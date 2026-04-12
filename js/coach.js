/* ═══ js/coach.js ═══
   Smart Digital Coach
   - Remembers user journey
   - No time pressure
   - Guides without interfering
   - Draggable with gradient infinity icon
   ═══════════════════════════════════════════════════════════════ */

class SmartCoach {
  constructor() {
    this.state = this.loadState();
    this.currentSession = {
      startTime: Date.now(),
      actions: [],
      screens: []
    };
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

  // ═══ MESSAGE GENERATION ═══
  getMessage() {
    const isGreek = LANG === 'el';

    if (this.state.isFirstTime) {
      return this.getFirstTimeMessage(isGreek);
    }

    if (this.currentSession.actions.length === 0) {
      return this.getReturnMessage(isGreek);
    }

    const lastAction = this.currentSession.actions[this.currentSession.actions.length - 1];
    
    if (lastAction === 'breath' && this.currentSession.actions.filter(a => a === 'breath').length === 1) {
      return this.getAfterBreathMessage(isGreek);
    }

    return this.getEncouragingMessage(isGreek);
  }

  getFirstTimeMessage(isGreek) {
    return {
      title: isGreek ? '👋 Καλώς ήρθατε!' : '👋 Welcome!',
      message: isGreek 
        ? `Πάρετε τον χρόνο που θέλετε. Καμία βιασύνη. 💚

🫁 Αναπνοή
   • Αναπνεύστε όσο θέλετε
   • Tip: Βάλτε ακουστικά για binaural beats 🎧
   • (Διαβάστε τις οδηγίες πρώτα)

📖 Διάβασμα
   • Κεφάλαιο 1 - Όσο θέλετε
   • Καμία βιασύνη`
        : `Take your time. No rush. 💚

🫁 Breathing
   • Breathe as long as you want
   • Tip: Use headphones for binaural beats 🎧
   • (Read instructions first)

📖 Reading
   • Chapter 1 - At your pace
   • No pressure`,

      buttons: [
        { 
          label: isGreek ? '🫁 Ξεκίνα Αναπνοή' : '🫁 Start Breathing',
          action: 'breath',
          icon: '🫁'
        },
        { 
          label: isGreek ? '📖 Διάβασε Κ1' : '📖 Read Ch1',
          action: 'chapter-1',
          icon: '📖'
        }
      ]
    };
  }

  getReturnMessage(isGreek) {
    const lastSession = this.state.lastSession;
    if (!lastSession) {
      return this.getEncouragingMessage(isGreek);
    }

    const daysSince = this.getDaysSince(lastSession.date);
    const actions = lastSession.actions || [];
    const didBreath = actions.includes('breath');
    const didRead = actions.some(a => a.includes('chapter'));

    if (didBreath && !didRead) {
      return {
        title: isGreek ? '👋 Καλώς πίσω!' : '👋 Welcome back!',
        message: isGreek
          ? `Χθες κάνατε αναπνοή. Τέλεια! 🌬️

Τι θέλετε σήμερα;`
          : `You did breathing yesterday. Perfect! 🌬️

What would you like today?`,
        
        buttons: [
          { label: isGreek ? '📖 Διάβασε Κ1' : '📖 Read Ch1', action: 'chapter-1', icon: '📖' },
          { label: isGreek ? '🫁 Πάλι αναπνοή' : '🫁 Breathing again', action: 'breath', icon: '🫁' }
        ]
      };
    }

    if (didRead) {
      const chapterNum = this.extractChapterNumber(actions);
      return {
        title: isGreek ? '👋 Καλώς!' : '👋 Hello!',
        message: isGreek
          ? `Χθες διάβασες το Κεφάλαιο ${chapterNum}.

Θες να το ξανάδεις, ή να συνέχισεις 
στο επόμενο;`
          : `Yesterday you read Chapter ${chapterNum}.

Want to review it or move forward?`,
        
        buttons: [
          { label: isGreek ? `↩️ Ξανάδιάβασε Κ${chapterNum}` : `↩️ Re-read Ch${chapterNum}`, action: `chapter-${chapterNum}`, icon: '↩️' },
          { label: isGreek ? `➜ Κεφάλαιο ${chapterNum + 1}` : `➜ Chapter ${chapterNum + 1}`, action: `chapter-${chapterNum + 1}`, icon: '➜' }
        ]
      };
    }

    return this.getEncouragingMessage(isGreek);
  }

  getAfterBreathMessage(isGreek) {
    return {
      title: isGreek ? '💡 Συμβουλή' : '💡 Tip',
      message: isGreek
        ? `Πρώτη φορά με ακουστικά;

Βάλτε τα και ακούστε τα 
binaural beats. Ωραία έμπειρία! 🎧

(Θα δείτε τις οδηγίες 
 όταν ξεκινάει ο ήχος)`
        : `First time with headphones?

Put them on and listen to the 
binaural beats. Great experience! 🎧

(You'll see instructions 
 when sound starts)`,
      
      buttons: [
        { label: isGreek ? '🎧 Με ακουστικά' : '🎧 With headphones', action: 'breath-audio', icon: '🎧' },
        { label: isGreek ? '📖 Διάβασε τώρα' : '📖 Read now', action: 'chapter-1', icon: '📖' }
      ]
    };
  }

  getEncouragingMessage(isGreek) {
    const messages = isGreek ? [
      'Πάρετε τον χρόνο σας. 💚',
      'Κάνετε καλή δουλειά! 🌱',
      'Συνεχίστε έτσι. 🌿',
      'Δεν υπάρχει βιασύνη. 💫',
      'Το σώμα σας ξέρει. ✨'
    ] : [
      'Take your time. 💚',
      'You\'re doing great! 🌱',
      'Keep going. 🌿',
      'No rush. 💫',
      'Your body knows. ✨'
    ];

    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    return {
      title: randomMsg,
      message: isGreek 
        ? '🫁 Αναπνοή ή 📖 Διάβασμα;'
        : '🫁 Breathing or 📖 Reading?',
      
      buttons: [
        { label: isGreek ? '🫁 Αναπνοή' : '🫁 Breathing', action: 'breath', icon: '🫁' },
        { label: isGreek ? '📖 Διάβασμα' : '📖 Reading', action: 'chapter-1', icon: '📖' }
      ]
    };
  }

  // ═══ HELPERS ═══
  getDaysSince(date) {
    const lastDate = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  extractChapterNumber(actions) {
    for (let action of actions) {
      if (action.includes('chapter-')) {
        const num = action.split('-')[1];
        return parseInt(num) || 1;
      }
    }
    return 1;
  }

  // ═══ TRACKING ═══
  trackAction(action) {
    this.currentSession.actions.push(action);
    
    // Also track screen changes
    if (action.includes('chapter') || action.includes('breath')) {
      this.currentSession.screens.push(action);
    }
  }

  trackBinauralPreference(preference) {
    this.state.binaural_preference = preference; // 'with-audio' or 'silent'
    this.saveState();
  }

  saveSession() {
    const session = {
      date: new Date().toDateString(),
      actions: this.currentSession.actions,
      screens: this.currentSession.screens,
      duration: Date.now() - this.currentSession.startTime
    };

    this.state.sessions.push(session);
    this.state.lastSession = session;
    this.state.journeyPath.push(...this.currentSession.actions);
    this.state.isFirstTime = false;
    this.saveState();
  }

  // ═══ POSITION MANAGEMENT ═══
  savePosition(left, top) {
    this.state.guide_position = { left, top };
    localStorage.setItem('coach_position', JSON.stringify(this.state.guide_position));
    this.saveState();
  }

  getPosition() {
    return this.state.guide_position || { bottom: '90px', right: '12px' };
  }
}

// ═══ GLOBAL COACH INSTANCE ═══
let coach = null;

function initCoach() {
  coach = new SmartCoach();
  
  document.addEventListener('DOMContentLoaded', () => {
    setupCoachUI();
    setupCoachDragging();
    showCoachMessage();
  });

  // Track screen changes
  const originalShowScreen = window.showScreen;
  window.showScreen = function(id) {
    if (coach) {
      coach.trackAction(id);
    }
    originalShowScreen.call(this, id);
    showCoachMessage();
  };

  // Save session on exit
  window.addEventListener('beforeunload', () => {
    if (coach && coach.currentSession.actions.length > 0) {
      coach.saveSession();
    }
  });

  // Save periodically
  setInterval(() => {
    if (coach && coach.currentSession.actions.length > 0) {
      coach.saveSession();
      coach.currentSession = {
        startTime: Date.now(),
        actions: [],
        screens: []
      };
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

function setupCoachUI() {
  const coachMsg = coach.getMessage();
  const panel = document.getElementById('guide-panel');
  
  if (!panel) return;

  let buttonsHTML = coachMsg.buttons.map(btn => `
    <button onclick="executeCoachAction('${btn.action}')" 
            class="coach-btn" 
            style="width: 100%; padding: 12px; margin-bottom: 8px; border-radius: 10px; background: var(--teal); color: white; border: none; cursor: pointer; font-weight: 700; font-family: inherit;">
      ${btn.icon} ${btn.label}
    </button>
  `).join('');

  const content = document.getElementById('guide-content');
  if (content) {
    content.innerHTML = `
      <h3 style="margin: 0 0 12px; font-size: 16px; color: var(--text);">${coachMsg.title}</h3>
      <p style="font-size: 13px; color: var(--text-soft); line-height: 1.6; white-space: pre-wrap; margin-bottom: 16px;">${coachMsg.message}</p>
      <div>${buttonsHTML}</div>
    `;
  }
}

function showCoachMessage() {
  setupCoachUI();
}

function executeCoachAction(action) {
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

  setupCoachUI();
}

// ═══ DRAGGABLE SETUP ═══
function setupCoachDragging() {
  const guide = document.getElementById('infinity-guide');
  if (!guide) return;

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  guide.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = guide.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    guide.style.cursor = 'grabbing';
    guide.style.transition = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;

    // Keep within screen
    const maxX = window.innerWidth - guide.offsetWidth - 10;
    const maxY = window.innerHeight - guide.offsetHeight - 100; // Above nav

    const finalX = Math.max(10, Math.min(x, maxX));
    const finalY = Math.max(10, Math.min(y, maxY));

    guide.style.position = 'fixed';
    guide.style.left = finalX + 'px';
    guide.style.top = finalY + 'px';
    guide.style.bottom = 'auto';
    guide.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    guide.style.cursor = 'grab';
    guide.style.transition = 'all 0.3s ease';

    // Save position
    if (coach) {
      coach.savePosition(guide.style.left, guide.style.top);
    }
  });

  // Touch support
  guide.addEventListener('touchstart', (e) => {
    isDragging = true;
    const rect = guide.getBoundingClientRect();
    const touch = e.touches[0];
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;
    guide.style.transition = 'none';
  });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const x = touch.clientX - offsetX;
    const y = touch.clientY - offsetY;

    const maxX = window.innerWidth - guide.offsetWidth - 10;
    const maxY = window.innerHeight - guide.offsetHeight - 100;

    const finalX = Math.max(10, Math.min(x, maxX));
    const finalY = Math.max(10, Math.min(y, maxY));

    guide.style.position = 'fixed';
    guide.style.left = finalX + 'px';
    guide.style.top = finalY + 'px';
    guide.style.bottom = 'auto';
    guide.style.right = 'auto';
  }, { passive: false });

  document.addEventListener('touchend', () => {
    isDragging = false;
    guide.style.transition = 'all 0.3s ease';

    if (coach) {
      coach.savePosition(guide.style.left, guide.style.top);
    }
  });

  // Restore position
  const savedPos = coach?.getPosition();
  if (savedPos?.left) {
    guide.style.left = savedPos.left;
    guide.style.bottom = 'auto';
    guide.style.right = 'auto';
  }
  if (savedPos?.top) {
    guide.style.top = savedPos.top;
    guide.style.bottom = 'auto';
  }
}

// Auto-init
document.addEventListener('DOMContentLoaded', initCoach);

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SmartCoach, initCoach };
}
