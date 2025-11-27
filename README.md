# 🎨 Comic Generator

Ein flexibler, KI-gestützter Comic-Baukasten für Bildungseinrichtungen, Unternehmen und kreative Projekte.

![Version](https://img.shields.io/badge/version-2.7-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 📦 Baukasten-System
Keine Prompt-Kenntnisse nötig! Klicke einfach die gewünschten Elemente zusammen:
- **Protagonisten** - Charaktere und Figuren
- **Szenen/Orte** - Hintergründe und Umgebungen
- **Handlungen** - Was passiert im Bild
- **Stile** - Comic, Manga, Aquarell, 3D...
- **Extras** - Tageszeit, Wetter, Kamerawinkel

### 💬 Drag-to-Point Sprechblasen
Intuitive Platzierung von Sprechblasen:
1. Text eingeben
2. Im Bild klicken & halten
3. Zur sprechenden Person ziehen
4. Loslassen - fertig!

Drei Blasentypen: 💬 Sprechblase, 💭 Denkblase, 💥 Rufblase

### ⚙️ Configurator
Passe den Generator an deine Marke an:
- **Titel & Logo** - Name und Icon ändern
- **Farbschema** - Eigene Farben oder Vorlagen (Ocean, Forest, Sunset, Night, Candy)
- **Katalog-Editor** - Eigene Elemente erstellen, bearbeiten, löschen
- **400+ Emojis** - Integrierter Emoji-Picker

### 💾 Export
- Einzelbilder als PNG (inkl. Sprechblasen)
- Kompletter Comic-Strip als PNG
- Katalog als JSON (Backup/Sharing)

## 🚀 Installation

### Voraussetzungen
- PHP 8.0+ mit cURL
- Webserver (Apache, nginx, oder PHP Built-in)
- OpenAI API-Key

### Setup

```bash
# 1. Repository klonen
git clone https://github.com/yourusername/comic-generator.git
cd comic-generator

# 2. API-Key konfigurieren
cp api/config.php api/config.local.php
nano api/config.local.php  # API-Key eintragen

# 3. Schreibrechte setzen
chmod 755 generated/

# 4. Starten
php -S localhost:8080
```

Öffne http://localhost:8080 im Browser.

## 📁 Projektstruktur

```
comic-generator/
├── index.html          # Hauptseite
├── css/
│   └── style.css       # Styling
├── js/
│   └── app.js          # Frontend-Logik
├── api/
│   ├── config.php      # Konfiguration (Template)
│   ├── config.local.php# Lokale Config (API-Key) - NICHT COMMITTEN!
│   └── generate.php    # API-Endpoint
├── data/
│   └── catalog.json    # Element-Katalog
├── generated/          # Generierte Bilder
└── assets/             # Statische Assets
```

## ⚙️ Konfiguration

### OpenAI API (api/config.local.php)

```php
<?php
define('OPENAI_API_KEY', 'sk-proj-...');
define('OPENAI_MODEL', 'gpt-image-1');    // oder 'dall-e-3'
define('OPENAI_QUALITY', 'medium');        // low, medium, high
define('OPENAI_SIZE', '1024x1024');
```

### Modell-Optionen

| Modell | Qualität | Geschwindigkeit | Kosten |
|--------|----------|-----------------|--------|
| gpt-image-1-mini | low | Schnell | ~$0.005 |
| gpt-image-1 | medium | Mittel | ~$0.04 |
| gpt-image-1 | high | Langsam | ~$0.17 |
| dall-e-3 | hd | Mittel | ~$0.08 |

## 🎨 Anpassung

### Branding ändern
1. Öffne den **Configurator** (⚙️ Button)
2. Wähle den Tab **🎨 Branding**
3. Ändere Titel, Tagline, Logo
4. Wähle ein Farbschema oder definiere eigene Farben
5. Klicke **✓ Anwenden**

### Katalog erweitern
1. Öffne den **Configurator**
2. Wähle eine Kategorie (Protagonisten, Szenen, etc.)
3. Klicke **➕ Neu**
4. Fülle die Felder aus:
   - **ID**: Eindeutiger Bezeichner (lowercase, keine Leerzeichen)
   - **Name**: Anzeigename
   - **Icon**: Emoji auswählen
   - **Prompt**: Beschreibung für die KI
5. Klicke **💾 Änderungen speichern**

## 🌐 Deployment

### nginx Konfiguration
```nginx
server {
    listen 80;
    server_name comic.example.com;
    root /var/www/comic-generator;
    
    charset utf-8;
    
    location ~ \.json$ {
        add_header Content-Type "application/json; charset=utf-8";
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### Sicherheit
- `config.local.php` niemals committen!
- `generated/` Verzeichnis ggf. mit `.htaccess` schützen
- Rate-Limiting für API-Endpoint empfohlen

## 📝 API-Referenz

### POST /api/generate.php

**Request:**
```json
{
  "protagonists": ["character_1", "character_2"],
  "scene": "scene_id",
  "action": "action_id",
  "style": "style_id",
  "specials": ["extra_1", "extra_2"],
  "caption": "Bildunterschrift"
}
```

**Response:**
```json
{
  "success": true,
  "image": "generated/comic_20241126_140000_abc123.png",
  "prompt": "Generierter Prompt...",
  "caption": "Bildunterschrift"
}
```

## 🤝 Contributing

Beiträge sind willkommen! Bitte:
1. Forke das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add AmazingFeature'`)
4. Pushe zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

## 🙏 Credits

- OpenAI für die Bildgenerierungs-API
- [html2canvas](https://html2canvas.hertzen.com/) für Screenshot-Funktionalität
- Alle Contributors und Tester

---

Made with ❤️ für kreative Projekte
