/* ═══════════════════════════════════════════
   companion.js — ∞ Neurodiversity Companion
   A gentle, memory-aware guide for neurodivergent users
   - Tracks reading progress per chapter (scroll depth, time)
   - Integrates with journal mood
   - Offers context-aware, guilt-free suggestions
   - All data in localStorage (device-only)
   - Export/Import for device transfer
   ═══════════════════════════════════════════ */

// ═══ COMPANION STATE ═══
const COMPANION_KEY = 'companion_v1';

function loadCompanionData() {
  try {
    const d = JSON.parse(localStorage.getItem(COMPANION_KEY));
    if (!d) return defaultCompanionData();
    // Migrate if needed
    if (!d.chapterProgress) d.chapterProgress = {};
    if (!d.visits) d.visits = [];
    if (!d.exercisesDone) d.exercisesDone = [];
    if (!d.dismissed) d.dismissed = false;
    if (!d.lastSeen) d.lastSeen = null;
    return d;
  } catch { return defaultCompanionData(); }
}

function defaultCompanionData() {
  return {
    chapterProgress: {},  // { "1": { scrollPct: 0.8, timeSpent: 45, lastVisit: "...", completed: false, visits: 2 } }
    visits: [],           // [{ date: "...", screen: "...", duration: 0 }]
    exercisesDone: [],    // ["breath", "gravity", ...]
    lastScreen: 'home',
    lastChapter: null,
    firstVisit: new Date().toISOString(),
    lastSeen: null,
    dismissed: false,
    bubbleCount: 0
  };
}

function saveCompanionData(data) {
  try { localStorage.setItem(COMPANION_KEY, JSON.stringify(data)); } catch(e) {}
}

let companionData = loadCompanionData();
let companionVisible = false;
let companionTimeout = null;
let chapterScrollTracker = null;
let chapterTimeStart = null;

// ═══ INFINITY SYMBOL SVG ═══
function infinitySVG(size = 32) {
  return `<svg width="${size}" height="${size * 0.55}" viewBox="0 0 120 66" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="inf-grad" x1="0" y1="33" x2="120" y2="33" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#E8704A"/>
        <stop offset="20%" stop-color="#E8A030"/>
        <stop offset="40%" stop-color="#C8C040"/>
        <stop offset="55%" stop-color="#50B870"/>
        <stop offset="70%" stop-color="#40A0A8"/>
        <stop offset="85%" stop-color="#6070C0"/>
        <stop offset="100%" stop-color="#9860A8"/>
      </linearGradient>
    </defs>
    <path d="M60 33 C60 16, 45 4, 30 4 C15 4, 2 16, 2 33 C2 50, 15 62, 30 62 C45 62, 60 50, 60 33 C60 16, 75 4, 90 4 C105 4, 118 16, 118 33 C118 50, 105 62, 90 62 C75 62, 60 50, 60 33Z" 
          stroke="url(#inf-grad)" stroke-width="6.5" stroke-linecap="round" fill="none"/>
  </svg>`;
}

// ═══ BUILD COMPANION UI ═══
function initCompanion() {
  // Floating button
  if (document.getElementById('companion-fab')) return;

  const fab = document.createElement('div');
  fab.id = 'companion-fab';
  fab.innerHTML = infinitySVG(36);
  fab.onclick = function(e) {
    e.stopPropagation();
    tapFeedback();
    toggleCompanionBubble();
  };
  document.body.appendChild(fab);

  // Bubble container
  const bubble = document.createElement('div');
  bubble.id = 'companion-bubble';
  bubble.innerHTML = '<div id="companion-bubble-inner"></div>';
  document.body.appendChild(bubble);

  // Close bubble when clicking outside
  document.addEventListener('click', function(e) {
    if (companionVisible && !e.target.closest('#companion-bubble') && !e.target.closest('#companion-fab')) {
      hideCompanionBubble();
    }
  });

  // Track screen changes
  const origShowScreen = window.showScreen;
  window.showScreen = function(id) {
    origShowScreen(id);
    companionTrackScreen(id);
  };

  // Track chapter reading
  const origOpenChapter = window.openChapter;
  window.openChapter = function(num) {
    origOpenChapter(num);
    companionStartChapterTracking(num);
  };

  // Initial context-aware appearance (gentle, after delay)
  setTimeout(function() {
    if (!companionData.dismissed) {
      showCompanionNudge();
    }
  }, 3000);
}

// ═══ SCREEN TRACKING ═══
function companionTrackScreen(screenId) {
  companionData.lastScreen = screenId;
  companionData.lastSeen = new Date().toISOString();

  // Add to visits log (keep last 50)
  companionData.visits.push({
    date: new Date().toISOString(),
    screen: screenId
  });
  if (companionData.visits.length > 50) companionData.visits = companionData.visits.slice(-50);

  saveCompanionData(companionData);

  // Stop chapter tracking if leaving chapter
  if (screenId !== 'chapter') {
    companionStopChapterTracking();
  }
}

// ═══ CHAPTER PROGRESS TRACKING ═══
function companionStartChapterTracking(num) {
  companionStopChapterTracking(); // cleanup previous
  chapterTimeStart = Date.now();
  companionData.lastChapter = num;

  // Initialize chapter progress
  if (!companionData.chapterProgress[num]) {
    companionData.chapterProgress[num] = {
      scrollPct: 0,
      timeSpent: 0,
      lastVisit: new Date().toISOString(),
      completed: false,
      visits: 0
    };
  }
  companionData.chapterProgress[num].visits++;
  companionData.chapterProgress[num].lastVisit = new Date().toISOString();
  saveCompanionData(companionData);

  // Track scroll depth
  setTimeout(function() {
    const screen = document.getElementById('screen-chapter');
    const scrollArea = screen ? screen.querySelector('.scroll-area') : null;
    if (scrollArea) {
      chapterScrollTracker = function() {
        const pct = scrollArea.scrollTop / (scrollArea.scrollHeight - scrollArea.clientHeight);
        const capped = Math.min(1, Math.max(0, pct));
        if (companionData.chapterProgress[num] && capped > companionData.chapterProgress[num].scrollPct) {
          companionData.chapterProgress[num].scrollPct = Math.round(capped * 100) / 100;
          if (capped > 0.85) {
            companionData.chapterProgress[num].completed = true;
          }
          saveCompanionData(companionData);
        }
      };
      scrollArea.addEventListener('scroll', chapterScrollTracker, { passive: true });
    }
  }, 300);
}

function companionStopChapterTracking() {
  if (chapterTimeStart && companionData.lastChapter) {
    const elapsed = Math.round((Date.now() - chapterTimeStart) / 1000);
    const num = companionData.lastChapter;
    if (companionData.chapterProgress[num]) {
      companionData.chapterProgress[num].timeSpent += elapsed;
      saveCompanionData(companionData);
    }
  }
  chapterTimeStart = null;

  // Remove scroll listener
  if (chapterScrollTracker) {
    const screen = document.getElementById('screen-chapter');
    const scrollArea = screen ? screen.querySelector('.scroll-area') : null;
    if (scrollArea) {
      scrollArea.removeEventListener('scroll', chapterScrollTracker);
    }
    chapterScrollTracker = null;
  }
}

// ═══ COMPANION INTELLIGENCE ═══
function getCompanionMessage() {
  const lang = typeof LANG !== 'undefined' ? LANG : 'el';
  const data = companionData;
  const now = new Date();
  const mood = loadMood ? loadMood() : -1;
  const totalChapters = 10;

  // Count progress
  const chaptersStarted = Object.keys(data.chapterProgress).length;
  const chaptersCompleted = Object.values(data.chapterProgress).filter(c => c.completed).length;
  const lastChapter = data.lastChapter;

  // Days since last visit
  let daysSince = 0;
  if (data.lastSeen) {
    daysSince = Math.floor((now - new Date(data.lastSeen)) / 86400000);
  }

  // Find incomplete chapter with highest scroll
  let resumeChapter = null;
  let resumeScroll = 0;
  for (const [num, prog] of Object.entries(data.chapterProgress)) {
    if (!prog.completed && prog.scrollPct > 0.05 && prog.scrollPct < 0.85) {
      if (prog.scrollPct > resumeScroll) {
        resumeScroll = prog.scrollPct;
        resumeChapter = parseInt(num);
      }
    }
  }

  // Find next unread chapter
  let nextChapter = null;
  for (let i = 1; i <= totalChapters; i++) {
    if (!data.chapterProgress[i] || !data.chapterProgress[i].completed) {
      nextChapter = i;
      break;
    }
  }

  // Get chapter titles
  const chs = (typeof CHAPTERS_DATA !== 'undefined') ? (CHAPTERS_DATA[lang] || CHAPTERS_DATA.el) : [];

  const messages = { primary: '', secondary: '', actions: [] };

  // ─── MOOD-AWARE RESPONSES ───
  if (mood >= 0 && mood <= 1) {
    // User feels bad → suggest breath, not reading
    messages.primary = lang === 'el'
      ? 'Βλέπω ότι δεν νιώθεις και τόσο καλά σήμερα. Δεν χρειάζεται να κάνεις τίποτα.'
      : 'I see today isn\'t easy. You don\'t need to do anything.';
    messages.secondary = lang === 'el'
      ? 'Αν θέλεις, μια ήρεμη αναπνοή μπορεί να βοηθήσει.'
      : 'If you want, a calm breath might help.';
    messages.actions = [
      { label: lang === 'el' ? '🫁 Αναπνοή' : '🫁 Breathe', action: "showScreen('breath')" },
    ];
    return messages;
  }

  // ─── RETURNING AFTER ABSENCE ───
  if (daysSince >= 2) {
    messages.primary = lang === 'el'
      ? 'Καλώς ήρθες πίσω. Ξέρω από πού συνεχίζεις.'
      : 'Welcome back. I know where you left off.';

    if (resumeChapter && chs[resumeChapter - 1]) {
      const ch = chs[resumeChapter - 1];
      const pct = Math.round(resumeScroll * 100);
      messages.secondary = lang === 'el'
        ? `Ήσουν στο «${ch.title}» (${pct}%). Θέλεις να συνεχίσεις;`
        : `You were at "${ch.title}" (${pct}%). Want to continue?`;
      messages.actions = [
        { label: `${ch.icon} ${lang === 'el' ? 'Συνέχισε' : 'Continue'}`, action: `openChapter(${resumeChapter})` },
      ];
    } else if (nextChapter && chs[nextChapter - 1]) {
      const ch = chs[nextChapter - 1];
      messages.secondary = lang === 'el'
        ? `Το επόμενο βήμα σου είναι «${ch.title}».`
        : `Your next step is "${ch.title}".`;
      messages.actions = [
        { label: `${ch.icon} ${lang === 'el' ? 'Πάμε' : 'Let\'s go'}`, action: `openChapter(${nextChapter})` },
      ];
    }
    return messages;
  }

  // ─── HAS AN INCOMPLETE CHAPTER ───
  if (resumeChapter && chs[resumeChapter - 1]) {
    const ch = chs[resumeChapter - 1];
    const pct = Math.round(resumeScroll * 100);
    messages.primary = lang === 'el'
      ? `Μένεις στο «${ch.title}» — ${pct}% διαβασμένο.`
      : `You're at "${ch.title}" — ${pct}% read.`;
    messages.secondary = lang === 'el'
      ? 'Θέλεις να συνεχίσεις απ\' όπου σταμάτησες;'
      : 'Want to continue where you stopped?';
    messages.actions = [
      { label: `${ch.icon} ${lang === 'el' ? 'Συνέχισε' : 'Continue'}`, action: `openChapter(${resumeChapter})` },
    ];
    return messages;
  }

  // ─── ALL CHAPTERS DONE ───
  if (chaptersCompleted >= totalChapters) {
    messages.primary = lang === 'el'
      ? 'Έχεις ολοκληρώσει όλα τα κεφάλαια! 🎉'
      : 'You\'ve completed all chapters! 🎉';
    messages.secondary = lang === 'el'
      ? 'Η πρακτική δεν σταματά εδώ. Δοκίμασε μια μικρή δόση.'
      : 'The practice doesn\'t end here. Try a micro dose.';
    messages.actions = [
      { label: lang === 'el' ? '✦ Μικρή δόση' : '✦ Micro dose', action: "microCat='all';microIdx=0;showScreen('micro')" },
      { label: lang === 'el' ? '🫁 Αναπνοή' : '🫁 Breathe', action: "showScreen('breath')" },
    ];
    return messages;
  }

  // ─── SUGGEST NEXT CHAPTER ───
  if (nextChapter && chs[nextChapter - 1]) {
    const ch = chs[nextChapter - 1];
    messages.primary = lang === 'el'
      ? `Το επόμενο βήμα: «${ch.title}»`
      : `Next step: "${ch.title}"`;
    messages.secondary = lang === 'el'
      ? `${ch.sub} — ${chaptersCompleted}/${totalChapters} ολοκληρωμένα`
      : `${ch.sub} — ${chaptersCompleted}/${totalChapters} completed`;
    messages.actions = [
      { label: `${ch.icon} ${lang === 'el' ? 'Ξεκίνα' : 'Start'}`, action: `openChapter(${nextChapter})` },
    ];
    return messages;
  }

  // ─── DEFAULT ───
  messages.primary = lang === 'el' ? 'Γεια σου! Πώς θέλεις να ξεκινήσεις;' : 'Hi! How would you like to start?';
  messages.secondary = '';
  messages.actions = [
    { label: lang === 'el' ? '📖 Κεφάλαια' : '📖 Chapters', action: "showScreen('chapters')" },
    { label: lang === 'el' ? '🫁 Αναπνοή' : '🫁 Breathe', action: "showScreen('breath')" },
  ];
  return messages;
}

// ═══ PROGRESS SUMMARY ═══
function getProgressSummary() {
  const lang = typeof LANG !== 'undefined' ? LANG : 'el';
  const data = companionData;
  const totalChapters = 10;
  const chaptersCompleted = Object.values(data.chapterProgress).filter(c => c.completed).length;
  const totalTime = Object.values(data.chapterProgress).reduce((s, c) => s + (c.timeSpent || 0), 0);
  const sessionsCount = data.visits.length;
  const exerciseCount = (typeof stats !== 'undefined' && stats.explored) ? stats.explored.length : 0;

  const mins = Math.round(totalTime / 60);
  
  return {
    chaptersCompleted,
    totalChapters,
    totalMinutes: mins,
    sessions: sessionsCount,
    exercises: exerciseCount,
    pct: Math.round((chaptersCompleted / totalChapters) * 100)
  };
}

// ═══ BUBBLE UI ═══
function toggleCompanionBubble() {
  if (companionVisible) {
    hideCompanionBubble();
  } else {
    showCompanionBubble();
  }
}

function showCompanionBubble() {
  const bubble = document.getElementById('companion-bubble');
  const inner = document.getElementById('companion-bubble-inner');
  if (!bubble || !inner) return;

  const msg = getCompanionMessage();
  const progress = getProgressSummary();
  const lang = typeof LANG !== 'undefined' ? LANG : 'el';

  // Build progress bar
  const progressBar = `
    <div class="comp-progress">
      <div class="comp-progress-bar">
        <div class="comp-progress-fill" style="width:${progress.pct}%"></div>
      </div>
      <div class="comp-progress-label">
        ${progress.chaptersCompleted}/${progress.totalChapters} ${lang === 'el' ? 'κεφάλαια' : 'chapters'}
        ${progress.totalMinutes > 0 ? ` · ${progress.totalMinutes} ${lang === 'el' ? 'λεπτά' : 'min'}` : ''}
        ${progress.exercises > 0 ? ` · ${progress.exercises} ${lang === 'el' ? 'ασκήσεις' : 'exercises'}` : ''}
      </div>
    </div>`;

  // Build actions
  const actionsHtml = msg.actions.map(a =>
    `<button class="comp-action" onclick="hideCompanionBubble();${a.action}">${a.label}</button>`
  ).join('');

  inner.innerHTML = `
    <div class="comp-header">
      <div class="comp-icon">${infinitySVG(28)}</div>
      <button class="comp-close" onclick="hideCompanionBubble()" aria-label="Close">✕</button>
    </div>
    <div class="comp-body">
      <p class="comp-primary">${msg.primary}</p>
      ${msg.secondary ? `<p class="comp-secondary">${msg.secondary}</p>` : ''}
    </div>
    ${actionsHtml ? `<div class="comp-actions">${actionsHtml}</div>` : ''}
    ${progressBar}
    <div class="comp-footer">
      <button class="comp-footer-btn" onclick="showCompanionSettings()">⚙ ${lang === 'el' ? 'Ρυθμίσεις' : 'Settings'}</button>
    </div>`;

  bubble.classList.add('visible');
  companionVisible = true;
  companionData.bubbleCount++;
  saveCompanionData(companionData);
}

function hideCompanionBubble() {
  const bubble = document.getElementById('companion-bubble');
  if (bubble) bubble.classList.remove('visible');
  companionVisible = false;
}

// ═══ GENTLE NUDGE (auto-appear) ═══
function showCompanionNudge() {
  const fab = document.getElementById('companion-fab');
  if (!fab) return;
  fab.classList.add('nudge');
  setTimeout(function() {
    fab.classList.remove('nudge');
  }, 4000);
}

// ═══ SETTINGS PANEL ═══
function showCompanionSettings() {
  const inner = document.getElementById('companion-bubble-inner');
  if (!inner) return;
  const lang = typeof LANG !== 'undefined' ? LANG : 'el';

  inner.innerHTML = `
    <div class="comp-header">
      <div class="comp-icon">${infinitySVG(28)}</div>
      <button class="comp-close" onclick="hideCompanionBubble()" aria-label="Close">✕</button>
    </div>
    <div class="comp-body">
      <p class="comp-primary">${lang === 'el' ? 'Ρυθμίσεις Βοηθού' : 'Companion Settings'}</p>
      <p class="comp-secondary">${lang === 'el' ? 'Τα δεδομένα αποθηκεύονται μόνο στη συσκευή σου.' : 'Data is stored only on your device.'}</p>
    </div>
    <div class="comp-actions" style="flex-direction:column">
      <button class="comp-action" onclick="companionExport()">📤 ${lang === 'el' ? 'Εξαγωγή δεδομένων' : 'Export data'}</button>
      <button class="comp-action" onclick="companionImportTrigger()">📥 ${lang === 'el' ? 'Εισαγωγή δεδομένων' : 'Import data'}</button>
      <button class="comp-action comp-action-danger" onclick="companionReset()">🗑 ${lang === 'el' ? 'Διαγραφή δεδομένων' : 'Delete data'}</button>
    </div>
    <div class="comp-footer">
      <button class="comp-footer-btn" onclick="showCompanionBubble()">← ${lang === 'el' ? 'Πίσω' : 'Back'}</button>
    </div>
    <input type="file" id="companion-import-file" accept=".json" style="display:none" onchange="companionImportFile(this)">`;
}

// ═══ EXPORT / IMPORT ═══
function companionExport() {
  const lang = typeof LANG !== 'undefined' ? LANG : 'el';
  const exportData = {
    companion: companionData,
    journal: null,
    stats: null,
    mood: null,
    exportDate: new Date().toISOString(),
    version: 1
  };

  // Gather all app data
  try { exportData.journal = JSON.parse(localStorage.getItem('journal_v1')); } catch {}
  try { exportData.stats = JSON.parse(localStorage.getItem('mindful_stats')); } catch {}
  try { exportData.mood = JSON.parse(localStorage.getItem('mood_today')); } catch {}
  try { exportData.chaptersRead = JSON.parse(localStorage.getItem('chaptersRead')); } catch {}
  try { exportData.breathSessions = JSON.parse(localStorage.getItem('breath_sessions')); } catch {}

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mindfulness-progress-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);

  showSaveConfirm && showSaveConfirm();
}

function companionImportTrigger() {
  document.getElementById('companion-import-file')?.click();
}

function companionImportFile(input) {
  const lang = typeof LANG !== 'undefined' ? LANG : 'el';
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.version || !data.companion) {
        alert(lang === 'el' ? 'Μη έγκυρο αρχείο.' : 'Invalid file.');
        return;
      }

      const confirmMsg = lang === 'el'
        ? 'Θέλεις να αντικαταστήσεις τα τρέχοντα δεδομένα με τα εισαγόμενα;'
        : 'Replace current data with imported data?';

      if (!confirm(confirmMsg)) return;

      // Restore all data
      if (data.companion) {
        companionData = data.companion;
        saveCompanionData(companionData);
      }
      if (data.journal) localStorage.setItem('journal_v1', JSON.stringify(data.journal));
      if (data.stats) {
        localStorage.setItem('mindful_stats', JSON.stringify(data.stats));
        if (typeof loadStats === 'function') stats = loadStats();
      }
      if (data.mood) localStorage.setItem('mood_today', JSON.stringify(data.mood));
      if (data.chaptersRead) localStorage.setItem('chaptersRead', JSON.stringify(data.chaptersRead));
      if (data.breathSessions) localStorage.setItem('breath_sessions', JSON.stringify(data.breathSessions));

      showSaveConfirm && showSaveConfirm();
      showCompanionBubble(); // refresh
    } catch (err) {
      alert(lang === 'el' ? 'Σφάλμα κατά την εισαγωγή.' : 'Import error.');
    }
  };
  reader.readAsText(file);
}

function companionReset() {
  const lang = typeof LANG !== 'undefined' ? LANG : 'el';
  const msg = lang === 'el'
    ? 'Θέλεις σίγουρα να διαγράψεις όλα τα δεδομένα του βοηθού; (Δεν επηρεάζει το ημερολόγιο ή τα στατιστικά σου)'
    : 'Delete all companion data? (Does not affect your journal or stats)';
  if (confirm(msg)) {
    companionData = defaultCompanionData();
    saveCompanionData(companionData);
    showCompanionBubble();
  }
}

// ═══ INIT ON DOM READY ═══
document.addEventListener('DOMContentLoaded', function() {
  // Small delay to let other scripts init first
  setTimeout(initCompanion, 500);
});
