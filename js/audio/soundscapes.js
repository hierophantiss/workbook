/* ═══ js/audio/soundscapes.js ═══
   Procedural Soundscapes: Rain, Fire, Cicadas
   Uses noise generators + oscillators to create ambient environments
   ═══════════════════════════════════════════════════ */

var soundscapeNodes = {
  rain: null,
  fire: null,
  cicadas: null
};

// ──────────────────────────────────────────
// RAIN — Pink noise + low rumble
// ──────────────────────────────────────────
function createRainscape(ac) {
  var ctx = ac || getAC();
  
  // Main: Pink noise
  var noiseBuffer = makePinkNoise(ctx);
  var noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;

  // Low-pass filter for softer rain sound
  var lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 4000; // 4 kHz cutoff

  // Compressor to smooth dynamics
  var comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -30;
  comp.knee.value = 6;
  comp.ratio.value = 4;

  // Wet/Dry gain
  var wetGain = ctx.createGain();
  wetGain.gain.value = 0.6;

  // Wire
  noiseSource.connect(lpf);
  lpf.connect(comp);
  comp.connect(wetGain);
  wetGain.connect(ctx.destination);

  noiseSource.start();

  return {
    source: noiseSource,
    filter: lpf,
    gain: wetGain,
    play: function() { noiseSource.start(); },
    pause: function() { noiseSource.stop(); },
    stop: function() { noiseSource.stop(); }
  };
}

// ──────────────────────────────────────────
// FIRE — Brown noise + crackling
// ──────────────────────────────────────────
function createFirescape(ac) {
  var ctx = ac || getAC();
  
  // Main: Brown noise (deeper than pink)
  var noiseBuffer = makeBrownNoise(ctx);
  var noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;

  // Crackling layer: high-frequency clicks
  var crackleOsc = ctx.createOscillator();
  crackleOsc.type = 'square';
  crackleOsc.frequency.value = 120; // Low-freq modulation

  // Noise for crackle
  var crackleNoise = ctx.createBufferSource();
  crackleNoise.buffer = makePinkNoise(ctx);
  crackleNoise.loop = true;

  // Filter crackle to high-pass
  var hpf = ctx.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.value = 6000; // 6 kHz for crispy crackle

  // Amplitude modulation with LFO
  var lfo = ctx.createOscillator();
  lfo.frequency.value = 2; // 2 Hz wobble

  var lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.3;

  // Main brown gain
  var mainGain = ctx.createGain();
  mainGain.gain.value = 0.7;

  // Crackle gain
  var crackleGain = ctx.createGain();
  crackleGain.gain.value = 0.0;

  // Master out
  var masterGain = ctx.createGain();
  masterGain.gain.value = 0.5;

  // Wire main
  noiseSource.connect(mainGain);
  mainGain.connect(masterGain);

  // Wire crackle
  crackleNoise.connect(hpf);
  hpf.connect(crackleGain);
  crackleGain.connect(masterGain);

  // Wire LFO to crackle gain
  lfo.connect(lfoGain);
  lfoGain.connect(crackleGain.gain);

  masterGain.connect(ctx.destination);

  noiseSource.start();
  crackleNoise.start();
  lfo.start();

  return {
    main: noiseSource,
    crackle: crackleNoise,
    lfo: lfo,
    gain: masterGain,
    play: function() {
      noiseSource.start();
      crackleNoise.start();
      lfo.start();
    },
    pause: function() {
      noiseSource.stop();
      crackleNoise.stop();
      lfo.stop();
    },
    stop: function() {
      try { noiseSource.stop(); } catch(e) {}
      try { crackleNoise.stop(); } catch(e) {}
      try { lfo.stop(); } catch(e) {}
    }
  };
}

// ──────────────────────────────────────────
// CICADAS — Tonal chirping @ 4-8 kHz
// ──────────────────────────────────────────
function createCicadascape(ac) {
  var ctx = ac || getAC();

  // Create 3 cicada voices at different frequencies
  var cicadaFreqs = [4500, 5500, 6500];
  var cicadaOscs = cicadaFreqs.map(function(freq) {
    var osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    return osc;
  });

  // LFO to modulate each voice
  var lfos = [1.2, 1.5, 1.8].map(function(rate) {
    var lfo = ctx.createOscillator();
    lfo.frequency.value = rate; // Chirp rate 1-2 Hz
    return lfo;
  });

  var lfoGains = lfos.map(function(lfo, i) {
    var gain = ctx.createGain();
    gain.gain.value = 80; // Frequency modulation depth
    lfo.connect(gain);
    gain.connect(cicadaOscs[i].frequency);
    return gain;
  });

  // Main volume envelope
  var envelope = ctx.createGain();
  envelope.gain.value = 0.08; // Cicadas are soft in nature

  // Master
  var master = ctx.createGain();
  master.gain.value = 0.4;

  // Wire oscillators to output
  cicadaOscs.forEach(function(osc) {
    osc.connect(envelope);
  });
  envelope.connect(master);
  master.connect(ctx.destination);

  // Start all
  cicadaOscs.forEach(function(osc) { osc.start(); });
  lfos.forEach(function(lfo) { lfo.start(); });

  return {
    oscs: cicadaOscs,
    lfos: lfos,
    gain: master,
    play: function() {
      cicadaOscs.forEach(function(o) { o.start(); });
      lfos.forEach(function(l) { l.start(); });
    },
    pause: function() {
      cicadaOscs.forEach(function(o) { o.stop(); });
      lfos.forEach(function(l) { l.stop(); });
    },
    stop: function() {
      try { cicadaOscs.forEach(function(o) { o.stop(); }); } catch(e) {}
      try { lfos.forEach(function(l) { l.stop(); }); } catch(e) {}
    }
  };
}

// ──────────────────────────────────────────
// SOUNDSCAPE PLAYBACK MANAGER
// ──────────────────────────────────────────

var activeSoundscape = null;

function playSoundscape(name) {
  var ac = getAC();

  // Stop any active soundscape
  if (activeSoundscape) {
    activeSoundscape.stop();
  }

  // Create and play requested soundscape
  switch (name) {
    case 'rain':
      activeSoundscape = createRainscape(ac);
      break;
    case 'fire':
      activeSoundscape = createFirescape(ac);
      break;
    case 'cicadas':
      activeSoundscape = createCicadascape(ac);
      break;
    default:
      activeSoundscape = null;
  }
}

function pauseSoundscape() {
  if (activeSoundscape && activeSoundscape.pause) {
    activeSoundscape.pause();
  }
}

function stopSoundscape() {
  if (activeSoundscape) {
    activeSoundscape.stop();
    activeSoundscape = null;
  }
}

function setSoundscapeVolume(vol) {
  if (activeSoundscape && activeSoundscape.gain) {
    activeSoundscape.gain.gain.value = Math.max(0, Math.min(1, vol));
  }
}

// ──────────────────────────────────────────
// SOUNDSCAPE SELECTOR UI
// ──────────────────────────────────────────

const SOUNDSCAPES_INFO = {
  rain: {
    titleKey: 'soundscapeRain',
    descKey: 'soundscapeRainDesc',
    emoji: '🌧️'
  },
  fire: {
    titleKey: 'soundscapeFire',
    descKey: 'soundscapeFireDesc',
    emoji: '🔥'
  },
  cicadas: {
    titleKey: 'soundscapeCicadas',
    descKey: 'soundscapeCicadasDesc',
    emoji: '🦗'
  }
};

function buildSoundscapesWidget(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var html = '<div style="display:flex;gap:8px;flex-wrap:wrap">';
  
  Object.entries(SOUNDSCAPES_INFO).forEach(function([key, info]) {
    html += '<button class="btn-soundscape" ' +
      'onclick="playSoundscape(\''+key+'\')" ' +
      'style="flex:1;min-width:80px;padding:12px 8px;border-radius:8px;' +
      'border:1.5px solid var(--border);background:var(--bg-card);' +
      'font-family:inherit;cursor:pointer;transition:all 0.2s">' +
      '<div style="font-size:20px;margin-bottom:4px">'+info.emoji+'</div>' +
      '<div style="font-size:11px;font-weight:700;color:var(--text)">'+t(info.titleKey)+'</div>' +
      '</button>';
  });

  html += '<button class="btn-soundscape-stop" ' +
    'onclick="stopSoundscape()" ' +
    'style="flex:1;min-width:80px;padding:12px 8px;border-radius:8px;' +
    'border:1.5px solid var(--border);background:var(--bg-card);' +
    'font-family:inherit;cursor:pointer;transition:all 0.2s">' +
    '<div style="font-size:20px;margin-bottom:4px">⊘</div>' +
    '<div style="font-size:11px;font-weight:700;color:var(--text)">'+t('soundscapeNone')+'</div>' +
    '</button>';

  html += '</div>';
  container.innerHTML = html;
}
