/* ═══ js/breath.js ═══ */
// js/breath.js
/* ═══ breath.js — Breathing Engine ═══ */
const B_PATTERNS = {
  '4-2-6-1': {
    name_el: 'Τετραπλός Άξονας 4-2-6-1', name_en: 'Fourfold Axis 4-2-6-1',
    purpose_el: 'Γείωση & Παρουσία', purpose_en: 'Grounding & Presence',
    desc_el: 'Αργή εκπνοή, ενεργοποίηση πνευμονογαστρικού — Gerritsen & Band (2018)',
    desc_en: 'Slow exhale, vagus nerve activation — Gerritsen & Band (2018)',
    phases: [
      { dur: 4000, armFrom: 0, armTo: 1, labelKey: 0 },
      { dur: 2000, armFrom: 1, armTo: 1, labelKey: 1 },
      { dur: 6000, armFrom: 1, armTo: 0, labelKey: 2 },
      { dur: 1000, armFrom: 0, armTo: 0, labelKey: 3 }
    ]
  },
  '4-7-8': {
    name_el: 'Ηρεμία 4-7-8', name_en: 'Calming 4-7-8',
    purpose_el: 'Βαθιά Ηρεμία & Ύπνος', purpose_en: 'Deep Calm & Sleep',
    desc_el: 'Η μέθοδος Dr. Andrew Weil — βαθιά χαλάρωση νευρικού συστήματος',
    desc_en: 'Dr. Andrew Weil method — deep nervous system relaxation',
    phases: [
      { dur: 4000, armFrom: 0, armTo: 1, labelKey: 0 },
      { dur: 7000, armFrom: 1, armTo: 1, labelKey: 1 },
      { dur: 8000, armFrom: 1, armTo: 0, labelKey: 2 },
      { dur: 1000, armFrom: 0, armTo: 0, labelKey: 3 }
    ]
  },
  '5-5': {
    name_el: 'Συνοχή 5-5', name_en: 'Coherence 5-5',
    purpose_el: 'Εστίαση & Ισορροπία', purpose_en: 'Focus & Balance',
    desc_el: 'Καρδιακή συνοχή — McCraty et al. (2009) HeartMath Institute',
    desc_en: 'Cardiac coherence — McCraty et al. (2009) HeartMath Institute',
    phases: [
      { dur: 5000, armFrom: 0, armTo: 1, labelKey: 0 },
      { dur: 500, armFrom: 1, armTo: 1, labelKey: 1 },
      { dur: 5000, armFrom: 1, armTo: 0, labelKey: 2 },
      { dur: 500, armFrom: 0, armTo: 0, labelKey: 3 }
    ]
  }
};
var bCurrentPattern = '4-2-6-1';
var B_PHASES = B_PATTERNS[bCurrentPattern].phases;
const B_PHASE_LABELS = {
  el: [
    { label: "Εισπνοή", sub: "σήκωσε τα χέρια αργά" },
    { label: "Παύση",   sub: "κράτα ψηλά" },
    { label: "Εκπνοή",  sub: "κατέβασε αργά" },
    { label: "Παύση",   sub: "νιώσε το βάρος" }
  ],
  en: [
    { label: "Inhale", sub: "raise arms slowly" },
    { label: "Hold",   sub: "hold up" },
    { label: "Exhale", sub: "lower arms slowly" },
    { label: "Hold",   sub: "feel the weight" }
  ]
};
const B_CUES = {
  el: ["νιώσε το βάρος σου","συγκέντρωσε το βλέμμα","η γη σε κρατά","άνοιξε την αντίληψη","αφέσου στον ρυθμό","εδώ, τώρα","η αναπνοή ρέει μόνη της","το σώμα ξέρει τον ρυθμό"],
  en: ["feel your weight","soften your gaze","earth holds you","open awareness","surrender to rhythm","here, now","breath flows by itself","body knows the rhythm"]
};
const B_UI_TEXT = {
  el: { play:'▶ Ξεκίνα', pause:'⏸ Παύση', reset:'↺ Επαναφορά', timer:'Χρόνος', cycles:'Κύκλοι', total:'Σύνολο', today:'Σήμερα', streak:'Ημ. Φροντίδας', min:'Λεπτά' },
  en: { play:'▶ Start', pause:'⏸ Pause', reset:'↺ Reset', timer:'Time', cycles:'Cycles', total:'Total', today:'Today', streak:'Care Days', min:'Minutes' }
};

let bRunning = false, bPhaseIdx = 0, bPhaseStart = 0, bArmPos = 0;
let bCycles = 0, bSeconds = 0, bLastTs = 0, bAnimId = null;
let bCues = [], bLastCueTime = 0, bTime = 0;
let bLastCountSec = -1;
let bCanvas, bCtx, bInited = false;

function bEase(x) { return x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x+2,3)/2; }

// Session history
function bLoadHist() { try { return JSON.parse(localStorage.getItem('breath_history')) || {sessions:[],totalMin:0}; } catch { return {sessions:[],totalMin:0}; } }
function bSaveHist(h) { localStorage.setItem('breath_history', JSON.stringify(h)); }
function bTodayStr() { return new Date().toISOString().split('T')[0]; }
function bStreak(sessions) {
  if (!sessions.length) return 0;
  var seen = {};
  sessions.forEach(function(s) { if (s.date) seen[s.date] = true; });
  return Object.keys(seen).length;
}
function bRecordSession(cycles, secs) {
  const h = bLoadHist();
  h.sessions.push({ date:bTodayStr(), cycles, seconds:Math.round(secs), ts:Date.now() });
  h.totalMin = Math.round((h.totalMin||0) + secs/60);
  bSaveHist(h);
  bUpdateHistUI();
  // Also write for journal integration
  try {
    const data = JSON.parse(localStorage.getItem('breath_sessions')||'{}');
    const now = new Date(), day = now.getDay();
    const diff = now.getDate() - day + (day===0?-6:1);
    const monday = new Date(new Date(now).setDate(diff));
    const key = monday.toISOString().split('T')[0] + '_' + ((now.getDay()+6)%7);
    data[key] = (data[key]||0) + 1;
    localStorage.setItem('breath_sessions', JSON.stringify(data));
  } catch(e){}
  // Also update main stats
  recordSession(Math.max(1, Math.round(secs/60)));
}
function bUpdateHistUI() {
  const h = bLoadHist();
  const today = bTodayStr();
  const todayN = h.sessions.filter(s=>s.date===today).length;
  document.getElementById('bHistTotal').textContent = h.sessions.length;
  document.getElementById('bHistToday').textContent = todayN;
  document.getElementById('bHistStreak').textContent = bStreak(h.sessions);
  document.getElementById('bHistMin').textContent = h.totalMin||0;
  const ui = B_UI_TEXT[LANG];
  document.getElementById('bHistTotalLbl').textContent = ui.total;
  document.getElementById('bHistTodayLbl').textContent = ui.today;
  document.getElementById('bHistStreakLbl').textContent = ui.streak;
  document.getElementById('bHistMinLbl').textContent = ui.min;
}

function updateBreathLang() {
  const ui = B_UI_TEXT[LANG];
  document.getElementById('bTimerLbl').textContent = ui.timer;
  document.getElementById('bCyclesLbl').textContent = ui.cycles;
  const btn = document.getElementById('bPlayBtn');
  btn.textContent = bRunning ? ui.pause : ui.play;
  document.getElementById('bResetBtn').textContent = ui.reset;
  const ph = B_PHASE_LABELS[LANG][B_PHASES[bPhaseIdx].labelKey];
  document.getElementById('bPhaseName').textContent = ph.label;
  document.getElementById('bPhaseSub').textContent = ph.sub;
  // Show initial countdown dots
  const totalSecs = Math.round(B_PHASES[bPhaseIdx].dur / 1000);
  document.getElementById('bcNumber').textContent = bRunning ? '' : '';
  let initDots = '';
  for (let i = 0; i < totalSecs; i++) initDots += '<span class="bc-dot"></span>';
  document.getElementById('bcDots').innerHTML = initDots;
  bUpdateHistUI();
  var safeEl = document.getElementById('bSafetyNote');
  if (safeEl) safeEl.textContent = t('breathSafety') + ' ' + t('pauseAnytime');
  // Update pattern purpose labels and description for current language
  if (typeof updatePatternPurposeLabels === 'function') updatePatternPurposeLabels();
  var p = B_PATTERNS[bCurrentPattern];
  var descEl = document.getElementById('bPatternDesc');
  if (descEl && p) descEl.textContent = LANG === 'el' ? p.desc_el : p.desc_en;
}

function bResizeCanvas() {
  if (!bCanvas) return;
  const rect = bCanvas.getBoundingClientRect();
  if (rect.width === 0) return;
  const dpr = Math.min(devicePixelRatio||1, 2);
  bCanvas.width = rect.width * dpr;
  bCanvas.height = rect.height * dpr;
  bCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function bUpdatePhase(now) {
  if (!bRunning) return;
  const elapsed = now - bPhaseStart;
  const phase = B_PHASES[bPhaseIdx];
  const progress = Math.min(elapsed / phase.dur, 1);
  const ep = bEase(progress);
  bArmPos = phase.armFrom + (phase.armTo - phase.armFrom) * ep;
  const ph = B_PHASE_LABELS[LANG][phase.labelKey];
  document.getElementById('bPhaseName').textContent = ph.label;
  document.getElementById('bPhaseSub').textContent = ph.sub;

  // Countdown: total seconds for this phase
  const totalSecs = Math.round(phase.dur / 1000);
  const elapsedSecs = Math.min(Math.floor(elapsed / 1000), totalSecs - 1);
  const currentCount = elapsedSecs + 1;

  // Per-second gentle tick vibration
  if (typeof bLastCountSec === 'undefined') bLastCountSec = -1;
  if (currentCount !== bLastCountSec) {
    bLastCountSec = currentCount;
    if (!document.body.classList.contains('reduce-motion')) hapticPulse(8, 180);
  }

  // Update number
  document.getElementById('bcNumber').textContent = currentCount;

  // Update dots
  const dotsEl = document.getElementById('bcDots');
  let dotsHtml = '';
  for (let i = 0; i < totalSecs; i++) {
    const cls = i < elapsedSecs ? 'bc-dot filled' : (i === elapsedSecs ? 'bc-dot current' : 'bc-dot');
    dotsHtml += '<span class="' + cls + '"></span>';
  }
  dotsEl.innerHTML = dotsHtml;

  if (progress >= 1) {
    bPhaseIdx = (bPhaseIdx + 1) % 4;
    bPhaseStart = now;
    if (!document.body.classList.contains('reduce-motion')) {
      // Inhale: gentle rising pulses, Hold: steady, Exhale: long slow, Rest: soft tap
      var vp = [
        [15,40,20,40,25,40,30],  // Inhale — rising intensity
        [20,50,20],               // Hold — calm double
        [40,30,35,30,30,30,25,30,20,30,15], // Exhale — fading wave
        [50]                      // Rest — single grounding pulse
      ];
      breathVibrate(vp[bPhaseIdx]);
    }
    if (bPhaseIdx === 0) {
      bCycles++;
      document.getElementById('bCycles').textContent = bCycles;
    }
  }
}

function bUpdateTimer(now) {
  if (!bRunning) return;
  if (bLastTs === 0) { bLastTs = now; return; }
  const d = Math.min(now - bLastTs, 100);
  if (d > 0) {
    bSeconds += d / 1000;
    const m = Math.floor(bSeconds/60), s = Math.floor(bSeconds%60);
    document.getElementById('bTimer').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  bLastTs = now;
}

function bDraw() {
  if (!bCanvas || !bCanvas.width || !bCanvas.height) return;
  const dpr = Math.min(devicePixelRatio||1, 2);
  const w = bCanvas.width / dpr, h = bCanvas.height / dpr;
  bCtx.clearRect(0, 0, w, h);
  const cx = w / 2, groundY = h * 0.48;
  const sc = Math.min(w / 220, h / 300);
  const pulse = Math.sin(bTime * 1.2) * 0.5 + 0.5;
  bCtx.save();
  bCtx.translate(cx, groundY);
  bCtx.scale(sc, sc);
  bCtx.lineCap = 'round'; bCtx.lineJoin = 'round';

  // Gravity axis
  const axTop = -146, axBot = 70;
  const ag = bCtx.createLinearGradient(0,axTop,0,axBot);
  ag.addColorStop(0,'rgba(220,190,60,0)'); ag.addColorStop(0.05,'rgba(220,190,60,0.18)');
  ag.addColorStop(0.5,'rgba(220,190,60,0.32)'); ag.addColorStop(0.95,'rgba(220,190,60,0.18)');
  ag.addColorStop(1,'rgba(220,190,60,0)');
  bCtx.strokeStyle=ag; bCtx.lineWidth=2.2; bCtx.beginPath(); bCtx.moveTo(0,axTop); bCtx.lineTo(0,axBot); bCtx.stroke();
  bCtx.strokeStyle='rgba(220,190,60,0.04)'; bCtx.lineWidth=12; bCtx.beginPath(); bCtx.moveTo(0,axTop); bCtx.lineTo(0,axBot); bCtx.stroke();

  // Globe
  const gR=44, gY=0;
  const gg=bCtx.createRadialGradient(-10,gY-8,5,0,gY,gR);
  gg.addColorStop(0,'rgba(180,160,80,0.28)'); gg.addColorStop(0.5,'rgba(50,120,100,0.22)'); gg.addColorStop(1,'rgba(30,70,80,0.18)');
  bCtx.fillStyle=gg; bCtx.beginPath(); bCtx.arc(0,gY,gR,0,Math.PI*2); bCtx.fill();
  bCtx.strokeStyle='rgba(100,160,140,0.18)'; bCtx.lineWidth=1.5; bCtx.stroke();
  bCtx.fillStyle='rgba(160,140,60,0.08)';
  bCtx.beginPath(); bCtx.ellipse(-12,gY-5,18,12,-0.2,0,Math.PI*2); bCtx.fill();
  bCtx.beginPath(); bCtx.ellipse(15,gY+8,10,8,0.3,0,Math.PI*2); bCtx.fill();

  // Phase arc
  if (bRunning) {
    const pP = Math.min((performance.now()-bPhaseStart)/B_PHASES[bPhaseIdx].dur,1);
    const aS=-Math.PI/2, aE=aS+pP*Math.PI*2;
    const aC=['rgba(168,213,220,0.3)','rgba(180,180,180,0.15)','rgba(220,190,60,0.3)','rgba(180,180,180,0.12)'];
    bCtx.strokeStyle=aC[bPhaseIdx]; bCtx.lineWidth=2.8; bCtx.beginPath(); bCtx.arc(0,gY,gR+6,aS,aE); bCtx.stroke();
  }

  // Lotus legs
  const sY=-gR+5, pY=sY-8;
  bCtx.fillStyle='rgba(40,60,50,0.85)'; bCtx.beginPath();
  bCtx.moveTo(-32,sY+5); bCtx.quadraticCurveTo(-37,sY+18,-27,sY+24);
  bCtx.quadraticCurveTo(-5,sY+27,0,sY+15); bCtx.quadraticCurveTo(5,sY+27,27,sY+24);
  bCtx.quadraticCurveTo(37,sY+18,32,sY+5); bCtx.quadraticCurveTo(16,sY-2,0,pY);
  bCtx.quadraticCurveTo(-16,sY-2,-32,sY+5); bCtx.fill();
  bCtx.strokeStyle='rgba(30,50,40,0.22)'; bCtx.lineWidth=1;
  bCtx.beginPath(); bCtx.moveTo(-22,sY+10); bCtx.quadraticCurveTo(0,sY+22,22,sY+10); bCtx.stroke();

  // Torso
  const wY=pY-22, cY=wY-28, shY=cY-12;
  bCtx.fillStyle='rgba(60,85,75,0.8)'; bCtx.beginPath();
  bCtx.moveTo(-24,pY); bCtx.quadraticCurveTo(-27,wY,-26,cY); bCtx.lineTo(-22,shY);
  bCtx.lineTo(22,shY); bCtx.lineTo(26,cY); bCtx.quadraticCurveTo(27,wY,24,pY); bCtx.closePath(); bCtx.fill();
  bCtx.strokeStyle='rgba(30,50,40,0.18)'; bCtx.lineWidth=1;
  bCtx.beginPath(); bCtx.moveTo(0,shY+5); bCtx.lineTo(0,pY); bCtx.stroke();

  // Arms
  const aAng=bArmPos*Math.PI, aL1=30, aL2=28;
  for (let side=-1;side<=1;side+=2) {
    const sx=side*22, sy=shY+3, ang=Math.PI/2-aAng;
    const eX=sx+Math.cos(ang)*side*aL1*0.7, eY=sy+Math.sin(ang)*aL1;
    const hx=eX+Math.cos(ang)*side*aL2*0.5, hy=eY+Math.sin(ang)*aL2*0.7;
    bCtx.fillStyle=`rgba(55,80,70,${0.6+bArmPos*0.15})`; bCtx.beginPath();
    bCtx.moveTo(sx-side*5,sy); bCtx.lineTo(sx+side*5,sy);
    bCtx.lineTo(eX+side*3.5,eY); bCtx.lineTo(eX-side*3.5,eY); bCtx.closePath(); bCtx.fill();
    bCtx.strokeStyle=`rgba(200,170,120,${0.5+bArmPos*0.2})`; bCtx.lineWidth=3.5;
    bCtx.beginPath(); bCtx.moveTo(eX,eY); bCtx.lineTo(hx,hy); bCtx.stroke();
    bCtx.fillStyle=`rgba(200,170,120,${0.4+bArmPos*0.2})`;
    bCtx.beginPath(); bCtx.arc(hx,hy,4.5,0,Math.PI*2); bCtx.fill();
    if (bArmPos>0.1 && bRunning) {
      bCtx.strokeStyle=`rgba(168,213,220,${bArmPos*0.07})`; bCtx.lineWidth=7;
      bCtx.beginPath(); bCtx.moveTo(sx,sy); bCtx.quadraticCurveTo(eX,eY,hx,hy); bCtx.stroke();
    }
  }
  // Mudra
  if (bArmPos<0.15) {
    const mY=wY+16;
    bCtx.fillStyle='rgba(200,170,120,0.4)'; bCtx.beginPath(); bCtx.ellipse(0,mY,9,5.5,0,0,Math.PI*2); bCtx.fill();
    bCtx.strokeStyle='rgba(180,150,100,0.25)'; bCtx.lineWidth=1;
    bCtx.beginPath(); bCtx.arc(0,mY,5.5,0.2,Math.PI-0.2); bCtx.stroke();
  }

  // Infinity symbol
  const iY=cY+9, iR=9;
  const iCo=['rgba(220,60,60,0.35)','rgba(220,180,40,0.35)','rgba(60,180,60,0.35)','rgba(60,60,220,0.35)','rgba(180,60,180,0.35)'];
  bCtx.lineWidth=2;
  for (let i=0;i<5;i++) { const o=(i-2)*0.9; bCtx.strokeStyle=iCo[i]; bCtx.beginPath(); bCtx.moveTo(0,iY+o);
    bCtx.bezierCurveTo(-iR*1.2,iY-iR+o,-iR*1.2,iY+iR+o,0,iY+o);
    bCtx.bezierCurveTo(iR*1.2,iY-iR+o,iR*1.2,iY+iR+o,0,iY+o); bCtx.stroke(); }

  // Head & hood
  const nY=shY-9, hdY=nY-20, hdR=17, htop=hdY-hdR-7;
  bCtx.fillStyle='rgba(200,170,120,0.7)'; bCtx.fillRect(-5.5,nY,11,shY-nY);
  bCtx.fillStyle='rgba(60,85,75,0.8)'; bCtx.beginPath();
  bCtx.moveTo(-24,shY); bCtx.quadraticCurveTo(-26,nY-5,-22,hdY);
  bCtx.quadraticCurveTo(-17,htop,0,htop-3); bCtx.quadraticCurveTo(17,htop,22,hdY);
  bCtx.quadraticCurveTo(26,nY-5,24,shY); bCtx.fill();
  bCtx.strokeStyle='rgba(30,50,40,0.18)'; bCtx.lineWidth=1.2; bCtx.beginPath();
  bCtx.moveTo(-20,shY-2); bCtx.quadraticCurveTo(-22,hdY+5,-15,hdY-5);
  bCtx.quadraticCurveTo(0,hdY-hdR-2,15,hdY-5); bCtx.quadraticCurveTo(22,hdY+5,20,shY-2); bCtx.stroke();
  bCtx.fillStyle='rgba(200,170,120,0.65)'; bCtx.beginPath(); bCtx.arc(0,hdY,hdR-3,-0.3,Math.PI+0.3); bCtx.fill();
  bCtx.strokeStyle='rgba(80,60,40,0.4)'; bCtx.lineWidth=1.3;
  bCtx.beginPath(); bCtx.moveTo(-8,hdY+1); bCtx.quadraticCurveTo(-5.5,hdY+3.5,-3,hdY+1); bCtx.stroke();
  bCtx.beginPath(); bCtx.moveTo(3,hdY+1); bCtx.quadraticCurveTo(5.5,hdY+3.5,8,hdY+1); bCtx.stroke();
  bCtx.strokeStyle='rgba(80,60,40,0.18)'; bCtx.lineWidth=0.9;
  bCtx.beginPath(); bCtx.moveTo(-4.5,hdY+7.5); bCtx.quadraticCurveTo(0,hdY+10,4.5,hdY+7.5); bCtx.stroke();

  // Tantien
  const tY=wY+9;
  const tg=bCtx.createRadialGradient(0,tY,0,0,tY,14+pulse*5);
  tg.addColorStop(0,`rgba(80,200,160,${0.15+bArmPos*0.1})`);
  tg.addColorStop(0.6,`rgba(80,200,160,${0.05+bArmPos*0.05})`);
  tg.addColorStop(1,'rgba(80,200,160,0)');
  bCtx.fillStyle=tg; bCtx.beginPath(); bCtx.arc(0,tY,14+pulse*5,0,Math.PI*2); bCtx.fill();

  // Aura
  if (bRunning && bArmPos>0.15) {
    for (let i=0;i<3;i++) { const rr=((bTime*7+i*40)%140); const ra=Math.max(0,1-rr/140)*bArmPos*0.055;
      bCtx.strokeStyle=`rgba(168,213,220,${ra})`; bCtx.lineWidth=0.8;
      bCtx.beginPath(); bCtx.arc(0,cY-5,rr,0,Math.PI*2); bCtx.stroke(); } }

  // Stars
  for (let i=0;i<14;i++) { const sx2=Math.sin(i*2.1+bTime*0.08)*160, sy2=-155-i*10+Math.cos(i*1.5)*35;
    bCtx.fillStyle=`rgba(220,230,240,${0.08+Math.sin(bTime*0.7+i)*0.04})`;
    bCtx.beginPath(); bCtx.arc(sx2,sy2,1.3,0,Math.PI*2); bCtx.fill(); }

  bCtx.restore();

  // Floating cues
  if (bRunning && bCues.length) {
    const ns = performance.now()/1000;
    for (let i=bCues.length-1;i>=0;i--) {
      const c=bCues[i], age=ns-c.born;
      if (age>6) { bCues.splice(i,1); continue; }
      const alpha = age<0.8 ? age/0.8 : (age>4 ? (6-age)/2 : 1);
      bCtx.save(); bCtx.globalAlpha=Math.max(0,alpha*0.3);
      bCtx.font="italic 13px 'Fraunces',Georgia,serif"; bCtx.fillStyle='#A8D5DC'; bCtx.textAlign='center';
      bCtx.fillText(c.text,c.x,c.y-age*7); bCtx.restore();
    }
  }
  bTime += 0.016;
}

function bMaybeCue(now) {
  if (!bRunning || now-bLastCueTime<5000) return;
  bLastCueTime = now;
  const texts = B_CUES[LANG];
  const text = texts[Math.floor(Math.random()*texts.length)];
  const dpr = Math.min(devicePixelRatio||1,2);
  const w2=bCanvas.width/dpr, h2=bCanvas.height/dpr;
  bCues.push({text, x:20+Math.random()*(w2-40), y:h2*0.5+Math.random()*(h2*0.25), born:now/1000});
  if (bCues.length>5) bCues.shift();
}

function bAnimate(ts) {
  if (!bCanvas.width) bResizeCanvas();
  if (bRunning) { bUpdatePhase(ts); bUpdateTimer(ts); bMaybeCue(ts); }
  bDraw();
  bAnimId = requestAnimationFrame(bAnimate);
}

function bStart() {
  if (bRunning) return;
  bRunning = true;
  bPhaseStart = performance.now();
  bLastTs = bPhaseStart;
  document.getElementById('bPlayBtn').textContent = B_UI_TEXT[LANG].pause;
  breathVibrate([50,30,50]);
}

function bPause() {
  if (!bRunning) return;
  bRunning = false;
  document.getElementById('bPlayBtn').textContent = B_UI_TEXT[LANG].play;
  if (bCycles > 0) bRecordSession(bCycles, bSeconds);
}

function bReset() {
  const was = bRunning;
  if (was) { bRunning = false; if (bCycles>0) bRecordSession(bCycles, bSeconds); }
  bPhaseIdx=0; bArmPos=0; bCycles=0; bSeconds=0; bCues=[]; bLastCueTime=0; bLastCountSec=-1;
  document.getElementById('bTimer').textContent = '00:00';
  document.getElementById('bCycles').textContent = '0';
  const now = performance.now(); bPhaseStart=now; bLastTs=now;
  const ph = B_PHASE_LABELS[LANG][0];
  document.getElementById('bPhaseName').textContent = ph.label;
  document.getElementById('bPhaseSub').textContent = ph.sub;
  document.getElementById('bPlayBtn').textContent = B_UI_TEXT[LANG].play;
  if (!was) bDraw();
}

function switchPattern(key) {
  if (bRunning) return; // Don't switch while running
  tapFeedback();
  bCurrentPattern = key;
  B_PHASES = B_PATTERNS[key].phases;
  var p = B_PATTERNS[key];
  var descEl = document.getElementById('bPatternDesc');
  if (descEl) descEl.textContent = LANG === 'el' ? p.desc_el : p.desc_en;
  document.querySelectorAll('.breath-pattern-btn').forEach(function(btn){
    btn.classList.toggle('active', btn.dataset.pattern === key);
  });
  updatePatternPurposeLabels();
  // Only reset if breath canvas is initialized
  if (bCanvas) bReset();
}

function updatePatternPurposeLabels() {
  document.querySelectorAll('.breath-pattern-btn').forEach(function(btn){
    var key = btn.dataset.pattern;
    var p = B_PATTERNS[key];
    var purposeEl = btn.querySelector('.bp-purpose');
    if (purposeEl && p) {
      purposeEl.textContent = LANG === 'el' ? p.purpose_el : p.purpose_en;
    }
  });
}

function initBreathExercise() {
  bCanvas = document.getElementById('breathCanvas');
  if (!bCanvas) return;
  bCtx = bCanvas.getContext('2d');
  
  // Retry resize until canvas has dimensions
  var retries = 0;
  function tryResize() {
    bResizeCanvas();
    if ((!bCanvas.width || !bCanvas.height) && retries < 10) {
      retries++;
      setTimeout(tryResize, 100);
    } else {
      bDraw();
    }
  }
  tryResize();
  if (!bInited) {
    document.getElementById('bPlayBtn').addEventListener('click', () => bRunning ? bPause() : bStart());
    document.getElementById('bResetBtn').addEventListener('click', bReset);
    window.addEventListener('resize', () => { if (document.getElementById('screen-breath').classList.contains('active')) { bResizeCanvas(); bDraw(); } });
    bInited = true;
  }
  bUpdateHistUI();
  updateBreathLang();
  var p = B_PATTERNS[bCurrentPattern];
  var descEl = document.getElementById('bPatternDesc');
  if (descEl) descEl.textContent = LANG === 'el' ? p.desc_el : p.desc_en;
  if (!bAnimId) bAnimId = requestAnimationFrame(bAnimate);
}

// ══════════════════════════════════════════════
// CELEBRATION
// ══════════════════════════════════════════════
function showCelebrate() {
  const mins = Math.floor(bSeconds / 60);
  const secs = Math.floor(bSeconds % 60);
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  // Celebrate overlay removed in v2 - just record
}
