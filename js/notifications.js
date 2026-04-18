/* ═══ js/notifications.js ═══ */
// Reminder & Notification System for 8-week program
const NOTIF_STORAGE_KEY = 'mindful_reminders_enabled';

const REMINDERS_TEXT = {
  el: {
    title: 'Υπενθύμιση Πρακτικής',
    body: 'Είναι ώρα για τη σημερινή σου στιγμή ενσυνειδητότητας. 🧘',
    request: 'Θέλεις να λαμβάνεις υπενθυμίσεις για την πρακτική σου;',
    granted: 'Οι υπενθυμίσεις ενεργοποιήθηκαν!',
    denied: 'Οι υπενθυμίσεις δεν είναι διαθέσιμες.'
  },
  en: {
    title: 'Practice Reminder',
    body: 'It\'s time for your mindfulness moment today. 🧘',
    request: 'Would you like to receive practice reminders?',
    granted: 'Reminders enabled!',
    denied: 'Reminders are not available.'
  }
};

function initNotifications() {
  if (!("Notification" in window)) return;
  
  // Show prompt if not set and practiced at least once
  const stats = loadStats();
  if (stats.sessions > 0 && localStorage.getItem(NOTIF_STORAGE_KEY) === null) {
    // Optionally show a UI card first
  }
  
  checkAndNotify();
  // Check every hour if tab is open
  setInterval(checkAndNotify, 3600000);
}

function requestNotifPermission() {
  if (!("Notification" in window)) {
    showToast(REMINDERS_TEXT[LANG].denied);
    return;
  }
  
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      localStorage.setItem(NOTIF_STORAGE_KEY, '1');
      showToast(REMINDERS_TEXT[LANG].granted);
      // Send a test one
      new Notification(REMINDERS_TEXT[LANG].title, {
        body: REMINDERS_TEXT[LANG].body,
        icon: '/favicon.ico'
      });
    } else {
      localStorage.setItem(NOTIF_STORAGE_KEY, '0');
    }
  });
}

function checkAndNotify() {
  if (localStorage.getItem(NOTIF_STORAGE_KEY) !== '1') return;
  if (Notification.permission !== 'granted') return;
  
  const stats = loadStats();
  const lastDate = stats.lastDate; // "Sat Apr 18 2026"
  const today = new Date().toDateString();
  
  if (lastDate !== today) {
    // Check if it's afternoon (often a good time for reminders)
    const hour = new Date().getHours();
    if (hour >= 18) { // 6 PM
      showPracticeNotification();
    }
  }
}

function showPracticeNotification() {
  const lastPrompt = localStorage.getItem('last_notif_timestamp') || 0;
  const now = Date.now();
  
  // Don't notify more than once every 20 hours
  if (now - lastPrompt < 20 * 3600000) return;
  
  new Notification(REMINDERS_TEXT[LANG].title, {
    body: REMINDERS_TEXT[LANG].body,
    icon: '/favicon.ico'
  });
  
  localStorage.setItem('last_notif_timestamp', now.toString());
}
