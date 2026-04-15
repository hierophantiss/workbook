/* ═══════════════════════════════════════════
   js/companion2.js — Companion 2.0 Routing Engine (Stable Version)
   ═══════════════════════════════════════════ */

var c2CurrentFlow = null;
var c2CurrentStep = null;
var c2FlowHistory = [];
var c2SheetVisible = false;

// 1. Αρχικοποίηση Δεδομένων Χρήστη
function c2EnsureState() {
    if (typeof window.companionData === 'undefined') {
        window.companionData = JSON.parse(localStorage.getItem('companionData')) || {};
    }
    var d = window.companionData;
    if (!d.chapterProgress) d.chapterProgress = {};
    if (!d.moodHistory) d.moodHistory = [];
    if (!d.faqSeen) d.faqSeen = {};
    if (!d.conceptsSeen) d.conceptsSeen = [];
    if (!d.depthPreference) d.depthPreference = 1;
    if (!d.lastChapter) d.lastChapter = 1;
    if (typeof d.microDosesDone === 'undefined') d.microDosesDone = 0;
    saveCompanionData(d);
}

// 2. Δημιουργία του UI (Sheet)
function c2Init() {
    if (document.getElementById('c2-sheet')) return;
    c2EnsureState();
    
    var sheet = document.createElement('div');
    sheet.id = 'c2-sheet';
    sheet.className = 'c2-sheet';
    sheet.innerHTML = `
        <div class="c2-sheet-handle" onclick="window.c2ToggleSheet()">
            <div class="c2-handle-bar"></div>
        </div>
        <div class="c2-sheet-content" id="c2-content"></div>`;
    document.body.appendChild(sheet);

    var fab = document.getElementById('companion-fab');
    if (fab) {
        fab.onclick = function(e) {
            e.stopPropagation();
            if (typeof tapFeedback === 'function') tapFeedback();
            window.c2ToggleSheet();
        };
    }
}

// 3. Διαχείριση Εμφάνισης
function c2ToggleSheet() { 
    c2SheetVisible ? window.c2HideSheet() : window.c2ShowSheet(); 
}

function c2ShowSheet() {
    var sheet = document.getElementById('c2-sheet');
    if (!sheet) return;
    c2EnsureState();
    window.c2ShowMainMenu();
    sheet.classList.add('visible');
    c2SheetVisible = true;
}

function c2HideSheet() {
    var sheet = document.getElementById('c2-sheet');
    if (sheet) sheet.classList.remove('visible');
    c2SheetVisible = false;
    c2CurrentFlow = null;
    c2CurrentStep = null;
    c2FlowHistory = [];
}

// 4. Κεντρικό Μενού
function c2ShowMainMenu() {
    var lang = (typeof LANG !== 'undefined') ? LANG : 'el';
    var html = `
        <div class="c2-header">
            <div class="c2-greeting">
                <div class="c2-greeting-text">${lang === 'el' ? 'Πώς μπορώ να βοηθήσω;' : 'How can I help?'}</div>
            </div>
            <button class="c2-close" onclick="window.c2HideSheet()">✕</button>
        </div>
        <div class="c2-menu">
            ${c2MenuBtn('💭', lang === 'el' ? 'Πώς νιώθεις;' : 'How do you feel?', 'moodCheck')}
            ${c2MenuBtn('❓', lang === 'el' ? 'Ρώτα κάτι' : 'Ask something', 'chapterExplore')}
            ${c2MenuBtn('🔍', lang === 'el' ? 'Τι σημαίνει...' : 'What does it mean...', 'conceptExplore')}
            ${c2MenuBtn('⏱', lang === 'el' ? 'Τι μπορώ να κάνω;' : 'What can I do?', 'whatToDo')}
        </div>`;
    document.getElementById('c2-content').innerHTML = html;
}

function c2MenuBtn(icon, title, flowId) {
    return `
    <button class="c2-menu-btn" onclick="window.c2StartFlow('${flowId}')">
        <span class="c2-menu-icon">${icon}</span>
        <div class="c2-menu-text"><div class="c2-menu-title">${title}</div></div>
        <span class="c2-menu-arrow">›</span>
    </button>`;
}

// 5. Μηχανή Ροής (Flow Engine)
function c2StartFlow(flowId) {
    if (typeof CONVERSATION_FLOWS === 'undefined' || !CONVERSATION_FLOWS[flowId]) return;
    c2CurrentFlow = CONVERSATION_FLOWS[flowId];
    c2FlowHistory = [];
    window.c2RunStep(c2CurrentFlow.steps[0].id);
}

function c2RunStep(stepId) {
    if (!c2CurrentFlow || stepId === 'end') { window.c2ShowMainMenu(); return; }

    var step = c2CurrentFlow.steps.find(function(s) { return s.id === stepId; });
    if (!step) return;

    c2CurrentStep = step;
    var lang = (typeof LANG !== 'undefined') ? LANG : 'el';

    // Επιλογή renderer ανάλογα με τον τύπο του step
    if (step.type === 'mood_select') {
        window.c2RenderMoodSelect(step, lang);
    } else if (step.type === 'mood_response') {
        window.c2RenderMoodResponse(lang);
    } else {
        window.c2RenderGenericSelect(step, lang);
    }
}

// 6. Renderers (Εμφάνιση περιεχομένου)
function c2RenderGenericSelect(step, lang) {
    var title = step.text ? step.text[lang] : "...";
    var html = `<div class="c2-back-row"><button class="c2-back" onclick="window.c2ShowMainMenu()">←</button><span class="c2-back-title">${title}</span></div>`;
    html += '<div class="c2-options">';
    
    if (step.options) {
        step.options.forEach(function(opt) {
            var label = opt.label[lang] || opt.label;
            var action = "";
            if (opt.next) action = `window.c2RunStep('${opt.next}')`;
            else if (opt.run) action = `window.c2HideSheet(); ${opt.run}`;
            else action = `window.c2ShowMainMenu()`;

            html += `<button class="c2-option-btn" onclick="${action}">${label}</button>`;
        });
    }
    html += '</div>';
    document.getElementById('c2-content').innerHTML = html;
}

function c2RenderMoodSelect(step, lang) {
    var title = step.text[lang];
    var html = `<div class="c2-back-row"><button class="c2-back" onclick="window.c2ShowMainMenu()">←</button><span class="c2-back-title">${title}</span></div>`;
    html += '<div class="c2-mood-grid">';
    
    Object.keys(MOOD_CATEGORIES).forEach(function(catKey) {
        var cat = MOOD_CATEGORIES[catKey];
        html += `<div class="c2-mood-category"><div class="c2-mood-cat-label" style="color:${cat.color}">${cat[lang]}</div>`;
        cat.moods.forEach(function(mKey) {
            var route = MOOD_ROUTES[mKey];
            if (route) {
                html += `
                <button class="c2-mood-btn" onclick="window.c2HandleMoodClick('${mKey}')">
                    <span class="c2-mood-icon">${route.icon}</span>
                    <span class="c2-mood-label">${route.label[lang]}</span>
                </button>`;
            }
        });
        html += '</div>';
    });
    html += '</div>';
    document.getElementById('c2-content').innerHTML = html;
}

function c2HandleMoodClick(moodKey) {
    window.companionData.lastMoodRoute = moodKey;
    saveCompanionData(window.companionData);
    window.c2RunStep('route_by_mood');
}

function c2RenderMoodResponse(lang) {
    var moodKey = window.companionData.lastMoodRoute;
    var route = MOOD_ROUTES[moodKey];
    if (!route) return window.c2ShowMainMenu();

    var resp = route.response[lang];
    var html = `<div class="c2-back-row"><button class="c2-back" onclick="window.c2RunStep('ask_mood')">←</button><span class="c2-back-title">${route.label[lang]}</span></div>`;
    html += `
        <div class="c2-response">
            <div class="c2-resp-msg">${resp.msg}</div>
            ${resp.task ? `<div class="c2-resp-task">${resp.task}</div>` : ''}
            <div class="c2-resp-wisdom">"${resp.wisdom}"</div>
        </div>
        <div class="c2-actions">`;
    
    route.actions.forEach(function(act) {
        var label = act.label[lang];
        html += `<button class="c2-action-btn" onclick="window.c2HideSheet(); ${act.run}">${label}</button>`;
    });
    
    html += `</div>`;
    document.getElementById('c2-content').innerHTML = html;
}

// Εκθέτουμε τις συναρτήσεις στο window
window.c2Init = c2Init;
window.c2ToggleSheet = c2ToggleSheet;
window.c2ShowSheet = c2ShowSheet;
window.c2HideSheet = c2HideSheet;
window.c2StartFlow = c2StartFlow;
window.c2RunStep = c2RunStep;
window.c2ShowMainMenu = c2ShowMainMenu;
window.c2RenderMoodSelect = c2RenderMoodSelect;
window.c2HandleMoodClick = c2HandleMoodClick;
window.c2RenderMoodResponse = c2RenderMoodResponse;
window.c2RenderGenericSelect = c2RenderGenericSelect;

// Auto-init
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(window.c2Init, 600);
});