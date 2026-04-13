// js/init.js
// ═══ INSTALL APP ═══
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; });
function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(r => { deferredPrompt = null; });
  } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    alert(LANG === 'el' ? 'Safari: ⎙ → Προσθήκη στην αρχική οθόνη' : 'Safari: ⎙ → Add to Home Screen');
  } else {
    alert(LANG === 'el' ? 'Μενού browser (⋮) → Εγκατάσταση εφαρμογής' : 'Browser menu (⋮) → Install app');
  }
}


// ═══ STATE-BASED ENTRY ═══
function showAdvice(state) {
  tapFeedback();
  var advice = {hyper:t('adviceHyper'),discon:t('adviceDiscon'),focus:t('adviceFocus'),body:t('adviceBody')};
  var microCats = {hyper:'body',discon:'body',focus:'attention',body:'body'};
  var microLabels = {
    hyper: LANG==='el' ? '🧍 Μικρή δόση γείωσης' : '🧍 Quick grounding dose',
    discon: LANG==='el' ? '🧍 Μικρή δόση σώματος' : '🧍 Quick body dose',
    focus: LANG==='el' ? '👁 Μικρή δόση προσοχής' : '👁 Quick attention dose',
    body: LANG==='el' ? '🧍 Μικρή δόση σώματος' : '🧍 Quick body dose'
  };

  // Map each state to the best breath pattern
  var breathMap = {
    hyper: { pattern: '4-7-8', label_el: '🫁 Αναπνοή 4-7-8 — Βαθιά Ηρεμία', label_en: '🫁 Breath 4-7-8 — Deep Calm' },
    discon: { pattern: '4-2-6-1', label_el: '🫁 Αναπνοή 4-2-6-1 — Γείωση & Παρουσία', label_en: '🫁 Breath 4-2-6-1 — Grounding & Presence' },
    focus: { pattern: '5-5', label_el: '🫁 Αναπνοή 5-5 — Εστίαση & Ισορροπία', label_en: '🫁 Breath 5-5 — Focus & Balance' },
    body: { pattern: '4-2-6-1', label_el: '🫁 Αναπνοή 4-2-6-1 — Γείωση & Παρουσία', label_en: '🫁 Breath 4-2-6-1 — Grounding & Presence' }
  };
  var bm = breathMap[state];
  var breathLabel = LANG === 'el' ? bm.label_el : bm.label_en;
  var breathPattern = bm.pattern;

  document.getElementById('state-advice').style.display = 'block';
  document.getElementById('state-advice').innerHTML = 
    '<div style="font-size:13px;color:var(--text);line-height:1.6;margin-bottom:12px">' + advice[state] + '</div>' +
    '<div style="display:flex;flex-direction:column;gap:8px">' +
      '<button class="btn-primary" style="font-size:13px;padding:10px 18px;width:100%;justify-content:center" onclick="switchPattern(\'' + breathPattern + '\');showScreen(\'breath\')">' + breathLabel + '</button>' +
      '<button class="btn-secondary" style="font-size:13px;padding:10px 18px;width:100%;justify-content:center" onclick="microCat=\'' + microCats[state] + '\';microIdx=0;showScreen(\'micro\')">' + microLabels[state] + '</button>' +
    '</div>';
}
// ═══ HIDE STATS ═══
function toggleHideStats() {
  localStorage.setItem('hideStats', localStorage.getItem('hideStats') === '1' ? '0' : '1');
  buildPracticeList();
}
// ═══ REDUCE MOTION ═══
function openLearningToRide() {
  const isGreek = document.documentElement.lang === 'el' || LANG === 'el';
  const url = isGreek ? 'learning-to-ride-greek.html' : 'learning-to-ride-english.html';
  location.href = url;
}

function toggleReduceMotion() {
  var on = document.body.classList.toggle('reduce-motion');
  localStorage.setItem('reduceMotion', on ? '1' : '0');
  updateReduceMotionBtn();
}
function updateReduceMotionBtn() {
  var btn = document.getElementById('reduce-motion-toggle');
  if (btn) btn.textContent = document.body.classList.contains('reduce-motion') ? '⏸' : '▶';
}


// ═══ SHARE ═══
function shareSite() {
  var title = 'Mindfulness for Neurodivergent Minds';
  var text = LANG === 'el'
    ? 'Δωρεάν εργαλείο ενσυνειδητότητας για νευροδιαφορετικούς — trauma-informed, δίγλωσσο, offline.'
    : 'Free mindfulness tool for neurodivergent individuals — trauma-informed, bilingual, offline.';
  var url = 'https://mindfulness-practice.site/';
  if (navigator.share) {
    navigator.share({title: title, text: text, url: url}).catch(function(){});
  } else {
    // Fallback: copy URL
    navigator.clipboard.writeText(url).then(function(){
      showSaveConfirm();
    }).catch(function(){
      window.open('https://mindfulness-practice.site/', '_blank');
    });
  }
}
// ═══ DARK MODE ═══
function toggleDark() {
  document.body.classList.toggle('dark');
  // Save explicit user preference
  localStorage.setItem('darkMode', document.body.classList.contains('dark') ? '1' : '0');
  updateDarkBtn();
}
function updateDarkBtn() {
  const btn = document.getElementById('dark-toggle');
  if (btn) btn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
}
function applySystemDark() {
  // If user has no explicit preference, follow system
  if (!localStorage.getItem('darkMode')) {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark', prefersDark);
    updateDarkBtn();
  }
}

// ═══ INIT ═══
document.addEventListener('DOMContentLoaded', () => {
  // Dark mode: user preference > system preference
  const savedDark = localStorage.getItem('darkMode');
  if (savedDark === '1') {
    document.body.classList.add('dark');
  } else if (savedDark === '0') {
    document.body.classList.remove('dark');
  } else {
    // No user preference — follow system
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark');
    }
  }
  // Listen for system theme changes (only applies if no user override)
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applySystemDark());
  }
  updateDarkBtn();

  // Reduce motion restore
  if (localStorage.getItem('reduceMotion') === '1') document.body.classList.add('reduce-motion');
  updateReduceMotionBtn();

  const urlLang = new URLSearchParams(location.search).get('lang');
  if (urlLang === 'en' || urlLang === 'el') LANG = urlLang;
  else if (!urlLang) {
    // Auto-detect from browser language
    var browserLang = (navigator.language || navigator.userLanguage || 'el').toLowerCase();
    if (browserLang.indexOf('el') === -1) LANG = 'en';
  }
  setLang(LANG);
  updateQuote();

  // Set initial history state
  try{history.replaceState({screen:'home'},'',location.hash||'#home')}catch(e){}

  // Restore screen from hash on load
  var hash = location.hash.replace('#','');
  if (hash && hash !== 'home') {
    showScreen(hash);
  }

  // Service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // Initialize haptic AudioContext on first touch (iOS requires user gesture)
  document.addEventListener('touchstart', function _initHaptic() {
    _getHapticCtx();
    document.removeEventListener('touchstart', _initHaptic);
  }, { once: true, passive: true });
  document.addEventListener('click', function _initHapticClick() {
    _getHapticCtx();
    document.removeEventListener('click', _initHapticClick);
  }, { once: true });

  // Welcome screen — only first visit
  if (!localStorage.getItem('welcomed')) {
    showWelcome();
  }
});

// ═══ WELCOME SCREEN ═══
function showWelcome() {
  var overlay = document.getElementById('welcome-overlay');
  if (overlay) overlay.style.display = 'flex';
}
function closeWelcome() {
  localStorage.setItem('welcomed', '1');
  document.getElementById('welcome-overlay').style.display = 'none';
}
function welcomeAction(action) {
  closeWelcome();
  if (action === 'breath') showScreen('breath');
  else if (action === 'learn') openLearningToRide();
  else if (action === 'explore') { /* stay on home */ }
}
