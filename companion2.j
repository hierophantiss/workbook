/* ═══════════════════════════════════════════
   js/companion2.js — Companion 2.0 Routing Engine (Fixed)
   ═══════════════════════════════════════════ */

var c2CurrentFlow = null;
var c2CurrentStep = null;
var c2FlowHistory = [];
var c2SheetVisible = false;

// 1. Δημιουργία του Sheet στο DOM
function c2Init() {
    if (document.getElementById('c2-sheet')) return;
    
    var sheet = document.createElement('div');
    sheet.id = 'c2-sheet';
    sheet.className = 'c2-sheet';
    sheet.innerHTML = `
        <div class="c2-sheet-handle" onclick="window.c2ToggleSheet()">
            <div class="c2-handle-bar"></div>
        </div>
        <div class="c2-sheet-content" id="c2-content"></div>`;
    document.body.appendChild(sheet);

    // Σύνδεση με το FAB κουμπί
    var fab = document.getElementById('companion-fab');
    if (fab) {
        fab.onclick = function(e) {
            e.stopPropagation();
            window.tapFeedback();
            window.c2ToggleSheet();
        };
    }
}

// 2. Διαχείριση Sheet (Άνοιγμα/Κλείσιμο)
window.c2ToggleSheet = function() {
    c2SheetVisible ? window.c2HideSheet() : window.c2ShowSheet();
};

window.c2ShowSheet = function() {
    var sheet = document.getElementById('c2-sheet');
    if (!sheet) return;
    window.c2ShowMainMenu();
    sheet.classList.add('visible');
    c2SheetVisible = true;
};

window.c2HideSheet = function() {
    var sheet = document.getElementById('c2-sheet');
    if (sheet) sheet.classList.remove('visible');
    c2SheetVisible = false;
    c2CurrentFlow = null;
    c2CurrentStep = null;
};

// 3. Κεντρικό Μενού
window.c2ShowMainMenu = function() {
    var lang = window.LANG || 'el';
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
};

function c2MenuBtn(icon, title, flowId) {
    return `
    <button class="c2-menu-btn" onclick="window.c2StartFlow('${flowId}')">
        <span class="c2-menu-icon">${icon}</span>
        <div class="c2-menu-text"><div class="c2-menu-title">${title}</div></div>
        <span class="c2-menu-arrow">›</span>
    </button>`;
}

// 4. Μηχανή Ροής (Routing Engine)
window.c2StartFlow = function(flowId) {
    if (typeof CONVERSATION_FLOWS === 'undefined' || !CONVERSATION_FLOWS[flowId]) {
        console.error("Flow error:", flowId);
        return;
    }
    c2CurrentFlow = CONVERSATION_FLOWS[flowId];
    window.c2RunStep(c2CurrentFlow.steps[0].id);
};

window.c2RunStep = function(stepId) {
    if (!c2CurrentFlow) return;
    if (stepId === 'end') return window.c2ShowMainMenu();

    var step = c2CurrentFlow.steps.find(function(s) { return s.id === stepId; });
    if (!step) return;

    c2CurrentStep = step;
    var lang = window.LANG || 'el';

    // Απόφαση για το τι θα εμφανιστεί
    if (step.type === 'mood_select') {
        window.c2RenderMoodSelect(step, lang);
    } else if (step.type === 'mood_response') {
        window.c2RenderMoodResponse(lang);
    } else {
        window.c2RenderGenericSelect(step, lang);
    }
};

// 5. Renderers (HTML Generators)
window.c2RenderGenericSelect = function(step, lang) {
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
};

window.c2RenderMoodSelect = function(step, lang) {
    var html = `<div class="c2-back-row"><button class="c2-back" onclick="window.c2ShowMainMenu()">←</button><span class="c2-back-title">${step.text[lang]}</span></div>`;
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
};

window.c2HandleMoodClick = function(moodKey) {
    window.companionData.lastMoodRoute = moodKey;
    window.saveCompanionData(window.companionData);
    window.c2RunStep('route_by_mood');
};

window.c2RenderMoodResponse = function(lang) {
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
};

// Αυτόματη εκκίνηση
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(c2Init, 600);
});
