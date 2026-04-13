/* ═══════════════════════════════════════════
   sos.js — SOS Emergency Calm Mode
   Quad-sensory intervention for fight-or-flight:
   1. EARS  → Theta 6Hz binaural beats + ocean
   2. EYES  → Slow blue-teal breathing gradient
   3. BODY  → 4-7-8 breathing pattern
   4. TOUCH → Haptic tick on every count
   
   Research basis:
   - Theta 6Hz binaural: parasympathetic activation (PMC4231835)
   - Blue/teal light: parasympathetic activation, cortisol suppression
   - 4-7-8 breath: vagus nerve activation (Dr. Andrew Weil)
   - Rhythmic haptics: nervous system entrainment (Adiem/PLOS ONE)
   ═══════════════════════════════════════════ */

var sosActive = false;
var sosAudioNodes = null;

// ═══ SOS BREATHING PATTERN ═══
// Added to B_PATTERNS in breath.js
function registerSOSPattern() {
  if (typeof B_PATTERNS === 'undefined') return;
  if (B_PATTERNS['sos']) return; // Already registered

  B_PATTERNS['sos'] = {
    name_el: 'SOS — Ηρεμία Τώρα', name_en: 'SOS — Calm Now',
    purpose_el: 'Έκτακτη Ηρεμία', purpose_en: 'Emergency Calm',
    desc_el: 'Theta 6Hz binaural + αναπνοή 4-7-8 + ηρεμιστικό φως + haptic ρυθμός — 4 κανάλια ηρεμίας ταυτόχρονα',
    desc_en: 'Theta 6Hz binaural + 4-7-8 breath + calming light + haptic rhythm — 4 calming channels at once',
    isSOS: true,
    phases: [
      { dur: 4000, armFrom: 0, armTo: 1, labelKey: 0 },
      { dur: 7000, armFrom: 1, armTo: 1, labelKey: 1 },
      { dur: 8000, armFrom: 1, armTo: 0, labelKey: 2 },
      { dur: 1000, armFrom: 0, armTo: 0, labelKey: 3 }
    ]
  };
}

// ═══ THETA BINAURAL AUDIO (6 Hz) ═══
function buildSOSAudio() {
  var ac = getAC();
  var master = ac.createGain();
  master.gain.value = 0;
  master.connect(ac.destination);

  // Theta binaural beats (6 Hz)
  // Carrier at 200 Hz — optimal range per research (Wahbeh et al.)
  var baseF = 200;
  var beatF = 6; // Theta

  var binL = ac.createOscillator(); binL.type = 'sine'; binL.frequency.value = baseF;
  var gL = ac.createGain(); gL.gain.value = 0.3;
  var pL = ac.createStereoPanner(); pL.pan.value = -1;
  binL.connect(gL).connect(pL).connect(master);

  var binR = ac.createOscillator(); binR.type = 'sine'; binR.frequency.value = baseF + beatF;
  var gR = ac.createGain(); gR.gain.value = 0.3;
  var pR = ac.createStereoPanner(); pR.pan.value = 1;
  binR.connect(gR).connect(pR).connect(master);

  // Warm sub-harmonic pad (very subtle, grounding)
  var padG = ac.createGain(); padG.gain.value = 0.04;
  [baseF * 0.5, baseF * 1.5].forEach(function(f, i) {
    var o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    var g = ac.createGain(); g.gain.value = [0.3, 0.15][i];
    o.connect(g).connect(padG); o.start();
  });
  padG.connect(master);

  // Deep ocean (brown noise, heavily filtered for deep rumble)
  var oceanSrc = ac.createBufferSource();
  oceanSrc.buffer = makeBrownNoise(ac); oceanSrc.loop = true;
  var oceanG = ac.createGain(); oceanG.gain.value = 0.3;
  var oceanLP = ac.createBiquadFilter(); oceanLP.type = 'lowpass'; oceanLP.frequency.value = 400; oceanLP.Q.value = 0.3;
  oceanSrc.connect(oceanLP).connect(oceanG).connect(master);

  // Gentle wind (very quiet)
  var windSrc = ac.createBufferSource();
  windSrc.buffer = makePinkNoise(ac); windSrc.loop = true;
  var windG = ac.createGain(); windG.gain.value = 0.04;
  var windHP = ac.createBiquadFilter(); windHP.type = 'highpass'; windHP.frequency.value = 600;
  var windLP = ac.createBiquadFilter(); windLP.type = 'lowpass'; windLP.frequency.value = 2000;
  windSrc.connect(windHP).connect(windLP).connect(windG).connect(master);

  binL.start(); binR.start(); oceanSrc.start(); windSrc.start();

  return { master: master, oceanG: oceanG };
}

function startSOSAudio() {
  // Check binaural acknowledgment
  if (!localStorage.getItem('binaural_ack')) {
    showBinauralModal();
    // After modal accepted, start SOS audio
    var origAccept = document.getElementById('binauralAccept');
    if (origAccept) {
      var origClick = origAccept.onclick;
      origAccept.onclick = function() {
        if (document.getElementById('binauralRemember').checked) {
          localStorage.setItem('binaural_ack', '1');
        }
        document.getElementById('binauralModal').style.display = 'none';
        _activateSOSAudio();
      };
    }
    return;
  }
  _activateSOSAudio();
}

function _activateSOSAudio() {
  var ac = getAC();
  if (!sosAudioNodes) sosAudioNodes = buildSOSAudio();
  sosAudioNodes.master.gain.linearRampToValueAtTime(0.4, ac.currentTime + 4);
}

function stopSOSAudio() {
  if (!sosAudioNodes) return;
  var ac = getAC();
  sosAudioNodes.master.gain.linearRampToValueAtTime(0, ac.currentTime + 3);
}

// ═══ BLUE BREATHING BACKGROUND ═══
function activateSOSVisuals() {
  sosActive = true;
  var screen = document.getElementById('screen-breath');
  if (!screen) return;
  screen.classList.add('sos-mode');
}

function deactivateSOSVisuals() {
  sosActive = false;
  var screen = document.getElementById('screen-breath');
  if (!screen) return;
  screen.classList.remove('sos-mode');
}

// ═══ SOS HAPTIC FEEDBACK ═══
// Stronger per-count vibration for SOS mode
function sosHapticTick() {
  if (document.body.classList.contains('reduce-motion')) return;
  // Longer, more grounding vibration than standard
  if (navigator.vibrate) {
    navigator.vibrate(25);
  } else {
    hapticPulse(25, 150);
  }
}

// ═══ SWITCH TO SOS MODE ═══
function activateSOS() {
  registerSOSPattern();
  // Stop existing breath audio if running
  if (typeof breathAudioOn !== 'undefined' && breathAudioOn) {
    toggleBreathAudio();
  }
  // Switch pattern
  switchPattern('sos');
  // Activate all SOS channels
  activateSOSVisuals();
  startSOSAudio();
}

function deactivateSOS() {
  deactivateSOSVisuals();
  stopSOSAudio();
}

// ═══ HOOK INTO PATTERN SWITCHING ═══
// When user switches away from SOS, deactivate visuals/audio
var _origSwitchPattern = null;

function hookSOSIntoPatternSwitch() {
  if (_origSwitchPattern) return; // Already hooked
  _origSwitchPattern = window.switchPattern;
  
  window.switchPattern = function(key) {
    // If switching away from SOS
    if (bCurrentPattern === 'sos' && key !== 'sos') {
      deactivateSOS();
    }
    _origSwitchPattern(key);
    // If switching to SOS
    if (key === 'sos') {
      activateSOSVisuals();
      startSOSAudio();
    }
  };
}

// ═══ HOOK INTO SCREEN NAVIGATION ═══
// Stop SOS when leaving breath screen
function hookSOSIntoNavigation() {
  var origShow = window.showScreen;
  window.showScreen = function(id) {
    if (sosActive && id !== 'breath') {
      deactivateSOS();
      // Reset pattern to default
      if (typeof B_PATTERNS !== 'undefined' && bCurrentPattern === 'sos') {
        bCurrentPattern = '4-2-6-1';
        B_PHASES = B_PATTERNS['4-2-6-1'].phases;
      }
    }
    origShow(id);
  };
}

// ═══ OVERRIDE HAPTIC FOR SOS ═══
// Replace the standard per-count haptic with stronger SOS version
var _origBUpdatePhase_sos = null;

function hookSOSHaptics() {
  // Override the per-count haptic in bUpdatePhase
  // The breath.js already calls hapticPulse(8, 180) per count
  // For SOS we want stronger: hapticPulse(25, 150)
  var origHapticPulse = window.hapticPulse;
  window.hapticPulse = function(durationMs, freq) {
    if (sosActive) {
      durationMs = 25;
      freq = 150;
    }
    origHapticPulse(durationMs, freq);
  };
}

// ═══ ADD SOS BUTTON TO BREATH SCREEN ═══
function addSOSButton() {
  var patternSelect = document.getElementById('bPatternSelect');
  if (!patternSelect) return;
  if (document.querySelector('[data-pattern="sos"]')) return;

  registerSOSPattern();

  var lang = typeof LANG !== 'undefined' ? LANG : 'el';
  var btn = document.createElement('button');
  btn.className = 'breath-pattern-btn sos-pattern-btn';
  btn.dataset.pattern = 'sos';
  btn.onclick = function() { activateSOS(); };
  btn.innerHTML = '<span style="font-size:12px;font-weight:700">SOS</span><br><span class="bp-purpose" style="font-size:8px;opacity:0.6;font-weight:400">' +
    (lang === 'el' ? 'Έκτακτη Ηρεμία' : 'Emergency Calm') + '</span>';
  patternSelect.appendChild(btn);
}

// ═══ SYNC OCEAN TO BREATH (for SOS audio) ═══
function syncSOSOceanToBreath() {
  var origBUpdate = window.bUpdatePhase;
  var lastSosSync = 0;
  
  window.bUpdatePhase = function(now) {
    origBUpdate(now);
    // Sync SOS ocean volume to arm position
    if (sosActive && sosAudioNodes && typeof audioCtx !== 'undefined' && audioCtx) {
      if (now - lastSosSync > 100) { // throttle
        var target = 0.15 + bArmPos * 0.25;
        sosAudioNodes.oceanG.gain.linearRampToValueAtTime(target, audioCtx.currentTime + 0.2);
        lastSosSync = now;
      }
    }
  };
}

// ═══ COMPANION INTEGRATION ═══
// When mood is bad, companion suggests SOS directly
function patchCompanionForSOS() {
  if (typeof getCompanionMessage !== 'function') return;
  var origGetMsg = window.getCompanionMessage;
  window.getCompanionMessage = function() {
    var msg = origGetMsg();
    var lang = typeof LANG !== 'undefined' ? LANG : 'el';
    var mood = typeof loadMood === 'function' ? loadMood() : -1;
    
    // If mood is very bad, replace breath action with SOS
    if (mood >= 0 && mood <= 1) {
      msg.secondary = lang === 'el'
        ? 'Το SOS mode συνδυάζει αναπνοή, ήχο θήτα και ηρεμιστικό φως. Δεν χρειάζεται να κάνεις τίποτα άλλο.'
        : 'SOS mode combines breathing, theta sound and calming light. You don\'t need to do anything else.';
      msg.actions = [
        { label: lang === 'el' ? '🆘 SOS Ηρεμία' : '🆘 SOS Calm', action: "activateSOS();showScreen('breath')" }
      ];
    }
    return msg;
  };
}

// ═══ INIT ═══
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    registerSOSPattern();
    hookSOSIntoPatternSwitch();
    hookSOSHaptics();
    syncSOSOceanToBreath();
    patchCompanionForSOS();
    
    // Add SOS button when breath screen opens
    var origInitBreath = window.initBreathExercise;
    window.initBreathExercise = function() {
      origInitBreath();
      addSOSButton();
    };
    
    // If breath screen already has the button area
    addSOSButton();
  }, 600);
});
