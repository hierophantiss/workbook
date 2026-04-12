/* ═══ js/audio/bowls.js ═══ */
// ═══ 1. TIBETAN SINGING BOWLS ═══
var bowlsOn = false;
var bowlNodes = null;
var bowlInterval = null;

function buildBowls() {
  var ac = getAC();
  var master = ac.createGain();
  master.gain.value = 0;

  // Reverb via convolution-like delay
  var delay = ac.createDelay(1.0);
  delay.delayTime.value = 0.15;
  var dGain = ac.createGain();
  dGain.gain.value = 0.25;
  var delay2 = ac.createDelay(1.0);
  delay2.delayTime.value = 0.37;
  var dGain2 = ac.createGain();
  dGain2.gain.value = 0.15;

  master.connect(ac.destination);
  master.connect(delay).connect(dGain).connect(ac.destination);
  master.connect(delay2).connect(dGain2).connect(ac.destination);
  // Feedback loop for reverb tail
  dGain.connect(delay2);
  dGain2.connect(delay);

  return { master: master, ac: ac };
}

// Bowl frequencies — real singing bowl harmonics
var BOWL_FREQS = [
  { f: 110,   harmonics: [1, 2.76, 4.72, 6.83] },   // Large bowl — deep
  { f: 164,   harmonics: [1, 2.71, 4.58, 6.92] },   // Medium bowl
  { f: 220,   harmonics: [1, 2.83, 4.95, 7.15] },   // Small bowl
  { f: 293,   harmonics: [1, 2.68, 5.12, 7.43] },   // Tiny bowl
  { f: 146.8, harmonics: [1, 2.72, 4.81, 6.67] },   // Medium-low
];

function strikeOneBowl(nodes) {
  var ac = nodes.ac;
  var now = ac.currentTime;

  // Pick a random bowl
  var bowl = BOWL_FREQS[Math.floor(Math.random() * BOWL_FREQS.length)];

  // Each bowl has harmonics that decay at different rates
  bowl.harmonics.forEach(function(h, i) {
    var osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = bowl.f * h;

    // Slight random detuning for organic feel
    osc.detune.value = (Math.random() - 0.5) * 8;

    var env = ac.createGain();
    // Harmonics: lower = louder + longer decay
    var amp = [0.3, 0.12, 0.06, 0.03][i] || 0.02;
    var decay = [6, 4, 2.5, 1.5][i] || 1;

    // Add randomness
    amp *= 0.7 + Math.random() * 0.6;
    decay *= 0.8 + Math.random() * 0.4;

    // Sharp attack, long natural decay
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(amp, now + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(env).connect(nodes.master);
    osc.start(now);
    osc.stop(now + decay + 0.1);
  });
}

function bowlLoop() {
  if (!bowlsOn || !bowlNodes) return;
  strikeOneBowl(bowlNodes);
}

function toggleBowls() {
  var btn = document.getElementById('bowlToggle');
  var icon = document.getElementById('bowlIcon');
  var ac = getAC();

  if (!bowlsOn) {
    if (!bowlNodes) bowlNodes = buildBowls();
    bowlNodes.master.gain.linearRampToValueAtTime(0.5, ac.currentTime + 2);
    bowlsOn = true;
    btn.classList.add('active');
    icon.textContent = '🔔';

    // Strike first bowl immediately
    strikeOneBowl(bowlNodes);

    // Then every 4-8 seconds (random, organic spacing)
    function scheduleBowl() {
      if (!bowlsOn) return;
      var delay = 4000 + Math.random() * 5000; // 4-9 seconds
      bowlInterval = setTimeout(function() {
        bowlLoop();
        scheduleBowl();
      }, delay);
    }
    scheduleBowl();

  } else {
    bowlsOn = false;
    bowlNodes.master.gain.linearRampToValueAtTime(0, ac.currentTime + 3);
    btn.classList.remove('active');
    icon.textContent = '🔇';
    if (bowlInterval) { clearTimeout(bowlInterval); bowlInterval = null; }
  }
}

// Cleanup: remove old toggleAmbient references
function toggleAmbient() { toggleBowls(); }

