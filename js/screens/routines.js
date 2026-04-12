/* ═══ js/screens/routines.js ═══
   Guided Routines — Pre-built 2-3 min exercise chains
   Combines: microdose → breathing → kindness automatically
   ═══════════════════════════════════════════════════ */

var currentRoutine = null;
var routineStep = 0;
var routineTimer = null;

const ROUTINES = {
  morning: {
    id: 'morning',
    titleKey: 'routineMorning',
    descKey: 'routineMorningDesc',
    emoji: '🌅',
    totalDuration: 180, // 3 min
    steps: [
      {
        phase: 'intro',
        duration: 5,
        titleKey: 'routineGroundingStart',
        textKey: 'routineGroundingText',
        action: 'grounding'
      },
      {
        phase: 'body',
        duration: 30,
        titleKey: 'routineBodyAwareness',
        textKey: 'routineBodyText',
        action: 'body-scan',
        haptic: [50, 20, 50]
      },
      {
        phase: 'breath',
        duration: 45,
        titleKey: 'routineBreath421',
        textKey: 'routineBreathText',
        action: 'breath-guided',
        pattern: '4-2-1' // inhale 4, hold 2, exhale 1 (slow morning)
      },
      {
        phase: 'kindness',
        duration: 60,
        titleKey: 'routineKindness',
        textKey: 'routineKindnessText',
        action: 'kindness-affirmations'
      },
      {
        phase: 'closing',
        duration: 40,
        titleKey: 'routineClosing',
        textKey: 'routineClosingText',
        action: 'gratitude'
      }
    ]
  },

  bedtime: {
    id: 'bedtime',
    titleKey: 'routineBedtime',
    descKey: 'routineBedtimeDesc',
    emoji: '🌙',
    totalDuration: 180, // 3 min
    steps: [
      {
        phase: 'intro',
        duration: 5,
        titleKey: 'routineReleaseStart',
        textKey: 'routineReleaseText',
        action: 'release'
      },
      {
        phase: 'body',
        duration: 40,
        titleKey: 'routineProgressiveRelax',
        textKey: 'routineRelaxText',
        action: 'progressive-relax',
        haptic: [30, 50, 30]
      },
      {
        phase: 'breath',
        duration: 60,
        titleKey: 'routineSlowBreath',
        textKey: 'routineSlowBreathText',
        action: 'breath-guided',
        pattern: '6-4-6' // longer exhale for relaxation
      },
      {
        phase: 'settling',
        duration: 50,
        titleKey: 'routineSettling',
        textKey: 'routineSettlingText',
        action: 'body-settling'
      },
      {
        phase: 'closing',
        duration: 25,
        titleKey: 'routineSleep',
        textKey: 'routineSleepText',
        action: 'sleep-transition'
      }
    ]
  },

  crisis: {
    id: 'crisis',
    titleKey: 'routineCrisis',
    descKey: 'routineCrisisDesc',
    emoji: '🆘',
    totalDuration: 120, // 2 min
    steps: [
      {
        phase: 'emergency',
        duration: 10,
        titleKey: 'routineEmergencyBreath',
        textKey: 'routineEmergencyText',
        action: 'emergency-breath',
        haptic: [100, 100, 100],
        audioLoop: 'calm-pulse'
      },
      {
        phase: 'grounding5',
        duration: 50,
        titleKey: 'routine5Senses',
        textKey: 'routine5SensesText',
        action: 'five-senses'
      },
      {
        phase: 'stabilize',
        duration: 40,
        titleKey: 'routineStabilize',
        textKey: 'routineStabilizeText',
        action: 'stabilizing-breath',
        pattern: '4-4-4'
      },
      {
        phase: 'safety',
        duration: 20,
        titleKey: 'routineSafety',
        textKey: 'routineSafetyText',
        action: 'safety-affirmation'
      }
    ]
  }
};

function buildRoutinesScreen() {
  var screen = document.getElementById('screen-routines');
  if (!screen) return;

  if (currentRoutine) {
    buildRoutineActive(screen);
  } else {
    buildRoutinesList(screen);
  }
}

function buildRoutinesList(screen) {
  var routines = Object.values(ROUTINES);
  var cards = routines.map(function(r) {
    return '<div class="routine-card" onclick="startRoutine(\''+r.id+'\')" style="cursor:pointer;padding:16px;border:1px solid var(--border);border-radius:12px;background:var(--bg-card);transition:all 0.2s;margin-bottom:12px">' +
      '<div style="display:flex;align-items:flex-start;gap:12px">' +
        '<div style="font-size:32px">'+r.emoji+'</div>' +
        '<div style="flex:1">' +
          '<h3 style="margin:0 0 4px 0;font-size:16px;font-weight:700">'+t(r.titleKey)+'</h3>' +
          '<p style="margin:0 0 8px 0;font-size:12px;color:var(--text-soft)">'+t(r.descKey)+'</p>' +
          '<div style="font-size:11px;color:var(--text-hint);font-weight:700">⏱ '+(Math.round(r.totalDuration/60))+' λεπτά</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  screen.innerHTML = '<div class="scroll-area">' +
    '<div class="screen-header">' +
      '<button class="back-btn" onclick="goBack()">←</button>' +
      '<div class="screen-title">'+t('routinesTitle')+'</div>' +
    '</div>' +
    '<div class="content-card">' +
      '<p style="font-size:13px;color:var(--text);line-height:1.7">'+t('routinesIntro')+'</p>' +
    '</div>' +
    '<div style="padding:0 16px">' +
      cards +
    '</div>' +
    '<div class="spacer-bottom"></div>' +
  '</div>';
}

function buildRoutineActive(screen) {
  var routine = ROUTINES[currentRoutine];
  if (!routine) {
    currentRoutine = null;
    buildRoutinesScreen();
    return;
  }

  var step = routine.steps[routineStep];
  if (!step) {
    // Routine complete
    buildRoutineComplete(screen, routine);
    return;
  }

  var progress = Math.round((routineStep / routine.steps.length) * 100);
  var elapsed = routine.steps.slice(0, routineStep).reduce((sum, s) => sum + s.duration, 0);
  var totalSeconds = routine.totalDuration;

  screen.innerHTML = '<div class="scroll-area" style="display:flex;flex-direction:column;justify-content:center;align-items:center;padding:20px;text-align:center">' +
    '<div style="position:absolute;top:16px;left:16px">' +
      '<button class="back-btn" onclick="stopRoutine()" style="margin:0">×</button>' +
    '</div>' +
    
    '<div style="width:100%;max-width:200px;height:8px;background:var(--border);border-radius:4px;margin-bottom:24px;overflow:hidden">' +
      '<div style="width:'+progress+'%;height:100%;background:var(--teal);transition:width 0.3s"></div>' +
    '</div>' +
    
    '<div style="font-size:32px;margin-bottom:12px">'+routine.emoji+'</div>' +
    
    '<h2 style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:var(--text)">'+t(step.titleKey)+'</h2>' +
    '<p style="margin:0 0 24px 0;font-size:13px;color:var(--text-soft);line-height:1.7;max-width:300px">'+t(step.textKey)+'</p>' +
    
    '<div style="font-family:Fraunces,serif;font-size:56px;font-weight:900;color:var(--teal);margin:24px 0" id="routine-timer">'+step.duration+'</div>' +
    
    '<p style="margin:16px 0 0 0;font-size:11px;color:var(--text-hint);text-transform:uppercase;letter-spacing:1px">'+t(step.phase === 'intro' ? 'routinePhaseStart' : 'routinePhase'+step.phase.charAt(0).toUpperCase()+step.phase.slice(1))+'</p>' +
    
    '<div class="spacer-bottom"></div>' +
  '</div>';

  if (!routineTimer) {
    advanceRoutineStep();
  }
}

function buildRoutineComplete(screen, routine) {
  screen.innerHTML = '<div class="scroll-area" style="display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40px 20px;text-align:center">' +
    '<div style="font-size:48px;margin-bottom:20px">✨</div>' +
    '<h2 style="margin:0 0 12px 0;font-size:24px;font-weight:700">'+t('routineComplete')+'</h2>' +
    '<p style="margin:0 0 24px 0;font-size:13px;color:var(--text-soft);line-height:1.7;max-width:300px">'+t('routineCompleteMsg')+'</p>' +
    '<button class="btn-primary" onclick="stopRoutine();showScreen(\'home\')" style="margin-bottom:12px">'+t('routineHome')+'</button>' +
    '<button class="btn-secondary" onclick="currentRoutine=null;routineStep=0;buildRoutinesScreen()">'+t('routineAgain')+'</button>' +
    '<div class="spacer-bottom"></div>' +
  '</div>';

  navigator.vibrate && navigator.vibrate([50, 50, 50, 50, 50]);
}

function startRoutine(routineId) {
  tapFeedback();
  currentRoutine = routineId;
  routineStep = 0;
  showScreen('routines');
  buildRoutineActive(document.getElementById('screen-routines'));
}

function advanceRoutineStep() {
  var routine = ROUTINES[currentRoutine];
  if (!routine) return;
  var step = routine.steps[routineStep];
  if (!step) return;

  var remaining = step.duration;
  var timerEl = document.getElementById('routine-timer');

  if (step.haptic && routineStep === 0) {
    breathVibrate(step.haptic);
  }

  routineTimer = setInterval(function() {
    remaining--;
    if (timerEl) timerEl.textContent = remaining;

    if (remaining <= 0) {
      clearInterval(routineTimer);
      routineTimer = null;
      
      // Move to next step
      routineStep++;
      if (routineStep < routine.steps.length) {
        buildRoutineActive(document.getElementById('screen-routines'));
      } else {
        buildRoutineActive(document.getElementById('screen-routines'));
      }
    }
  }, 1000);
}

function stopRoutine() {
  tapFeedback();
  if (routineTimer) clearInterval(routineTimer);
  routineTimer = null;
  currentRoutine = null;
  routineStep = 0;
}
