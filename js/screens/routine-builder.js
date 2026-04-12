/* ═══ js/screens/routine-builder.js ═══
   Custom Routine Builder — Users create personalized routines
   Drag-drop phases, set durations, save to localStorage
   ═══════════════════════════════════════════════════════════ */

var builderMode = 'select'; // 'select' | 'edit' | 'play'
var builtRoutine = null;     // { name, phases: [{phase, duration, text}] }
var customRoutines = [];     // Loaded from localStorage

const PHASE_LIBRARY = {
  body: {
    title: '🧍 Σώμα',
    titleEn: '🧍 Body',
    defaultDur: 30,
    suggestions: [
      { text: 'Σάρωση σώματος από πέλματα ως κεφάλι', textEn: 'Body scan from feet to head' },
      { text: 'Αίσθηση βάρους και επαφής', textEn: 'Feel weight and contact points' },
      { text: 'Ενειδέτωση τάσης και χαλάρωσης', textEn: 'Notice tension and release' },
      { text: 'Γείωση στη βαρύτητα', textEn: 'Ground into gravity' }
    ]
  },
  breath: {
    title: '🫁 Αναπνοή',
    titleEn: '🫁 Breath',
    defaultDur: 45,
    suggestions: [
      { text: 'Αναπνοή 4-2-6-1 (κλασική)', textEn: 'Breath 4-2-6-1 (classic)' },
      { text: 'Αναπνοή 4-7-8 (ηρεμία)', textEn: 'Breath 4-7-8 (calm)' },
      { text: 'Αναπνοή 5-5 (ισορροπία)', textEn: 'Breath 5-5 (balance)' },
      { text: 'Αναπνοή 6-4-6 (αργή)', textEn: 'Breath 6-4-6 (slow)' }
    ]
  },
  kindness: {
    title: '💛 Καλοσύνη',
    titleEn: '💛 Kindness',
    defaultDur: 40,
    suggestions: [
      { text: 'Αφιέρωση αγάπης στον εαυτό', textEn: 'Loving-kindness toward self' },
      { text: 'Φράσες ενδυνάμωσης', textEn: 'Empowering affirmations' },
      { text: 'Ευγνωμοσύνη για το σώμα', textEn: 'Gratitude for the body' },
      { text: 'Αυτο-συμπόνια', textEn: 'Self-compassion' }
    ]
  },
  space: {
    title: '✦ Χώρος',
    titleEn: '✦ Space',
    defaultDur: 35,
    suggestions: [
      { text: 'Ανοιχτή επίγνωση χωρίς κέντρο', textEn: 'Open awareness with no center' },
      { text: 'Παρατήρηση ήχων χωρίς κόλληση', textEn: 'Notice sounds without grasping' },
      { text: 'Σύννεφα σκέψεων στον ουρανό', textEn: 'Thoughts as clouds in sky' },
      { text: 'Χώρος που χωράει τα πάντα', textEn: 'Space that holds everything' }
    ]
  },
  grounding: {
    title: '🌍 Γείωση',
    titleEn: '🌍 Grounding',
    defaultDur: 25,
    suggestions: [
      { text: '5 αισθήσεις (5-4-3-2-1)', textEn: '5 senses (5-4-3-2-1)' },
      { text: 'Επαφή με έδαφος/καρέκλα', textEn: 'Contact with ground/chair' },
      { text: 'Πέντε αντικείμενα γύρω σου', textEn: 'Five objects around you' },
      { text: 'Ψυχρό νερό ή δύσκολη αφή', textEn: 'Cold water or texture' }
    ]
  },
  closing: {
    title: '🙏 Κλείσιμο',
    titleEn: '🙏 Closing',
    defaultDur: 20,
    suggestions: [
      { text: 'Επιστροφή στο παρόν', textEn: 'Return to present' },
      { text: 'Ευγνωμοσύνη για την πρακτική', textEn: 'Gratitude for practice' },
      { text: 'Επέκταση ευεργεσίας', textEn: 'Extend well-being' },
      { text: 'Αργή αφύπνιση', textEn: 'Gentle awakening' }
    ]
  }
};

function buildRoutineBuilderScreen() {
  var screen = document.getElementById('screen-routine-builder');
  if (!screen) return;

  loadCustomRoutines();

  if (builderMode === 'select') {
    buildBuilderSelect(screen);
  } else if (builderMode === 'edit') {
    buildBuilderEdit(screen);
  }
}

function buildBuilderSelect(screen) {
  var html = '<div class="scroll-area">' +
    '<div class="screen-header">' +
      '<button class="back-btn" onclick="goBack()">←</button>' +
      '<div class="screen-title">'+t('routineBuilderTitle')+'</div>' +
    '</div>' +
    '<div class="content-card">' +
      '<p style="font-size:13px;color:var(--text-soft);line-height:1.7">'+t('routineBuilderIntro')+'</p>' +
    '</div>';

  // Custom routines list
  if (customRoutines.length > 0) {
    html += '<div style="padding:0 16px;margin-bottom:12px">' +
      '<div style="font-size:12px;font-weight:700;color:var(--text-hint);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">'+t('routineBuilderCustom')+'</div>';
    
    customRoutines.forEach(function(r, idx) {
      var duration = r.phases.reduce((sum, p) => sum + p.duration, 0);
      html += '<div style="padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card);margin-bottom:8px;cursor:pointer" onclick="loadRoutineForEdit('+idx+')">' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
          '<div style="font-weight:700;color:var(--text)">'+r.name+'</div>' +
          '<div style="font-size:11px;color:var(--text-hint)">⏱ '+Math.round(duration/60)+' λ</div>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--text-soft);margin-top:4px">'+r.phases.map(p => p.phase).join(' → ')+'</div>' +
        '<div style="display:flex;gap:8px;margin-top:8px">' +
          '<button class="btn-primary" style="font-size:11px;padding:6px 12px;flex:1" onclick="playCustomRoutine('+idx+')">▶ Play</button>' +
          '<button class="btn-secondary" style="font-size:11px;padding:6px 12px;flex:1" onclick="deleteCustomRoutine('+idx+')">🗑 Delete</button>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
  }

  // Create new routine button
  html += '<div style="padding:0 16px;margin-bottom:12px">' +
    '<button class="btn-primary" style="width:100%;justify-content:center" onclick="startNewRoutineBuilder()">' +
      '✏️ '+t('routineBuilderNew')+'' +
    '</button>' +
  '</div>' +
  '<div class="spacer-bottom"></div>' +
  '</div>';

  screen.innerHTML = html;
}

function buildBuilderEdit(screen) {
  if (!builtRoutine) {
    builderMode = 'select';
    buildRoutineBuilderScreen();
    return;
  }

  var html = '<div class="scroll-area">' +
    '<div class="screen-header">' +
      '<button class="back-btn" onclick="cancelRoutineEdit()">←</button>' +
      '<div class="screen-title">'+t('routineBuilderEdit')+'</div>' +
    '</div>' +
    '<div class="content-card">' +
      '<label style="font-size:12px;font-weight:700;color:var(--text-hint);text-transform:uppercase;display:block;margin-bottom:4px">'+t('routineBuilderName')+'</label>' +
      '<input type="text" id="routine-name-input" value="'+builtRoutine.name+'" placeholder="π.χ. Πρωινή Ηρεμία" ' +
        'style="width:100%;padding:10px;border:1px solid var(--border);border-radius:6px;font-size:14px;font-family:inherit" ' +
        'oninput="builtRoutine.name = this.value">' +
    '</div>' +
    '<div style="padding:0 16px">' +
      '<div style="font-size:12px;font-weight:700;color:var(--text-hint);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px">Φάσεις</div>';

  // Draggable phase list
  builtRoutine.phases.forEach(function(phase, idx) {
    html += '<div class="routine-phase-card" style="padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card);margin-bottom:8px;cursor:grab">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<div style="font-weight:700">'+PHASE_LIBRARY[phase.phase].title+'</div>' +
        '<button style="background:none;border:none;color:var(--text-hint);cursor:pointer;font-size:16px" onclick="removePhase('+idx+')">×</button>' +
      '</div>' +
      '<div style="margin-bottom:8px">' +
        '<label style="font-size:11px;color:var(--text-soft);display:block;margin-bottom:4px">Διάρκεια: <strong>'+phase.duration+' δευτ.</strong></label>' +
        '<input type="range" min="5" max="180" value="'+phase.duration+'" step="5" ' +
          'oninput="builtRoutine.phases['+idx+'].duration = parseInt(this.value);buildRoutineBuilderScreen()" ' +
          'style="width:100%">' +
      '</div>' +
      '<textarea placeholder="Περιγραφή (προαιρετικό)" ' +
        'style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;font-size:12px;font-family:inherit;resize:none;height:50px" ' +
        'oninput="builtRoutine.phases['+idx+'].text = this.value">'+phase.text+'</textarea>' +
    '</div>';
  });

  // Add phase button
  html += '<button class="btn-secondary" style="width:100%;justify-content:center;margin-bottom:12px" onclick="showPhaseSelector()">' +
    '+ '+t('routineBuilderAddPhase')+'' +
  '</button>' +
  '<div style="background:rgba(42,93,94,0.06);border-radius:8px;padding:12px;margin-bottom:12px">' +
    '<div style="font-size:12px;color:var(--text);font-weight:700;margin-bottom:6px">⏱ Σύνολο: <strong>'+Math.round(builtRoutine.phases.reduce((s,p)=>s+p.duration,0)/60)+' λ '+builtRoutine.phases.reduce((s,p)=>s+p.duration,0)%60+' δ</strong></div>' +
  '</div>' +
  '<div style="display:flex;gap:8px">' +
    '<button class="btn-primary" style="flex:1;justify-content:center" onclick="saveCustomRoutine()">💾 '+t('routineBuilderSave')+'</button>' +
    '<button class="btn-secondary" style="flex:1;justify-content:center" onclick="playBuiltRoutine()">▶ '+t('routineBuilderPreview')+'</button>' +
  '</div>' +
  '<div class="spacer-bottom"></div>' +
  '</div>';

  screen.innerHTML = html;
}

function startNewRoutineBuilder() {
  builtRoutine = {
    name: '',
    phases: [
      { phase: 'body', duration: 30, text: '' },
      { phase: 'breath', duration: 45, text: '' },
      { phase: 'kindness', duration: 40, text: '' },
      { phase: 'closing', duration: 20, text: '' }
    ]
  };
  builderMode = 'edit';
  buildRoutineBuilderScreen();
}

function showPhaseSelector() {
  var opts = Object.entries(PHASE_LIBRARY).map(function([key, lib]) {
    return '<button class="btn-secondary" style="width:100%;text-align:left;margin-bottom:8px" onclick="addPhaseToRoutine(\''+key+'\')">' +
      lib.title + ' — ' + lib.defaultDur + ' δευτ.' +
    '</button>';
  }).join('');

  var modal = '<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000" onclick="this.style.display=\'none\'">' +
    '<div style="background:var(--bg-card);border-radius:12px;padding:20px;max-width:300px;max-height:80vh;overflow-y:auto" onclick="event.stopPropagation()">' +
      '<h3 style="margin:0 0 16px 0;font-size:16px">Επέλεξε φάση</h3>' +
      opts +
      '<button class="btn-secondary" style="width:100%;text-align:center" onclick="this.parentElement.parentElement.style.display=\'none\'">Κλείσιμο</button>' +
    '</div>' +
  '</div>';

  document.body.insertAdjacentHTML('beforeend', modal);
}

function addPhaseToRoutine(phaseKey) {
  if (!builtRoutine) return;
  var lib = PHASE_LIBRARY[phaseKey];
  builtRoutine.phases.push({
    phase: phaseKey,
    duration: lib.defaultDur,
    text: lib.suggestions[0].text
  });
  document.querySelector('[style*="position:fixed"]').remove();
  buildRoutineBuilderScreen();
}

function removePhase(idx) {
  if (builtRoutine && builtRoutine.phases.length > 1) {
    builtRoutine.phases.splice(idx, 1);
    buildRoutineBuilderScreen();
  }
}

function saveCustomRoutine() {
  if (!builtRoutine || !builtRoutine.name.trim()) {
    alert('Δώσε ένα όνομα στη ρουτίνα');
    return;
  }

  // Save to localStorage
  var idx = customRoutines.findIndex(r => r.name === builtRoutine.name);
  if (idx >= 0) {
    customRoutines[idx] = builtRoutine;
  } else {
    customRoutines.push(builtRoutine);
  }

  localStorage.setItem('customRoutines', JSON.stringify(customRoutines));
  builtRoutine = null;
  builderMode = 'select';
  buildRoutineBuilderScreen();
  navigator.vibrate && navigator.vibrate([50, 30, 50]);
}

function playBuiltRoutine() {
  if (!builtRoutine || !builtRoutine.phases.length) return;

  // Convert to ROUTINES format and play
  var tempRoutine = {
    id: 'custom-' + Date.now(),
    totalDuration: builtRoutine.phases.reduce((s,p)=>s+p.duration,0),
    emoji: '✨',
    steps: builtRoutine.phases.map(function(p) {
      return {
        phase: p.phase,
        duration: p.duration,
        titleKey: p.phase + 'Phase',
        textKey: '',
        action: p.phase,
        text: p.text
      };
    })
  };

  ROUTINES['custom'] = tempRoutine;
  startRoutine('custom');
}

function playCustomRoutine(idx) {
  if (idx < 0 || idx >= customRoutines.length) return;
  builtRoutine = customRoutines[idx];
  playBuiltRoutine();
}

function loadRoutineForEdit(idx) {
  if (idx < 0 || idx >= customRoutines.length) return;
  builtRoutine = JSON.parse(JSON.stringify(customRoutines[idx]));
  builderMode = 'edit';
  buildRoutineBuilderScreen();
}

function deleteCustomRoutine(idx) {
  if (idx < 0 || idx >= customRoutines.length) return;
  if (confirm('Σίγουρα θέλεις να διαγράψεις "'+customRoutines[idx].name+'"?')) {
    customRoutines.splice(idx, 1);
    localStorage.setItem('customRoutines', JSON.stringify(customRoutines));
    buildRoutineBuilderScreen();
  }
}

function cancelRoutineEdit() {
  builtRoutine = null;
  builderMode = 'select';
  buildRoutineBuilderScreen();
}

function loadCustomRoutines() {
  var saved = localStorage.getItem('customRoutines');
  customRoutines = saved ? JSON.parse(saved) : [];
}
