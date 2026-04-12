/* ═══ js/coach.js (OPTIMIZED) ═══
   Smart Digital Coach - Performance optimized
   - Lazy loading
   - Light initialization
   - No blocking
   ═══════════════════════════════════════════════════════════════ */

class SmartCoach {
  constructor() {
    this.state = this.loadState();
    this.currentSession = {
      startTime: Date.now(),
      actions: [],
      screens: []
    };
    this.initialized = false;
  }

  loadState() {
    try {
      return JSON.parse(localStorage.getItem('coach_state')) || {
        isFirstTime: true,
        sessions: [],
        lastSession: null,
        journeyPath: [],
        binaural_preference: null,
        guide_position: { bottom: '90px', right: '12px' }
      };
    } catch {
      return {
        isFirstTime: true,
        sessions: [],
        lastSession: null,
        journeyPath: [],
        binaural_preference: null,
        guide_position: { bottom: '90px', right: '12px' }
      };
    }
  }

  saveState() {
    localStorage.setItem('coach_state', JSON.stringify(this.state));
  }

  // ═══ MESSAGE GENERATION (Lightweight) ═══
  getMessage() {
    const isGreek = typeof LANG !== 'undefined' ? LANG === 'el' : true;

    if (this.state.isFirstTime) {
      return this.getFirstTimeMessage(isGreek);
    }

    if (this.currentSession.actions.length === 0) {
      return this.getReturnMessage(isGreek);
    }

    return this.getEncouragingMessage(isGreek);
  }

  getFirstTimeMessage(isGreek) {
    return {
      title: isGreek ? '👋 Καλώς ήρθατε!' : '👋 Welcome!',
      message: isGreek 
        ? `Πάρετε τον χρόνο που θέλετε. 💚

🫁 Αναπνοή - Όσο θέλετε
   (Tip: Ακουστικά + binaural beats 🎧)

📖 Διάβασμα - Κ1
   (Χαλαρά)`
        : `Take your time. 💚

🫁 Breathing - As long as you want
   (Tip: Headphones + binaural 🎧)

📖 Reading - Ch1
   (At your pace)`,

      buttons: [
        { label: isGreek ? '🫁 Αναπνοή' : '🫁 Breathing', action: 'breath', icon: '🫁' },
        { label: isGreek ? '📖 Κ1' : '📖 Ch1', action: 'chapter-1', icon: '📖' }
      ]
    };
  }

  getReturnMessage(isGreek) {
    const lastSession = this.state.lastSession;
    if (!lastSession) {
      return this.getEncouragingMessage(isGreek);
    }

    const actions = lastSession.actions || [];
    const didBreath = actions.includes('breath');
    const didRead = actions.some(a => typeof a === 'string' && a.includes('chapter'));

    if (didBreath && !didRead) {
      return {
        title: isGreek ? '👋 Καλώς!' : '👋 Hello!',
        message: isGreek ? 'Χθες: Αναπνοή ✓\n\nΤι θέλετε;' : 'Yesterday: Breathing ✓\n\nWhat now?',
        buttons: [
          { label: isGreek ? '📖 Κ1' : '📖 Ch1', action: 'chapter-1', icon: '📖' },
          { label: isGreek ? '🫁 Πάλι' : '🫁 Again', action: 'breath', icon: '🫁' }
        ]
      };
    }

    if (didRead) {
      return {
        title: isGreek ? '👋 Καλώς!' : '👋 Hello!',
        message: isGreek ? 'Χθες: Κεφάλαια ✓\n\nΣυνέχισε ή ξανάδιάβασε;' : 'Yesterday: Chapters ✓\n\nContinue or review?',
        buttons: [
          { label: isGreek ? '📖 Κ2' : '📖 Ch2', action: 'chapter-2', icon: '📖' },
          { label: isGreek ? '🫁 Αναπνοή' : '🫁 Breathing', action: 'breath', icon: '🫁' }
        ]
      };
    }

    return this.getEncouragingMessage(isGreek);
  }

  getEncouragingMessage(isGreek) {
    const msgs = isGreek 
      ? ['Πάρε τον χρόνο σου 💚', 'Συνέχισε 🌱', 'Καλή δουλειά ✨']
      : ['Take your time 💚', 'Keep going 🌱', 'Great work ✨'];
    
    const msg = msgs[Math.floor(Math.random() * msgs.length)];

    return {
      title: msg,
      message: isGreek ? '🫁 ή 📖;' : '🫁 or 📖?',
      buttons: [
        { label: isGreek ? '🫁 Αναπνοή' : '🫁 Breath', action: 'breath', icon: '🫁' },
        { label: isGreek ? '📖 Διάβασμα' : '📖 Read', action: 'chapter-1', icon: '📖' }
      ]
    };
  }

  // ═══ TRACKING ═══
  trackAction(action) {
    this.currentSession.actions.push(action);
  }

  trackBinauralPreference(preference) {
    this.state.binaural_preference = preference;
    this.saveState();
  }

  saveSession() {
    if (this.currentSession.actions.length === 0) return;

    const session = {
      date: new Date().toDateString(),
      actions: this.currentSession.actions,
      duration: Date.now() - this.currentSession.startTime
    };

    this.state.sessions.push(session);
    this.state.lastSession = session;
    this.state.journeyPath.push(...this.currentSession.actions);
    this.state.isFirstTime = false;
    this.saveState();
  }

  // ═══ POSITION ═══
  savePosition(left, top) {
    this.state.guide_position = { left, top };
    this.saveState();
  }

  getPosition() {
    return this.state.guide_position || { bottom: '90px', right: '12px' };
  }
}

// ═══ GLOBAL INSTANCE ═══
let coach = null;

function initCoach() {
  coach = new SmartCoach();
  
  // Lazy init - after page ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoachUI);
  } else {
    setTimeout(initCoachUI, 100);
  }

  // Hook into showScreen
  const originalShowScreen = window.showScreen;
  if (originalShowScreen) {
    window.showScreen = function(id) {
      if (coach) coach.trackAction(id);
      const result = originalShowScreen.call(this, id);
      showCoachMessage();
      return result;
    };
  }

  // Save on exit
  window.addEventListener('beforeunload', () => {
    if (coach) coach.saveSession();
  });
}

function initCoachUI() {
  if (!coach || coach.initialized) return;
  coach.initialized = true;

  setupCoachDragging();
  setupCoachPanel();
  showCoachMessage();

  // Auto-show first time
  const panel = document.getElementById('guide-panel');
  const guide = document.getElementById('infinity-guide');
  
  if (coach.state.isFirstTime && panel && guide) {
    setTimeout(() => {
      guide.style.display = 'flex';
      panel.style.display = 'block';
    }, 800);
  } else if (guide) {
    guide.style.display = 'flex';
  }
}

function setupCoachPanel() {
  const panel = document.getElementById('guide-panel');
  if (!panel) return;

  panel.addEventListener('click', (e) => {
    if (e.target.closest('.coach-btn')) return;
    if (e.target.textContent === '×') toggleGuidePanel();
  });
}

function showCoachMessage() {
  if (!coach) return;

  const coachMsg = coach.getMessage();
  const content = document.getElementById('guide-content');
  
  if (!content) return;

  let buttonsHTML = coachMsg.buttons.map(btn => `
    <button class="coach-btn" onclick="executeCoachAction('${btn.action}')" style="width: 100%; padding: 10px; margin-bottom: 6px; border-radius: 8px; background: var(--teal); color: white; border: none; cursor: pointer; font-weight: 700; font-family: inherit; font-size: 13px;">
      ${btn.icon} ${btn.label}
    </button>
  `).join('');

  content.innerHTML = `
    <h3 style="margin: 0 0 8px; font-size: 14px; color: var(--text); font-weight: 700;">${coachMsg.title}</h3>
    <p style="font-size: 12px; color: var(--text-soft); line-height: 1.5; white-space: pre-wrap; margin-bottom: 12px;">${coachMsg.message}</p>
    <div>${buttonsHTML}</div>
  `;
}

function executeCoachAction(action) {
  if (!coach) return;
  coach.trackAction(action);

  if (action === 'breath') {
    showScreen('breath');
  } else if (action === 'breath-audio') {
    coach.trackBinauralPreference('with-audio');
    showScreen('breath');
  } else if (action === 'breath-silent') {
    coach.trackBinauralPreference('silent');
    showScreen('breath');
  } else if (action.includes('chapter')) {
    showScreen(action);
  } else {
    showScreen('home');
  }

  showCoachMessage();
}

// ═══ DRAGGING (Optimized) ═══
function setupCoachDragging() {
  const guide = document.getElementById('infinity-guide');
  if (!guide) return;

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let startX = 0;
  let startY = 0;

  const startDrag = (clientX, clientY) => {
    isDragging = true;
    const rect = guide.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    startX = clientX;
    startY = clientY;
    guide.style.cursor = 'grabbing';
    guide.style.transition = 'none';
  };

  const moveDrag = (clientX, clientY) => {
    if (!isDragging) return;

    const x = clientX - offsetX;
    const y = clientY - offsetY;

    const maxX = window.innerWidth - guide.offsetWidth - 10;
    const maxY = window.innerHeight - guide.offsetHeight - 100;

    const finalX = Math.max(10, Math.min(x, maxX));
    const finalY = Math.max(10, Math.min(y, maxY));

    guide.style.position = 'fixed';
    guide.style.left = finalX + 'px';
    guide.style.top = finalY + 'px';
    guide.style.bottom = 'auto';
    guide.style.right = 'auto';
  };

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    guide.style.cursor = 'grab';
    guide.style.transition = 'all 0.3s ease';

    if (coach) {
      coach.savePosition(guide.style.left, guide.style.top);
    }
  };

  // Mouse
  guide.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
  document.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
  document.addEventListener('mouseup', endDrag);

  // Touch
  guide.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  });

  document.addEventListener('touchmove', (e) => {
    if (isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      moveDrag(touch.clientX, touch.clientY);
    }
  }, { passive: false });

  document.addEventListener('touchend', endDrag);

  // Restore position
  setTimeout(() => {
    const pos = coach?.getPosition();
    if (pos?.left) {
      guide.style.left = pos.left;
      guide.style.bottom = 'auto';
      guide.style.right = 'auto';
    }
    if (pos?.top) {
      guide.style.top = pos.top;
      guide.style.bottom = 'auto';
    }
  }, 500);
}

function toggleGuidePanel() {
  const panel = document.getElementById('guide-panel');
  if (!panel) return;
  
  if (panel.style.display === 'none' || !panel.style.display) {
    panel.style.display = 'block';
  } else {
    panel.style.display = 'none';
  }
}

// ═══ AUTO-INIT (Lightweight) ═══
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCoach);
} else {
  initCoach();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SmartCoach, initCoach };
}
