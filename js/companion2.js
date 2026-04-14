/* ═══════════════════════════════════════════
   js/companion2.js — Companion 2.0 Routing Engine
   
   Upgrades the ∞ companion with:
   - Mood-based routing (12 moods → actions)
   - FAQ explorer (per chapter, 3 depths)
   - Concept cards (25 concepts with ND notes)
   - Conversation flows (decision trees)
   - Bottom sheet UI (no text input, buttons only)
   
   Depends on:
   - js/data/faq.js (KNOWLEDGE_FAQ)
   - js/data/concepts.js (KNOWLEDGE_CONCEPTS)
   - js/data/routes.js (MOOD_ROUTES, CONVERSATION_FLOWS, etc.)
   - js/companion.js (companionData, saveCompanionData)
   - js/knowledge.js (COMPANION_KNOWLEDGE)
   - js/i18n.js (LANG, t())
   ═══════════════════════════════════════════ */

// ═══ STATE ═══
var c2CurrentFlow = null;
var c2CurrentStep = null;
var c2FlowHistory = [];
var c2SheetVisible = false;

// ═══ UPGRADE USER STATE ═══
function c2EnsureState() {
  if (!companionData.preferredAxis) companionData.preferredAxis = null;
  if (!companionData.moodHistory) companionData.moodHistory = [];
  if (!companionData.faqSeen) companionData.faqSeen = {};
  if (!companionData.conceptsSeen) companionData.conceptsSeen = [];
  if (!companionData.depthPreference) companionData.depthPreference = 1;
  if (typeof companionData.sosCount === 'undefined') companionData.sosCount = 0;
  if (typeof companionData.microDosesDone === 'undefined') companionData.microDosesDone = 0;
  if (typeof companionData.returnAfterAbsence === 'undefined') companionData.returnAfterAbsence = 0;
  if (!companionData.lastMoodRoute) companionData.lastMoodRoute = null;
}

// ═══ BUILD BOTTOM SHEET UI ═══
function c2Init() {
  if (document.getElementById('c2-sheet')) return;
  c2EnsureState();

  var sheet = document.createElement('div');
  sheet.id = 'c2-sheet';
  sheet.className = 'c2-sheet';
  sheet.innerHTML =
    '<div class="c2-sheet-handle" onclick="c2ToggleSheet()"><div class="c2-handle-bar"></div></div>' +
    '<div class="c2-sheet-content" id="c2-content"></div>';
  document.body.appendChild(sheet);

  // Override companion FAB to open our sheet instead
  var fab = document.getElementById('companion-fab');
  if (fab) {
    fab.onclick = function(e) {
      e.stopPropagation();
      if (typeof tapFeedback === 'function') tapFeedback();
      c2ToggleSheet();
    };
  }

  // Close on outside click
  document.addEventListener('click', function(e) {
    if (c2SheetVisible && !e.target.closest('#c2-sheet') && !e.target.closest('#companion-fab')) {
      c2HideSheet();
    }
  });
}

// ═══ SHEET SHOW/HIDE ═══
function c2ToggleSheet() {
  c2SheetVisible ? c2HideSheet() : c2ShowSheet();
}

function c2ShowSheet() {
  var sheet = document.getElementById('c2-sheet');
  if (!sheet) return;

  // Also hide old bubble if visible
  if (typeof hideCompanionBubble === 'function') hideCompanionBubble();

  // Decide what to show
  c2DecideView();

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

// ═══ DECIDE WHAT TO SHOW ═══
function c2DecideView() {
  var lang = typeof LANG !== 'undefined' ? LANG : 'el';
  var now = new Date();
  var daysSince = 0;
  if (companionData.lastSeen) daysSince = Math.floor((now - new Date(companionData.lastSeen)) / 86400000);

  // Returning after 2+ days
  if (daysSince >= 2) {
    companionData.returnAfterAbsence++;
    saveCompanionData(companionData);
    c2StartFlow('welcomeBack');
    return;
  }

  // Default: show main menu
  c2ShowMainMenu();
}

// ═══ MAIN MENU ═══
function c2ShowMainMenu() {
  var lang = typeof LANG !== 'undefined' ? LANG : 'el';
  var hour = new Date().getHours();
  var timeKey = hour < 12 ? 'morning' : (hour < 18 ? 'afternoon' : 'evening');
  var timeData = COMPANION_KNOWLEDGE.timeOfDay[timeKey][lang];
  var progress = getProgressSummary();

  var html =
    '<div class="c2-header">' +
      '<div class="c2-icon">' + infinitySVG(28) + '</div>' +
      '<div class="c2-greeting">' +
        '<div class="c2-greeting-text">' + timeData.msg + '</div>' +
        '<div class="c2-progress-mini">' + progress.chaptersCompleted + '/10 ' +
          (lang === 'el' ? 'κεφάλαια' : 'chapters') +
          (progress.totalMinutes > 0 ? ' · ' + progress.totalMinutes + (lang === 'el' ? '′' : '′') : '') +
        '</div>' +
      '</div>' +
      '<button class="c2-close" onclick="c2HideSheet()">✕</button>' +
    '</div>' +
    '<div class="c2-menu">' +
      c2MenuBtn('💭', lang === 'el' ? 'Πώς νιώθεις;' : 'How do you feel?',
        lang === 'el' ? 'Βρες τι ταιριάζει τώρα' : 'Find what fits now', "c2StartFlow('moodCheck')") +
      c2MenuBtn('❓', lang === 'el' ? 'Ρώτα κάτι' : 'Ask something',
        lang === 'el' ? 'FAQ από το βιβλίο' : 'FAQ from the book', "c2StartFlow('chapterExplore')") +
      c2MenuBtn('🔍', lang === 'el' ? 'Τι σημαίνει...' : 'What does ... mean',
        lang === 'el' ? 'Εξερεύνηση εννοιών' : 'Explore concepts', "c2StartFlow('conceptExplore')") +
      c2MenuBtn('⏱', lang === 'el' ? 'Τι μπορώ να κάνω;' : 'What can I do?',
        lang === 'el' ? 'Με βάση τον χρόνο σου' : 'Based on your time', "c2StartFlow('whatToDo')") +
    '</div>' +
    '<div class="c2-quick-actions">' +
      '<button class="c2-quick" onclick="c2HideSheet();showScreen(\'breath\')">' +
        '🫁 ' + (lang === 'el' ? 'Αναπνοή' : 'Breathe') +
      '</button>' +
      '<button class="c2-quick" onclick="c2HideSheet();microCat=\'all\';microIdx=0;showScreen(\'micro\')">' +
        '⚡ ' + (lang === 'el' ? 'Μικρή δόση' : 'Micro dose') +
      '</button>' +
    '</div>';

  document.getElementById('c2-content').innerHTML = html;
}

function c2MenuBtn(icon, title, sub, onclick) {
  return '<button class="c2-menu-btn" onclick="' + onclick + '">' +
    '<span class="c2-menu-icon">' + icon + '</span>' +
    '<div class="c2-menu-text">' +
      '<div class="c2-menu-title">' + title + '</div>' +
      '<div class="c2-menu-sub">' + sub + '</div>' +
    '</div>' +
    '<span class="c2-menu-arrow">›</span>' +
  '</button>';
}

// ═══ FLOW ENGINE ═══
function c2StartFlow(flowId) {
  c2CurrentFlow = CONVERSATION_FLOWS[flowId];
  if (!c2CurrentFlow) return;
  c2FlowHistory = [];
  c2RunStep(c2CurrentFlow.steps[0].id);
}

function c2RunStep(stepId) {
  if (!c2CurrentFlow) return;
  var step = null;
  for (var i = 0; i < c2CurrentFlow.steps.length; i++) {
    if (c2CurrentFlow.steps[i].id === stepId) { step = c2CurrentFlow.steps[i]; break; }
  }
  if (!step) return;
  if (stepId === 'end') { c2ShowMainMenu(); return; }

  c2CurrentStep = step;
  c2FlowHistory.push(stepId);

  var lang = typeof LANG !== 'undefined' ? LANG : 'el';

  switch (step.type) {
    case 'mood_select': c2RenderMoodSelect(step, lang); break;
    case 'mood_response': c2RenderMoodResponse(lang); break;
    case 'select': c2RenderSelect(step, lang); break;
    case 'faq_list': c2RenderFaqList(lang); break;
    case 'faq_answer': c2RenderFaqAnswer(lang); break;
    case 'concept_select': c2RenderConceptSelect(lang); break;
    case 'concept_card': c2RenderConceptCard(lang); break;
    case 'message': c2RenderMessage(step, lang); break;
    case 'micro_suggestion': c2RenderMicroSuggestion(lang); break;
    case 'breath_suggestion': c2RenderBreathSuggestion(step, lang); break;
    case 'chapter_suggestion': c2RenderChapterSuggestion(lang); break;
    case 'dynamic_greeting': c2RenderWelcomeBack(lang); break;
    case 'resume_from_progress': c2RenderResume(lang); break;
    default: c2RenderSelect(step, lang);
  }
}

function c2GoBack() {
  if (c2FlowHistory.length > 1) {
    c2FlowHistory.pop();
    var prev = c2FlowHistory.pop();
    c2RunStep(prev);
  } else {
    c2ShowMainMenu();
  }
}

// ═══ RENDER: MOOD SELECT ═══
function c2RenderMoodSelect(step, lang) {
  var html = c2BackHeader(step.text[lang]) +
    '<div class="c2-subtext">' + (step.subtext ? step.subtext[lang] : '') + '</div>' +
    '<div class="c2-mood-grid">';

  var cats = MOOD_CATEGORIES;
  var catKeys = Object.keys(cats);
  for (var c = 0; c < catKeys.length; c++) {
    var cat = cats[catKeys[c]];
    html += '<div class="c2-mood-category">' +
      '<div class="c2-mood-cat-label" style="color:' + cat.color + '">' + cat[lang] + '</div>';
    for (var m = 0; m < cat.moods.length; m++) {
      var moodKey = cat.moods[m];
      var route = MOOD_ROUTES[moodKey];
      if (route) {
        html += '<button class="c2-mood-btn" style="border-color:' + cat.color + '20" onclick="c2SelectMood(\'' + moodKey + '\')">' +
          '<span class="c2-mood-icon">' + route.icon + '</span>' +
          '<span class="c2-mood-label">' + route.label[lang] + '</span>' +
        '</button>';
      }
    }
    html += '</div>';
  }
  html += '</div>';
  document.getElementById('c2-content').innerHTML = html;
}

// ═══ SELECT MOOD → RESPONSE ═══
function c2SelectMood(moodKey) {
  companionData.lastMoodRoute = moodKey;
  companionData.moodHistory.push({
    date: new Date().toISOString(),
    mood: moodKey,
    actionTaken: null,
    helpful: null
  });
  if (companionData.moodHistory.length > 100) companionData.moodHistory = companionData.moodHistory.slice(-100);
  if (moodKey === 'overwhelm' || moodKey === 'panic') companionData.sosCount++;
  saveCompanionData(companionData);

  // Detect preferred axis
  c2UpdatePreferredAxis(moodKey);

  c2RenderMoodResponse(typeof LANG !== 'undefined' ? LANG : 'el');
}

function c2UpdatePreferredAxis(moodKey) {
  var route = MOOD_ROUTES[moodKey];
  if (!route || !route.axis || route.axis === 'all' || route.axis === 'learn' || route.axis === 'kindness') return;
  var axisCount = {};
  var recent = companionData.moodHistory.slice(-20);
  for (var i = 0; i < recent.length; i++) {
    var r = MOOD_ROUTES[recent[i].mood];
    if (r && r.axis && r.axis !== 'all') {
      axisCount[r.axis] = (axisCount[r.axis] || 0) + 1;
    }
  }
  var maxAxis = null, maxCount = 0;
  for (var a in axisCount) {
    if (axisCount[a] > maxCount) { maxCount = axisCount[a]; maxAxis = a; }
  }
  if (maxAxis) { companionData.preferredAxis = maxAxis; saveCompanionData(companionData); }
}

// ═══ RENDER: MOOD RESPONSE ═══
function c2RenderMoodResponse(lang) {
  var moodKey = companionData.lastMoodRoute;
  var route = MOOD_ROUTES[moodKey];
  if (!route) { c2ShowMainMenu(); return; }

  var resp = route.response[lang];
  var actions = route.actions || [];

  // Dynamic actions
  if (route.dynamicActions && DYNAMIC_ACTIONS[route.dynamicActions]) {
    actions = DYNAMIC_ACTIONS[route.dynamicActions](companionData, lang);
  }

  var html = c2BackHeader(route.icon + ' ' + route.label[lang]) +
    '<div class="c2-response">' +
      '<div class="c2-resp-msg">' + resp.msg + '</div>' +
      (resp.task ? '<div class="c2-resp-task">' + resp.task + '</div>' : '') +
      '<div class="c2-resp-wisdom">«' + resp.wisdom + '»</div>' +
    '</div>' +
    '<div class="c2-actions">';

  for (var i = 0; i < actions.length; i++) {
    var act = actions[i];
    var label = act.label[lang] || act.label;
    if (act.run) {
      html += '<button class="c2-action-btn" onclick="c2HideSheet();' + act.run + '">' + label + '</button>';
    } else if (act.flow) {
      html += '<button class="c2-action-btn c2-action-secondary" onclick="c2StartFlow(\'' + act.flow + '\')">' + label + '</button>';
    }
  }
  html += '</div>';
  document.getElementById('c2-content').innerHTML = html;
}

// ═══ RENDER: GENERIC SELECT ═══
function c2RenderSelect(step, lang) {
  var html = c2BackHeader(step.text[lang]);
  html += '<div class="c2-options">';
  for (var i = 0; i < step.options.length; i++) {
    var opt = step.options[i];
    var label = opt.label[lang] || opt.label;
    if (opt.next) {
      var extra = '';
      if (opt.depth) extra = "companionData.depthPreference=" + opt.depth + ";saveCompanionData(companionData);";
      html += '<button class="c2-option-btn" onclick="' + extra + 'c2RunStep(\'' + opt.next + '\')">' + label + '</button>';
    } else if (opt.run) {
      html += '<button class="c2-option-btn" onclick="c2HideSheet();' + opt.run + '">' + label + '</button>';
    }
  }
  html += '</div>';
  document.getElementById('c2-content').innerHTML = html;
}

// ═══ RENDER: FAQ LIST ═══
function c2RenderFaqList(lang) {
  var depth = companionData.depthPreference || 1;
  // Determine which chapter to show FAQ for
  var chNum = companionData.lastChapter || 1;

  var faqs = KNOWLEDGE_FAQ[chNum] ? (KNOWLEDGE_FAQ[chNum][lang] || []) : [];
  var filtered = faqs.filter(function(f) { return f.depth <= depth; });

  // Chapter tabs
  var chs = (typeof CHAPTERS_DATA !== 'undefined') ? (CHAPTERS_DATA[lang] || CHAPTERS_DATA.el) : [];
  var tabs = '<div class="c2-ch-tabs">';
  for (var c = 1; c <= 10; c++) {
    if (chs[c-1]) {
      var active = c === chNum ? ' c2-ch-active' : '';
      tabs += '<button class="c2-ch-tab' + active + '" onclick="companionData.lastChapter=' + c + ';c2RenderFaqList(\'' + lang + '\')">' +
        chs[c-1].icon + ' ' + c + '</button>';
    }
  }
  tabs += '</div>';

  var html = c2BackHeader(lang === 'el' ? '❓ Ερωτήσεις — Κεφ. ' + chNum : '❓ Questions — Ch. ' + chNum) +
    tabs + '<div class="c2-faq-list">';

  if (filtered.length === 0) {
    html += '<div class="c2-empty">' + (lang === 'el' ? 'Δεν υπάρχουν ερωτήσεις σε αυτό το βάθος.' : 'No questions at this depth.') + '</div>';
  }

  for (var i = 0; i < filtered.length; i++) {
    var seen = companionData.faqSeen[chNum] && companionData.faqSeen[chNum].indexOf(i) >= 0;
    html += '<button class="c2-faq-btn' + (seen ? ' c2-faq-seen' : '') + '" onclick="c2ShowFaqAnswer(' + chNum + ',' + i + ')">' +
      '<span class="c2-faq-q">' + filtered[i].q + '</span>' +
      '<span class="c2-faq-depth">' + ['', '🟢', '🟡', '🔴'][filtered[i].depth] + '</span>' +
    '</button>';
  }
  html += '</div>';

  // Depth selector
  html += '<div class="c2-depth-row">' +
    '<span class="c2-depth-label">' + (lang === 'el' ? 'Βάθος:' : 'Depth:') + '</span>' +
    '<button class="c2-depth-btn' + (depth === 1 ? ' active' : '') + '" onclick="companionData.depthPreference=1;saveCompanionData(companionData);c2RenderFaqList(\'' + lang + '\')">🟢</button>' +
    '<button class="c2-depth-btn' + (depth === 2 ? ' active' : '') + '" onclick="companionData.depthPreference=2;saveCompanionData(companionData);c2RenderFaqList(\'' + lang + '\')">🟡</button>' +
    '<button class="c2-depth-btn' + (depth === 3 ? ' active' : '') + '" onclick="companionData.depthPreference=3;saveCompanionData(companionData);c2RenderFaqList(\'' + lang + '\')">🔴</button>' +
  '</div>';

  document.getElementById('c2-content').innerHTML = html;
}

// ═══ RENDER: FAQ ANSWER ═══
var c2LastFaqChapter = 1;
var c2LastFaqIndex = 0;

function c2ShowFaqAnswer(chNum, idx) {
  c2LastFaqChapter = chNum;
  c2LastFaqIndex = idx;

  // Mark as seen
  if (!companionData.faqSeen[chNum]) companionData.faqSeen[chNum] = [];
  if (companionData.faqSeen[chNum].indexOf(idx) < 0) companionData.faqSeen[chNum].push(idx);
  saveCompanionData(companionData);

  c2RenderFaqAnswer(typeof LANG !== 'undefined' ? LANG : 'el');
}

function c2RenderFaqAnswer(lang) {
  var faqs = KNOWLEDGE_FAQ[c2LastFaqChapter] ? (KNOWLEDGE_FAQ[c2LastFaqChapter][lang] || []) : [];
  var faq = faqs[c2LastFaqIndex];
  if (!faq) { c2RenderFaqList(lang); return; }

  var html = '<div class="c2-back-row"><button class="c2-back" onclick="c2RenderFaqList(\'' + lang + '\')">←</button>' +
    '<span class="c2-back-title">' + faq.q + '</span></div>' +
    '<div class="c2-answer">' +
      '<div class="c2-answer-text">' + faq.a.replace(/\n/g, '<br>') + '</div>';

  // Related concept
  if (faq.relatedConcept && KNOWLEDGE_CONCEPTS[faq.relatedConcept]) {
    var concept = KNOWLEDGE_CONCEPTS[faq.relatedConcept];
    html += '<button class="c2-related-btn" onclick="c2ShowConceptByKey(\'' + faq.relatedConcept + '\')">' +
      '🔍 ' + concept[lang].title + '</button>';
  }

  // Related chapter
  if (faq.relatedChapter) {
    var chs = (typeof CHAPTERS_DATA !== 'undefined') ? (CHAPTERS_DATA[lang] || CHAPTERS_DATA.el) : [];
    if (chs[faq.relatedChapter - 1]) {
      html += '<button class="c2-related-btn" onclick="c2HideSheet();openChapter(' + faq.relatedChapter + ')">' +
        '📖 ' + (lang === 'el' ? 'Κεφ.' : 'Ch.') + ' ' + faq.relatedChapter + ': ' + chs[faq.relatedChapter-1].title + '</button>';
    }
  }

  // Related exercise
  if (faq.relatedExercise) {
    html += '<button class="c2-related-btn" onclick="c2HideSheet();launchPractice(\'' + faq.relatedExercise + '\')">' +
      '🎯 ' + (lang === 'el' ? 'Δοκίμασε άσκηση' : 'Try exercise') + '</button>';
  }

  html += '</div>';
  document.getElementById('c2-content').innerHTML = html;
}

// ═══ RENDER: CONCEPT SELECT ═══
function c2RenderConceptSelect(lang) {
  var axes = {
    body: { el: '🧍 Σώμα', en: '🧍 Body' },
    breath: { el: '🫁 Αναπνοή', en: '🫁 Breath' },
    attention: { el: '👁 Προσοχή', en: '👁 Attention' },
    space: { el: '✦ Χώρος', en: '✦ Space' },
    all: { el: '🧠 Γενικά', en: '🧠 General' }
  };

  var html = c2BackHeader(lang === 'el' ? '🔍 Τι σημαίνει...' : '🔍 What does ... mean');

  var axisKeys = Object.keys(axes);
  for (var a = 0; a < axisKeys.length; a++) {
    var axisKey = axisKeys[a];
    var concepts = [];
    var cKeys = Object.keys(KNOWLEDGE_CONCEPTS);
    for (var c = 0; c < cKeys.length; c++) {
      if (KNOWLEDGE_CONCEPTS[cKeys[c]].axis === axisKey) {
        concepts.push({ key: cKeys[c], data: KNOWLEDGE_CONCEPTS[cKeys[c]] });
      }
    }
    if (concepts.length === 0) continue;

    html += '<div class="c2-concept-group">' +
      '<div class="c2-concept-group-title">' + axes[axisKey][lang] + '</div>';
    for (var i = 0; i < concepts.length; i++) {
      var con = concepts[i];
      var seen = companionData.conceptsSeen.indexOf(con.key) >= 0;
      html += '<button class="c2-concept-btn' + (seen ? ' c2-concept-seen' : '') + '" onclick="c2ShowConceptByKey(\'' + con.key + '\')">' +
        '<span class="c2-concept-title">' + con.data[lang].title + '</span>' +
        '<span class="c2-concept-short">' + con.data[lang].short + '</span>' +
      '</button>';
    }
    html += '</div>';
  }

  document.getElementById('c2-content').innerHTML = html;
}

// ═══ RENDER: CONCEPT CARD ═══
var c2CurrentConcept = null;

function c2ShowConceptByKey(key) {
  c2CurrentConcept = key;
  if (companionData.conceptsSeen.indexOf(key) < 0) {
    companionData.conceptsSeen.push(key);
    saveCompanionData(companionData);
  }
  c2RenderConceptCard(typeof LANG !== 'undefined' ? LANG : 'el');
}

function c2RenderConceptCard(lang) {
  var concept = KNOWLEDGE_CONCEPTS[c2CurrentConcept];
  if (!concept) { c2RenderConceptSelect(lang); return; }
  var data = concept[lang];

  var html = '<div class="c2-back-row"><button class="c2-back" onclick="c2RenderConceptSelect(\'' + lang + '\')">←</button>' +
    '<span class="c2-back-title">' + data.title + '</span></div>' +
    '<div class="c2-concept-card">' +
      '<div class="c2-concept-full">' + data.full.replace(/\n/g, '<br>') + '</div>' +
      '<div class="c2-concept-nd">' +
        '<div class="c2-nd-label">🧠 ' + (lang === 'el' ? 'Για νευροδιαφορετικούς' : 'For neurodivergent') + '</div>' +
        '<div class="c2-nd-text">' + data.ndNote + '</div>' +
      '</div>' +
      (data.science ? '<div class="c2-concept-science">📚 ' + data.science + '</div>' : '');

  // Related concepts
  if (concept.related && concept.related.length > 0) {
    html += '<div class="c2-related-section">' +
      '<div class="c2-related-label">' + (lang === 'el' ? 'Σχετικά:' : 'Related:') + '</div>';
    for (var r = 0; r < concept.related.length; r++) {
      var relKey = concept.related[r];
      if (KNOWLEDGE_CONCEPTS[relKey]) {
        html += '<button class="c2-related-chip" onclick="c2ShowConceptByKey(\'' + relKey + '\')">' +
          KNOWLEDGE_CONCEPTS[relKey][lang].title + '</button>';
      }
    }
    html += '</div>';
  }

  // Related chapters
  if (concept.chapters && concept.chapters.length > 0) {
    var chs = (typeof CHAPTERS_DATA !== 'undefined') ? (CHAPTERS_DATA[lang] || CHAPTERS_DATA.el) : [];
    html += '<div class="c2-related-section">';
    for (var ch = 0; ch < concept.chapters.length; ch++) {
      var chNum = concept.chapters[ch];
      if (chs[chNum-1]) {
        html += '<button class="c2-related-btn" onclick="c2HideSheet();openChapter(' + chNum + ')">' +
          chs[chNum-1].icon + ' ' + (lang === 'el' ? 'Κεφ.' : 'Ch.') + ' ' + chNum + '</button>';
      }
    }
    html += '</div>';
  }

  html += '</div>';
  document.getElementById('c2-content').innerHTML = html;
}

// ═══ RENDER: MESSAGE ═══
function c2RenderMessage(step, lang) {
  var html = c2BackHeader('∞') +
    '<div class="c2-message">' +
      '<div class="c2-msg-text">' + step.text[lang] + '</div>' +
    '</div>';

  if (step.showConcept && KNOWLEDGE_CONCEPTS[step.showConcept]) {
    html += '<button class="c2-related-btn" onclick="c2ShowConceptByKey(\'' + step.showConcept + '\')">' +
      '🔍 ' + KNOWLEDGE_CONCEPTS[step.showConcept][lang].title + '</button>';
  }

  html += '<div class="c2-actions">' +
    '<button class="c2-action-btn c2-action-secondary" onclick="c2ShowMainMenu()">' +
      (lang === 'el' ? '← Αρχική' : '← Home') + '</button></div>';

  document.getElementById('c2-content').innerHTML = html;
}

// ═══ RENDER: MICRO SUGGESTION ═══
function c2RenderMicroSuggestion(lang) {
  var axis = companionData.preferredAxis || 'body';
  var chMap = { body: 1, breath: 2, attention: 3, space: 4 };
  var chNum = chMap[axis] || 1;
  var chK = COMPANION_KNOWLEDGE.chapters[chNum];
  if (!chK) chK = COMPANION_KNOWLEDGE.chapters[1];

  var tasks = chK.microTasks[lang];
  var dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  var taskIdx = (dayOfYear + (companionData.microDosesDone || 0)) % tasks.length;

  var html = c2BackHeader(lang === 'el' ? '⚡ Μικρή νίκη' : '⚡ Small victory') +
    '<div class="c2-micro-card">' +
      '<div class="c2-micro-icon">' + chK.icon + '</div>' +
      '<div class="c2-micro-task">' + tasks[taskIdx] + '</div>' +
    '</div>' +
    '<div class="c2-actions">' +
      '<button class="c2-action-btn" onclick="companionData.microDosesDone++;saveCompanionData(companionData);c2HideSheet();microCat=\'' + axis + '\';microIdx=0;showScreen(\'micro\')">' +
        '▶ ' + (lang === 'el' ? 'Ξεκίνα' : 'Start') + '</button>' +
      '<button class="c2-action-btn c2-action-secondary" onclick="c2RenderMicroSuggestion(\'' + lang + '\')">' +
        '↻ ' + (lang === 'el' ? 'Άλλη' : 'Another') + '</button>' +
    '</div>';

  document.getElementById('c2-content').innerHTML = html;
}

// ═══ RENDER: BREATH SUGGESTION ═══
function c2RenderBreathSuggestion(step, lang) {
  var html = c2BackHeader(lang === 'el' ? '🫁 Αναπνοή' : '🫁 Breathe') +
    '<div class="c2-breath-options">';
  for (var i = 0; i < step.actions.length; i++) {
    var act = step.actions[i];
    html += '<button class="c2-breath-btn" onclick="c2HideSheet();' + act.run + '">' +
      act.label[lang] + '</button>';
  }
  html += '</div>';
  document.getElementById('c2-content').innerHTML = html;
}

// ═══ RENDER: CHAPTER SUGGESTION ═══
function c2RenderChapterSuggestion(lang) {
  var chs = (typeof CHAPTERS_DATA !== 'undefined') ? (CHAPTERS_DATA[lang] || CHAPTERS_DATA.el) : [];
  var nextCh = null, resumeCh = null, resumeScroll = 0;

  for (var i = 1; i <= 10; i++) {
    if (!companionData.chapterProgress[i] || !companionData.chapterProgress[i].completed) {
      if (!nextCh) nextCh = i;
    }
  }
  var pKeys = Object.keys(companionData.chapterProgress);
  for (var p = 0; p < pKeys.length; p++) {
    var prog = companionData.chapterProgress[pKeys[p]];
    if (!prog.completed && prog.scrollPct > 0.05 && prog.scrollPct > resumeScroll) {
      resumeScroll = prog.scrollPct;
      resumeCh = parseInt(pKeys[p]);
    }
  }

  var html = c2BackHeader(lang === 'el' ? '📖 Πρόταση κεφαλαίου' : '📖 Chapter suggestion') +
    '<div class="c2-actions">';

  if (resumeCh && chs[resumeCh-1]) {
    html += '<button class="c2-action-btn" onclick="c2HideSheet();openChapter(' + resumeCh + ')">' +
      chs[resumeCh-1].icon + ' ' + (lang === 'el' ? 'Συνέχισε: ' : 'Continue: ') + chs[resumeCh-1].title +
      ' (' + Math.round(resumeScroll * 100) + '%)</button>';
  }
  if (nextCh && nextCh !== resumeCh && chs[nextCh-1]) {
    html += '<button class="c2-action-btn c2-action-secondary" onclick="c2HideSheet();openChapter(' + nextCh + ')">' +
      chs[nextCh-1].icon + ' ' + (lang === 'el' ? 'Επόμενο: ' : 'Next: ') + chs[nextCh-1].title + '</button>';
  }
  html += '</div>';
  document.getElementById('c2-content').innerHTML = html;
}

// ═══ RENDER: WELCOME BACK ═══
function c2RenderWelcomeBack(lang) {
  var daysSince = 0;
  if (companionData.lastSeen) daysSince = Math.floor((new Date() - new Date(companionData.lastSeen)) / 86400000);

  var greeting = '';
  if (daysSince >= 7) {
    greeting = lang === 'el'
      ? 'Χαίρομαι που γύρισες. ' + daysSince + ' μέρες — αυτό θέλει θάρρος.'
      : 'Glad you\'re back. ' + daysSince + ' days — that takes courage.';
  } else {
    greeting = lang === 'el' ? 'Καλώς ήρθες πίσω.' : 'Welcome back.';
  }

  // Wisdom from current chapter
  var currentCh = companionData.lastChapter || 1;
  var chK = COMPANION_KNOWLEDGE.chapters[currentCh];
  var wisdom = '';
  if (chK) {
    var wisdomArr = chK.wisdom[lang];
    wisdom = wisdomArr[Math.floor(Math.random() * wisdomArr.length)];
  }

  var html = c2BackHeader('∞') +
    '<div class="c2-welcome">' +
      '<div class="c2-welcome-msg">' + greeting + '</div>' +
      (wisdom ? '<div class="c2-welcome-wisdom">«' + wisdom + '»</div>' : '') +
    '</div>';

  // Offer options (from welcomeBack flow)
  var flow = CONVERSATION_FLOWS.welcomeBack;
  var offerStep = null;
  for (var i = 0; i < flow.steps.length; i++) {
    if (flow.steps[i].id === 'offer_options') { offerStep = flow.steps[i]; break; }
  }
  if (offerStep) {
    html += '<div class="c2-options">';
    for (var o = 0; o < offerStep.options.length; o++) {
      var opt = offerStep.options[o];
      if (opt.next) {
        html += '<button class="c2-option-btn" onclick="c2RunStep(\'' + opt.next + '\')">' + opt.label[lang] + '</button>';
      } else if (opt.run) {
        html += '<button class="c2-option-btn" onclick="c2HideSheet();' + opt.run + '">' + opt.label[lang] + '</button>';
      }
    }
    html += '</div>';
  }

  document.getElementById('c2-content').innerHTML = html;
}

// ═══ RENDER: RESUME ═══
function c2RenderResume(lang) {
  c2RenderChapterSuggestion(lang);
}

// ═══ HELPER: BACK HEADER ═══
function c2BackHeader(title) {
  return '<div class="c2-back-row">' +
    '<button class="c2-back" onclick="c2GoBack()">←</button>' +
    '<span class="c2-back-title">' + title + '</span>' +
    '<button class="c2-close" onclick="c2HideSheet()">✕</button>' +
  '</div>';
}

// ═══ INIT ON LOAD ═══
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(c2Init, 800);
});
