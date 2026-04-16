/* ═══ js/screens/widget.js ═══ */
function buildWidgetScreen() {
  const screen = document.getElementById('screen-widget');
  screen.innerHTML = `
    <div class="widget-container">
        <div class="widget-clock" id="widgetClock">00:00</div>
        <div class="widget-grid" id="widgetGrid">
          <div class="widget-item" id="axis-body" onclick="showScreen('home')">🧍<br><span class="axis-label">${t('axes')[0].label.replace('🧍 ','')}</span></div>
          <div class="widget-item" id="axis-breath" onclick="showScreen('home')">🫁<br><span class="axis-label">${t('axes')[1].label.replace('🫁 ','')}</span></div>
          <div class="widget-item" id="axis-focus" onclick="showScreen('home')">👁<br><span class="axis-label">${t('axes')[2].label.replace('👁 ','')}</span></div>
          <div class="widget-item" id="axis-space" onclick="showScreen('home')">✦<br><span class="axis-label">${t('axes')[3].label.replace('✦ ','')}</span></div>
          <div class="widget-item breath-btn" onclick="showScreen('breath')">🌬<br><span class="axis-label">Breath</span></div>
        </div>
        <div class="widget-nudge" id="widgetNudge"></div>
      </div>
    </div>
    <style>
      .widget-container { padding: 20px; text-align: center; background: var(--bg-card); border-radius: 24px; }
      .widget-clock { font-size: 4.5rem; font-weight: 200; margin-bottom: 20px; font-family: 'Inter', sans-serif; color: var(--text-primary); }
      .widget-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; }
      .widget-item { background: var(--bg-soft); padding: 10px 5px; border-radius: 12px; cursor: pointer; font-size: 1.2rem; color: var(--text-secondary); transition: all 0.3s ease; border: 2px solid transparent; }
      .axis-label { font-size: 0.65rem; display: block; margin-top: 4px; color: var(--text-muted); }
      .breath-btn { grid-column: span 4; background: var(--teal); color: white; font-size: 1.5rem; }
      .widget-item.active { border-color: var(--teal); box-shadow: 0 0 15px rgba(44, 110, 107, 0.4); transform: scale(1.05); }
      .widget-nudge { font-size: 0.85rem; color: var(--teal); font-style: italic; margin-top: 10px; }
    </style>
  `;
  updateWidgetClock();
  setInterval(updateWidgetClock, 1000);
  updateWidgetHighlight();
}

function updateWidgetClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const clock = document.getElementById('widgetClock');
  if (clock) clock.textContent = timeStr;
}

function updateWidgetHighlight() {
  const data = typeof loadCompanionData === 'function' ? loadCompanionData() : {};
  const week = data.lastChapter ? Math.ceil(data.lastChapter / 1.25) : 1; // Simple mapping
  
  const axisMap = { 1: 'body', 2: 'body', 3: 'breath', 4: 'breath', 5: 'focus', 6: 'focus', 7: 'space', 8: 'space' };
  const activeAxis = axisMap[week] || 'body';
  
  document.querySelectorAll('.widget-item').forEach(el => el.classList.remove('active'));
  const el = document.getElementById('axis-' + activeAxis);
  if (el) el.classList.add('active');
  
  const nudge = document.getElementById('widgetNudge');
  if (nudge) nudge.textContent = `Εβδομάδα ${week} · Εστίαση στον άξονα: ${activeAxis.toUpperCase()}`;
}
