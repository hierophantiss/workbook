/* ═══ js/i18n_translations.js ═══
   Translation strings for bilingual support
   Greek (el) & English (en)
   ═══════════════════════════════════════════════════════════════ */

const TRANSLATIONS = {
  el: {
    // Navigation
    navHome: 'Αρχική',
    navChapters: 'Κεφάλαια',
    navBreath: 'Αναπνοή',
    navJournal: 'Ημερολόγιο',
    navDownloads: 'Λήψεις',
    
    // Welcome
    welcomeIntro: 'Καλώς ήρθες στον Τετραπλό Άξονα',
    welcomeDesc: 'Απλή δομή, σαφή βήματα, χωρίς πίεση',
    welcomeKindness: 'Η καλοσύνη είναι η μέθοδος',
    welcomeQ: 'Πώς νιώθεις;',
    welcomeBreath: 'Χρειάζομαι ηρεμία',
    welcomeBreathSub: 'Αναπνοή 4-2-6-1',
    welcomeExplore: 'Θέλω να εξερευνήσω',
    welcomeExploreSub: 'Δες τι υπάρχει',
    
    // Screens
    screenHome: 'Αρχική',
    screenChapters: 'Κεφάλαια',
    screenBreath: 'Αναπνοή',
    screenJournal: 'Ημερολόγιο',
    screenDownloads: 'Λήψεις',
    
    // Coach
    coachWelcome: 'Καλώς ήρθατε!',
    coachTaketime: 'Πάρετε τον χρόνο που θέλετε. 💚',
    coachBreathTip: 'Αναπνοή - Όσο θέλετε',
    coachReadTip: 'Διάβασμα - Χαλαρά',
    coachReturning: 'Καλώς πίσω!',
    
    // Actions
    startBreathing: 'Ξεκίνα Αναπνοή',
    readChapter: 'Διάβασε',
    downloadBook: 'Κατέβασε',
    closeButton: 'Κλείσιμο',
    backButton: 'Πίσω',
  },
  
  en: {
    // Navigation
    navHome: 'Home',
    navChapters: 'Chapters',
    navBreath: 'Breath',
    navJournal: 'Journal',
    navDownloads: 'Downloads',
    
    // Welcome
    welcomeIntro: 'Welcome to the Fourfold Axis',
    welcomeDesc: 'Simple structure, clear steps, no pressure',
    welcomeKindness: 'Kindness is the method',
    welcomeQ: 'How are you feeling?',
    welcomeBreath: 'I need calm',
    welcomeBreathSub: 'Breathing 4-2-6-1',
    welcomeExplore: 'I want to explore',
    welcomeExploreSub: 'See what\'s here',
    
    // Screens
    screenHome: 'Home',
    screenChapters: 'Chapters',
    screenBreath: 'Breathing',
    screenJournal: 'Journal',
    screenDownloads: 'Downloads',
    
    // Coach
    coachWelcome: 'Welcome!',
    coachTaketime: 'Take your time. 💚',
    coachBreathTip: 'Breathing - As long as you want',
    coachReadTip: 'Reading - At your pace',
    coachReturning: 'Welcome back!',
    
    // Actions
    startBreathing: 'Start Breathing',
    readChapter: 'Read',
    downloadBook: 'Download',
    closeButton: 'Close',
    backButton: 'Back',
  }
};

// ═══ HELPER FUNCTION ═══
function getTranslation(key, lang = LANG) {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
}

// ═══ UPDATE ALL TRANSLATIONS ═══
function updateLanguage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = getTranslation(key, LANG);
    if (text && text !== key) {
      el.textContent = text;
    }
  });

  // Update document language
  document.documentElement.lang = LANG === 'el' ? 'el' : 'en';
}

// Initialize
window.getTranslation = getTranslation;
window.updateLanguage = updateLanguage;

// Auto-update on load
document.addEventListener('DOMContentLoaded', updateLanguage);
