/* ═══ js/app.js ═══
   Core application logic
   - Screen navigation
   - Language switching
   - Dark mode toggle
   - Coach action execution
   ═══════════════════════════════════════════════════════════════ */

let LANG = localStorage.getItem('lang') || 'el';
let currentScreen = 'home';
let screenHistory = [];

const T = {
  el: {
    navHome: 'Αρχική',
    navChapters: 'Κεφάλαια',
    navBreath: 'Αναπνοή',
    navJournal: 'Ημερολόγιο',
    navDownloads: 'Λήψεις'
  },
  en: {
    navHome: 'Home',
    navChapters: 'Chapters',
    navBreath: 'Breath',
    navJournal: 'Journal',
    navDownloads: 'Downloads'
  }
};

// ═══ SCREEN NAVIGATION ═══
function showScreen(id) {
  // Hide all screens
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    screen.classList.remove('active');
  });

  // Show target screen
  const targetScreen = document.getElementById(`screen-${id}`);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }

  // Update nav buttons
  updateNavigation(id);

  // Track in coach
  if (typeof coach !== 'undefined' && coach) {
    coach.trackAction(id);
  }

  // Update accessibility
  if (typeof updateScreenAccessibility !== 'undefined') {
    updateScreenAccessibility(id);
  }

  // Build screen content
  buildScreenContent(id);

  currentScreen = id;
  screenHistory.push(id);

  // Scroll to top
  const scrollArea = targetScreen?.querySelector('.scroll-area');
  if (scrollArea) {
    scrollArea.scrollTop = 0;
  }
}

function buildScreenContent(id) {
  if (id === 'chapters' && typeof buildChaptersList !== 'undefined') {
    buildChaptersList();
  } else if (id === 'practice' && typeof buildPracticeList !== 'undefined') {
    buildPracticeList();
  } else if (id === 'journal' && typeof buildJournal !== 'undefined') {
    buildJournal();
  } else if (id === 'start' && typeof buildStartScreen !== 'undefined') {
    buildStartScreen();
  } else if (id === 'about' && typeof buildAboutScreen !== 'undefined') {
    buildAboutScreen();
  } else if (id === 'downloads' && typeof buildDownloadsScreen !== 'undefined') {
    buildDownloadsScreen();
  }
}

function updateNavigation(screenId) {
  // Remove active from all
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.removeAttribute('aria-current');
  });

  // Add active to current
  const navMap = {
    'home': 'nav-home',
    'chapters': 'nav-chapters',
    'chapter-1': 'nav-chapters',
    'chapter-2': 'nav-chapters',
    'practice': 'nav-chapters',
    'micro': 'nav-chapters',
    'breath': 'nav-breath',
    'journal': 'nav-journal',
    'downloads': 'nav-downloads',
    'start': 'nav-home',
    'about': 'nav-home'
  };

  const navBtnId = navMap[screenId] || 'nav-home';
  const navBtn = document.getElementById(navBtnId);
  if (navBtn) {
    navBtn.classList.add('active');
    navBtn.setAttribute('aria-current', 'page');
  }
}

// ═══ LANGUAGE SWITCHING ═══
function setLang(lang) {
  LANG = lang;
  localStorage.setItem('lang', lang);

  // Update page language
  if (typeof updateLanguage !== 'undefined') {
    updateLanguage();
  }

  // Update nav button text
  updateNavButtonText();

  // Rebuild current screen
  buildScreenContent(currentScreen);

  // Update i18n elements
  updateI18nElements();

  // Announce to screen reader
  if (typeof announceToScreenReader !== 'undefined') {
    announceToScreenReader(lang === 'el' ? 'Ελληνικά' : 'English');
  }
}

function updateNavButtonText() {
  const navButtons = [
    { id: 'nav-home', key: 'navHome' },
    { id: 'nav-chapters', key: 'navChapters' },
    { id: 'nav-breath', key: 'navBreath' },
    { id: 'nav-journal', key: 'navJournal' },
    { id: 'nav-downloads', key: 'navDownloads' }
  ];

  navButtons.forEach(btn => {
    const el = document.getElementById(btn.id);
    if (el) {
      const span = el.querySelector('span');
      if (span) {
        const text = T[LANG][btn.key] || btn.key;
        span.textContent = text;
      }
    }
  });
}

function updateI18nElements() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    // Get translation from your i18n system
    // This is a placeholder - your actual i18n.js should handle this
    if (window.getTranslation) {
      el.textContent = window.getTranslation(key, LANG);
    }
  });
}

// ═══ DARK MODE ═══
function toggleDark() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('dark-mode', isDark);
  
  // Update icon
  const darkToggle = document.getElementById('dark-toggle');
  if (darkToggle) {
    darkToggle.textContent = isDark ? '☀️' : '🌙';
  }
}

// ═══ COACH ACTION EXECUTION ═══
function executeCoachAction(action) {
  // Track in coach
  if (typeof coach !== 'undefined' && coach) {
    coach.trackAction(action);
  }

  // Execute action
  if (action === 'breath') {
    showScreen('breath');
  } else if (action === 'breath-audio') {
    if (typeof coach !== 'undefined' && coach) {
      coach.trackBinauralPreference('with-audio');
    }
    showScreen('breath');
  } else if (action === 'breath-silent') {
    if (typeof coach !== 'undefined' && coach) {
      coach.trackBinauralPreference('silent');
    }
    showScreen('breath');
  } else if (action.startsWith('chapter-')) {
    showScreen(action);
  } else if (action === 'practice') {
    showScreen('practice');
  } else if (action === 'journal') {
    showScreen('journal');
  } else {
    showScreen(action);
  }

  // Update coach message
  if (typeof showCoachMessage !== 'undefined') {
    showCoachMessage();
  }
}

// ═══ WELCOME & OVERLAYS ═══
function closeWelcome() {
  const overlay = document.getElementById('welcome-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    localStorage.setItem('welcomed', 'true');
  }
}

function welcomeAction(action) {
  closeWelcome();
  if (action === 'breath') {
    showScreen('breath');
  } else if (action === 'explore') {
    showScreen('home');
  }
}

function closePractice() {
  const overlay = document.getElementById('practice-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

function openPractice(practiceId, title) {
  const overlay = document.getElementById('practice-overlay');
  const iframe = document.getElementById('practice-iframe');
  
  if (overlay && iframe) {
    overlay.style.display = 'flex';
    iframe.src = `practice/${practiceId}.html`;
    iframe.title = title;
  }
}

function closeTW() {
  const overlay = document.getElementById('tw-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

function confirmTW() {
  closeTW();
  // Continue to practice
  if (window.lastPracticeId) {
    openPractice(window.lastPracticeId, window.lastPracticeTitle);
  }
}

function tapFeedback() {
  // Haptic feedback if available
  if (typeof triggerHaptic !== 'undefined') {
    triggerHaptic();
  }
}

// ═══ INITIALIZATION ═══
document.addEventListener('DOMContentLoaded', () => {
  // Load dark mode preference
  const darkMode = localStorage.getItem('dark-mode') === 'true';
  if (darkMode) {
    document.body.classList.add('dark');
    const darkToggle = document.getElementById('dark-toggle');
    if (darkToggle) darkToggle.textContent = '☀️';
  }

  // Update nav button text
  updateNavButtonText();

  // Initialize language
  if (LANG === 'el') {
    document.documentElement.lang = 'el';
  } else {
    document.documentElement.lang = 'en';
  }

  // Show home screen
  showScreen('home');

  // Update i18n
  updateI18nElements();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { showScreen, setLang, toggleDark, executeCoachAction };
}
