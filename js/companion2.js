/* ═══════════════════════════════════════════
   js/companion2.js — Companion 2.0 Routing Engine
   v2.5 — FIXED + FLOATING ∞ BUTTON + Event Delegation
   ============================================= */

// SAFE showScreen wrapper
window.c2SafeShowScreen = function(screen) {
  try {
    if (typeof window.showScreen === 'function') return window.showScreen(screen);
  } catch (e) { console.error('c2SafeShowScreen error', e); }
};

// ERROR LOGGING (όλο το σύστημα logs που είχες)
var c2ErrorLog = [];
var MAX_LOG_ENTRIES = 100;

(function() {
  try {
    var saved = localStorage.getItem('c2_error_log');
    if (saved) c2ErrorLog = JSON.parse(saved);
    if (!Array.isArray(c2ErrorLog)) c2ErrorLog = [];
  } catch(e) { c2ErrorLog = []; }
})();

function c2SaveErrorLog() {
  try {
    if (c2ErrorLog.length > MAX_LOG_ENTRIES) c2ErrorLog = c2ErrorLog.slice(-MAX_LOG_ENTRIES);
    localStorage.setItem('c2_error_log', JSON.stringify(c2ErrorLog));
  } catch(e) {}
}

function c2LogError(source, message, stack, extra) {
  var entry = { timestamp: new Date().toISOString(), source, message: String(message), stack: stack || null, extra: extra || null };
  c2ErrorLog.push(entry);
  c2SaveErrorLog();
  console.warn('[C2 Logged Error]', entry);
}

window.addEventListener('error', e => c2LogError('global', e.message, e.error?.stack, {file: e.filename, line: e.lineno}));
window.addEventListener('unhandledrejection', e => c2LogError('promise', e.reason, e.reason?.stack));

// STATE
var c2SheetVisible = false;

function c2EnsureState() {
  if (typeof companionData === 'undefined') window.companionData = {};
  var cd = companionData;
  if (!cd.preferredAxis) cd.preferredAxis = null;
  if (!cd.chapterProgress) cd.chapterProgress = {};
  if (!cd.lastChapter) cd.lastChapter = 1;
}

function c2HideSheet() {
  const sheet = document.getElementById('c2-sheet');
  if (sheet) sheet.style.transform = 'translateY(100%)';
  c2SheetVisible = false;
}

window.c2ToggleSheet = function() {
  const sheet = document.getElementById('c2-sheet');
  if (!sheet) return;
  c2SheetVisible = !c2SheetVisible;
  sheet.style.transform = c2SheetVisible ? 'translateY(0)' : 'translateY(100%)';
};

// CREATE FLOATING ∞ BUTTON (αυτό έλειπε!)
function c2CreateFloatingButton() {
  if (document.getElementById('c2-floating-btn')) return;
  const btn = document.createElement('div');
  btn.id = 'c2-floating-btn';
  btn.innerHTML = '∞';
  btn.style.cssText = `
    position:fixed; bottom:30px; right:30px; z-index:99999;
    width:68px; height:68px; border-radius:50%; background:#1a1a1a;
    color:#fff; font-size:42px; display:flex; align-items:center;
    justify-content:center; box-shadow:0 6px 20px rgba(0,0,0,0.4);
    cursor:pointer; user-select:none; touch-action:manipulation;
  `;
  btn.onclick = window.c2ToggleSheet;
  document.body.appendChild(btn);
}

// KNOWLEDGE + ΕΠΙΣΤΗΜΟΝΙΚΗ ΕΞΗΓΗΣΗ
function c2GetChapterGuidance(chapter) {
  const lang = typeof LANG !== 'undefined' ? LANG : 'el';
  return {
    title: lang === 'el' ? `Άξονας ${chapter}` : `Axis ${chapter}`,
    icon: ['🧍','🫁','👁','✦'][chapter-1],
    wisdom: lang === 'el' ? 'Η παρουσία αρχίζει με μικρές νίκες.' : 'Presence starts with small victories.',
    science: lang === 'el' 
      ? `Η **insula** επεξεργάζεται την **interoception**. Το progressive body scan ενεργοποιεί νέους νευρώνες → καλύτερη ρύθμιση συναισθημάτων και λιγότερο overwhelm (ιδανικό για ADHD/autism).`
      : `The **insula** processes **interoception**. Progressive body scan grows new neural connections → better emotion regulation.`,
    micro: lang === 'el' ? 'Ξεκίνα με 10 δευτερόλεπτα αίσθησης του σώματος.' : 'Start with 10 seconds of body awareness.',
    nextPrompt: lang === 'el' ? 'Θέλεις να κάνουμε progressive body scan τώρα;' : 'Shall we do the progressive body scan now?'
  };
}

// 4 ΕΠΙΛΟΓΕΣ
function c2DecideView() {
  const lang = typeof LANG !== 'undefined' ? LANG : 'el';
  const content = document.getElementById('c2-content');
  content.innerHTML = `
    <div class="c2-header">
      <h2>${lang === 'el' ? 'Πώς νιώθεις σήμερα;' : 'How are you feeling today?'}</h2>
      <p>${lang === 'el' ? 'Επίλεξε έναν άξονα και θα σε οδηγήσω με βάση το workbook + επιστημονικά στοιχεία.' : 'Choose an axis and I will guide you using the workbook + science.'}</p>
    </div>
    <div class="c2-options-grid">
      <button class="c2-option-btn" data-action="axis" data-chapter="1">🧍 <strong>${lang === 'el' ? 'Σώμα' : 'Body'}</strong><br><small>Insula + Interoception</small></button>
      <button class="c2-option-btn" data-action="axis" data-chapter="2">🫁 <strong>${lang === 'el' ? 'Αναπνοή' : 'Breath'}</strong><br><small>Vagus nerve</small></button>
      <button class="c2-option-btn" data-action="axis" data-chapter="3">👁 <strong>${lang === 'el' ? 'Προσοχή' : 'Attention'}</strong><br><small>Default Mode Network</small></button>
      <button class="c2-option-btn" data-action="axis" data-chapter="4">✦ <strong>${lang === 'el' ? 'Χώρος' : 'Space'}</strong><br><small>Open awareness</small></button>
    </div>
    <div class="c2-footer"><button onclick="window.c2HideSheet()" class="c2-close-btn">${lang === 'el' ? 'Κλείσιμο' : 'Close'}</button></div>
  `;
}

// EVENT DELEGATION
function c2SetupClickDelegation() {
  const sheet = document.getElementById('c2-sheet');
  if (!sheet) return;
  sheet.addEventListener('click', function(e) {
    const btn = e.target.closest('.c2-option-btn');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const chapter = parseInt(btn.getAttribute('data-chapter'));
    if (action === 'axis') {
      e.stopImmediatePropagation();
      const guidance = c2GetChapterGuidance(chapter);
      const content = document.getElementById('c2-content');
      content.innerHTML = `
        <div class="c2-guidance">
          <h2>${guidance.icon} ${guidance.title}</h2>
          <p><strong>${guidance.wisdom}</strong></p>
          <div class="c2-science-box"><strong>Επιστημονικά:</strong><br>${guidance.science}</div>
          <p><em>${guidance.micro}</em></p>
          <p>${guidance.nextPrompt}</p>
          <div class="c2-action-buttons">
            <button onclick="window.c2StartProgressiveBodyScan(${chapter}); window.c2HideSheet()" class="c2-primary-btn">✅ Ναι, ξεκίνα body scan</button>
            <button onclick="window.c2HideSheet()" class="c2-secondary-btn">Όχι τώρα</button>
          </div>
        </div>
      `;
    }
  }, true);
}

window.c2StartProgressiveBodyScan = function(chapter) {
  c2LogError('c2StartProgressiveBodyScan', `Started for chapter ${chapter}`, null, {chapter});
  alert(`🚀 Ξεκινάμε Progressive Body Scan (4 στάδια insula) για Άξονα ${chapter}\n\n1. Χέρια\n2. Στήθος & αναπνοή\n3. Κοιλιά\n4. Ολόκληρο σώμα`);
};

// INIT + CREATE BUTTON + SHEET
function c2Init() {
  try {
    if (document.getElementById('c2-sheet')) return;
    c2EnsureState();
    
    // 1. Δημιουργία κάτω sheet
    var sheet = document.createElement('div');
    sheet.id = 'c2-sheet';
    sheet.className = 'c2-sheet';
    sheet.innerHTML = `<div class="c2-sheet-handle" onclick="window.c2ToggleSheet()"><div class="c2-handle-bar"></div></div><div class="c2-sheet-content" id="c2-content"></div>`;
    document.body.appendChild(sheet);
    
    // 2. Δημιουργία floating ∞ button
    c2CreateFloatingButton();
    
    c2SetupClickDelegation();
    setTimeout(() => { c2DecideView(); }, 10);
  } catch(e) { c2LogError('c2Init', e.message, e.stack); }
}

window.addEventListener('load', c2Init);
console.log('%c✅ Companion 2.5 loaded — Floating ∞ button + full flow!', 'color:#0a0;font-weight:bold');
