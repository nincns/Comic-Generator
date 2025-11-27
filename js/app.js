/**
 * Comic Generator - Main Application
 * Mit integriertem Configurator (Branding & Katalog-Editor)
 */

// ============================================
// State Management
// ============================================
const state = {
    catalog: null,
    originalCatalog: null, // Für Reset-Funktion
    selection: {
        protagonists: [],
        scene: null,
        action: null,
        style: null,
        specials: []
    },
    comicStrip: [],
    currentEditingCard: null,
    editor: {
        currentCategory: 'branding',
        currentItemId: null,
        hasUnsavedChanges: false
    },
    branding: {
        title: 'Comic Generator',
        tagline: 'Erstelle deinen eigenen Comic!',
        logo: '🎨',
        colors: {
            primary: '#00a5b5',
            primaryDark: '#008a98',
            accent: '#ff6b35',
            bgDark: '#1a1a2e'
        }
    }
};

// LocalStorage Keys
const CATALOG_STORAGE_KEY = 'comic_generator_catalog';
const BRANDING_STORAGE_KEY = 'comic_generator_branding';

// Farb-Presets
const COLOR_PRESETS = {
    default: {
        name: 'Standard',
        primary: '#00a5b5',
        primaryDark: '#008a98',
        accent: '#ff6b35',
        bgDark: '#1a1a2e'
    },
    ocean: {
        name: 'Ocean',
        primary: '#0077b6',
        primaryDark: '#005f8d',
        accent: '#00b4d8',
        bgDark: '#03045e'
    },
    forest: {
        name: 'Forest',
        primary: '#2d6a4f',
        primaryDark: '#1b4332',
        accent: '#95d5b2',
        bgDark: '#081c15'
    },
    sunset: {
        name: 'Sunset',
        primary: '#e85d04',
        primaryDark: '#dc2f02',
        accent: '#ffba08',
        bgDark: '#370617'
    },
    night: {
        name: 'Night',
        primary: '#7209b7',
        primaryDark: '#560bad',
        accent: '#f72585',
        bgDark: '#10002b'
    },
    candy: {
        name: 'Candy',
        primary: '#ff006e',
        primaryDark: '#d00061',
        accent: '#8338ec',
        bgDark: '#3a0ca3'
    }
};

// ============================================
// DOM Elements
// ============================================
const elements = {
    catalogContainer: document.getElementById('catalog-container'),
    promptText: document.getElementById('prompt-text'),
    captionInput: document.getElementById('caption-input'),
    generateBtn: document.getElementById('generate-btn'),
    comicStrip: document.getElementById('comic-strip'),
    clearStripBtn: document.getElementById('clear-strip-btn'),
    downloadStripBtn: document.getElementById('download-strip-btn'),
    loadingOverlay: document.getElementById('loading-overlay'),
    toastContainer: document.getElementById('toast-container'),
    bubbleModal: document.getElementById('bubble-modal'),
    bubblePreviewImg: document.getElementById('bubble-preview-img'),
    bubbleOverlay: document.getElementById('bubble-overlay'),
    bubbleText: document.getElementById('bubble-text'),
    // Catalog Editor
    catalogEditorModal: document.getElementById('catalog-editor-modal'),
    openConfiguratorBtn: document.getElementById('open-configurator'),
    editorItemsList: document.getElementById('editor-items-list'),
    editorDetailContent: document.getElementById('editor-detail-content'),
    addItemBtn: document.getElementById('add-item-btn'),
    saveCatalogBtn: document.getElementById('save-catalog-btn'),
    resetCatalogBtn: document.getElementById('reset-catalog-btn'),
    exportCatalogBtn: document.getElementById('export-catalog-btn'),
    importCatalogBtn: document.getElementById('import-catalog-btn'),
    importFileInput: document.getElementById('import-file-input')
};

// ============================================
// Emoji-Liste für Picker (kategorisiert)
// ============================================
const emojiCategories = {
    'Personen': [
        '🦉', '🤖', '👨‍🎓', '👩‍🎓', '🧑‍🎓', '👨‍🏫', '👩‍🏫', '🧑‍🏫',
        '👨‍💼', '👩‍💼', '👨‍🔬', '👩‍🔬', '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎨',
        '👩‍🎨', '👥', '👤', '🧑', '👨', '👩', '🧒', '👶',
        '🧓', '👴', '👵', '🙋', '🙋‍♂️', '🙋‍♀️', '💁', '💁‍♂️',
        '💁‍♀️', '🙆', '🙆‍♂️', '🙆‍♀️', '🙅', '🙅‍♂️', '🙅‍♀️', '🤷',
        '🤷‍♂️', '🤷‍♀️', '🧏', '🧏‍♂️', '🧏‍♀️', '🙇', '🙇‍♂️', '🙇‍♀️'
    ],
    'Gebäude & Orte': [
        '🏛️', '🏫', '🏢', '🏠', '🏡', '🏘️', '🏗️', '🏭',
        '🏰', '🏯', '🏟️', '🏪', '🏬', '🏣', '🏤', '🏥',
        '🏦', '🏨', '🏩', '🏚️', '⛪', '🕌', '🕍', '⛩️',
        '🗼', '🗽', '🗿', '🏙️', '🌆', '🌇', '🌃', '🌉',
        '🎡', '🎢', '🎠', '⛲', '🏖️', '🏝️', '🏜️', '🌋',
        '⛰️', '🏔️', '🗻', '🏕️', '🛖', '🧱', '🪨', '🪵'
    ],
    'Bildung & Wissenschaft': [
        '📚', '📖', '📕', '📗', '📘', '📙', '📓', '📔',
        '📒', '📃', '📄', '📰', '🗞️', '📑', '🔖', '🏷️',
        '✏️', '✒️', '🖊️', '🖋️', '🖌️', '🖍️', '📝', '📋',
        '🔬', '🔭', '🧪', '🧫', '🧬', '🩺', '💊', '💉',
        '🩻', '🔍', '🔎', '📐', '📏', '🧮', '🎓', '📜'
    ],
    'Technik & Geräte': [
        '💻', '🖥️', '🖨️', '⌨️', '🖱️', '💾', '💿', '📀',
        '📱', '📲', '☎️', '📞', '📟', '📠', '🔌', '🔋',
        '🪫', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📺',
        '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰',
        '🕰️', '⌚', '📡', '🔦', '🔧', '🔨', '🛠️', '⚙️'
    ],
    'Handlungen & Gesten': [
        '💡', '💭', '💬', '🗯️', '👋', '🤚', '🖐️', '✋',
        '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘',
        '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
        '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐',
        '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵'
    ],
    'Aktivitäten': [
        '🚶', '🚶‍♂️', '🚶‍♀️', '🏃', '🏃‍♂️', '🏃‍♀️', '💃', '🕺',
        '🧘', '🧘‍♂️', '🧘‍♀️', '🏋️', '🏋️‍♂️', '🏋️‍♀️', '🤸', '🤸‍♂️',
        '🤸‍♀️', '⛹️', '⛹️‍♂️', '⛹️‍♀️', '🤾', '🤾‍♂️', '🤾‍♀️', '🏌️',
        '🏄', '🏊', '🚴', '🚵', '🧗', '🤼', '🤹', '🎭'
    ],
    'Emotionen & Symbole': [
        '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊',
        '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗',
        '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😮',
        '😯', '😲', '😳', '🥺', '😢', '😭', '😤', '😠',
        '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉',
        '⭐', '🌟', '✨', '💫', '💥', '🔥', '❤️', '💯'
    ],
    'Wetter & Zeit': [
        '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️',
        '🌩️', '🌨️', '❄️', '💨', '🌬️', '🌀', '🌈', '🌅',
        '🌄', '🌇', '🌆', '🌃', '🌌', '🌙', '🌛', '🌜',
        '⭐', '🌟', '💫', '✨', '☄️', '🌍', '🌎', '🌏'
    ],
    'Essen & Trinken': [
        '🍽️', '🍴', '🥄', '🔪', '🏺', '🍕', '🍔', '🍟',
        '🌭', '🥪', '🌮', '🌯', '🥗', '🥘', '🍝', '🍜',
        '🍲', '🍛', '🍣', '🍱', '🍙', '🍚', '🍘', '🍥',
        '☕', '🍵', '🥤', '🧃', '🧋', '🍶', '🍺', '🍻'
    ],
    'Kunst & Medien': [
        '🎨', '🖼️', '🎭', '🎪', '🎬', '🎤', '🎧', '🎼',
        '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎵',
        '🎶', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📺',
        '📻', '🎙️', '📰', '🗞️', '📕', '📗', '📘', '📙'
    ],
    'Transport': [
        '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑',
        '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🏍️',
        '🚲', '🛴', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇',
        '✈️', '🛫', '🛬', '🚀', '🛸', '🚁', '⛵', '🚢'
    ],
    'Natur & Tiere': [
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
        '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
        '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺',
        '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀',
        '🌸', '🌺', '🌻', '🌹', '🌷', '💐', '🌱', '🪴'
    ]
};

// Flache Liste für Kompatibilität
const commonEmojis = Object.values(emojiCategories).flat();

// ============================================
// Emoji Picker Rendering
// ============================================
let currentEmojiCategory = 'Personen';

function renderEmojiPicker(container, inputElement, previewElement) {
    const categories = Object.keys(emojiCategories);
    
    container.innerHTML = `
        <div class="emoji-picker-search">
            <input type="text" id="emoji-search" placeholder="🔍 Emoji suchen..." autocomplete="off">
        </div>
        <div class="emoji-category-tabs">
            ${categories.map(cat => `
                <button type="button" class="emoji-cat-tab ${cat === currentEmojiCategory ? 'active' : ''}" 
                        data-category="${cat}" title="${cat}">
                    ${emojiCategories[cat][0]}
                </button>
            `).join('')}
        </div>
        <div class="emoji-grid" id="emoji-grid">
            ${renderEmojiGrid(currentEmojiCategory)}
        </div>
    `;
    
    // Category tab clicks
    container.querySelectorAll('.emoji-cat-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.stopPropagation();
            currentEmojiCategory = tab.dataset.category;
            container.querySelectorAll('.emoji-cat-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('emoji-grid').innerHTML = renderEmojiGrid(currentEmojiCategory);
            attachEmojiClickHandlers(container, inputElement, previewElement);
        });
    });
    
    // Search functionality
    const searchInput = container.querySelector('#emoji-search');
    searchInput.addEventListener('input', (e) => {
        e.stopPropagation();
        const query = e.target.value.toLowerCase();
        if (query.length > 0) {
            // Search all emojis
            const allEmojis = Object.values(emojiCategories).flat();
            const filtered = allEmojis.filter(emoji => emoji.includes(query));
            document.getElementById('emoji-grid').innerHTML = filtered.length > 0 
                ? filtered.map(e => `<button type="button" class="emoji-option" data-emoji="${e}">${e}</button>`).join('')
                : '<p class="emoji-no-results">Keine Emojis gefunden</p>';
        } else {
            document.getElementById('emoji-grid').innerHTML = renderEmojiGrid(currentEmojiCategory);
        }
        attachEmojiClickHandlers(container, inputElement, previewElement);
    });
    
    // Prevent search input from closing picker
    searchInput.addEventListener('click', (e) => e.stopPropagation());
    
    attachEmojiClickHandlers(container, inputElement, previewElement);
}

function renderEmojiGrid(category) {
    const emojis = emojiCategories[category] || [];
    return emojis.map(e => `
        <button type="button" class="emoji-option" data-emoji="${e}">${e}</button>
    `).join('');
}

function attachEmojiClickHandlers(container, inputElement, previewElement) {
    container.querySelectorAll('.emoji-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            inputElement.value = btn.dataset.emoji;
            previewElement.textContent = btn.dataset.emoji;
            container.classList.add('hidden');
        });
    });
}

// ============================================
// Initialization
// ============================================
async function init() {
    try {
        await loadCatalog();
        console.log('Katalog geladen:', Object.keys(state.catalog));
        
        // Branding laden und anwenden
        loadBrandingFromStorage();
        
        renderCatalog();
        setupEventListeners();
        setupColorInputSync();
        updatePromptPreview();
        updateGenerateButton();
    } catch (error) {
        showToast('Fehler beim Laden: ' + error.message, 'error');
        console.error(error);
    }
}

// ============================================
// Catalog Loading & Rendering
// ============================================
async function loadCatalog() {
    // Zuerst prüfen ob es gespeicherte Änderungen gibt
    const savedCatalog = localStorage.getItem(CATALOG_STORAGE_KEY);
    
    if (savedCatalog) {
        try {
            state.catalog = JSON.parse(savedCatalog);
            console.log('Katalog aus LocalStorage geladen');
        } catch (e) {
            console.warn('Gespeicherter Katalog ungültig, lade Original...');
            await loadOriginalCatalog();
        }
    } else {
        await loadOriginalCatalog();
    }
    
    // Original-Katalog für Reset speichern
    await loadOriginalCatalogForReset();
}

async function loadOriginalCatalog() {
    const response = await fetch('data/catalog.json');
    if (!response.ok) throw new Error('Katalog konnte nicht geladen werden');
    state.catalog = await response.json();
}

async function loadOriginalCatalogForReset() {
    try {
        const response = await fetch('data/catalog.json');
        if (response.ok) {
            state.originalCatalog = await response.json();
        }
    } catch (e) {
        console.warn('Original-Katalog konnte nicht geladen werden');
    }
}

function saveCatalogToStorage() {
    try {
        localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(state.catalog));
        return true;
    } catch (e) {
        console.error('Fehler beim Speichern:', e);
        return false;
    }
}

function renderCatalog() {
    if (!state.catalog) return;
    
    const categories = ['protagonists', 'scene', 'action', 'style', 'specials'];
    let html = '';
    
    for (const categoryKey of categories) {
        const category = state.catalog[categoryKey];
        if (!category) continue;
        
        const isMultiple = category.multiple;
        const badgeText = isMultiple ? 'Mehrfach' : 'Einzeln';
        
        html += `
            <div class="catalog-category" data-category="${categoryKey}">
                <div class="category-header">
                    <h3>${category.label}</h3>
                    <span class="category-badge">${badgeText}</span>
                </div>
                <div class="catalog-items">
                    ${category.items.map(item => `
                        <button class="catalog-item" 
                                data-category="${categoryKey}" 
                                data-id="${item.id}"
                                data-multiple="${isMultiple}">
                            <span class="item-icon">${item.icon}</span>
                            <span class="item-name">${item.name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    elements.catalogContainer.innerHTML = html;
    
    // Add click listeners to items
    elements.catalogContainer.querySelectorAll('.catalog-item').forEach(item => {
        item.addEventListener('click', handleCatalogItemClick);
    });
    
    // Restore selection state
    restoreSelectionUI();
}

function restoreSelectionUI() {
    // Protagonists
    state.selection.protagonists.forEach(id => {
        const btn = elements.catalogContainer.querySelector(`[data-category="protagonists"][data-id="${id}"]`);
        if (btn) btn.classList.add('selected');
    });
    
    // Single selections
    ['scene', 'action', 'style'].forEach(cat => {
        if (state.selection[cat]) {
            const btn = elements.catalogContainer.querySelector(`[data-category="${cat}"][data-id="${state.selection[cat]}"]`);
            if (btn) btn.classList.add('selected');
        }
    });
    
    // Specials
    state.selection.specials.forEach(id => {
        const btn = elements.catalogContainer.querySelector(`[data-category="specials"][data-id="${id}"]`);
        if (btn) btn.classList.add('selected');
    });
}

// ============================================
// Selection Handling
// ============================================
function handleCatalogItemClick(event) {
    const button = event.currentTarget;
    const category = button.dataset.category;
    const id = button.dataset.id;
    const isMultiple = button.dataset.multiple === 'true';
    
    if (!(category in state.selection)) {
        state.selection[category] = isMultiple ? [] : null;
    }
    
    if (isMultiple) {
        if (!Array.isArray(state.selection[category])) {
            state.selection[category] = [];
        }
        const index = state.selection[category].indexOf(id);
        if (index > -1) {
            state.selection[category].splice(index, 1);
            button.classList.remove('selected');
        } else {
            state.selection[category].push(id);
            button.classList.add('selected');
        }
    } else {
        const categoryContainer = button.closest('.catalog-category');
        categoryContainer.querySelectorAll('.catalog-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        if (state.selection[category] === id) {
            state.selection[category] = null;
        } else {
            state.selection[category] = id;
            button.classList.add('selected');
        }
    }
    
    updatePromptPreview();
    updateGenerateButton();
}

// ============================================
// Prompt Building
// ============================================
function buildPrompt() {
    if (!state.catalog) return '';
    
    const parts = [];
    
    // Protagonists
    if (state.selection.protagonists.length > 0) {
        const protagonistParts = state.selection.protagonists.map(id => {
            const item = state.catalog.protagonists.items.find(i => i.id === id);
            return item ? item.prompt : '';
        }).filter(p => p);
        
        if (protagonistParts.length > 0) {
            parts.push(protagonistParts.join(' Together with '));
        }
    }
    
    // Action
    if (state.selection.action) {
        const item = state.catalog.action.items.find(i => i.id === state.selection.action);
        if (item) parts.push(item.prompt);
    }
    
    // Scene
    if (state.selection.scene) {
        const item = state.catalog.scene.items.find(i => i.id === state.selection.scene);
        if (item) parts.push(item.prompt);
    }
    
    // Specials
    state.selection.specials.forEach(specialId => {
        const item = state.catalog.specials.items.find(i => i.id === specialId);
        if (item) parts.push(item.prompt);
    });
    
    // Style (at the end)
    if (state.selection.style) {
        const item = state.catalog.style.items.find(i => i.id === state.selection.style);
        if (item) parts.push(item.prompt);
    }
    
    return parts.join('. ');
}

function updatePromptPreview() {
    const prompt = buildPrompt();
    elements.promptText.innerHTML = prompt 
        ? `<span>${prompt}</span>` 
        : '<em>Wähle Elemente aus dem Katalog...</em>';
}

function updateGenerateButton() {
    const hasProtagonist = state.selection.protagonists.length > 0;
    const hasScene = state.selection.scene !== null;
    const hasStyle = state.selection.style !== null;
    
    const isValid = hasProtagonist && hasScene && hasStyle;
    elements.generateBtn.disabled = !isValid;
    
    const missing = [];
    if (!hasProtagonist) missing.push('Protagonist');
    if (!hasScene) missing.push('Szene');
    if (!hasStyle) missing.push('Stil');
    
    if (missing.length > 0) {
        elements.generateBtn.title = `Noch auswählen: ${missing.join(', ')}`;
        elements.generateBtn.classList.add('incomplete');
    } else {
        elements.generateBtn.title = 'Klicken um Comic-Kachel zu erstellen!';
        elements.generateBtn.classList.remove('incomplete');
    }
}

// ============================================
// Image Generation
// ============================================
async function generateImage() {
    const prompt = buildPrompt();
    const caption = elements.captionInput.value.trim();
    
    if (!prompt) {
        showToast('Bitte wähle mindestens einen Protagonisten, eine Szene und einen Stil', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('api/generate.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Fertigen Prompt direkt senden (für Custom-Kataloge)
                prompt: prompt,
                // IDs auch senden (für Logging/Debug)
                protagonists: state.selection.protagonists,
                scene: state.selection.scene,
                action: state.selection.action,
                style: state.selection.style,
                specials: state.selection.specials,
                caption: caption
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Unbekannter Fehler');
        }
        
        addToComicStrip({
            image: data.image,
            caption: data.caption || caption,
            prompt: data.prompt,
            revisedPrompt: data.revised_prompt,
            bubbles: []
        });
        
        showToast('Comic-Kachel erstellt! 🎉', 'success');
        elements.captionInput.value = '';
        
    } catch (error) {
        showToast('Fehler: ' + error.message, 'error');
        console.error(error);
    } finally {
        showLoading(false);
    }
}

// ============================================
// Comic Strip Management
// ============================================
function addToComicStrip(card) {
    state.comicStrip.push(card);
    renderComicStrip();
    updateStripButtons();
}

function removeFromComicStrip(index) {
    state.comicStrip.splice(index, 1);
    renderComicStrip();
    updateStripButtons();
}

function clearComicStrip() {
    if (confirm('Möchtest du wirklich alle Kacheln löschen?')) {
        state.comicStrip = [];
        renderComicStrip();
        updateStripButtons();
    }
}

function renderComicStrip() {
    if (state.comicStrip.length === 0) {
        elements.comicStrip.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎬</div>
                <p>Dein Comic erscheint hier!</p>
                <p class="hint">Wähle links die Elemente und klicke auf "Erstellen"</p>
            </div>
        `;
        return;
    }
    
    elements.comicStrip.innerHTML = state.comicStrip.map((card, index) => {
        const rotation = (Math.random() - 0.5) * 4;
        return `
            <div class="polaroid-card" style="--rotation: ${rotation}deg" data-index="${index}">
                <div class="polaroid-actions">
                    <button class="polaroid-action-btn" data-action="download" title="Bild herunterladen">💾</button>
                    <button class="polaroid-action-btn" data-action="bubble" title="Sprechblase hinzufügen">💬</button>
                    <button class="polaroid-action-btn" data-action="delete" title="Löschen">🗑️</button>
                </div>
                <div class="polaroid-image-container">
                    <img src="${card.image}" alt="Comic Panel ${index + 1}" crossorigin="anonymous">
                    <div class="polaroid-bubbles" data-card-index="${index}">
                        ${renderBubbles(card.bubbles, index)}
                    </div>
                </div>
                <div class="polaroid-caption">
                    <p>${card.caption || ''}</p>
                </div>
            </div>
        `;
    }).join('');
    
    elements.comicStrip.querySelectorAll('.polaroid-action-btn').forEach(btn => {
        btn.addEventListener('click', handlePolaroidAction);
    });
    
    // Draw SVG tails after DOM is rendered
    requestAnimationFrame(() => {
        drawAllBubbleTails();
    });
}

function drawAllBubbleTails() {
    state.comicStrip.forEach((card, index) => {
        if (!card.bubbles) return;
        
        const svg = document.getElementById(`tail-svg-${index}`);
        if (!svg) return;
        
        const container = svg.closest('.polaroid-bubbles');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        card.bubbles.forEach(bubble => {
            if (bubble.tailX === null || bubble.tailY === null) return;
            if (bubble.type === 'shout') return;
            
            const bx = (bubble.x / 100) * width;
            const by = (bubble.y / 100) * height;
            const tx = (bubble.tailX / 100) * width;
            const ty = (bubble.tailY / 100) * height;
            
            if (bubble.type === 'thought') {
                drawThoughtBubblesStatic(svg, bx, by, tx, ty);
            } else {
                const tailPoints = calculateTailPoints(bx, by, tx, ty, bubble.type);
                
                const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                polygon.setAttribute('points', `${tailPoints.p1.x},${tailPoints.p1.y} ${tailPoints.p2.x},${tailPoints.p2.y} ${tx},${ty}`);
                polygon.setAttribute('fill', 'white');
                polygon.setAttribute('stroke', '#333');
                polygon.setAttribute('stroke-width', '2');
                svg.appendChild(polygon);
            }
        });
    });
}

function drawThoughtBubblesStatic(svg, bx, by, tx, ty) {
    const dx = tx - bx;
    const dy = ty - by;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length < 20) return;
    
    const numBubbles = 3;
    const startDist = 35;
    
    for (let i = 0; i < numBubbles; i++) {
        const t = (startDist + i * 15) / length;
        if (t > 0.9) break;
        
        const cx = bx + dx * t;
        const cy = by + dy * t;
        const r = 6 - i * 1.5;
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', Math.max(r, 2));
        circle.setAttribute('fill', 'white');
        circle.setAttribute('stroke', '#333');
        circle.setAttribute('stroke-width', '2');
        svg.appendChild(circle);
    }
}

function renderBubbles(bubbles, cardIndex) {
    if (!bubbles || bubbles.length === 0) return '';
    
    // Create unique ID for SVG
    const svgId = `tail-svg-${cardIndex}`;
    
    // Generate bubble HTML
    const bubblesHtml = bubbles.map(bubble => `
        <div class="bubble ${bubble.type}" 
             style="left: ${bubble.x}%; top: ${bubble.y}%;">
            ${bubble.text}
        </div>
    `).join('');
    
    // We'll need to draw SVG tails after render
    // Store data for post-render
    return `
        <svg class="bubble-tail-svg" id="${svgId}" data-bubbles='${JSON.stringify(bubbles)}'></svg>
        ${bubblesHtml}
    `;
}

function handlePolaroidAction(event) {
    const button = event.currentTarget;
    const action = button.dataset.action;
    const card = button.closest('.polaroid-card');
    const index = parseInt(card.dataset.index);
    
    if (action === 'delete') {
        removeFromComicStrip(index);
    } else if (action === 'bubble') {
        openBubbleEditor(index);
    } else if (action === 'download') {
        downloadSingleCard(index);
    }
}

function updateStripButtons() {
    const hasCards = state.comicStrip.length > 0;
    elements.clearStripBtn.disabled = !hasCards;
    elements.downloadStripBtn.disabled = !hasCards;
}

// ============================================
// Bubble Editor mit Drag-to-Point
// ============================================
let currentBubbleType = 'speech';
let bubblePreviewElement = null;
let dragTargetElement = null;
let tailSvg = null;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let dragEnd = { x: 0, y: 0 };
let previewContainer = null;

function openBubbleEditor(cardIndex) {
    state.currentEditingCard = cardIndex;
    const card = state.comicStrip[cardIndex];
    
    elements.bubblePreviewImg.src = card.image;
    elements.bubbleText.value = '';
    
    // Get container and SVG references
    previewContainer = document.getElementById('bubble-preview-container');
    tailSvg = document.getElementById('bubble-tail-svg');
    
    // Clear overlays
    elements.bubbleOverlay.innerHTML = '';
    tailSvg.innerHTML = '';
    
    // Render existing bubbles with their tails
    if (card.bubbles) {
        card.bubbles.forEach(bubble => {
            addBubbleWithTailToOverlay(bubble);
        });
    }
    
    // Create preview elements
    createDragPreviewElements();
    
    // Setup drag handlers
    setupDragHandlers();
    
    elements.bubbleModal.classList.remove('hidden');
}

function createDragPreviewElements() {
    // Remove old elements
    if (bubblePreviewElement) bubblePreviewElement.remove();
    if (dragTargetElement) dragTargetElement.remove();
    
    // Create bubble preview
    bubblePreviewElement = document.createElement('div');
    bubblePreviewElement.className = `bubble-preview ${currentBubbleType} hidden`;
    bubblePreviewElement.textContent = 'Vorschau...';
    elements.bubbleOverlay.appendChild(bubblePreviewElement);
    
    // Create drag target indicator
    dragTargetElement = document.createElement('div');
    dragTargetElement.className = 'drag-target hidden';
    elements.bubbleOverlay.appendChild(dragTargetElement);
}

function setupDragHandlers() {
    // Remove old handlers first
    previewContainer.onmousedown = null;
    previewContainer.onmousemove = null;
    previewContainer.onmouseup = null;
    previewContainer.onmouseleave = null;
    previewContainer.ontouchstart = null;
    previewContainer.ontouchmove = null;
    previewContainer.ontouchend = null;
    
    // Mouse events
    previewContainer.addEventListener('mousedown', handleDragStart);
    previewContainer.addEventListener('mousemove', handleDragMove);
    previewContainer.addEventListener('mouseup', handleDragEnd);
    previewContainer.addEventListener('mouseleave', handleDragEnd);
    
    // Touch events
    previewContainer.addEventListener('touchstart', handleDragStart, { passive: false });
    previewContainer.addEventListener('touchmove', handleDragMove, { passive: false });
    previewContainer.addEventListener('touchend', handleDragEnd);
}

function getEventPosition(event, container) {
    const rect = container.getBoundingClientRect();
    let clientX, clientY;
    
    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }
    
    return {
        x: ((clientX - rect.left) / rect.width) * 100,
        y: ((clientY - rect.top) / rect.height) * 100
    };
}

function handleDragStart(event) {
    event.preventDefault();
    isDragging = true;
    
    const pos = getEventPosition(event, previewContainer);
    dragStart = { x: pos.x, y: pos.y };
    dragEnd = { x: pos.x, y: pos.y };
    
    // Show and position preview bubble
    const text = elements.bubbleText.value.trim() || 'Text...';
    bubblePreviewElement.textContent = text;
    bubblePreviewElement.className = `bubble-preview ${currentBubbleType} active`;
    bubblePreviewElement.style.left = `${pos.x}%`;
    bubblePreviewElement.style.top = `${pos.y}%`;
    
    // Hide drag target initially
    dragTargetElement.classList.add('hidden');
    
    // Clear preview tail
    clearPreviewTail();
    
    previewContainer.classList.add('dragging');
}

function handleDragMove(event) {
    if (!isDragging) return;
    event.preventDefault();
    
    const pos = getEventPosition(event, previewContainer);
    dragEnd = { x: pos.x, y: pos.y };
    
    // Calculate distance
    const dx = dragEnd.x - dragStart.x;
    const dy = dragEnd.y - dragStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Only show tail if dragged more than 5%
    if (distance > 5 && currentBubbleType !== 'shout') {
        dragTargetElement.classList.remove('hidden');
        dragTargetElement.style.left = `${pos.x}%`;
        dragTargetElement.style.top = `${pos.y}%`;
        
        // Draw preview tail
        drawPreviewTail(dragStart, dragEnd);
    } else {
        dragTargetElement.classList.add('hidden');
        clearPreviewTail();
    }
}

function handleDragEnd(event) {
    if (!isDragging) return;
    isDragging = false;
    
    previewContainer.classList.remove('dragging');
    
    // Hide preview elements
    bubblePreviewElement.classList.add('hidden');
    dragTargetElement.classList.add('hidden');
    clearPreviewTail();
    
    // Calculate distance
    const dx = dragEnd.x - dragStart.x;
    const dy = dragEnd.y - dragStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if we have text
    const text = elements.bubbleText.value.trim();
    if (!text) {
        showToast('Bitte erst Text eingeben!', 'error');
        return;
    }
    
    // Create bubble
    const bubble = {
        type: currentBubbleType,
        text: text,
        x: dragStart.x,
        y: dragStart.y,
        tailX: distance > 5 ? dragEnd.x : null,
        tailY: distance > 5 ? dragEnd.y : null
    };
    
    // Add to card
    if (!state.comicStrip[state.currentEditingCard].bubbles) {
        state.comicStrip[state.currentEditingCard].bubbles = [];
    }
    state.comicStrip[state.currentEditingCard].bubbles.push(bubble);
    
    // Add to overlay with tail
    addBubbleWithTailToOverlay(bubble);
    
    // Clear text input for next bubble
    elements.bubbleText.value = '';
    
    // Re-render strip
    renderComicStrip();
    
    showToast('Sprechblase hinzugefügt!', 'success');
}

function drawPreviewTail(bubblePos, targetPos) {
    if (currentBubbleType === 'shout') return;
    
    const rect = previewContainer.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Convert percentages to pixels
    const bx = (bubblePos.x / 100) * width;
    const by = (bubblePos.y / 100) * height;
    const tx = (targetPos.x / 100) * width;
    const ty = (targetPos.y / 100) * height;
    
    // Calculate tail points
    const tailPoints = calculateTailPoints(bx, by, tx, ty, currentBubbleType);
    
    // Clear and draw new SVG
    tailSvg.innerHTML = '';
    
    if (currentBubbleType === 'thought') {
        // Draw thought bubbles (circles)
        drawThoughtBubbles(tailSvg, bx, by, tx, ty, true);
    } else {
        // Draw speech triangle
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', `${tailPoints.p1.x},${tailPoints.p1.y} ${tailPoints.p2.x},${tailPoints.p2.y} ${tx},${ty}`);
        polygon.setAttribute('fill', 'rgba(255,255,255,0.9)');
        polygon.setAttribute('stroke', '#333');
        polygon.setAttribute('stroke-width', '2');
        polygon.setAttribute('stroke-dasharray', '4,2');
        tailSvg.appendChild(polygon);
    }
}

function clearPreviewTail() {
    if (tailSvg) {
        tailSvg.innerHTML = '';
    }
}

function calculateTailPoints(bx, by, tx, ty, bubbleType) {
    // Vector from bubble to target
    const dx = tx - bx;
    const dy = ty - by;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return { p1: { x: bx, y: by }, p2: { x: bx, y: by } };
    
    // Normalize direction vector
    const nx = dx / length;
    const ny = dy / length;
    
    // Perpendicular vector
    const px = -ny;
    const py = nx;
    
    // Bubble radius (approximate)
    const bubbleRadius = 30;
    const tailWidth = 8;
    
    // Calculate the two base points of the tail
    // Start from bubble edge in direction of target
    const edgeX = bx + nx * bubbleRadius;
    const edgeY = by + ny * bubbleRadius;
    
    return {
        p1: { x: edgeX + px * tailWidth, y: edgeY + py * tailWidth },
        p2: { x: edgeX - px * tailWidth, y: edgeY - py * tailWidth }
    };
}

function drawThoughtBubbles(svg, bx, by, tx, ty, isPreview = false) {
    const dx = tx - bx;
    const dy = ty - by;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length < 20) return;
    
    // Draw 3 circles from bubble to target
    const numBubbles = 3;
    const startDist = 35;
    
    for (let i = 0; i < numBubbles; i++) {
        const t = (startDist + i * 15) / length;
        if (t > 0.9) break;
        
        const cx = bx + dx * t;
        const cy = by + dy * t;
        const r = 6 - i * 1.5;
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', Math.max(r, 2));
        circle.setAttribute('fill', isPreview ? 'rgba(255,255,255,0.9)' : 'white');
        circle.setAttribute('stroke', '#333');
        circle.setAttribute('stroke-width', '2');
        if (isPreview) {
            circle.setAttribute('stroke-dasharray', '2,2');
        }
        svg.appendChild(circle);
    }
}

function addBubbleWithTailToOverlay(bubble) {
    const rect = previewContainer.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Draw tail first (behind bubble)
    if (bubble.tailX !== null && bubble.tailY !== null && bubble.type !== 'shout') {
        const bx = (bubble.x / 100) * width;
        const by = (bubble.y / 100) * height;
        const tx = (bubble.tailX / 100) * width;
        const ty = (bubble.tailY / 100) * height;
        
        if (bubble.type === 'thought') {
            drawThoughtBubbles(tailSvg, bx, by, tx, ty, false);
        } else {
            const tailPoints = calculateTailPoints(bx, by, tx, ty, bubble.type);
            
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', `${tailPoints.p1.x},${tailPoints.p1.y} ${tailPoints.p2.x},${tailPoints.p2.y} ${tx},${ty}`);
            polygon.setAttribute('fill', 'white');
            polygon.setAttribute('stroke', '#333');
            polygon.setAttribute('stroke-width', '2');
            tailSvg.appendChild(polygon);
        }
    }
    
    // Add bubble div
    const div = document.createElement('div');
    div.className = `bubble ${bubble.type}`;
    div.style.left = `${bubble.x}%`;
    div.style.top = `${bubble.y}%`;
    div.textContent = bubble.text;
    elements.bubbleOverlay.appendChild(div);
}

function closeBubbleEditor() {
    elements.bubbleModal.classList.add('hidden');
    state.currentEditingCard = null;
    isDragging = false;
    
    // Cleanup
    if (bubblePreviewElement) {
        bubblePreviewElement.remove();
        bubblePreviewElement = null;
    }
    if (dragTargetElement) {
        dragTargetElement.remove();
        dragTargetElement = null;
    }
}

// addBubbleToCard not needed anymore - handled by drag end

// ============================================
// Configurator (Branding & Katalog-Editor)
// ============================================
function openConfigurator() {
    elements.catalogEditorModal.classList.remove('hidden');
    state.editor.currentCategory = 'branding';
    state.editor.currentItemId = null;
    state.editor.hasUnsavedChanges = false;
    
    updateEditorTabs();
    switchEditorCategory('branding');
}

function closeConfigurator() {
    if (state.editor.hasUnsavedChanges) {
        if (!confirm('Du hast ungespeicherte Änderungen. Wirklich schließen?')) {
            return;
        }
    }
    elements.catalogEditorModal.classList.add('hidden');
}

function updateEditorTabs() {
    const tabs = elements.catalogEditorModal.querySelectorAll('.editor-tab');
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === state.editor.currentCategory);
    });
}

function switchEditorCategory(category) {
    state.editor.currentCategory = category;
    state.editor.currentItemId = null;
    updateEditorTabs();
    
    const brandingPanel = document.getElementById('branding-panel');
    const catalogPanels = document.getElementById('catalog-panels');
    
    if (category === 'branding') {
        // Branding-Panel anzeigen
        brandingPanel.classList.remove('hidden');
        catalogPanels.classList.add('hidden');
        loadBrandingForm();
    } else {
        // Katalog-Panels anzeigen
        brandingPanel.classList.add('hidden');
        catalogPanels.classList.remove('hidden');
        renderEditorItemsList();
        renderEditorDetailPlaceholder();
    }
}

// ============================================
// Branding Functions
// ============================================
function loadBrandingForm() {
    // Werte in Formular laden
    document.getElementById('branding-title').value = state.branding.title;
    document.getElementById('branding-tagline').value = state.branding.tagline;
    document.getElementById('branding-logo').value = state.branding.logo;
    
    // Farben laden
    document.getElementById('color-primary').value = state.branding.colors.primary;
    document.getElementById('color-primary-hex').value = state.branding.colors.primary;
    document.getElementById('color-primary-dark').value = state.branding.colors.primaryDark;
    document.getElementById('color-primary-dark-hex').value = state.branding.colors.primaryDark;
    document.getElementById('color-accent').value = state.branding.colors.accent;
    document.getElementById('color-accent-hex').value = state.branding.colors.accent;
    document.getElementById('color-bg-dark').value = state.branding.colors.bgDark;
    document.getElementById('color-bg-dark-hex').value = state.branding.colors.bgDark;
}

function applyBranding() {
    // Werte aus Formular lesen
    state.branding.title = document.getElementById('branding-title').value || 'Comic Generator';
    state.branding.tagline = document.getElementById('branding-tagline').value || 'Erstelle deinen eigenen Comic!';
    state.branding.logo = document.getElementById('branding-logo').value || '🎨';
    
    state.branding.colors.primary = document.getElementById('color-primary').value;
    state.branding.colors.primaryDark = document.getElementById('color-primary-dark').value;
    state.branding.colors.accent = document.getElementById('color-accent').value;
    state.branding.colors.bgDark = document.getElementById('color-bg-dark').value;
    
    // Auf UI anwenden
    applyBrandingToUI();
    
    // Speichern
    saveBrandingToStorage();
    
    showToast('Branding angewendet! ✨', 'success');
}

function applyBrandingToUI() {
    // Header aktualisieren
    document.getElementById('header-title').textContent = state.branding.title;
    document.getElementById('header-tagline').textContent = state.branding.tagline;
    document.getElementById('header-logo').textContent = state.branding.logo;
    document.title = state.branding.title;
    
    // CSS Variablen aktualisieren
    const root = document.documentElement;
    root.style.setProperty('--eah-primary', state.branding.colors.primary);
    root.style.setProperty('--eah-primary-dark', state.branding.colors.primaryDark);
    root.style.setProperty('--eah-primary-light', adjustColorBrightness(state.branding.colors.primary, 40));
    root.style.setProperty('--eah-accent', state.branding.colors.accent);
    root.style.setProperty('--eah-accent-light', adjustColorBrightness(state.branding.colors.accent, 30));
    root.style.setProperty('--bg-dark', state.branding.colors.bgDark);
    root.style.setProperty('--bg-medium', adjustColorBrightness(state.branding.colors.bgDark, 15));
    root.style.setProperty('--bg-light', adjustColorBrightness(state.branding.colors.bgDark, 30));
}

function adjustColorBrightness(hex, percent) {
    // Hex zu RGB
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    
    // Aufhellen
    r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
    g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
    b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));
    
    // Zurück zu Hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function applyColorPreset(presetName) {
    const preset = COLOR_PRESETS[presetName];
    if (!preset) return;
    
    // Formular aktualisieren
    document.getElementById('color-primary').value = preset.primary;
    document.getElementById('color-primary-hex').value = preset.primary;
    document.getElementById('color-primary-dark').value = preset.primaryDark;
    document.getElementById('color-primary-dark-hex').value = preset.primaryDark;
    document.getElementById('color-accent').value = preset.accent;
    document.getElementById('color-accent-hex').value = preset.accent;
    document.getElementById('color-bg-dark').value = preset.bgDark;
    document.getElementById('color-bg-dark-hex').value = preset.bgDark;
    
    // Preset-Buttons aktualisieren
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === presetName);
    });
}

function resetBranding() {
    if (!confirm('Branding auf Standardwerte zurücksetzen?')) return;
    
    state.branding = {
        title: 'Comic Generator',
        tagline: 'Erstelle deinen eigenen Comic!',
        logo: '🎨',
        colors: { ...COLOR_PRESETS.default }
    };
    
    loadBrandingForm();
    applyBrandingToUI();
    saveBrandingToStorage();
    
    showToast('Branding zurückgesetzt', 'info');
}

function saveBrandingToStorage() {
    try {
        localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(state.branding));
    } catch (e) {
        console.warn('Branding konnte nicht gespeichert werden:', e);
    }
}

function loadBrandingFromStorage() {
    try {
        const saved = localStorage.getItem(BRANDING_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            state.branding = { ...state.branding, ...parsed };
            if (parsed.colors) {
                state.branding.colors = { ...state.branding.colors, ...parsed.colors };
            }
            applyBrandingToUI();
        }
    } catch (e) {
        console.warn('Branding konnte nicht geladen werden:', e);
    }
}

function setupColorInputSync() {
    // Sync color picker mit hex input
    const colorPairs = [
        ['color-primary', 'color-primary-hex'],
        ['color-primary-dark', 'color-primary-dark-hex'],
        ['color-accent', 'color-accent-hex'],
        ['color-bg-dark', 'color-bg-dark-hex']
    ];
    
    colorPairs.forEach(([colorId, hexId]) => {
        const colorInput = document.getElementById(colorId);
        const hexInput = document.getElementById(hexId);
        
        if (colorInput && hexInput) {
            colorInput.addEventListener('input', () => {
                hexInput.value = colorInput.value;
            });
            
            hexInput.addEventListener('input', () => {
                if (/^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) {
                    colorInput.value = hexInput.value;
                }
            });
        }
    });
}

function renderEditorItemsList() {
    const category = state.catalog[state.editor.currentCategory];
    if (!category) {
        elements.editorItemsList.innerHTML = '<p class="loading">Kategorie nicht gefunden</p>';
        return;
    }
    
    if (category.items.length === 0) {
        elements.editorItemsList.innerHTML = `
            <div class="editor-placeholder" style="padding: 2rem;">
                <p>Noch keine Elemente</p>
                <p class="hint">Klicke auf "➕ Neu" um ein Element zu erstellen</p>
            </div>
        `;
        return;
    }
    
    elements.editorItemsList.innerHTML = category.items.map(item => `
        <div class="editor-item ${item.id === state.editor.currentItemId ? 'active' : ''}" 
             data-id="${item.id}">
            <span class="item-icon">${item.icon}</span>
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-id">${item.id}</div>
            </div>
        </div>
    `).join('');
    
    // Add click listeners
    elements.editorItemsList.querySelectorAll('.editor-item').forEach(item => {
        item.addEventListener('click', () => {
            selectEditorItem(item.dataset.id);
        });
    });
}

function selectEditorItem(itemId) {
    state.editor.currentItemId = itemId;
    renderEditorItemsList();
    renderEditorDetailForm();
}

function renderEditorDetailPlaceholder() {
    elements.editorDetailContent.innerHTML = `
        <div class="editor-placeholder">
            <span class="placeholder-icon">👈</span>
            <p>Wähle ein Element zum Bearbeiten</p>
            <p class="hint">oder erstelle ein neues mit dem ➕ Button</p>
        </div>
    `;
}

function renderEditorDetailForm(isNew = false) {
    const category = state.catalog[state.editor.currentCategory];
    let item = null;
    
    if (!isNew && state.editor.currentItemId) {
        item = category.items.find(i => i.id === state.editor.currentItemId);
    }
    
    const formTitle = isNew ? 'Neues Element erstellen' : 'Element bearbeiten';
    
    elements.editorDetailContent.innerHTML = `
        <form class="editor-form" id="item-edit-form">
            <h4 style="font-family: var(--font-comic); color: var(--eah-primary-dark); margin-bottom: 0.5rem;">
                ${formTitle}
            </h4>
            
            <div class="form-row">
                <div class="form-group">
                    <label>ID <span class="required">*</span></label>
                    <input type="text" 
                           id="item-id" 
                           value="${item?.id || ''}" 
                           placeholder="z.B. my_character"
                           pattern="[a-z0-9_]+"
                           ${!isNew ? 'readonly' : ''}
                           required>
                    <span class="form-hint">Nur Kleinbuchstaben, Zahlen, Unterstriche</span>
                </div>
                
                <div class="form-group">
                    <label>Name <span class="required">*</span></label>
                    <input type="text" 
                           id="item-name" 
                           value="${item?.name || ''}" 
                           placeholder="z.B. Mein Charakter"
                           required>
                </div>
            </div>
            
            <div class="form-group">
                <label>Icon/Emoji <span class="required">*</span></label>
                <div class="icon-input-group">
                    <div class="icon-preview" id="icon-preview">${item?.icon || '❓'}</div>
                    <input type="text" 
                           id="item-icon" 
                           value="${item?.icon || ''}" 
                           placeholder="z.B. 🎭"
                           maxlength="4"
                           required>
                    <button type="button" class="emoji-picker-btn" id="open-emoji-picker">
                        📋 Auswählen
                    </button>
                </div>
                <div class="emoji-picker-popup hidden" id="emoji-picker-popup">
                    <!-- Wird dynamisch gerendert -->
                </div>
            </div>
            
            <div class="form-group">
                <label>Prompt-Text <span class="required">*</span></label>
                <textarea id="item-prompt" 
                          placeholder="Beschreibung für die Bildgenerierung..."
                          required>${item?.prompt || ''}</textarea>
                <span class="form-hint">Dieser Text wird für die KI-Bildgenerierung verwendet</span>
            </div>
            
            <div class="form-actions">
                <div class="form-actions-left">
                    ${!isNew ? `
                        <button type="button" class="action-btn danger" id="delete-item-btn">
                            🗑️ Löschen
                        </button>
                        <button type="button" class="action-btn secondary" id="duplicate-item-btn">
                            📋 Duplizieren
                        </button>
                    ` : ''}
                </div>
                <div class="form-actions-right">
                    <button type="button" class="action-btn secondary" id="cancel-edit-btn">
                        Abbrechen
                    </button>
                    <button type="submit" class="action-btn primary">
                        ${isNew ? '➕ Erstellen' : '💾 Speichern'}
                    </button>
                </div>
            </div>
        </form>
    `;
    
    // Setup form event listeners
    setupEditorFormListeners(isNew);
}

function setupEditorFormListeners(isNew) {
    const form = document.getElementById('item-edit-form');
    const iconInput = document.getElementById('item-icon');
    const iconPreview = document.getElementById('icon-preview');
    const emojiPickerBtn = document.getElementById('open-emoji-picker');
    const emojiPickerPopup = document.getElementById('emoji-picker-popup');
    
    // Icon input changes
    iconInput.addEventListener('input', () => {
        iconPreview.textContent = iconInput.value || '❓';
    });
    
    // Emoji picker toggle
    emojiPickerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (emojiPickerPopup.classList.contains('hidden')) {
            renderEmojiPicker(emojiPickerPopup, iconInput, iconPreview);
        }
        emojiPickerPopup.classList.toggle('hidden');
    });
    
    // Close emoji picker on outside click
    document.addEventListener('click', (e) => {
        if (!emojiPickerPopup.contains(e.target) && e.target !== emojiPickerBtn) {
            emojiPickerPopup.classList.add('hidden');
        }
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveEditorItem(isNew);
    });
    
    // Cancel button
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        state.editor.currentItemId = null;
        renderEditorItemsList();
        renderEditorDetailPlaceholder();
    });
    
    // Delete button (only for existing items)
    if (!isNew) {
        document.getElementById('delete-item-btn')?.addEventListener('click', deleteEditorItem);
        document.getElementById('duplicate-item-btn')?.addEventListener('click', duplicateEditorItem);
    }
}

function saveEditorItem(isNew) {
    const id = document.getElementById('item-id').value.trim();
    const name = document.getElementById('item-name').value.trim();
    const icon = document.getElementById('item-icon').value.trim();
    const prompt = document.getElementById('item-prompt').value.trim();
    
    // Validation
    if (!id || !name || !icon || !prompt) {
        showToast('Bitte fülle alle Pflichtfelder aus', 'error');
        return;
    }
    
    if (!/^[a-z0-9_]+$/.test(id)) {
        showToast('ID darf nur Kleinbuchstaben, Zahlen und Unterstriche enthalten', 'error');
        return;
    }
    
    const category = state.catalog[state.editor.currentCategory];
    
    if (isNew) {
        // Check for duplicate ID
        if (category.items.some(i => i.id === id)) {
            showToast('Ein Element mit dieser ID existiert bereits', 'error');
            return;
        }
        
        category.items.push({ id, name, icon, prompt });
        showToast('Element erstellt! 🎉', 'success');
    } else {
        const itemIndex = category.items.findIndex(i => i.id === state.editor.currentItemId);
        if (itemIndex > -1) {
            category.items[itemIndex] = { id, name, icon, prompt };
            showToast('Element gespeichert! ✓', 'success');
        }
    }
    
    state.editor.hasUnsavedChanges = true;
    state.editor.currentItemId = id;
    renderEditorItemsList();
    renderEditorDetailForm();
}

function deleteEditorItem() {
    if (!confirm('Möchtest du dieses Element wirklich löschen?')) {
        return;
    }
    
    const category = state.catalog[state.editor.currentCategory];
    const itemIndex = category.items.findIndex(i => i.id === state.editor.currentItemId);
    
    if (itemIndex > -1) {
        category.items.splice(itemIndex, 1);
        state.editor.currentItemId = null;
        state.editor.hasUnsavedChanges = true;
        
        renderEditorItemsList();
        renderEditorDetailPlaceholder();
        showToast('Element gelöscht', 'info');
    }
}

function duplicateEditorItem() {
    const category = state.catalog[state.editor.currentCategory];
    const item = category.items.find(i => i.id === state.editor.currentItemId);
    
    if (!item) return;
    
    // Generate new ID
    let newId = item.id + '_copy';
    let counter = 1;
    while (category.items.some(i => i.id === newId)) {
        newId = item.id + '_copy' + counter;
        counter++;
    }
    
    category.items.push({
        id: newId,
        name: item.name + ' (Kopie)',
        icon: item.icon,
        prompt: item.prompt
    });
    
    state.editor.hasUnsavedChanges = true;
    state.editor.currentItemId = newId;
    renderEditorItemsList();
    renderEditorDetailForm();
    
    showToast('Element dupliziert! 📋', 'success');
}

function createNewEditorItem() {
    state.editor.currentItemId = null;
    renderEditorItemsList();
    renderEditorDetailForm(true);
}

function saveCatalogChanges() {
    if (saveCatalogToStorage()) {
        state.editor.hasUnsavedChanges = false;
        renderCatalog();
        showToast('Katalog gespeichert! 💾', 'success');
    } else {
        showToast('Fehler beim Speichern', 'error');
    }
}

function resetCatalog() {
    if (!state.originalCatalog) {
        showToast('Original-Katalog nicht verfügbar', 'error');
        return;
    }
    
    if (!confirm('Möchtest du wirklich alle Änderungen verwerfen und den Original-Katalog wiederherstellen?')) {
        return;
    }
    
    state.catalog = JSON.parse(JSON.stringify(state.originalCatalog));
    localStorage.removeItem(CATALOG_STORAGE_KEY);
    
    state.editor.currentItemId = null;
    state.editor.hasUnsavedChanges = false;
    
    renderEditorItemsList();
    renderEditorDetailPlaceholder();
    renderCatalog();
    
    showToast('Katalog zurückgesetzt! 🔄', 'success');
}

function exportCatalog() {
    const dataStr = JSON.stringify(state.catalog, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `comic_catalog_${Date.now()}.json`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Katalog exportiert! 📤', 'success');
}

function importCatalog(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const importedCatalog = JSON.parse(e.target.result);
            
            // Validate structure
            const requiredCategories = ['protagonists', 'scene', 'action', 'style', 'specials'];
            for (const cat of requiredCategories) {
                if (!importedCatalog[cat] || !importedCatalog[cat].items) {
                    throw new Error(`Kategorie "${cat}" fehlt oder ist ungültig`);
                }
            }
            
            state.catalog = importedCatalog;
            state.editor.hasUnsavedChanges = true;
            state.editor.currentItemId = null;
            
            renderEditorItemsList();
            renderEditorDetailPlaceholder();
            
            showToast('Katalog importiert! 📥 Vergiss nicht zu speichern.', 'success');
            
        } catch (error) {
            showToast('Import-Fehler: ' + error.message, 'error');
        }
    };
    
    reader.onerror = () => {
        showToast('Datei konnte nicht gelesen werden', 'error');
    };
    
    reader.readAsText(file);
}

// ============================================
// Download Functionality
// ============================================
async function downloadStrip() {
    if (state.comicStrip.length === 0) {
        showToast('Keine Bilder zum Herunterladen', 'error');
        return;
    }
    
    showToast('Download wird vorbereitet...', 'info');
    
    try {
        if (typeof html2canvas === 'undefined') {
            showToast('html2canvas wird geladen...', 'info');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        }
        
        // Strip-Container temporär für besseres Rendering anpassen
        const stripElement = elements.comicStrip;
        const originalStyle = stripElement.style.cssText;
        
        // Für sauberes Rendering
        stripElement.style.background = '#ffffff';
        stripElement.style.padding = '20px';
        stripElement.style.borderRadius = '0';
        stripElement.style.border = 'none';
        
        const canvas = await html2canvas(stripElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            // Warte auf Bilder
            onclone: (clonedDoc) => {
                const clonedStrip = clonedDoc.getElementById('comic-strip');
                if (clonedStrip) {
                    clonedStrip.style.background = '#ffffff';
                    // Polaroid-Rotation entfernen für sauberen Export
                    clonedStrip.querySelectorAll('.polaroid-card').forEach(card => {
                        card.style.transform = 'none';
                    });
                    // Action-Buttons verstecken
                    clonedStrip.querySelectorAll('.polaroid-actions').forEach(actions => {
                        actions.style.display = 'none';
                    });
                }
            }
        });
        
        // Original-Style wiederherstellen
        stripElement.style.cssText = originalStyle;
        
        const link = document.createElement('a');
        link.download = `comic_strip_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        showToast('Comic-Strip heruntergeladen! 📥', 'success');
        
    } catch (error) {
        console.error('Download error:', error);
        showToast('Download-Fehler: ' + error.message, 'error');
    }
}

// Einzelne Polaroid-Karte herunterladen
async function downloadSingleCard(index) {
    if (!state.comicStrip[index]) {
        showToast('Karte nicht gefunden', 'error');
        return;
    }
    
    showToast('Download wird vorbereitet...', 'info');
    
    try {
        if (typeof html2canvas === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        }
        
        const cardElement = elements.comicStrip.querySelector(`[data-index="${index}"]`);
        if (!cardElement) {
            throw new Error('Karte nicht im DOM gefunden');
        }
        
        const canvas = await html2canvas(cardElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            onclone: (clonedDoc, element) => {
                element.style.transform = 'none';
                element.style.margin = '0';
                const actions = element.querySelector('.polaroid-actions');
                if (actions) actions.style.display = 'none';
            }
        });
        
        const link = document.createElement('a');
        link.download = `comic_panel_${index + 1}_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        showToast('Bild heruntergeladen! 📥', 'success');
        
    } catch (error) {
        console.error('Download error:', error);
        showToast('Download-Fehler: ' + error.message, 'error');
    }
}

// Helper: Script dynamisch laden
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ============================================
// UI Helpers
// ============================================
function showLoading(show) {
    if (show) {
        elements.loadingOverlay.classList.remove('hidden');
    } else {
        elements.loadingOverlay.classList.add('hidden');
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✔' : type === 'error' ? '✗' : 'ℹ'}</span>
        <span class="toast-message">${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// ============================================
// Event Listeners Setup
// ============================================
function setupEventListeners() {
    // Generate button
    elements.generateBtn.addEventListener('click', generateImage);
    
    // Strip actions
    elements.clearStripBtn.addEventListener('click', clearComicStrip);
    elements.downloadStripBtn.addEventListener('click', downloadStrip);
    
    // Bubble modal
    elements.bubbleModal.querySelector('.modal-backdrop').addEventListener('click', closeBubbleEditor);
    elements.bubbleModal.querySelector('.modal-close').addEventListener('click', closeBubbleEditor);
    
    // Bubble type selector
    elements.bubbleModal.querySelectorAll('.bubble-type').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.bubbleModal.querySelectorAll('.bubble-type').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBubbleType = btn.dataset.type;
            // Update preview if it exists
            if (bubblePreviewElement) {
                bubblePreviewElement.className = `bubble-preview ${currentBubbleType} hidden`;
            }
        });
    });
    
    // Configurator
    elements.openConfiguratorBtn.addEventListener('click', openConfigurator);
    elements.catalogEditorModal.querySelector('.modal-backdrop').addEventListener('click', closeConfigurator);
    elements.catalogEditorModal.querySelector('.modal-close').addEventListener('click', closeConfigurator);
    
    // Editor tabs
    elements.catalogEditorModal.querySelectorAll('.editor-tab').forEach(tab => {
        tab.addEventListener('click', () => switchEditorCategory(tab.dataset.category));
    });
    
    // Editor actions
    elements.addItemBtn.addEventListener('click', createNewEditorItem);
    elements.saveCatalogBtn.addEventListener('click', saveCatalogChanges);
    elements.resetCatalogBtn.addEventListener('click', resetCatalog);
    elements.exportCatalogBtn.addEventListener('click', exportCatalog);
    
    // Import
    elements.importCatalogBtn.addEventListener('click', () => elements.importFileInput.click());
    elements.importFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importCatalog(e.target.files[0]);
            e.target.value = ''; // Reset input
        }
    });
    
    // Branding controls
    const applyBrandingBtn = document.getElementById('apply-branding-btn');
    const resetBrandingBtn = document.getElementById('reset-branding-btn');
    const logoPickerBtn = document.getElementById('branding-logo-picker-btn');
    
    if (applyBrandingBtn) {
        applyBrandingBtn.addEventListener('click', applyBranding);
    }
    
    if (resetBrandingBtn) {
        resetBrandingBtn.addEventListener('click', resetBranding);
    }
    
    // Logo Emoji Picker
    if (logoPickerBtn) {
        logoPickerBtn.addEventListener('click', () => {
            const logoInput = document.getElementById('branding-logo');
            const existingPicker = document.querySelector('.logo-emoji-picker');
            
            if (existingPicker) {
                existingPicker.remove();
                return;
            }
            
            const picker = document.createElement('div');
            picker.className = 'emoji-picker-popup logo-emoji-picker';
            
            // Einfache Emoji-Auswahl für Logo
            const logoEmojis = [
                '🎨', '🦉', '🎬', '📚', '🎓', '🏫', '🌟', '⭐', '✨', '💫',
                '🚀', '💡', '🔥', '❤️', '💙', '💚', '💜', '🧡', '💛', '🤍',
                '🎯', '🏆', '👑', '🎪', '🎭', '🎸', '🎹', '🎤', '📷', '🎥',
                '🌈', '☀️', '🌙', '⚡', '🌸', '🌺', '🍀', '🌿', '🦋', '🐝',
                '🤖', '👾', '🎮', '🕹️', '💻', '📱', '⚙️', '🔧', '🛠️', '🧪'
            ];
            
            picker.innerHTML = `
                <div class="emoji-grid" style="grid-template-columns: repeat(10, 1fr);">
                    ${logoEmojis.map(e => `<button type="button" class="emoji-btn">${e}</button>`).join('')}
                </div>
            `;
            
            logoPickerBtn.parentElement.appendChild(picker);
            
            picker.querySelectorAll('.emoji-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    logoInput.value = btn.textContent;
                    picker.remove();
                });
            });
            
            // Close on click outside
            setTimeout(() => {
                document.addEventListener('click', function closePickerHandler(e) {
                    if (!picker.contains(e.target) && e.target !== logoPickerBtn) {
                        picker.remove();
                        document.removeEventListener('click', closePickerHandler);
                    }
                });
            }, 100);
        });
    }
    
    // Color Presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyColorPreset(btn.dataset.preset);
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeBubbleEditor();
            // Don't auto-close catalog editor on ESC (might have unsaved changes)
        }
    });
}

// ============================================
// Start Application
// ============================================
document.addEventListener('DOMContentLoaded', init);
