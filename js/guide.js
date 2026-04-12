/* ═══ js/guide.js ═══
   Guide System for mindfulness PWA
   - First-time: gentle step-by-step onboarding
   - Return visits: remembers progress, suggests continuation
   - Contextual nudges: soft recommendations without pressure
   - Infinity Helper (∞): friendly assistant for guidance
   - Tone: kind, encouraging, no judgment
   ═══════════════════════════════════════════════════════════════ */

// ═══ GUIDE STATE ═══
class GuideSystem {
  constructor() {
    this.state = this.loadState();
    this.currentStep = null;
    this.dismissedNudges = new Set(JSON.parse(localStorage.getItem('guide_dismissed_nudges') || '[]'));
  }

  loadState() {
    try {
      return JSON.parse(localStorage.getItem('guide_state')) || {
        isFirstTime: true,
        completedSteps: [],
        currentJourney: null,
        lastVisitDate: new Date().toDateString(),
        totalVisits: 0,
        lastScreen: 'home',
        guidePath: null
      };
    } catch {
      return {
        isFirstTime: true,
        completedSteps: [],
        currentJourney: null,
        lastVisitDate: new Date().toDateString(),
        totalVisits: 0,
        lastScreen: 'home',
        guidePath: null
      };
    }
  }

  saveState() {
    localStorage.setItem('guide_state', JSON.stringify(this.state));
  }

  markStepComplete(step) {
    if (!this.state.completedSteps.includes(step)) {
      this.state.completedSteps.push(step);
    }
    this.saveState();
  }

  dismissNudge(nudgeId) {
    this.dismissedNudges.add(nudgeId);
    localStorage.setItem('guide_dismissed_nudges', JSON.stringify([...this.dismissedNudges]));
  }

  isNudgeDismissed(nudgeId) {
    return this.dismissedNudges.has(nudgeId);
  }
}

let guide = null;

// ═══ INITIALIZATION ═══
function initGuide() {
  guide = new GuideSystem();
  
  document.addEventListener('DOMContentLoaded', () => {
    // Increment visit counter
    guide.state.totalVisits++;
    const today = new Date().toDateString();
    if (guide.state.lastVisitDate !== today) {
      guide.state.lastVisitDate = today;
    }
    guide.saveState();

    // Show appropriate guide for first time
    if (guide.state.isFirstTime && !localStorage.getItem('welcomed')) {
      setTimeout(showFirstTimeGuide, 500);
    } else if (guide.state.guidePath) {
      // Show gentle continuation nudge
      setTimeout(showContinuationNudge, 800);
    }

    // Show infinity guide for returning users
    setTimeout(showInfinityGuide, 1200);

    // Setup exit guide
    setupExitGuide();
  });
}

// ═══ FIRST TIME GUIDE ═══
function showFirstTimeGuide() {
  const overlay = document.createElement('div');
  overlay.id = 'guide-first-time';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    z-index: 999;
    animation: slideIn 0.4s ease-out;
  `;

  const isGreek = LANG === 'el';

  const content = `
    <div style="
      background: white;
      border-radius: 20px 20px 0 0;
      padding: 28px 20px 40px;
      max-height: 80vh;
      overflow-y: auto;
      width: 100%;
      animation: slideUp 0.5s ease-out;
    ">
      <button onclick="document.getElementById('guide-first-time')?.remove()" style="
        position: absolute;
        top: 12px;
        right: 12px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--text-hint);
        padding: 4px;
      ">×</button>

      <div style="text-align: center; margin-bottom: 24px;">
        <div style="
          font-size: 48px;
          margin-bottom: 12px;
          animation: bounce 0.6s ease-out;
        ">∞</div>
        <h2 style="
          font-size: 24px;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 8px;
        ">${isGreek ? 'Καλώς ήρθατε' : 'Welcome'}</h2>
        <p style="
          font-size: 14px;
          color: var(--text-soft);
          margin: 0;
          line-height: 1.6;
        ">${isGreek 
          ? 'Είμαι η ∞ — ο σύμβολο του ατέρμονου ταξιδιού'
          : 'I\'m ∞ — the symbol of your endless journey'}</p>
      </div>

      <div style="
        background: rgba(42, 93, 94, 0.05);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 24px;
      ">
        <p style="
          font-size: 14px;
          color: var(--text);
          line-height: 1.8;
          margin: 0;
        ">${isGreek
          ? 'Αυτή η εφαρμογή δεν είναι αυστηρή. Δεν υπάρχουν σωστές απαντήσεις. Απλώς δοκιμάστε, αν κάτι δεν σας ταιριάζει, δοκιμάστε κάτι άλλο. Το σώμα σας γνωρίζει το δρόμο. Και η ∞ θα είναι εδώ για να σας συμβουλέψει.'
          : 'This app is not strict. There are no right answers. Just try something. If it doesn\'t fit, try something else. Your body knows the way. And ∞ will be here to guide you.'}</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button onclick="guideStep('breath')" style="
          background: var(--teal);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        ">🫁 ${isGreek ? 'Ας ξεκινήσουμε με αναπνοή' : 'Let\'s start with breath'}</button>

        <button onclick="guideStep('chapter')" style="
          background: white;
          color: var(--text);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        ">📖 ${isGreek ? 'Μάθετε τη θεωρία πρώτα' : 'Learn the theory first'}</button>

        <button onclick="guideStep('explore')" style="
          background: white;
          color: var(--text);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        ">🔍 ${isGreek ? 'Ελεύθερη εξερεύνηση' : 'Free exploration'}</button>
      </div>

      <p style="
        font-size: 11px;
        color: var(--text-hint);
        text-align: center;
        margin-top: 16px;
        line-height: 1.6;
      ">${isGreek
        ? '💡 Συμβουλή: Ξεκινήστε μικρά. Λίγα λεπτά είναι αρκετά.'
        : '💡 Tip: Start small. A few minutes is enough.'}</p>
    </div>

    <style>
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.15); }
      }
    </style>
  `;

  overlay.innerHTML = content;
  document.body.appendChild(overlay);
  guide.state.isFirstTime = false;
  guide.saveState();
}

function guideStep(path) {
  document.getElementById('guide-first-time')?.remove();
  guide.state.guidePath = path;
  guide.saveState();

  const isGreek = LANG === 'el';

  if (path === 'breath') {
    showScreen('breath');
    guide.markStepComplete('breath');
    showInfinityMessage(
      isGreek ? '💨 Αφήστε τα άλλα απλώς για λίγο. Γνώρισε τη δική σου αναπνοή.' 
              : '💨 Let everything else fade for a moment. Know your own breath.',
      'breath_start'
    );
  } else if (path === 'chapter') {
    showScreen('chapters');
    guide.markStepComplete('chapter_start');
  } else if (path === 'explore') {
    showScreen('home');
  }
}

// ═══ CONTINUATION NUDGE ═══
function showContinuationNudge() {
  if (!guide.state.guidePath) return;

  const isGreek = LANG === 'el';
  const path = guide.state.guidePath;
  
  let message, icon, action;

  if (path === 'breath') {
    message = isGreek 
      ? 'Επιστρέφετε για αναπνοή; Υπέροχα. Διαλέξτε τι πρέπει σήμερα.'
      : 'Back for breath? Beautiful. Pick what you need today.';
    icon = '🫁';
    action = () => { showScreen('breath'); guide.state.guidePath = null; guide.saveState(); };
  } else if (path === 'practice') {
    message = isGreek
      ? 'Ας δοκιμάσουμε μια νέα άσκηση; ή ξανά ένα αγαπημένο;'
      : 'Try a new practice? Or revisit a favorite?';
    icon = '🎯';
    action = () => { showScreen('practice'); guide.state.guidePath = null; guide.saveState(); };
  }

  if (message) {
    showGentleNudge('continuation', message, action);
  }
}

// ═══ INFINITY GUIDE ═══
function showInfinityGuide() {
  const guide_el = document.getElementById('infinity-guide');
  if (!guide_el) return;
  
  const stats = JSON.parse(localStorage.getItem('mindful_stats') || '{}');
  
  // Show if returning user
  if ((stats.sessions || 0) > 0) {
    guide_el.style.display = 'flex';
    
    // Update guide panel with context
    updateInfinityMessage();
  }
}

function showInfinityMessage(message, context) {
  const panel = document.getElementById('guide-panel');
  if (!panel) return;
  
  const content = document.getElementById('guide-content');
  if (content) {
    content.innerHTML = `<p style="font-size:12px;color:var(--text-soft);line-height:1.6;margin:0">${message}</p>`;
  }
  
  // Show panel
  const guide_el = document.getElementById('infinity-guide');
  if (guide_el) {
    guide_el.style.display = 'flex';
    panel.style.display = 'block';
  }
}

function updateInfinityMessage() {
  const isGreek = LANG === 'el';
  const stats = JSON.parse(localStorage.getItem('mindful_stats') || '{}');
  const sessions = stats.sessions || 0;
  const practiced = (stats.explored || []).length;
  const chapters = JSON.parse(localStorage.getItem('chaptersRead') || '[]').length;
  
  let message = '';
  
  if (sessions === 0) {
    message = isGreek 
      ? '👋 Καλώς ήρθατε! Ξεκινήστε με μια αναπνοή ή διαβάστε κεφάλαια.'
      : '👋 Welcome! Start with a breath or read chapters.';
  } else if (sessions < 3) {
    message = isGreek
      ? '🌱 Τέλειο ξεκίνημα. Συνεχίστε με αυτό το ρυθμό.'
      : '🌱 Perfect start. Keep going at your own pace.';
  } else if (sessions < 10 && practiced === 0) {
    message = isGreek
      ? '🎯 Έχετε κάνει καλή δουλειά με την αναπνοή. Ας δοκιμάσετε τώρα μια άσκηση;'
      : '🎯 Great work with breath. Ready to try a practice?';
  } else if (sessions >= 21) {
    message = isGreek
      ? '🌲 Είκοσι μία φορές! Αυτό είναι όλο εσάς, όχι συνήθεια.'
      : '🌲 Twenty-one sessions! This is you now.';
  } else {
    message = isGreek
      ? '∞ Το ταξίδι συνεχίζεται. Τι χρειάζεστε σήμερα;'
      : '∞ The journey continues. What do you need today?';
  }
  
  const content = document.getElementById('guide-content');
  if (content) {
    content.innerHTML = `<p style="font-size:12px;color:var(--text-soft);line-height:1.6;margin:0">${message}</p>`;
  }
}

// ═══ GENTLE NUDGE DISPLAY ═══
function showGentleNudge(nudgeId, message, action) {
  if (guide.isNudgeDismissed(nudgeId)) return;

  const isGreek = LANG === 'el';
  const nudge = document.createElement('div');
  nudge.id = `nudge-${nudgeId}`;
  nudge.style.cssText = `
    position: fixed;
    bottom: 90px;
    left: 16px;
    right: 16px;
    background: white;
    border: 1.5px solid var(--border);
    border-radius: 14px;
    padding: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    z-index: 500;
    animation: slideUp 0.4s ease-out;
  `;

  nudge.innerHTML = `
    <div style="display: flex; gap: 12px; align-items: flex-start;">
      <div style="flex-shrink: 0; font-size: 18px; margin-top: 2px;">💡</div>
      <div style="flex: 1;">
        <p style="
          font-size: 13px;
          color: var(--text);
          margin: 0 0 8px;
          line-height: 1.5;
        ">${message}</p>
        <div style="display: flex; gap: 8px;">
          <button onclick="
            ${typeof action === 'function' ? 'action()' : `showScreen('${action}')`};
            document.getElementById('nudge-${nudgeId}')?.remove();
          " style="
            background: var(--teal);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 6px 12px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            font-family: inherit;
          ">${isGreek ? '✓ Ναι' : '✓ Yes'}</button>
          <button onclick="
            guide.dismissNudge('${nudgeId}');
            document.getElementById('nudge-${nudgeId}')?.remove();
          " style="
            background: transparent;
            color: var(--text-hint);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 6px 12px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            font-family: inherit;
          ">${isGreek ? 'Όχι τώρα' : 'Not now'}</button>
        </div>
      </div>
    </div>

    <style>
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    </style>
  `;

  let container = document.getElementById('nudge-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'nudge-container';
    document.body.appendChild(container);
  }

  container.appendChild(nudge);

  // Auto-dismiss after 8 seconds
  setTimeout(() => {
    nudge.style.animation = 'slideDown 0.3s ease-in';
    setTimeout(() => nudge.remove(), 300);
  }, 8000);
}

// ═══ EXIT GUIDE (Save Progress Reminder) ═══
function setupExitGuide() {
  window.addEventListener('beforeunload', (e) => {
    const recentActivity = localStorage.getItem('guide_last_action');
    const timeSinceAction = Date.now() - (parseInt(recentActivity) || 0);

    if (timeSinceAction < 30 * 60 * 1000) {
      const isGreek = LANG === 'el';
      const message = isGreek 
        ? 'Καλή δουλειά σήμερα. Το πρόγραμμα αποθηκεύεται αυτόματα.'
        : 'Good work today. Your progress is automatically saved.';
    }
  });

  document.addEventListener('click', () => {
    localStorage.setItem('guide_last_action', Date.now().toString());
  });
}

// ═══ SCREEN COMPLETION TRACKING ═══
function trackScreenCompletion(screenId, timeSpentSeconds) {
  guide.markStepComplete(screenId);
  
  const isGreek = LANG === 'el';

  if (screenId === 'breath' && timeSpentSeconds > 60) {
    guide.state.guidePath = 'practice';
    showInfinityMessage(
      isGreek 
        ? '✨ Πώς νιώθετε; Δοκιμάστε μια άσκηση τώρα;'
        : '✨ How do you feel? Try a practice now?',
      'practice'
    );
  } else if (screenId === 'practice') {
    guide.state.guidePath = 'journal';
    showInfinityMessage(
      isGreek
        ? '📝 Σημειώστε πώς νιώθετε στο ημερολόγιο.'
        : '📝 Note how you feel in the journal.',
      'journal'
    );
  }

  guide.saveState();
  updateInfinityMessage();
}

// ═══ EXPORT & INITIALIZATION ═══
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GuideSystem, initGuide, showGentleNudge, trackScreenCompletion };
}

// Auto-init on load
document.addEventListener('DOMContentLoaded', initGuide);
