/* ═══ js/screens/chapters.js ═══ */
function buildChaptersList() {
  const screen = document.getElementById('screen-chapters');
  const chs = CHAPTERS_DATA[LANG] || CHAPTERS_DATA.el;
  const programTitle = LANG === 'el' ? 'Πρόγραμμα 8 Εβδομάδων' : '8-Week Program';
  const programSub = LANG === 'el' ? 'Ολοκληρωμένη πρακτική Τετραπλού Άξονα' : 'Complete Fourfold Axis practice';
  screen.innerHTML = `
    <div class="scroll-area">
      <div class="screen-header">
        <button class="back-btn" onclick="goBack()">←</button>
        <div class="screen-title">${t('menuChapters')}</div>
      </div>
      <div class="ch-list">
        ${chs.map((ch,i) => `
          <button class="ch-item" onclick="openChapter(${ch.num})">
            <div class="ch-num" style="background:${ch.hex}">${ch.icon}</div>
            <div class="ch-info">
              <div class="ch-title">${LANG==='el'?'Βήμα':'Step'} ${ch.num}: ${ch.title}</div>
              <div class="ch-sub">${ch.sub}</div>
            </div>
            <div class="ch-arrow">›</div>
          </button>
        `).join('')}
      </div>
      <!-- 8-Week Program Card -->
      <div style="padding:8px 16px 0">
        <button class="ch-item" onclick="openLearningToRide()" style="border:1.5px solid var(--teal);background:rgba(42,93,94,0.04)">
          <div class="ch-num" style="background:var(--teal)">◎</div>
          <div class="ch-info">
            <div class="ch-title" style="color:var(--teal)">${programTitle}</div>
            <div class="ch-sub">${programSub}</div>
          </div>
          <div class="ch-arrow">›</div>
        </button>
      </div>
      <div class="spacer-bottom"></div>
    </div>`;
}

function openChapter(num) {
  const chs = CHAPTERS_DATA[LANG] || CHAPTERS_DATA.el;
  const ch = chs[num - 1];
  if (!ch) return;

  const practices = CHAPTER_PRACTICES[num] || [];
  const allPractices = T[LANG]?.practices || T.el.practices;

  const practiceCards = practices.map(id => {
    const p = allPractices.find(x => x.id === id);
    if (!p) return '';
    return `<button class="practice-card" onclick="openPracticeItem('${p.file}')" style="margin:0">
      <div class="practice-icon-wrap" style="background:${p.axisColor}22">${p.icon}</div>
      <div style="flex:1"><div class="practice-name">${p.name}</div><div class="practice-desc">${p.desc}</div></div>
    </button>`;
  }).join('');

  const screen = document.getElementById('screen-chapter');
  screen.innerHTML = `
    <div class="scroll-area">
      <div class="screen-header">
        <button class="back-btn" onclick="showScreen('chapters')">←</button>
        <div class="screen-title">${ch.icon} ${ch.title}</div>
      </div>
      <div class="content-card">
        <p style="font-style:italic;margin-bottom:12px">${ch.summary}</p>
      </div>
      ${ch.theorySections.map(s => `
        <div class="content-card">
          <h3>${s.title}</h3>
          <p>${window.c2LinkConcepts(s.body.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>'), LANG)}</p>
        </div>
      `).join('')}
      ${ch.exercise ? `
        <div class="content-card" style="border-left:3px solid ${ch.hex}">
          <h3>${ch.exercise.title}</h3>
          <ol style="margin:8px 0 0 16px;font-size:13px;color:var(--text-soft);line-height:1.8">
            ${ch.exercise.steps.map(s => `<li>${s}</li>`).join('')}
          </ol>
        </div>
      ` : ''}
      ${ch.insight ? `<div class="content-card" style="text-align:center;font-style:italic;color:var(--teal)">${ch.insight}</div>` : ''}

      ${(CHAPTER_TAKEAWAYS[LANG]||CHAPTER_TAKEAWAYS.el)[num] ? `
      <div class="content-card" style="border-left:3px solid var(--sage);background:rgba(42,93,94,0.03)">
        <h3 style="color:var(--sage)">${t('chTakeaway')}</h3>
        <div style="font-size:13px;color:var(--text-soft);line-height:1.8">
          ${((CHAPTER_TAKEAWAYS[LANG]||CHAPTER_TAKEAWAYS.el)[num]||[]).map(function(tk){ return '✓ ' + tk; }).join('<br>')}
        </div>
      </div>` : ''}

      <div style="padding:0 16px;text-align:center">
        <button class="btn-primary" onclick="microCat='${CHAPTER_MICRO_CAT[num]||'all'}';microIdx=0;showScreen('micro')" style="width:100%;justify-content:center">${t('chTryNow')}</button>
      </div>

      ${practiceCards ? `<div style="padding:0 16px"><div style="font-size:12px;font-weight:700;color:var(--text-hint);margin:12px 0 8px;text-transform:uppercase;letter-spacing:1px">${t('chPracticesLabel')}</div><div style="display:flex;flex-direction:column;gap:8px">${practiceCards}</div></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:16px 16px 40px">
        ${num > 1 ? `<button class="btn-secondary" onclick="openChapter(${num-1})">← ${t('prev')}</button>` : '<div></div>'}
        ${num < chs.length ? `<button class="btn-primary" onclick="openChapter(${num+1})">${t('next')} →</button>` : '<div></div>'}
      </div>
      <div id="ch-nudge" style="display:none;margin:0 16px 24px;padding:14px;background:rgba(42,93,94,0.06);border-radius:var(--radius);text-align:center;border:1px dashed var(--teal)">
        <p style="font-size:13px;color:var(--text);line-height:1.6;margin-bottom:10px">${t('chNudge')}</p>
        <button class="btn-primary" onclick="microCat='all';microIdx=0;showScreen('micro')" style="font-size:13px;padding:10px 18px">${t('chNudgeBtn')}</button>
      </div>
      <div class="spacer-bottom"></div>
    </div>`;
  showScreen('chapter');

  // Track chapters read for gentle nudge
  var chaptersRead = JSON.parse(localStorage.getItem('chaptersRead')||'[]');
  if (chaptersRead.indexOf(num) === -1) chaptersRead.push(num);
  localStorage.setItem('chaptersRead', JSON.stringify(chaptersRead));
  var practicesDone = (stats.explored||[]).length;
  if (chaptersRead.length >= 3 && practicesDone === 0) {
    setTimeout(function(){
      var nudge = document.getElementById('ch-nudge');
      if (nudge) nudge.style.display = 'block';
    }, 2000);
  }
}

function openPracticeItem(file) {
  const practices = T[LANG]?.practices || T.el.practices;
  const ex = practices.find(p => p.file === file);
  if (ex && ex.warn) { showTW(ex.warn, file); return; }
  launchPractice(file);
}

