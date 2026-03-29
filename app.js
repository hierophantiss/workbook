/* ═══════════════════════════════════════════
   App.js — Navigation & Screen Management
   ═══════════════════════════════════════════ */

let LANG = 'el';
let currentScreen = 'home';
const screenHistory = ['home'];

// ═══ NAVIGATION ═══
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById('screen-' + id);
  if (screen) {
    screen.classList.add('active');
    if (currentScreen !== id) screenHistory.push(id);
    currentScreen = id;
  }

  // Update bottom nav
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const navMap = { home:'nav-home', chapters:'nav-chapters', chapter:'nav-chapters', breath:'nav-breath', practice:'nav-practice', journal:'nav-journal' };
  const navId = navMap[id];
  if (navId) document.getElementById(navId)?.classList.add('active');

  // Build screen content on demand
  if (id === 'chapters') buildChaptersList();
  if (id === 'practice') buildPracticeList();
  if (id === 'breath') initBreathExercise();
  if (id === 'journal') buildJournal();
  if (id === 'start') buildStartScreen();
  if (id === 'about') buildAboutScreen();
  if (id === 'downloads') buildDownloadsScreen();

  // Scroll to top
  const sa = screen?.querySelector('.scroll-area');
  if (sa) sa.scrollTop = 0;
}

function goBack() {
  screenHistory.pop();
  const prev = screenHistory[screenHistory.length - 1] || 'home';
  showScreen(prev);
}

// ═══ LANGUAGE ═══
function setLang(lang) {
  LANG = lang;
  document.documentElement.lang = lang;

  // Update lang button
  const btn = document.getElementById('lang-label');
  if (btn) btn.textContent = lang === 'el' ? 'EN' : 'ΕΛ';

  // Update top title
  document.getElementById('top-title').textContent = lang === 'el' ? 'Τετραπλός Άξονας' : 'Fourfold Axis';

  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (T[lang] && T[lang][key]) el.textContent = T[lang][key];
  });

  // Update dynamic content
  updateQuote();
  if (currentScreen === 'chapters') buildChaptersList();
  if (currentScreen === 'practice') buildPracticeList();
  if (currentScreen === 'journal') buildJournal();
  if (currentScreen === 'start') buildStartScreen();
  if (currentScreen === 'about') buildAboutScreen();
  if (currentScreen === 'breath') updateBreathLang();
}

function t(key) {
  return (T[LANG] && T[LANG][key]) || (T.el && T.el[key]) || key;
}

// ═══ PRACTICE OVERLAY ═══
function launchPractice(file) {
  const overlay = document.getElementById('practice-overlay');
  const iframe = document.getElementById('practice-iframe');
  const sep = file.includes('?') ? '&' : '?';
  iframe.src = file + sep + 'lang=' + LANG;
  overlay.style.display = 'block';
  trackExerciseOpened(file);
}

function closePractice() {
  document.getElementById('practice-overlay').style.display = 'none';
  document.getElementById('practice-iframe').src = '';
}

// ═══ TRIGGER WARNING ═══
let pendingFile = null;
function showTW(msg, file) {
  pendingFile = file;
  const overlay = document.getElementById('tw-overlay');
  if (!overlay) return launchPractice(file);
  document.getElementById('tw-text').textContent = msg;
  overlay.style.display = 'flex';
}
function closeTW() {
  document.getElementById('tw-overlay').style.display = 'none';
}
function confirmTW() {
  const f = pendingFile;
  closeTW();
  if (f) launchPractice(f);
}

// ═══ QUOTES ═══
const QUOTES = {
  el: [
    { text: '«Η παρουσία δεν χρειάζεται ώρες. Ξεκινά με νίκες λίγων δευτερολέπτων.»', src: 'Τετραπλός Άξονας' },
    { text: '«Δεν είσαι τα σύννεφα. Είσαι ο ουρανός που τα χωράει.»', src: 'Τετραπλός Άξονας' },
    { text: '«Ο νους σου δεν είναι σπασμένος — λειτουργεί διαφορετικά.»', src: 'Τετραπλός Άξονας' },
    { text: '«Η βαρύτητα είναι πάντα εδώ. Το σώμα είναι πάντα εδώ.»', src: 'Τετραπλός Άξονας' },
    { text: '«Η επιστροφή της προσοχής δεν είναι αποτυχία — είναι η ίδια η άσκηση.»', src: 'Τετραπλός Άξονας' },
    { text: '«Παρατηρώ χωρίς να επεμβαίνω. Κάθε αναπνοή είναι μια νέα αρχή.»', src: 'Τετραπλός Άξονας' }
  ],
  en: [
    { text: '"Presence doesn\'t need hours. It starts with victories of a few seconds."', src: 'Fourfold Axis' },
    { text: '"You are not the clouds. You are the sky that holds them."', src: 'Fourfold Axis' },
    { text: '"Your mind is not broken — it works differently."', src: 'Fourfold Axis' },
    { text: '"Gravity is always here. The body is always here."', src: 'Fourfold Axis' },
    { text: '"Returning attention is not failure — it is the practice itself."', src: 'Fourfold Axis' },
    { text: '"I observe without intervening. Every breath is a new beginning."', src: 'Fourfold Axis' }
  ]
};

function updateQuote() {
  const quotes = QUOTES[LANG] || QUOTES.el;
  const idx = new Date().getDate() % quotes.length;
  const q = quotes[idx];
  document.getElementById('quote-text').textContent = q.text;
  document.getElementById('quote-src').textContent = '— ' + q.src;
}

// ═══ BUILD SCREENS ═══
function buildChaptersList() {
  const screen = document.getElementById('screen-chapters');
  const chs = CHAPTERS_DATA[LANG] || CHAPTERS_DATA.el;
  screen.innerHTML = `
    <div class="scroll-area">
      <div class="screen-header">
        <button class="back-btn" onclick="goBack()">←</button>
        <div class="screen-title">${t('menuChapters')}</div>
      </div>
      <div class="ch-list">
        ${chs.map(ch => `
          <button class="ch-item" onclick="openChapter(${ch.num})">
            <div class="ch-num" style="background:${ch.hex}">${ch.icon}</div>
            <div class="ch-info">
              <div class="ch-title">${ch.title}</div>
              <div class="ch-sub">${ch.sub}</div>
            </div>
            <div class="ch-arrow">›</div>
          </button>
        `).join('')}
      </div>
      <div class="spacer-bottom"></div>
    </div>`;
}

function openChapter(num) {
  const chs = CHAPTERS_DATA[LANG] || CHAPTERS_DATA.el;
  const ch = chs[num - 1];
  if (!ch) return;

  const practices = CHAPTER_PRACTICES[num] || [];
  const allPractices = T[LANG]?.practices || T.el.practices;

  const practiceCards = practices.map(id => {
    const p = allPractices.find(x => x.id === id);
    if (!p) return '';
    return `<button class="practice-card" onclick="openPracticeItem('${p.file}')" style="margin:0">
      <div class="practice-icon-wrap" style="background:${p.axisColor}22">${p.icon}</div>
      <div style="flex:1"><div class="practice-name">${p.name}</div><div class="practice-desc">${p.desc}</div></div>
    </button>`;
  }).join('');

  const screen = document.getElementById('screen-chapter');
  screen.innerHTML = `
    <div class="scroll-area">
      <div class="screen-header">
        <button class="back-btn" onclick="showScreen('chapters')">←</button>
        <div class="screen-title">${ch.icon} ${ch.title}</div>
      </div>
      <div class="content-card">
        <p style="font-style:italic;margin-bottom:12px">${ch.summary}</p>
      </div>
      ${ch.theorySections.map(s => `
        <div class="content-card">
          <h3>${s.title}</h3>
          <p>${s.body.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>')}</p>
        </div>
      `).join('')}
      ${ch.exercise ? `
        <div class="content-card" style="border-left:3px solid ${ch.hex}">
          <h3>${ch.exercise.title}</h3>
          <ol style="margin:8px 0 0 16px;font-size:13px;color:var(--text-soft);line-height:1.8">
            ${ch.exercise.steps.map(s => `<li>${s}</li>`).join('')}
          </ol>
        </div>
      ` : ''}
      ${ch.insight ? `<div class="content-card" style="text-align:center;font-style:italic;color:var(--teal)">${ch.insight}</div>` : ''}
      ${practiceCards ? `<div style="padding:0 16px"><div style="font-size:12px;font-weight:700;color:var(--text-hint);margin:12px 0 8px;text-transform:uppercase;letter-spacing:1px">${t('chPracticesLabel')}</div><div style="display:flex;flex-direction:column;gap:8px">${practiceCards}</div></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:16px">
        ${num > 1 ? `<button class="btn-secondary" onclick="openChapter(${num-1})">← ${t('prev')}</button>` : '<div></div>'}
        ${num < chs.length ? `<button class="btn-primary" onclick="openChapter(${num+1})">${t('next')} →</button>` : '<div></div>'}
      </div>
      <div class="spacer-bottom"></div>
    </div>`;
  showScreen('chapter');
}

function openPracticeItem(file) {
  const practices = T[LANG]?.practices || T.el.practices;
  const ex = practices.find(p => p.file === file);
  if (ex && ex.warn) { showTW(ex.warn, file); return; }
  launchPractice(file);
}

function buildPracticeList() {
  const screen = document.getElementById('screen-practice');
  const practices = T[LANG]?.practices || T.el.practices;

  screen.innerHTML = `
    <div class="scroll-area">
      <div class="screen-header">
        <button class="back-btn" onclick="goBack()">←</button>
        <div class="screen-title">${t('menuExercises')}</div>
      </div>
      <div class="practice-stats-bar">
        <div class="ps-cell"><div class="ps-val">${stats.sessions}</div><div class="ps-lbl">${t('statSessions')}</div></div>
        <div class="ps-div"></div>
        <div class="ps-cell"><div class="ps-val">${stats.minutes}</div><div class="ps-lbl">${t('statMinutes')}</div></div>
        <div class="ps-div"></div>
        <div class="ps-cell"><div class="ps-val">${stats.streak}</div><div class="ps-lbl">${t('statStreak')}</div></div>
        <div class="ps-div"></div>
        <div class="ps-cell"><div class="ps-val">${(stats.explored||[]).length}<span style="font-size:12px;opacity:0.4">/${practices.length}</span></div><div class="ps-lbl">${t('statExplored')}</div></div>
        <div style="width:100%"><div class="ps-progress"><div class="ps-bar" style="width:${Math.round((stats.explored||[]).length/practices.length*100)}%"></div></div></div>
      </div>
      <div class="practice-grid">
        ${practices.map(p => {
          const explored = (stats.explored||[]).includes(p.file.replace('.html',''));
          return `<button class="practice-card${explored?' explored':''}" onclick="openPracticeItem('${p.file}')">
            <div class="practice-icon-wrap" style="background:${p.axisColor}22">${p.icon}</div>
            <div style="flex:1">
              <div class="practice-name">${p.name}${p.warn ? ' ⚠️' : ''}${explored ? ' ✓' : ''}</div>
              <div class="practice-desc">${p.desc}</div>
              <span class="practice-axis" style="background:${p.axisColor}">${p.axis}</span>
            </div>
          </button>`;
        }).join('')}
      </div>
      <div class="spacer-bottom"></div>
    </div>`;
}

function buildStartScreen() {
  const screen = document.getElementById('screen-start');
  screen.innerHTML = `
    <div class="scroll-area">
      <div class="screen-header">
        <button class="back-btn" onclick="goBack()">←</button>
        <div class="screen-title">${t('menuStart')}</div>
      </div>
      <div class="content-card">
        <h3>${t('manifestoTitle')}</h3>
        <p>${t('manifestoBody').replace(/\\n\\n/g, '<br><br>').replace(/\\n/g, '<br>')}</p>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;padding:0 16px;margin-top:8px">
        <button class="btn-primary" onclick="showScreen('breath')">🫁 ${t('tryBreath')}</button>
        <button class="btn-secondary" onclick="openChapter(1)">📖 ${t('startCh1')}</button>
        <button class="btn-secondary" onclick="showScreen('practice')">🎯 ${t('seeExercises')}</button>
      </div>
      <div class="spacer-bottom"></div>
    </div>`;
}

function buildAboutScreen() {
  const screen = document.getElementById('screen-about');
  screen.innerHTML = `
    <div class="scroll-area">
      <div class="screen-header">
        <button class="back-btn" onclick="goBack()">←</button>
        <div class="screen-title">${t('menuAbout')}</div>
      </div>
      <div class="content-card">
        <h3>${t('traumaTitle')}</h3>
        <p>${t('traumaText').replace(/\\n\\n/g, '<br><br>').replace(/\\n/g, '<br>')}</p>
      </div>
      <div class="content-card">
        <h3>${t('aboutTitle')}</h3>
        <p class="about-bio">${t('aboutText')}</p>
        <a class="about-email" href="mailto:bairaktaris.theodoros@gmail.com">✉ ${t('aboutContact')}</a>
      </div>
      <div class="spacer-bottom"></div>
    </div>`;
}

function buildDownloadsScreen() {
  const screen = document.getElementById('screen-downloads');
  screen.innerHTML = `
    <div class="scroll-area">
      <div class="screen-header">
        <button class="back-btn" onclick="goBack()">←</button>
        <div class="screen-title">${t('menuDownloads')}</div>
      </div>
      <div class="content-card" style="cursor:pointer" onclick="window.open(LANG==='el'?'workbook_el.pdf':'workbook_en.pdf','_blank')">
        <h3>📥 ${t('dlPdfName')}</h3>
        <p>${t('dlPdfDesc')}</p>
      </div>
      <div class="content-card" id="installCard" style="cursor:pointer" onclick="installApp()">
        <h3>📱 ${t('dlAppName')}</h3>
        <p>${t('dlAppDesc')}</p>
      </div>
      <div class="spacer-bottom"></div>
    </div>`;
}

// ═══ JOURNAL (placeholder - will use full journal from old code) ═══
function buildJournal() {
  const screen = document.getElementById('screen-journal');
  if (screen.querySelector('.scroll-area')) return; // already built
  screen.innerHTML = `
    <div class="scroll-area">
      <div class="screen-header">
        <button class="back-btn" onclick="goBack()">←</button>
        <div class="screen-title">${t('menuJournal')}</div>
      </div>
      <div class="content-card">
        <p style="text-align:center;color:var(--text-hint)">📓 ${t('journalPlaceholder')}</p>
      </div>
      <div class="spacer-bottom"></div>
    </div>`;
}

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

// ═══ INIT ═══
document.addEventListener('DOMContentLoaded', () => {
  const urlLang = new URLSearchParams(location.search).get('lang');
  if (urlLang === 'en' || urlLang === 'el') LANG = urlLang;
  setLang(LANG);
  updateQuote();

  // Service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});
