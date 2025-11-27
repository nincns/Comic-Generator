<?php
/**
 * Comic Generator - Konfiguration
 * 
 * Kopiere diese Datei nach config.local.php und trage deinen API-Key ein.
 */

// OpenAI API Konfiguration
define('OPENAI_API_KEY', getenv('OPENAI_API_KEY') ?: 'sk-your-api-key-here');
define('OPENAI_MODEL', 'gpt-image-1');  // oder 'dall-e-3', 'gpt-image-1-mini'
define('OPENAI_QUALITY', 'medium');      // low, medium, high
define('OPENAI_SIZE', '1024x1024');

// Pfade
define('GENERATED_DIR', __DIR__ . '/../generated/');
define('CATALOG_FILE', __DIR__ . '/../data/catalog.json');

// Sicherheit
define('MAX_REQUESTS_PER_HOUR', 20);
define('ALLOWED_ORIGINS', ['http://localhost', 'https://your-domain.de']);

// Debug-Modus (nur fÃ¼r Entwicklung!)
define('DEBUG_MODE', true);
