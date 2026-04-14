/* ═══════════════════════════════════════════
   js/companion2.js — Companion 2.0 Routing Engine
   v2.4 — FULL FIXED FLOW + Event Delegation + Progressive Body Scan
   ============================================= */

// 🛡️ SAFE showScreen wrapper (από την v2.2 σου)
window.c2SafeShowScreen = function(screen) {
  try {
    if (typeof window.showScreen === 'function') {
      return window.showScreen(screen);
    }
  } catch (e) {
    console.error('c2SafeShowScreen error', e);
  }
};

// 🔒 Protect showScreen
(function protectShowScreen() {
  if (!window._c2_showScreen_wrapped && typeof window.showScreen === 'function') {
    const originalShowScreen = window.showScreen;
    window.showScreen = function() {
      return originalShowScreen.apply(this, arguments);
    };
    window._c2_showScreen_wrapped = true;
  }
})();

// ⭐ ERROR LOGGING (όλο το σύστημα logs που είχες ήδη)
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

window.addEventListener('error', function(e) {
  c2LogError('global window.onerror', e.message, e.error ? e.error.stack : null, { filename: e.filename, lineno: e.lineno });
});

window.addEventListener('unhandledrejection', function(e) {
  c2LogError('unhandledrejection', e.reason, e.reason ? e.reason.stack : null, { promise: e.promise });
});

window.c2ExportLogs = function() {
  var dataStr = JSON.stringify(c2ErrorLog, null, 2);
  var blob = new Blob([dataStr], {type: 'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'c2_error_log_' + new Date().toISOString().slice(0,19).replace(/:/g,'-') + '.json';
  a.click(); URL.revokeObjectURL(url);
};

window.c2ShowLogsModal = function() { /* ίδιο όπως στην v2.2 σου */ 
  // (ο κώδικας του modal logs παραμένει ακριβώς όπως τον είχες)
  var lang = typeof LANG !== 'undefined' ? LANG : 'el';
  var logCount = c2ErrorLog.length;
  var html = '<div class="c2-back-row"><span class="c2-back-title">Error Log (' + logCount + ')</span>' +
    '<button class="c2-close" onclick="window.c2HideSheet()">X</button></div>' +
    '<div style="padding:16px; max-height:60vh; overflow:auto; font-family:monospace; font-size:12px;">';
  if (logCount === 0) {
    html += '<p style="color:#888;">' + (lang === 'el' ? 'Δεν υπάρχουν καταγεγραμμένα σφάλματα.' : 'No errors logged.') + '</p>';
  } else {
    for (var i = c2ErrorLog.length - 1; i >= 0; i--) {
      var entry = c2ErrorLog[i];
      html += '<div style="border-bottom:1px solid #ddd; padding:8px 0;">' +
        '<strong>' + entry.timestamp + '</strong> ' + entry.source + '<br>' +
        '<span style="color:#c00;">' + entry.message + '</span><br>';
      if (entry.stack) html += '<pre style="margin:4px 0 0; white-space:pre-wrap;">' + entry.stack + '</pre>';
      if (entry.extra) html += '<pre style="margin:4px 0 0; white-space:pre-wrap;">' + JSON.stringify(entry.extra, null, 2) + '</pre>';
      html += '</div>';
    }
  }
  html += '</div><div class="c2-actions" style="padding:12px;">' +
    '<button class="c2-action-btn" onclick="window.c2ExportLogs()">Download JSON</button>' +
    '<button class="c2-action-btn c2-action-secondary" onclick="navigator.clipboard?.writeText(JSON.stringify(c2ErrorLog, null, 2));alert(\'' + (lang === 'el' ? 'Αντιγράφηκε!' : 'Copied!') + '\')">Copy</button>' +
    '<button class="c2-action-btn c2-action-secondary" onclick="window.c2HideSheet()">Close</button></div>';
  document.getElementById('c2-content').innerHTML = html;
};

function c2SetupLogTrigger() {
  var handle = document.querySelector('.c2-sheet-handle');
  if (handle) handle.addEventListener('dblclick', function(e) { e.stopPropagation(); window.c2ShowLogsModal(); });
}

// === STATE ===
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

// === KNOWLEDGE + ΕΠΙΣΤΗΜΟΝΙΚΗ ΕΞΗΓΗΣΗ ===
function c2GetChapterGuidance(chapter) {
  const lang = typeof LANG !== 'undefined' ? LANG : 'el';
  return {
    title: lang === 'el' ? `Άξονας ${chapter}` : `Axis ${chapter}`,
    icon: ['🧍','🫁','👁','✦'][chapter-1],
    wisdom: lang === 'el' ? 'Η παρουσία αρχίζει με μικρές νίκες.' : 'Presence starts with small victories.',
    science: lang === 'el' 
      ? `Η **insula** επεξεργάζεται την **interoception** (εσωτερική αίσθηση σώματος). Το progressive body scan ενεργοποιεί νέους νευρώνες στην insula → καλύτερη ρύθμιση συναισθημάτων και λιγότερο overwhelm (ιδανικό για ADHD/autism).`
      : `The **insula** processes **interoception**. Progressive body scan grows new neural connections → better emotion regulation, less overwhelm.`,
    micro: lang === 'el' ? 'Ξεκίνα με 10 δευτερόλεπτα αίσθησης του σώματος.' : 'Start with 10 seconds of body awareness.',
    nextPrompt: lang === 'el' ? 'Θέλεις να κάνουμε progressive body scan τώρα;' : 'Shall we do the progressive body scan now?'
  };
}

// === 4 ΕΠΙΛΟΓΕΣ (ΚΑΘΑΡΕΣ) ===
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

// === EVENT DELEGATION (το κλειδί που λύνει το πρόβλημα) ===
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

// === PROGRESSIVE BODY SCAN ===
window.c2StartProgressiveBodyScan = function(chapter) {
  c2LogError('c2StartProgressiveBodyScan', `Started for chapter ${chapter}`, null, {chapter});
  alert(`🚀 Ξεκινάμε Progressive Body Scan (4 στάδια insula) για Άξονα ${chapter}\n\n1. Χέρια\n2. Στήθος & αναπνοή\n3. Κοιλιά\n4. Ολόκληρο σώμα\n\n(Θα το κάνουμε πλήρες UI στο επόμενο βήμα)`);
  // εδώ μπορείς να καλέσεις την breath_exercise αργότερα
};

// === INIT ===
function c2Init() {
  try {
    if (document.getElementById('c2-sheet')) return;
    c2EnsureState();
    var sheet = document.createElement('div');
    sheet.id = 'c2-sheet';
    sheet.className = 'c2-sheet';
    sheet.innerHTML = `<div class="c2-sheet-handle" onclick="window.c2ToggleSheet()"><div class="c2-handle-bar"></div></div><div class="c2-sheet-content" id="c2-content"></div>`;
    document.body.appendChild(sheet);
    c2SetupLogTrigger();
    setTimeout(() => {
      c2DecideView();           // δείχνει τις 4 επιλογές
      c2SetupClickDelegation(); // διορθώνει τα clicks
    }, 10);
  } catch(e) { c2LogError('c2Init', e.message, e.stack); }
}

window.addEventListener('load', c2Init);
console.log('%c✅ Companion 2.4 loaded — Flow FIXED!', 'color:#0a0;font-weight:bold');
