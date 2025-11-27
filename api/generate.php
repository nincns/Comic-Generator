<?php
/**
 * Comic Generator - Image Generation API
 * 
 * POST /api/generate.php
 * {
 *   "protagonists": ["abbi", "student_neutral"],
 *   "scene": "campus_exterior",
 *   "action": "walking",
 *   "style": "comic_modern",
 *   "specials": ["morning"],
 *   "caption": "Abbis erster Tag..."
 * }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Konfiguration laden
$configFile = __DIR__ . '/config.local.php';
if (file_exists($configFile)) {
    require_once $configFile;
} else {
    require_once __DIR__ . '/config.php';
}

// Katalog laden
function loadCatalog(): array {
    $catalogPath = defined('CATALOG_FILE') ? CATALOG_FILE : __DIR__ . '/../data/catalog.json';
    if (!file_exists($catalogPath)) {
        throw new Exception("Katalog nicht gefunden: $catalogPath");
    }
    return json_decode(file_get_contents($catalogPath), true);
}

// Prompt aus Katalog-Elementen zusammenbauen
function buildPrompt(array $data, array $catalog): string {
    $parts = [];
    
    // Protagonisten
    if (!empty($data['protagonists'])) {
        $protagonistParts = [];
        foreach ($data['protagonists'] as $id) {
            foreach ($catalog['protagonists']['items'] as $item) {
                if ($item['id'] === $id) {
                    $protagonistParts[] = $item['prompt'];
                    break;
                }
            }
        }
        if ($protagonistParts) {
            $parts[] = implode(' Together with ', $protagonistParts);
        }
    }
    
    // Handlung
    if (!empty($data['action'])) {
        foreach ($catalog['action']['items'] as $item) {
            if ($item['id'] === $data['action']) {
                $parts[] = $item['prompt'];
                break;
            }
        }
    }
    
    // Szene/Ort
    if (!empty($data['scene'])) {
        foreach ($catalog['scene']['items'] as $item) {
            if ($item['id'] === $data['scene']) {
                $parts[] = $item['prompt'];
                break;
            }
        }
    }
    
    // Specials
    if (!empty($data['specials'])) {
        foreach ($data['specials'] as $specialId) {
            foreach ($catalog['specials']['items'] as $item) {
                if ($item['id'] === $specialId) {
                    $parts[] = $item['prompt'];
                    break;
                }
            }
        }
    }
    
    // Stil (am Ende)
    if (!empty($data['style'])) {
        foreach ($catalog['style']['items'] as $item) {
            if ($item['id'] === $data['style']) {
                $parts[] = $item['prompt'];
                break;
            }
        }
    }
    
    return implode('. ', $parts);
}

// OpenAI API aufrufen
function generateImage(string $prompt): array {
    $apiKey = defined('OPENAI_API_KEY') ? OPENAI_API_KEY : getenv('OPENAI_API_KEY');
    $model = defined('OPENAI_MODEL') ? OPENAI_MODEL : 'gpt-image-1';
    $quality = defined('OPENAI_QUALITY') ? OPENAI_QUALITY : 'medium';
    $size = defined('OPENAI_SIZE') ? OPENAI_SIZE : '1024x1024';
    
    if (!$apiKey || $apiKey === 'sk-your-api-key-here') {
        throw new Exception('OpenAI API-Key nicht konfiguriert');
    }
    
    $payload = [
        'model' => $model,
        'prompt' => $prompt,
        'size' => $size,
        'n' => 1
    ];
    
    // QualitÃ¤t hinzufÃ¼gen (nicht fÃ¼r dall-e-2)
    if ($model !== 'dall-e-2') {
        $payload['quality'] = $quality;
    }
    
    // Style fÃ¼r DALL-E 3
    if ($model === 'dall-e-3') {
        $payload['style'] = 'vivid';
    }
    
    $ch = curl_init('https://api.openai.com/v1/images/generations');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey
        ],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_TIMEOUT => 120
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        throw new Exception("cURL Fehler: $error");
    }
    
    $data = json_decode($response, true);
    
    if ($httpCode !== 200) {
        $errorMsg = $data['error']['message'] ?? 'Unbekannter API-Fehler';
        throw new Exception("OpenAI API Fehler ($httpCode): $errorMsg");
    }
    
    return $data;
}

// Bild speichern (Base64 oder URL)
function saveImage(array $imageData): string {
    $outputDir = defined('GENERATED_DIR') ? GENERATED_DIR : __DIR__ . '/../generated/';
    
    if (!is_dir($outputDir)) {
        mkdir($outputDir, 0755, true);
    }
    
    $filename = 'comic_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.png';
    $filepath = $outputDir . $filename;
    
    $imageItem = $imageData['data'][0];
    
    if (!empty($imageItem['b64_json'])) {
        // Base64 dekodieren
        $imageBytes = base64_decode($imageItem['b64_json']);
        file_put_contents($filepath, $imageBytes);
    } elseif (!empty($imageItem['url'])) {
        // Von URL herunterladen
        $imageBytes = file_get_contents($imageItem['url']);
        file_put_contents($filepath, $imageBytes);
    } else {
        throw new Exception('Keine Bilddaten in API-Antwort');
    }
    
    return $filename;
}

// Hauptlogik
try {
    // Nur POST erlauben
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Nur POST-Requests erlaubt');
    }
    
    // Input lesen
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Ungültige JSON-Daten');
    }
    
    // Prompt bestimmen: Entweder direkt übergeben oder aus Katalog bauen
    $prompt = '';
    
    if (!empty($input['prompt'])) {
        // Prompt wurde direkt vom Frontend übergeben (für Custom-Kataloge)
        $prompt = $input['prompt'];
    } else {
        // Fallback: Prompt aus Server-Katalog bauen (für Standard-Katalog)
        $catalog = loadCatalog();
        $prompt = buildPrompt($input, $catalog);
    }
    
    if (empty($prompt)) {
        throw new Exception('Prompt ist leer - bitte mindestens einen Protagonisten und eine Szene wählen');
    }
    
    // Debug: Prompt zurückgeben ohne zu generieren
    if (defined('DEBUG_MODE') && DEBUG_MODE && !empty($input['debug'])) {
        echo json_encode([
            'success' => true,
            'debug' => true,
            'prompt' => $prompt,
            'input' => $input
        ]);
        exit;
    }
    
    // Bild generieren
    $apiResponse = generateImage($prompt);
    
    // Bild speichern
    $filename = saveImage($apiResponse);
    
    // Erfolg zurückgeben
    echo json_encode([
        'success' => true,
        'image' => 'generated/' . $filename,
        'prompt' => $prompt,
        'caption' => $input['caption'] ?? '',
        'revised_prompt' => $apiResponse['data'][0]['revised_prompt'] ?? null
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
