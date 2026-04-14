/* ═══════════════════════════════════════════════════════════════════
   js/companion2.js — Companion 2.0 Routing Engine
   Version: 2.3 — Self-contained with fallback data + Error logging
   ═══════════════════════════════════════════════════════════════════ */

// ═══ FALLBACK DATA (used only if globals are missing) ═══
(function() {
  // Ensure companionData exists
  if (typeof companionData === 'undefined') {
    window.companionData = {
      preferredAxis: null, moodHistory: [], faqSeen: {}, conceptsSeen: [],
      depthPreference: 1, sosCount: 0, microDosesDone: 0, returnAfterAbsence: 0,
      lastMoodRoute: null, chapterProgress: {}, lastChapter: 1
    };
  }

  // Fallback CHAPTERS_DATA
  if (typeof CHAPTERS_DATA === 'undefined') {
    window.CHAPTERS_DATA = {
      el: [
        { icon: '🧍', title: 'Σώμα', sub: 'Γείωση και παρουσία' },
        { icon: '🫁', title: 'Αναπνοή', sub: 'Ηρεμία και ρυθμός' },
        { icon: '👁', title: 'Προσοχή', sub: 'Εστίαση και παρατήρηση' },
        { icon: '✦', title: 'Χώρος', sub: 'Ανοιχτή επίγνωση' }
      ],
      en: [
        { icon: '🧍', title: 'Body', sub: 'Grounding & presence' },
        { icon: '🫁', title: 'Breath', sub: 'Calm & rhythm' },
        { icon: '👁', title: 'Attention', sub: 'Focus & observation' },
        { icon: '✦', title: 'Space', sub: 'Open awareness' }
      ]
    };
    // Extend to 10 chapters
    for (var i = 5; i <= 10; i++) {
      CHAPTERS_DATA.el[i-1] = { icon: '📘', title: 'Κεφάλαιο ' + i, sub: 'Συνέχισε' };
      CHAPTERS_DATA.en[i-1] = { icon: '📘', title: 'Chapter ' + i, sub: 'Continue' };
    }
  }

  // Fallback COMPANION_KNOWLEDGE
  if (typeof COMPANION_KNOWLEDGE === 'undefined') {
    window.COMPANION_KNOWLEDGE = {
      timeOfDay: {
        morning: { el: { msg: 'Καλημέρα!' }, en: { msg: 'Good morning!' } },
        afternoon: { el: { msg: 'Καλό απόγευμα!' }, en: { msg: 'Good afternoon!' } },
        evening: { el: { msg: 'Καλό βράδυ!' }, en: { msg: 'Good evening!' } }
      },
      chapters: {
        1: { icon: '🧍', microTasks: { el: ['Πάτησε τα πόδια στο πάτωμα'], en: ['Press feet into floor'] }, wisdom: { el: ['Το σώμα είναι άγκυρα.'], en: ['The body is an anchor.'] } },
        2: { icon: '🫁', microTasks: { el: ['Πάρε τρεις βαθιές ανάσες'], en: ['Take three deep breaths'] }, wisdom: { el: ['Η αναπνοή είναι πάντα μαζί σου.'], en: ['The breath is always with you.'] } },
        3: { icon: '👁', microTasks: { el: ['Παρατήρησε ένα αντικείμενο'], en: ['Observe an object'] }, wisdom: { el: ['Η προσοχή είναι φακός.'], en: ['Attention is a flashlight.'] } },
        4: { icon: '✦', microTasks: { el: ['Κοίτα τον ορίζοντα'], en: ['Look at the horizon'] }, wisdom: { el: ['Ο χώρος πάντα υπάρχει.'], en: ['Space is always there.'] } }
      }
    };
    for (var i = 5; i <= 10; i++) {
      COMPANION_KNOWLEDGE.chapters[i] = { icon: '📘', microTasks: { el: ['Μικρή παύση'], en: ['Small pause'] }, wisdom: { el: ['Κάθε βήμα μετράει.'], en: ['Every step counts.'] } };
    }
  }

  // Fallback CONVERSATION_FLOWS
  if (typeof CONVERSATION_FLOWS === 'undefined') {
    window.CONVERSATION_FLOWS = {
      moodCheck: { id: 'moodCheck', steps: [{ id: 'mood', type: 'mood_select', text: { el: 'Πώς νιώθεις;', en: 'How do you feel?' }, subtext: { el: 'Διάλεξε αυτό που ταιριάζει', en: 'Pick what fits' } }] },
      chapterExplore: { id: 'chapterExplore', steps: [{ id: 'faq', type: 'faq_list' }] },
      conceptExplore: { id: 'conceptExplore', steps: [{ id: 'concept', type: 'concept_select' }] },
      whatToDo: {
        id: 'whatToDo', steps: [
          { id: 'timeSelect', type: 'select', text: { el: 'Πόσο χρόνο έχεις;', en: 'How much time?' },
            options: [
              { label: { el: '⚡ 1 λεπτό', en: '⚡ 1 minute' }, next: 'micro' },
              { label: { el: '🫁 3 λεπτά', en: '🫁 3 minutes' }, next: 'breath' },
              { label: { el: '📖 10 λεπτά', en: '📖 10 minutes' }, next: 'chapter' }
            ] },
          { id: 'micro', type: 'micro_suggestion' },
          { id: 'breath', type: 'breath_suggestion', actions: [{ label: { el: '4-7-8 αναπνοή', en: '4-7-8 breath' }, run: "showScreen('breath')" }] },
          { id: 'chapter', type: 'chapter_suggestion' }
        ]
      },
      welcomeBack: { id: 'welcomeBack', steps: [{ id: 'greet', type: 'dynamic_greeting' }] }
    };
  }

  // Fallback MOOD_CATEGORIES & MOOD_ROUTES
  if (typeof MOOD_CATEGORIES === 'undefined') {
    window.MOOD_CATEGORIES = {
      calm: { el: 'Ήρεμα', en: 'Calm', color: '#4CAF50', moods: ['calm', 'peaceful'] },
      tense: { el: 'Ένταση', en: 'Tense', color: '#F44336', moods: ['stressed', 'anxious', 'overwhelm', 'panic'] },
      low: { el: 'Χαμηλή ενέργεια', en: 'Low energy', color: '#607D8B', moods: ['tired', 'bored'] }
    };
  }
  if (typeof MOOD_ROUTES === 'undefined') {
    window.MOOD_ROUTES = {
      calm: { icon: '😌', label: { el: 'Ήρεμος', en: 'Calm' }, axis: 'breath', response: { el: { msg: 'Ωραία. Συνέχισε έτσι.', wisdom: 'Η ηρεμία είναι δύναμη.' }, en: { msg: 'Nice. Keep it up.', wisdom: 'Calm is strength.' } }, actions: [{ label: { el: 'Συνέχισε', en: 'Continue' }, flow: 'whatToDo' }] },
      stressed: { icon: '😰', label: { el: 'Στρεσαρισμένος', en: 'Stressed' }, axis: 'body', response: { el: { msg: 'Μια μικρή άσκηση μπορεί να βοηθήσει.', wisdom: 'Ανάπνευσε βαθιά.' }, en: { msg: 'A small exercise might help.', wisdom: 'Take a deep breath.' } }, actions: [{ label: { el: '🫁 Αναπνοή', en: '🫁 Breathe' }, run: "showScreen('breath')" }] },
      overwhelm: { icon: '😵', label: { el: 'Κατακλυσμένος', en: 'Overwhelmed' }, axis: 'body', response: { el: { msg: 'Πάμε βήμα-βήμα.', wisdom: 'Ένα πράγμα τη φορά.' }, en: { msg: 'Step by step.', wisdom: 'One thing at a time.' } }, actions: [{ label: { el: '🧍 Γείωση', en: '🧍 Grounding' }, run: "launchPractice('grounding')" }] },
      panic: { icon: '😱', label: { el: 'Πανικός', en: 'Panic' }, axis: 'breath', response: { el: { msg: 'Είμαι εδώ. Ανάπνευσε μαζί μου.', wisdom: 'Θα περάσει.' }, en: { msg: 'I\'m here. Breathe with me.', wisdom: 'This will pass.' } }, actions: [{ label: { el: '🫁 4-7-8', en: '🫁 4-7-8' }, run: "showScreen('breath')" }] },
      tired: { icon: '😴', label: { el: 'Κουρασμένος', en: 'Tired' }, axis: 'space', response: { el: { msg: 'Είναι εντάξει.', wisdom: 'Η ξεκούραση είναι παραγωγική.' }, en: { msg: 'It\'s okay.', wisdom: 'Rest is productive.' } }, actions: [{ label: { el: 'Μικρή παύση', en: 'Pause' }, flow: 'micro' }] }
    };
  }

  // Fallback KNOWLEDGE_FAQ
  if (typeof KNOWLEDGE_FAQ === 'undefined') {
    window.KNOWLEDGE_FAQ = {
      1: { el: [{ q: 'Τι είναι γείωση;', a: 'Σύνδεση με το σώμα.', depth: 1 }], en: [{ q: 'What is grounding?', a: 'Connection to the body.', depth: 1 }] }
    };
  }

  // Fallback KNOWLEDGE_CONCEPTS
  if (typeof KNOWLEDGE_CONCEPTS === 'undefined') {
    window.KNOWLEDGE_CONCEPTS = {
      grounding: { axis: 'body', el: { title: 'Γείωση', short: 'Σύνδεση με το παρόν', full: '...', ndNote: '...' }, en: { title: 'Grounding', short: 'Present connection', full: '...', ndNote: '...' } }
    };
  }

  // Fallback DYNAMIC_ACTIONS
  if (typeof DYNAMIC_ACTIONS === 'undefined') {
    window.DYNAMIC_ACTIONS = {};
  }

  // Ensure saveCompanionData exists
  if (typeof saveCompanionData !== 'function') {
    window.saveCompanionData = function(data) {
      try { localStorage.setItem('companion_v1', JSON.stringify(data)); } catch(e) {}
    };
  }
  // Ensure getProgressSummary exists
  if (typeof getProgressSummary !== 'function') {
    window.getProgressSummary = function() {
      var cd = window.companionData || {};
      var completed = 0, mins = 0;
      for (var k in cd.chapterProgress) {
        if (cd.chapterProgress[k].completed) completed++;
        mins += (cd.chapterProgress[k].timeSpent || 0) / 60;
      }
      return { chaptersCompleted: completed, totalMinutes: Math.round(mins) };
    };
  }
  // Ensure showScreen exists (dummy)
  if (typeof showScreen !== 'function') {
    window.showScreen = function(id) { console.log('showScreen:', id); };
  }
  // Ensure openChapter exists (dummy)
  if (typeof openChapter !== 'function') {
    window.openChapter = function(num) { console.log('openChapter:', num); };
  }
  // Ensure launchPractice exists (dummy)
  if (typeof launchPractice !== 'function') {
    window.launchPractice = function(id) { console.log('launchPractice:', id); };
  }
})();

// ═══ ERROR LOGGING ═══
var c2ErrorLog = [];
var MAX_LOG_ENTRIES = 100;
(function() {
  try {
    var saved = localStorage.getItem('c2_error_log');
    if (saved) { c2ErrorLog = JSON.parse(saved); if (!Array.isArray(c2ErrorLog)) c2ErrorLog = []; }
    if (c2ErrorLog.length > MAX_LOG_ENTRIES) c2ErrorLog = c2ErrorLog.slice(-MAX_LOG_ENTRIES);
  } catch(e) { c2ErrorLog = []; }
})();
function c2SaveErrorLog() {
  try { if (c2ErrorLog.length > MAX_LOG_ENTRIES) c2ErrorLog = c2ErrorLog.slice(-MAX_LOG_ENTRIES); localStorage.setItem('c2_error_log', JSON.stringify(c2ErrorLog)); } catch(e) {}
}
function c2LogError(source, message, stack, extra) {
  var entry = { timestamp: new Date().toISOString(), source: source, message: String(message), stack: stack || null, extra: extra || null };
  c2ErrorLog.push(entry); c2SaveErrorLog(); console.warn('[C2 Logged Error]', entry);
}
window.addEventListener('error', function(e) {
  c2LogError('global', e.message, e.error ? e.error.stack : null, { filename: e.filename, lineno: e.lineno });
});
window.addEventListener('unhandledrejection', function(e) {
  c2LogError('unhandledrejection', e.reason, e.reason ? e.reason.stack : null);
});
window.c2ExportLogs = function() {
  var blob = new Blob([JSON.stringify(c2ErrorLog, null, 2)], {type: 'application/json'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'c2_error_log_' + new Date().toISOString().slice(0,19).replace(/:/g,'-') + '.json'; a.click();
};
window.c2ShowLogsModal = function() {
  var lang = typeof LANG !== 'undefined' ? LANG : 'el';
  var html = '<div class="c2-back-row"><span class="c2-back-title">📋 Error Log ('+c2ErrorLog.length+')</span><button class="c2-close" onclick="window.c2HideSheet()">✕</button></div><div style="padding:16px;max-height:60vh;overflow:auto;font-family:monospace;font-size:12px;">';
  if (c2ErrorLog.length === 0) html += '<p style="color:#888;">'+(lang==='el'?'Δεν υπάρχουν σφάλματα.':'No errors logged.')+'</p>';
  else for (var i=c2ErrorLog.length-1;i>=0;i--) { var e=c2ErrorLog[i]; html += '<div style="border-bottom:1px solid #ddd;padding:8px 0;"><strong>'+e.timestamp+'</strong> '+e.source+'<br><span style="color:#c00;">'+e.message+'</span><br>'; if(e.stack) html += '<pre style="margin:4px 0;background:#f5f5f5;padding:4px;">'+e.stack+'</pre>'; html += '</div>'; }
  html += '</div><div class="c2-actions" style="padding:12px;"><button class="c2-action-btn" onclick="window.c2ExportLogs()">⬇ '+(lang==='el'?'Λήψη JSON':'Download JSON')+'</button><button class="c2-action-btn c2-action-secondary" onclick="navigator.clipboard?.writeText(JSON.stringify(c2ErrorLog,null,2));alert(\''+(lang==='el'?'Αντιγράφηκε!':'Copied!')+'\')">📋 '+(lang==='el'?'Αντιγραφή':'Copy')+'</button><button class="c2-action-btn c2-action-secondary" onclick="window.c2ShowMainMenu()">🏠 '+(lang==='el'?'Μενού':'Menu')+'</button></div>';
  document.getElementById('c2-content').innerHTML = html;
};

// ═══ CORE VARIABLES ═══
var c2CurrentFlow = null;
var c2CurrentStep = null;
var c2FlowHistory = [];
var c2SheetVisible = false;
var c2LastFaqChapter = 1;
var c2LastFaqIndex = 0;
var c2CurrentConcept = null;

function c2EnsureState() {
  var cd = companionData;
  if (!cd.preferredAxis) cd.preferredAxis = null;
  if (!cd.moodHistory) cd.moodHistory = [];
  if (!cd.faqSeen) cd.faqSeen = {};
  if (!cd.conceptsSeen) cd.conceptsSeen = [];
  if (!cd.depthPreference) cd.depthPreference = 1;
  if (typeof cd.sosCount === 'undefined') cd.sosCount = 0;
  if (typeof cd.microDosesDone === 'undefined') cd.microDosesDone = 0;
  if (typeof cd.returnAfterAbsence === 'undefined') cd.returnAfterAbsence = 0;
  if (!cd.lastMoodRoute) cd.lastMoodRoute = null;
  if (!cd.chapterProgress) cd.chapterProgress = {};
  if (!cd.lastChapter) cd.lastChapter = 1;
}

function c2Init() {
  try {
    if (document.getElementById('c2-sheet')) return;
    c2EnsureState();
    var sheet = document.createElement('div');
    sheet.id = 'c2-sheet';
    sheet.className = 'c2-sheet';
    sheet.innerHTML = '<div class="c2-sheet-handle" onclick="window.c2ToggleSheet()"><div class="c2-handle-bar"></div></div><div class="c2-sheet-content" id="c2-content"></div>';
    document.body.appendChild(sheet);
    setTimeout(function() {
      var handle = document.querySelector('.c2-sheet-handle');
      if (handle) handle.addEventListener('dblclick', function(e) { e.stopPropagation(); window.c2ShowLogsModal(); });
    }, 100);
    var fab = document.getElementById('companion-fab');
    if (fab) {
      fab.onclick = function(e) {
        e.stopPropagation();
        if (typeof tapFeedback === 'function') tapFeedback();
        window.c2ToggleSheet();
      };
    }
    document.addEventListener('click', function(e) {
      if (c2SheetVisible && !e.target.closest('#c2-sheet') && !e.target.closest('#companion-fab')) {
        window.c2HideSheet();
      }
    });
  } catch(e) { c2LogError('c2Init', e.message, e.stack); }
}

function c2ToggleSheet() { c2SheetVisible ? c2HideSheet() : c2ShowSheet(); }
function c2ShowSheet() {
  try {
    var sheet = document.getElementById('c2-sheet');
    if (!sheet) return;
    if (typeof hideCompanionBubble === 'function') hideCompanionBubble();
    c2DecideView();
    sheet.classList.add('visible');
    c2SheetVisible = true;
  } catch(e) { c2LogError('c2ShowSheet', e.message, e.stack); }
}
function c2HideSheet() {
  var sheet = document.getElementById('c2-sheet');
  if (sheet) sheet.classList.remove('visible');
  c2SheetVisible = false;
  c2CurrentFlow = null; c2CurrentStep = null; c2FlowHistory = [];
}

function c2DecideView() {
  try {
    var now = new Date(), daysSince = 0;
    if (companionData.lastSeen) { try { daysSince = Math.floor((now - new Date(companionData.lastSeen)) / 86400000); } catch(e) {} }
    if (daysSince >= 2) { companionData.returnAfterAbsence++; saveCompanionData(companionData); c2StartFlow('welcomeBack'); return; }
    c2ShowMainMenu();
  } catch(e) { c2LogError('c2DecideView', e.message, e.stack); }
}

function c2ShowMainMenu() {
  try {
    var lang = typeof LANG !== 'undefined' ? LANG : 'el';
    var hour = new Date().getHours();
    var timeKey = hour < 12 ? 'morning' : (hour < 18 ? 'afternoon' : 'evening');
    var timeMsg = '';
    try { timeMsg = COMPANION_KNOWLEDGE.timeOfDay[timeKey][lang].msg; } catch(e) { timeMsg = lang === 'el' ? 'Γεια σου.' : 'Hello.'; }
    var progress = getProgressSummary();
    var html = '<div class="c2-header"><div class="c2-icon">' + (typeof infinitySVG === 'function' ? infinitySVG(28) : '∞') + '</div><div class="c2-greeting"><div class="c2-greeting-text">' + timeMsg + '</div><div class="c2-progress-mini">' + progress.chaptersCompleted + '/10 ' + (lang==='el'?'κεφάλαια':'chapters') + (progress.totalMinutes>0?' · '+progress.totalMinutes+'\u2032':'') + '</div></div><button class="c2-close" onclick="window.c2HideSheet()">✕</button></div><div class="c2-menu">' +
      c2MenuBtn('💭', lang==='el'?'Πώς νιώθεις;':'How do you feel?', lang==='el'?'Βρες τι ταιριάζει':'Find what fits','moodCheck') +
      c2MenuBtn('❓', lang==='el'?'Ρώτα κάτι':'Ask something', lang==='el'?'FAQ από το βιβλίο':'FAQ from the book','chapterExplore') +
      c2MenuBtn('🔍', lang==='el'?'Τι σημαίνει...':'What does ... mean', lang==='el'?'Εξερεύνηση εννοιών':'Explore concepts','conceptExplore') +
      c2MenuBtn('⏱', lang==='el'?'Τι μπορώ να κάνω;':'What can I do?', lang==='el'?'Με βάση τον χρόνο':'Based on your time','whatToDo') +
      '</div><div class="c2-quick-actions">' +
      '<button class="c2-quick" onclick="window.c2HideSheet();showScreen(\'breath\')">🫁 ' + (lang==='el'?'Αναπνοή':'Breathe') + '</button>' +
      '<button class="c2-quick" onclick="window.c2HideSheet();microCat=\'all\';microIdx=0;showScreen(\'micro\')">⚡ ' + (lang==='el'?'Μικρή δόση':'Micro dose') + '</button></div>';
    document.getElementById('c2-content').innerHTML = html;
  } catch(e) { c2LogError('c2ShowMainMenu', e.message, e.stack); }
}

function c2MenuBtn(icon, title, sub, flowId) {
  return '<button class="c2-menu-btn" onclick="window.c2StartFlow(\'' + flowId + '\')"><span class="c2-menu-icon">' + icon + '</span><div class="c2-menu-text"><div class="c2-menu-title">' + title + '</div><div class="c2-menu-sub">' + sub + '</div></div><span class="c2-menu-arrow">›</span></button>';
}

function c2StartFlow(flowId) {
  try {
    if (typeof CONVERSATION_FLOWS === 'undefined') throw new Error('CONVERSATION_FLOWS missing');
    c2CurrentFlow = CONVERSATION_FLOWS[flowId];
    if (!c2CurrentFlow) throw new Error('Flow not found: '+flowId);
    c2FlowHistory = [];
    c2RunStep(c2CurrentFlow.steps[0].id);
  } catch(e) { c2LogError('c2StartFlow', e.message, e.stack, {flowId}); c2ShowErrorAndMenu(e.message); }
}

function c2ShowErrorAndMenu(msg) {
  var lang = typeof LANG !== 'undefined' ? LANG : 'el';
  document.getElementById('c2-content').innerHTML = '<div class="c2-back-row"><span class="c2-back-title">⚠️ '+(lang==='el'?'Σφάλμα':'Error')+'</span></div><div class="c2-message"><div class="c2-msg-text">'+msg+'</div></div><div class="c2-actions"><button class="c2-action-btn" onclick="window.c2ShowMainMenu()">'+(lang==='el'?'Πίσω':'Back')+'</button></div>';
}

function c2RunStep(stepId) {
  try {
    if (!c2CurrentFlow) return;
    if (stepId === 'end') { c2ShowMainMenu(); return; }
    var step = null;
    for (var i=0; i<c2CurrentFlow.steps.length; i++) if (c2CurrentFlow.steps[i].id === stepId) { step = c2CurrentFlow.steps[i]; break; }
    if (!step) return;
    c2CurrentStep = step;
    c2FlowHistory.push(stepId);
    var lang = typeof LANG !== 'undefined' ? LANG : 'el';
    switch (step.type) {
      case 'mood_select': c2RenderMoodSelect(step, lang); break;
      case 'mood_response': c2RenderMoodResponse(lang); break;
      case 'select': c2RenderSelect(step, lang); break;
      case 'faq_list': c2RenderFaqList(lang); break;
      case 'concept_select': c2RenderConceptSelect(lang); break;
      case 'concept_card': c2RenderConceptCard(lang); break;
      case 'message': c2RenderMessage(step, lang); break;
      case 'micro_suggestion': c2RenderMicroSuggestion(lang); break;
      case 'breath_suggestion': c2RenderBreathSuggestion(step, lang); break;
      case 'chapter_suggestion': c2RenderChapterSuggestion(lang); break;
      case 'dynamic_greeting': c2RenderWelcomeBack(lang); break;
      default: c2RenderSelect(step, lang);
    }
  } catch(e) { c2LogError('c2RunStep', e.message, e.stack, {stepId}); c2ShowErrorAndMenu('Error rendering step'); }
}

function c2GoBack() {
  if (c2FlowHistory.length > 1) { c2FlowHistory.pop(); var prev = c2FlowHistory[c2FlowHistory.length-1]; if (prev) c2RunStep(prev); else c2ShowMainMenu(); }
  else c2ShowMainMenu();
}

function c2BackHeader(title) {
  return '<div class="c2-back-row"><button class="c2-back" onclick="window.c2GoBack()">←</button><span class="c2-back-title">'+title+'</span><button class="c2-close" onclick="window.c2HideSheet()">✕</button></div>';
}

function c2RenderMoodSelect(step, lang) {
  try {
    var html = c2BackHeader(step.text[lang]) + '<div class="c2-subtext">'+(step.subtext?step.subtext[lang]:'')+'</div><div class="c2-mood-grid">';
    for (var catKey in MOOD_CATEGORIES) {
      var cat = MOOD_CATEGORIES[catKey];
      html += '<div class="c2-mood-category"><div class="c2-mood-cat-label" style="color:'+cat.color+'">'+cat[lang]+'</div>';
      for (var m=0; m<cat.moods.length; m++) {
        var mk = cat.moods[m], route = MOOD_ROUTES[mk];
        if (route) html += '<button class="c2-mood-btn" style="border-color:'+cat.color+'20" onclick="window.c2SelectMood(\''+mk+'\')"><span class="c2-mood-icon">'+route.icon+'</span><span class="c2-mood-label">'+route.label[lang]+'</span></button>';
      }
      html += '</div>';
    }
    html += '</div>';
    document.getElementById('c2-content').innerHTML = html;
  } catch(e) { c2LogError('c2RenderMoodSelect', e.message, e.stack); }
}

function c2SelectMood(moodKey) {
  try {
    companionData.lastMoodRoute = moodKey;
    companionData.moodHistory.push({ date: new Date().toISOString(), mood: moodKey });
    if (companionData.moodHistory.length > 100) companionData.moodHistory = companionData.moodHistory.slice(-100);
    if (moodKey === 'overwhelm' || moodKey === 'panic') companionData.sosCount++;
    saveCompanionData(companionData);
    c2RenderMoodResponse(typeof LANG !== 'undefined' ? LANG : 'el');
  } catch(e) { c2LogError('c2SelectMood', e.message, e.stack, {moodKey}); }
}

function c2RenderMoodResponse(lang) {
  try {
    var route = MOOD_ROUTES[companionData.lastMoodRoute];
    if (!route) { c2ShowMainMenu(); return; }
    var resp = route.response[lang];
    var actions = route.actions || [];
    var html = c2BackHeader(route.icon + ' ' + route.label[lang]) + '<div class="c2-response"><div class="c2-resp-msg">'+resp.msg+'</div>'+(resp.task?'<div class="c2-resp-task">'+resp.task+'</div>':'')+'<div class="c2-resp-wisdom">«'+resp.wisdom+'»</div></div><div class="c2-actions">';
    for (var i=0; i<actions.length; i++) {
      var act = actions[i], label = typeof act.label === 'string' ? act.label : (act.label[lang] || '');
      if (act.run) html += '<button class="c2-action-btn" onclick="window.c2HideSheet();'+act.run+'">'+label+'</button>';
      else if (act.flow) html += '<button class="c2-action-btn c2-action-secondary" onclick="window.c2StartFlow(\''+act.flow+'\')">'+label+'</button>';
    }
    html += '</div>';
    document.getElementById('c2-content').innerHTML = html;
  } catch(e) { c2LogError('c2RenderMoodResponse', e.message, e.stack); }
}

function c2RenderSelect(step, lang) {
  var html = c2BackHeader(step.text[lang]) + '<div class="c2-options">';
  for (var i=0; i<step.options.length; i++) {
    var opt = step.options[i], label = typeof opt.label === 'string' ? opt.label : (opt.label[lang] || '');
    if (opt.next) html += '<button class="c2-option-btn" onclick="window.c2RunStep(\''+opt.next+'\')">'+label+'</button>';
    else if (opt.run) html += '<button class="c2-option-btn" onclick="window.c2HideSheet();'+opt.run+'">'+label+'</button>';
  }
  html += '</div>';
  document.getElementById('c2-content').innerHTML = html;
}

function c2RenderFaqList(lang) {
  try {
    var depth = companionData.depthPreference || 1, chNum = companionData.lastChapter || 1;
    var faqs = KNOWLEDGE_FAQ[chNum] ? (KNOWLEDGE_FAQ[chNum][lang] || []) : [];
    var filtered = faqs.filter(function(f){ return f.depth <= depth; });
    var chs = CHAPTERS_DATA[lang] || CHAPTERS_DATA.el;
    var tabs = '<div class="c2-ch-tabs">';
    for (var c=1; c<=10; c++) if (chs[c-1]) tabs += '<button class="c2-ch-tab'+(c===chNum?' c2-ch-active':'')+'" onclick="companionData.lastChapter='+c+';window.c2RenderFaqList(\''+lang+'\')">'+chs[c-1].icon+' '+c+'</button>';
    tabs += '</div>';
    var html = c2BackHeader((lang==='el'?'❓ Ερωτήσεις — Κεφ. ':'❓ Questions — Ch. ')+chNum) + tabs + '<div class="c2-faq-list">';
    if (filtered.length===0) html += '<div class="c2-empty">'+(lang==='el'?'Δεν υπάρχουν ερωτήσεις.':'No questions.')+'</div>';
    for (var i=0; i<filtered.length; i++) {
      var seen = companionData.faqSeen[chNum] && companionData.faqSeen[chNum].indexOf(i)>=0;
      html += '<button class="c2-faq-btn'+(seen?' c2-faq-seen':'')+'" onclick="window.c2ShowFaqAnswer('+chNum+','+i+')"><span class="c2-faq-q">'+filtered[i].q+'</span><span class="c2-faq-depth">'+['','🟢','🟡','🔴'][filtered[i].depth]+'</span></button>';
    }
    html += '</div><div class="c2-depth-row"><span class="c2-depth-label">'+(lang==='el'?'Βάθος:':'Depth:')+'</span>';
    for (var d=1; d<=3; d++) html += '<button class="c2-depth-btn'+(depth===d?' active':'')+'" onclick="companionData.depthPreference='+d+';saveCompanionData(companionData);window.c2RenderFaqList(\''+lang+'\')">'+['','🟢','🟡','🔴'][d]+'</button>';
    html += '</div>';
    document.getElementById('c2-content').innerHTML = html;
  } catch(e) { c2LogError('c2RenderFaqList', e.message, e.stack); }
}

function c2ShowFaqAnswer(chNum, idx) {
  try {
    if (!companionData.faqSeen[chNum]) companionData.faqSeen[chNum] = [];
    if (companionData.faqSeen[chNum].indexOf(idx)<0) companionData.faqSeen[chNum].push(idx);
    saveCompanionData(companionData);
    var lang = typeof LANG !== 'undefined' ? LANG : 'el';
    var faq = KNOWLEDGE_FAQ[chNum][lang][idx];
    if (!faq) { c2RenderFaqList(lang); return; }
    var html = '<div class="c2-back-row"><button class="c2-back" onclick="window.c2RenderFaqList(\''+lang+'\')">←</button><span class="c2-back-title">'+faq.q+'</span></div><div class="c2-answer"><div class="c2-answer-text">'+faq.a.replace(/\n/g,'<br>')+'</div>';
    if (faq.relatedConcept && KNOWLEDGE_CONCEPTS[faq.relatedConcept]) html += '<button class="c2-related-btn" onclick="window.c2ShowConceptByKey(\''+faq.relatedConcept+'\')">🔍 '+KNOWLEDGE_CONCEPTS[faq.relatedConcept][lang].title+'</button>';
    html += '</div>';
    document.getElementById('c2-content').innerHTML = html;
  } catch(e) { c2LogError('c2ShowFaqAnswer', e.message, e.stack); }
}

function c2RenderConceptSelect(lang) {
  try {
    var axes = { body: { el: '🧍 Σώμα', en: '🧍 Body' }, breath: { el: '🫁 Αναπνοή', en: '🫁 Breath' }, attention: { el: '👁 Προσοχή', en: '👁 Attention' }, space: { el: '✦ Χώρος', en: '✦ Space' }, all: { el: '🧠 Γενικά', en: '🧠 General' } };
    var html = c2BackHeader(lang==='el'?'🔍 Τι σημαίνει...':'🔍 What does ... mean');
    for (var axisKey in axes) {
      var concepts = [];
      for (var cKey in KNOWLEDGE_CONCEPTS) if (KNOWLEDGE_CONCEPTS[cKey].axis === axisKey) concepts.push({ key: cKey, data: KNOWLEDGE_CONCEPTS[cKey] });
      if (concepts.length===0) continue;
      html += '<div class="c2-concept-group"><div class="c2-concept-group-title">'+axes[axisKey][lang]+'</div>';
      for (var i=0; i<concepts.length; i++) {
        var con = concepts[i], seen = companionData.conceptsSeen.indexOf(con.key)>=0;
        html += '<button class="c2-concept-btn'+(seen?' c2-concept-seen':'')+'" onclick="window.c2ShowConceptByKey(\''+con.key+'\')"><span class="c2-concept-title">'+con.data[lang].title+'</span><span class="c2-concept-short">'+con.data[lang].short+'</span></button>';
      }
      html += '</div>';
    }
    document.getElementById('c2-content').innerHTML = html;
  } catch(e) { c2LogError('c2RenderConceptSelect', e.message, e.stack); }
}

function c2ShowConceptByKey(key) {
  c2CurrentConcept = key;
  if (companionData.conceptsSeen.indexOf(key)<0) { companionData.conceptsSeen.push(key); saveCompanionData(companionData); }
  c2RenderConceptCard(typeof LANG !== 'undefined' ? LANG : 'el');
}

function c2RenderConceptCard(lang) {
  try {
    var concept = KNOWLEDGE_CONCEPTS[c2CurrentConcept];
    if (!concept) { c2RenderConceptSelect(lang); return; }
    var data = concept[lang];
    var html = '<div class="c2-back-row"><button class="c2-back" onclick="window.c2RenderConceptSelect(\''+lang+'\')">←</button><span class="c2-back-title">'+data.title+'</span></div><div class="c2-concept-card"><div class="c2-concept-full">'+data.full.replace(/\n/g,'<br>')+'</div><div class="c2-concept-nd"><div class="c2-nd-label">🧠 '+(lang==='el'?'Για νευροδιαφορετικούς':'For neurodivergent')+'</div><div class="c2-nd-text">'+data.ndNote+'</div></div>'+(data.science?'<div class="c2-concept-science">📚 '+data.science+'</div>':'');
    html += '</div>';
    document.getElementById('c2-content').innerHTML = html;
  } catch(e) { c2LogError('c2RenderConceptCard', e.message, e.stack); }
}

function c2RenderMessage(step, lang) {
  var html = c2BackHeader('∞') + '<div class="c2-message"><div class="c2-msg-text">'+step.text[lang]+'</div></div><div class="c2-actions"><button class="c2-action-btn c2-action-secondary" onclick="window.c2ShowMainMenu()">'+(lang==='el'?'← Αρχική':'← Home')+'</button></div>';
  document.getElementById('c2-content').innerHTML = html;
}

function c2RenderMicroSuggestion(lang) {
  try {
    var axis = companionData.preferredAxis || 'body';
    var chNum = { body:1, breath:2, attention:3, space:4 }[axis] || 1;
    var chK = COMPANION_KNOWLEDGE.chapters[chNum] || COMPANION_KNOWLEDGE.chapters[1];
    var tasks = chK.microTasks[lang];
    var dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(),0,0)) / 86400000);
    var taskIdx = (dayOfYear + (companionData.microDosesDone || 0)) % tasks.length;
    var html = c2BackHeader(lang==='el'?'⚡ Μικρή νίκη':'⚡ Small victory') + '<div class="c2-micro-card"><div class="c2-micro-icon">'+chK.icon+'</div><div class="c2-micro-task">'+tasks[taskIdx]+'</div></div><div class="c2-actions"><button class="c2-action-btn" onclick="companionData.microDosesDone++;saveCompanionData(companionData);window.c2HideSheet();microCat=\''+axis+'\';microIdx=0;showScreen(\'micro\')">▶ '+(lang==='el'?'Ξεκίνα':'Start')+'</button><button class="c2-action-btn c2-action-secondary" onclick="window.c2RenderMicroSuggestion(\''+lang+'\')">↻ '+(lang==='el'?'Άλλη':'Another')+'</button></div>';
    document.getElementById('c2-content').innerHTML = html;
  } catch(e) { c2LogError('c2RenderMicroSuggestion', e.message, e.stack); }
}

function c2RenderBreathSuggestion(step, lang) {
  var html = c2BackHeader(lang==='el'?'🫁 Αναπνοή':'🫁 Breathe') + '<div class="c2-breath-options">';
  for (var i=0; i<step.actions.length; i++) html += '<button class="c2-breath-btn" onclick="window.c2HideSheet();'+step.actions[i].run+'">'+step.actions[i].label[lang]+'</button>';
  html += '</div>';
  document.getElementById('c2-content').innerHTML = html;
}

function c2RenderChapterSuggestion(lang) {
  try {
    var chs = CHAPTERS_DATA[lang] || CHAPTERS_DATA.el;
    var nextCh = null, resumeCh = null, resumeScroll = 0;
    for (var i=1; i<=10; i++) if (!companionData.chapterProgress[i] || !companionData.chapterProgress[i].completed) { if (!nextCh) nextCh = i; }
    for (var k in companionData.chapterProgress) {
      var p = companionData.chapterProgress[k];
      if (!p.completed && p.scrollPct > 0.05 && p.scrollPct > resumeScroll) { resumeScroll = p.scrollPct; resumeCh = parseInt(k); }
    }
    var html = c2BackHeader(lang==='el'?'📖 Πρόταση κεφαλαίου':'📖 Chapter suggestion') + '<div class="c2-actions">';
    if (resumeCh && chs[resumeCh-1]) html += '<button class="c2-action-btn" onclick="window.c2HideSheet();openChapter('+resumeCh+')">'+chs[resumeCh-1].icon+' '+(lang==='el'?'Συνέχισε: ':'Continue: ')+chs[resumeCh-1].title+' ('+Math.round(resumeScroll*100)+'%)</button>';
    if (nextCh && nextCh !== resumeCh && chs[nextCh-1]) html += '<button class="c2-action-btn c2-action-secondary" onclick="window.c2HideSheet();openChapter('+nextCh+')">'+chs[nextCh-1].icon+' '+(lang==='el'?'Επόμενο: ':'Next: ')+chs[nextCh-1].title+'</button>';
    if (!resumeCh && !nextCh) html += '<div class="c2-empty">'+(lang==='el'?'Ολοκλήρωσες όλα τα κεφάλαια! 🎉':'All chapters complete! 🎉')+'</div>';
    html += '</div>';
    document.getElementById('c2-content').innerHTML = html;
  } catch(e) { c2LogError('c2RenderChapterSuggestion', e.message, e.stack); }
}

function c2RenderWelcomeBack(lang) {
  try {
    var daysSince = 0;
    if (companionData.lastSeen) daysSince = Math.floor((new Date() - new Date(companionData.lastSeen)) / 86400000);
    var greeting = daysSince >= 7 ? (lang==='el'?'Χαίρομαι που γύρισες. '+daysSince+' μέρες.':'Glad you\'re back. '+daysSince+' days.') : (lang==='el'?'Καλώς ήρθες πίσω.':'Welcome back.');
    var wisdom = '';
    try { var chK = COMPANION_KNOWLEDGE.chapters[companionData.lastChapter||1]; var wa = chK.wisdom[lang]; wisdom = wa[Math.floor(Math.random()*wa.length)]; } catch(e) {}
    var html = c2BackHeader('∞') + '<div class="c2-welcome"><div class="c2-welcome-msg">'+greeting+'</div>'+(wisdom?'<div class="c2-welcome-wisdom">«'+wisdom+'»</div>':'')+'</div><div class="c2-options">' +
      '<button class="c2-option-btn" onclick="window.c2RenderChapterSuggestion(\''+lang+'\')">'+(lang==='el'?'📖 Συνέχισε από εκεί που σταμάτησα':'📖 Continue where I left off')+'</button>' +
      '<button class="c2-option-btn" onclick="window.c2StartFlow(\'moodCheck\')">'+(lang==='el'?'💭 Πες μου πώς νιώθω':'💭 Tell me how I feel')+'</button>' +
      '<button class="c2-option-btn" onclick="window.c2RenderMicroSuggestion(\''+lang+'\')">'+(lang==='el'?'⚡ Μικρή δόση τώρα':'⚡ Quick dose now')+'</button>' +
      '<button class="c2-option-btn" onclick="window.c2HideSheet();showScreen(\'breath\')">'+(lang==='el'?'🫁 Αναπνοή':'🫁 Breathe')+'</button></div>';
    document.getElementById('c2-content').innerHTML = html;
  } catch(e) { c2LogError('c2RenderWelcomeBack', e.message, e.stack); }
}

// ═══ REGISTER ═══
window.c2ToggleSheet = c2ToggleSheet;
window.c2ShowSheet = c2ShowSheet;
window.c2HideSheet = c2HideSheet;
window.c2ShowMainMenu = c2ShowMainMenu;
window.c2StartFlow = c2StartFlow;
window.c2RunStep = c2RunStep;
window.c2GoBack = c2GoBack;
window.c2SelectMood = c2SelectMood;
window.c2RenderFaqList = c2RenderFaqList;
window.c2ShowFaqAnswer = c2ShowFaqAnswer;
window.c2RenderConceptSelect = c2RenderConceptSelect;
window.c2ShowConceptByKey = c2ShowConceptByKey;
window.c2RenderConceptCard = c2RenderConceptCard;
window.c2RenderMicroSuggestion = c2RenderMicroSuggestion;
window.c2RenderChapterSuggestion = c2RenderChapterSuggestion;
window.c2RenderWelcomeBack = c2RenderWelcomeBack;
window.c2RenderMoodResponse = c2RenderMoodResponse;
window.c2RenderMoodSelect = c2RenderMoodSelect;

// ═══ INIT ═══
document.addEventListener('DOMContentLoaded', function() { setTimeout(c2Init, 800); });
