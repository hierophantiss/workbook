/* ═══ js/guide.js ═══
   Guide System for mindfulness PWA
   - First-time: gentle step-by-step onboarding
   - Return visits: remembers progress, suggests continuation
   - Contextual nudges: soft recommendations without pressure
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
        guidePath: null // 'breath' | 'practice' | 'chapter' | 'journal'
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
        ">🌿</div>
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
          ? 'Είμαστε εδώ για να σας κάνουμε τα πράγματα εύκολα'
          : 'We're here to make this easy for you'}</p>
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
          ? 'Αυτή η εφαρμογή δεν είναι αυστηρή. Δεν υπάρχουν σωστές απαντήσεις. Απλώς δοκιμάστε, αν κάτι δεν σας ταιριάζει, δοκιμάστε κάτι άλλο. Το σώμα σας γνωρίζει το δρόμο.'
          : 'This app is not strict. There are no right answers. Just try something. If it doesn't fit, try something else. Your body knows the way.'}</p>
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
    showGentleNudge('breath_intro', 
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
  } else if (path === 'chapter') {
    message = isGreek
      ? 'Πού ήσασταν; Συνεχίστε όπου σταματήσατε.'
      : 'Where were you? Continue where you left off.';
    icon = '📖';
    action = () => { showScreen('chapters'); guide.state.guidePath = null; guide.saveState(); };
  } else if (path === 'journal') {
    message = isGreek
      ? 'Σήμερα είναι καινούριο καθάρισμα. Πώς νιώθετε;'
      : 'Today is a fresh slate. How are you feeling?';
    icon = '📔';
    action = () => { showScreen('journal'); guide.state.guidePath = null; guide.saveState(); };
  }

  showGentleNudge('continuation', message, action);
}

// ═══ CONTEXTUAL NUDGES ═══
function showNudgeAfterBreath() {
  if (guide.isNudgeDismissed('after_breath')) return;
  
  const isGreek = LANG === 'el';
  const nextStep = Math.random() > 0.5 ? 'micro' : 'journal';

  if (nextStep === 'micro') {
    showGentleNudge(
      'after_breath_micro',
      isGreek 
        ? '✨ Πώς νιώθετε; Μια γρήγορη δόση ενισχύει το αποτέλεσμα.'
        : '✨ How do you feel? A quick dose amplifies the effect.',
      () => { showScreen('micro'); guide.dismissNudge('after_breath_micro'); }
    );
  } else {
    showGentleNudge(
      'after_breath_journal',
      isGreek
        ? '📝 Σημειώστε πώς νιώθετε. Κάμερα της στιγμής.'
        : '📝 Note how you feel. A snapshot of this moment.',
      () => { showScreen('journal'); guide.dismissNudge('after_breath_journal'); }
    );
  }
}

function showNudgeAfterPractice() {
  if (guide.isNudgeDismissed('after_practice')) return;

  const isGreek = LANG === 'el';
  const practices = (stats.explored || []).length;
  const total = 20; // approximate

  if (practices < 5) {
    showGentleNudge(
      'after_practice_explore',
      isGreek
        ? '🌱 Ωραία ξεκίνημα. Υπάρχουν πολλά άλλα να δοκιμάσετε.'
        : '🌱 Nice start. There are many more to try.',
      () => { showScreen('practice'); guide.dismissNudge('after_practice_explore'); }
    );
  } else {
    showGentleNudge(
      'after_practice_favorite',
      isGreek
        ? '💫 Ποια άσκηση είναι η αγαπημένη σας; Επανάληψη = ρίζες.'
        : '💫 Which practice feels like home? Repetition = roots.',
      () => { showScreen('practice'); guide.dismissNudge('after_practice_favorite'); }
    );
  }
}

function showNudgeAfterChapter() {
  if (guide.isNudgeDismissed('after_chapter')) return;

  const isGreek = LANG === 'el';
  const chaptersRead = JSON.parse(localStorage.getItem('chaptersRead') || '[]').length;

  if (chaptersRead >= 3 && (stats.explored || []).length === 0) {
    showGentleNudge(
      'after_chapter_practice',
      isGreek
        ? '🎯 Έχετε διαβάσει αρκετά. Τώρα: δοκιμάστε. Το σώμα είναι δάσκαλος.'
        : '🎯 You've read enough. Now: try. Your body is the teacher.',
      () => { showScreen('practice'); guide.dismissNudge('after_chapter_practice'); }
    );
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

  // Find or create nudge container
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

    // Only show if user was active in past 30 mins
    if (timeSinceAction < 30 * 60 * 1000) {
      const isGreek = LANG === 'el';
      const message = isGreek 
        ? 'Καλή δουλειά σήμερα. Το πρόγραμμα αποθηκεύεται αυτόματα.'
        : 'Good work today. Your progress is automatically saved.';
      
      // Could show gentle message, but not blocking
      // (Browser may not show custom messages due to security)
    }
  });

  // Track last action
  document.addEventListener('click', () => {
    localStorage.setItem('guide_last_action', Date.now().toString());
  });
}

// ═══ SCREEN COMPLETION TRACKING ═══
function trackScreenCompletion(screenId, timeSpentSeconds) {
  guide.markStepComplete(screenId);
  
  const isGreek = LANG === 'el';

  if (screenId === 'breath' && timeSpentSeconds > 60) {
    guide.state.guidePath = 'practice'; // Suggest next step
    showNudgeAfterBreath();
  } else if (screenId === 'practice') {
    guide.state.guidePath = 'journal';
    showNudgeAfterPractice();
  } else if (screenId === 'chapter') {
    showNudgeAfterChapter();
  }

  guide.saveState();
}

// ═══ PROGRESSIVE ENCOURAGEMENT ═══
function getMilestoneMessage() {
  const isGreek = LANG === 'el';
  const sessions = stats.sessions || 0;

  if (sessions === 1) {
    return isGreek 
      ? '🌱 Ένα βήμα. Απλώς ένα βήμα.'
      : '🌱 One step. Just one step.';
  } else if (sessions === 5) {
    return isGreek
      ? '🌿 Πέντε εβδομάδες συνέπειας. Ο κόσμος έχει αλλάξει.'
      : '🌿 Five sessions of consistency. The world has shifted.';
  } else if (sessions === 10) {
    return isGreek
      ? '🌳 Δέκα φορές. Το σώμα σας ξέρει τώρα.'
      : '🌳 Ten times. Your body knows now.';
  } else if (sessions === 21) {
    return isGreek
      ? '🌲 Είκοσι μία. Αυτό δεν είναι συνήθεια — είναι η νέα σας φύση.'
      : '🌲 Twenty-one. This isn't a habit—it's your nature now.';
  }
  return null;
}

function showMilestoneIfReached() {
  const message = getMilestoneMessage();
  if (!message) return;

  showGentleNudge(
    `milestone_${stats.sessions}`,
    message,
    () => { /* Just dismiss */ }
  );
}

// ═══ EXPORT & INITIALIZATION ═══
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GuideSystem, initGuide, showGentleNudge, trackScreenCompletion };
}

// Auto-init on load
document.addEventListener('DOMContentLoaded', initGuide);
