/* ═══ js/screens/sos.js ═══
   SOS Mode — Emergency de-escalation
   Minimal UI: black screen, slow breathing, haptic, no text
   Triggered by: always-visible button OR 3× tap
   ═══════════════════════════════════════════════════ */

var sosActive = false;
var sosTapCount = 0;
var sosTapTimeout = null;
var sosBreathPhase = 'inhale'; // inhale, hold, exhale
var sosBreathDuration = 0;

const SOS_BREATH_PATTERN = {
  inhale: { duration: 6, next: 'hold' },
  hold: { duration: 4, next: 'exhale' },
  exhale: { duration: 8, next: 'inhale' }
};

function initSOSMode() {
  // Register global 3× tap listener
  document.addEventListener('touchend', handleSOSTap);
  
  // Always-visible SOS button
  var sosBtn = document.getElementById('sos-btn');
  if (sosBtn) {
    sosBtn.addEventListener('click', activateSOSMode);
  }
}

function handleSOSTap() {
  sosTapCount++;
  
  clearTimeout(sosTapTimeout);
  sosTapTimeout = setTimeout(() => {
    sosTapCount = 0;
  }, 600); // 3 taps within 600ms

  if (sosTapCount === 3) {
    sosTapCount = 0;
    clearTimeout(sosTapTimeout);
    activateSOSMode();
  }
}

function activateSOSMode() {
  sosActive = true;
  
  // Mute all audio except SOS audio
  document.querySelectorAll('audio').forEach(a => {
    a.pause();
    a.currentTime = 0;
  });

  // Show minimal SOS screen
  var screen = document.getElementById('screen-sos');
  if (!screen) {
    // Create on demand
    var container = document.querySelector('.screens-container');
    screen = document.createElement('div');
    screen.id = 'screen-sos';
    screen.className = 'screen';
    container.appendChild(screen);
  }

  // Hide all other screens
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
  
  buildSOSScreen(screen);
  sosBreathPhase = 'inhale';
  advanceSOSBreath();
}

function buildSOSScreen(screen) {
  screen.style.cssText = `
    background: #000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0;
    color: white;
    font-family: inherit;
  `;

  screen.innerHTML = `
    <div style="
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 1000;
      cursor: pointer;
    " onclick="deactivateSOSMode()" title="Close">
      <span style="
        display: inline-block;
        font-size: 28px;
        opacity: 0.5;
        transition: opacity 0.2s;
      " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">
        ×
      </span>
    </div>

    <div id="sos-breath-circle" style="
      width: 120px;
      height: 120px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 40px;
      transition: all 0.5s ease-in-out;
      box-shadow: 0 0 30px rgba(168, 213, 220, 0.2);
    ">
      <div style="
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        text-align: center;
        line-height: 1.4;
      " id="sos-breath-label">
        <div style="font-weight: 700; margin-bottom: 4px;">Ανάπνευση</div>
        <div style="font-size: 10px;">Αργή και σταθερή</div>
      </div>
    </div>

    <div id="sos-timer" style="
      font-size: 14px;
      color: rgba(255, 255, 255, 0.4);
      margin-bottom: 60px;
      letter-spacing: 2px;
      font-weight: 700;
      text-transform: uppercase;
    ">
      3:00
    </div>

    <div style="
      position: absolute;
      bottom: 30px;
      left: 0;
      right: 0;
      padding: 0 20px;
      text-align: center;
      color: rgba(255, 255, 255, 0.3);
      font-size: 11px;
      line-height: 1.6;
    ">
      <p style="margin: 0 0 8px 0;">Είσαι ασφαλής.</p>
      <p style="margin: 0;">Κάθε αναπνοή σε κρατάει.</p>
    </div>
  `;
}

function advanceSOSBreath() {
  if (!sosActive) return;

  var config = SOS_BREATH_PATTERN[sosBreathPhase];
  var circle = document.getElementById('sos-breath-circle');
  var label = document.getElementById('sos-breath-label');
  
  if (!circle || !label) return;

  // Haptic pulse on breath phase change
  if (navigator.vibrate) {
    navigator.vibrate(sosBreathPhase === 'hold' ? [20] : [40, 20]);
  }

  // Update circle scale
  if (sosBreathPhase === 'inhale') {
    circle.style.transform = 'scale(1)';
    circle.style.boxShadow = '0 0 30px rgba(168, 213, 220, 0.2)';
    label.innerHTML = '<div style="font-weight: 700; margin-bottom: 4px;">Εισπνοή</div><div style="font-size: 10px;">σταθερά</div>';
  } else if (sosBreathPhase === 'hold') {
    circle.style.transform = 'scale(1.05)';
    circle.style.boxShadow = '0 0 40px rgba(168, 213, 220, 0.4)';
    label.innerHTML = '<div style="font-weight: 700; margin-bottom: 4px;">Κράτησε</div><div style="font-size: 10px;">χωρίς πίεση</div>';
  } else if (sosBreathPhase === 'exhale') {
    circle.style.transform = 'scale(0.95)';
    circle.style.boxShadow = '0 0 20px rgba(168, 213, 220, 0.1)';
    label.innerHTML = '<div style="font-weight: 700; margin-bottom: 4px;">Εκπνοή</div><div style="font-size: 10px;">αργή και βαθειά</div>';
  }

  // Count down breath phase
  var remaining = config.duration;
  sosBreathDuration = remaining;

  var breathTimer = setInterval(function() {
    remaining--;
    sosBreathDuration = remaining;

    if (remaining <= 0) {
      clearInterval(breathTimer);
      sosBreathPhase = config.next;
      
      // Continue if still active
      if (sosActive) {
        setTimeout(advanceSOSBreath, 200);
      }
    }
  }, 1000);

  // Auto-update timer display
  updateSOSTimer();
}

function updateSOSTimer() {
  if (!sosActive) return;

  var timerEl = document.getElementById('sos-timer');
  if (!timerEl) return;

  var minutes = Math.floor(sosBreathDuration / 60);
  var seconds = sosBreathDuration % 60;
  timerEl.textContent = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;

  if (sosActive) {
    setTimeout(updateSOSTimer, 100);
  }
}

function deactivateSOSMode() {
  sosActive = false;
  sosTapCount = 0;
  clearTimeout(sosTapTimeout);

  // Return to previous screen
  var previousScreen = screenHistory[screenHistory.length - 2] || 'home';
  showScreen(previousScreen);
}

// ═══════════════════════════════════════════════════
// REGISTER SOS BUTTON IN HTML
// ═══════════════════════════════════════════════════
// Call this in index.html or init.js to add the SOS button to the top bar
function registerSOSButton() {
  var topBar = document.querySelector('.top-bar-inner');
  if (!topBar) return;

  var sosBtn = document.createElement('button');
  sosBtn.id = 'sos-btn';
  sosBtn.className = 'sos-button';
  sosBtn.title = 'Κρίση: Πάτησε ή τάπ 3 φορές';
  sosBtn.style.cssText = `
    position: absolute;
    right: 60px;
    top: 50%;
    transform: translateY(-50%);
    background: #dc2626;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
    z-index: 100;
  `;
  sosBtn.innerHTML = '🆘';
  sosBtn.addEventListener('click', activateSOSMode);
  sosBtn.addEventListener('mouseover', function() {
    this.style.boxShadow = '0 4px 16px rgba(220, 38, 38, 0.5)';
  });
  sosBtn.addEventListener('mouseout', function() {
    this.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.3)';
  });

  topBar.appendChild(sosBtn);
}
