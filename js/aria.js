/* ═══ js/aria.js ═══
   Accessibility module for WCAG 2.2 AA compliance
   - Semantic roles & labels for screen readers
   - aria-live regions for dynamic updates
   - aria-current for active navigation
   - Keyboard navigation support
   ═══════════════════════════════════════════════════════════════ */

// ═══ INITIALIZATION ═══
function initARIA() {
  setupMainRoles();
  setupNavigation();
  setupScreenRegions();
  setupLiveRegions();
  setupKeyboardNav();
  setupFocusManagement();
}

// ═══ MAIN STRUCTURAL ROLES ═══
function setupMainRoles() {
  // Top bar with title
  const topBar = document.getElementById('top-bar');
  if (topBar) {
    topBar.setAttribute('role', 'banner');
    const title = document.getElementById('top-title');
    if (title) {
      title.setAttribute('role', 'heading');
      title.setAttribute('aria-level', '1');
    }
  }

  // Navigation
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) {
    bottomNav.setAttribute('role', 'navigation');
    bottomNav.setAttribute('aria-label', 'Main navigation');
  }

  // Main content area
  const mainArea = document.querySelector('[role="main"]') || document.getElementById('main-area');
  if (!mainArea) {
    const container = document.body.querySelector('.app-container') || document.body.firstElementChild;
    if (container && !container.getAttribute('role')) {
      container.setAttribute('role', 'main');
    }
  }

  // Footer if present
  const footer = document.getElementById('footer');
  if (footer) {
    footer.setAttribute('role', 'contentinfo');
  }
}

// ═══ NAVIGATION ACCESSIBILITY ═══
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const navMap = {
    'nav-home': { label: 'Home', screen: 'home' },
    'nav-chapters': { label: 'Chapters', screen: 'chapters' },
    'nav-breath': { label: 'Breath Exercise', screen: 'breath' },
    'nav-practice': { label: 'Practices & Exercises', screen: 'practice' },
    'nav-journal': { label: 'Journal', screen: 'journal' }
  };

  navButtons.forEach(btn => {
    const id = btn.id;
    const info = navMap[id];
    if (info) {
      btn.setAttribute('aria-label', info.label);
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');
      btn.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    }
  });
}

// ═══ SCREEN & REGION ACCESSIBILITY ═══
function setupScreenRegions() {
  const screens = document.querySelectorAll('.screen');
  screens.forEach((screen, idx) => {
    const id = screen.id.replace('screen-', '');
    const label = getScreenLabel(id);
    
    screen.setAttribute('role', 'region');
    screen.setAttribute('aria-label', label);
    screen.setAttribute('aria-live', 'polite');
    screen.setAttribute('aria-atomic', 'false');
    
    // Set aria-hidden when not active
    updateScreenARIA(screen);
  });
}

function getScreenLabel(screenId) {
  const labels = {
    home: 'Home screen',
    chapters: 'Chapters and steps',
    chapter: 'Chapter details',
    breath: 'Breath exercise',
    practice: 'Exercises and practices',
    journal: 'Daily journal',
    micro: 'Quick practice doses',
    start: 'Getting started guide',
    about: 'About mindfulness',
    downloads: 'Downloads'
  };
  return labels[screenId] || screenId.charAt(0).toUpperCase() + screenId.slice(1);
}

function updateScreenARIA(screen) {
  const isActive = screen.classList.contains('active');
  if (isActive) {
    screen.setAttribute('aria-hidden', 'false');
    const heading = screen.querySelector('h1, h2, [role="heading"]');
    if (heading && heading.getAttribute('aria-level') === null) {
      heading.setAttribute('role', 'heading');
      heading.setAttribute('aria-level', '2');
    }
  } else {
    screen.setAttribute('aria-hidden', 'true');
  }
}

// ═══ LIVE REGIONS FOR DYNAMIC UPDATES ═══
function setupLiveRegions() {
  // Toast/notification area
  const notificationArea = document.getElementById('notification-area');
  if (!notificationArea) {
    const area = document.createElement('div');
    area.id = 'notification-area';
    area.setAttribute('role', 'status');
    area.setAttribute('aria-live', 'polite');
    area.setAttribute('aria-atomic', 'true');
    area.style.position = 'absolute';
    area.style.left = '-10000px';
    area.style.width = '1px';
    area.style.height = '1px';
    area.style.overflow = 'hidden';
    document.body.appendChild(area);
  }

  // Session stats updates
  const statsArea = document.getElementById('stats-area');
  if (statsArea) {
    statsArea.setAttribute('role', 'status');
    statsArea.setAttribute('aria-live', 'polite');
    statsArea.setAttribute('aria-label', 'Session statistics');
  }

  // Progress tracking
  const progressArea = document.querySelector('[role="progressbar"]') || document.querySelector('.progress-area');
  if (progressArea && !progressArea.getAttribute('role')) {
    progressArea.setAttribute('role', 'progressbar');
    progressArea.setAttribute('aria-valuemin', '0');
    progressArea.setAttribute('aria-valuemax', '100');
  }
}

// ═══ BUTTON & CONTROL ACCESSIBILITY ═══
function setupButtonAccessibility() {
  // State buttons (How feel now)
  document.querySelectorAll('.state-btn').forEach(btn => {
    const state = btn.textContent.match(/hyper|discon|focus|body/i);
    if (state) {
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('tabindex', '0');
      btn.setAttribute('aria-label', `Feeling ${state[0]}`);
    }
  });

  // Chapter items
  document.querySelectorAll('.ch-item').forEach((item, idx) => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    const title = item.querySelector('.ch-title');
    if (title) {
      item.setAttribute('aria-label', `Open ${title.textContent}`);
    }
  });

  // Practice cards
  document.querySelectorAll('.practice-card').forEach(card => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    const name = card.querySelector('.practice-name');
    if (name) {
      card.setAttribute('aria-label', `Practice: ${name.textContent}`);
      const explored = card.classList.contains('explored');
      if (explored) {
        card.setAttribute('aria-pressed', 'true');
      }
    }
  });

  // Toggle buttons
  document.querySelectorAll('[class*="toggle"], [onclick*="toggle"]').forEach(btn => {
    const state = btn.classList.contains('dark') || btn.textContent.includes('🌙');
    btn.setAttribute('role', 'switch');
    btn.setAttribute('aria-checked', state ? 'true' : 'false');
    if (btn.id === 'dark-toggle') {
      btn.setAttribute('aria-label', 'Toggle dark mode');
    } else if (btn.id === 'reduce-motion-toggle') {
      btn.setAttribute('aria-label', 'Toggle reduce motion');
    }
  });
}

// ═══ FORM & INPUT ACCESSIBILITY ═══
function setupFormAccessibility() {
  // Journal inputs
  document.querySelectorAll('textarea, input[type="text"], input[type="range"]').forEach(input => {
    if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
      const label = input.previousElementSibling;
      if (label && label.textContent) {
        input.setAttribute('aria-label', label.textContent);
      }
    }
  });

  // Checkboxes (journal axis checkmarks)
  document.querySelectorAll('input[type="checkbox"], [role="checkbox"]').forEach(cb => {
    const label = cb.nextElementSibling || cb.parentElement;
    if (label && label.textContent) {
      cb.setAttribute('aria-label', label.textContent);
    }
  });
}

// ═══ DYNAMIC SCREEN UPDATES ═══
function updateScreenAccessibility(screenId) {
  // Update all screens' aria-hidden
  document.querySelectorAll('.screen').forEach(screen => {
    updateScreenARIA(screen);
  });

  // Update nav aria-current
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.removeAttribute('aria-current');
  });
  
  const navMap = { home:'nav-home', chapters:'nav-chapters', chapter:'nav-chapters', breath:'nav-breath', practice:'nav-practice', journal:'nav-journal' };
  const navId = navMap[screenId];
  if (navId) {
    const navBtn = document.getElementById(navId);
    if (navBtn) {
      navBtn.setAttribute('aria-current', 'page');
    }
  }

  // Announce screen change to screen readers
  const label = getScreenLabel(screenId);
  announceToScreenReader(`${label} screen loaded`);
}

// ═══ KEYBOARD NAVIGATION ═══
function setupKeyboardNav() {
  document.addEventListener('keydown', (e) => {
    // Escape to close overlays
    if (e.key === 'Escape') {
      const overlay = document.getElementById('practice-overlay');
      if (overlay && overlay.style.display !== 'none') {
        closePractice();
        e.preventDefault();
      }
      const twOverlay = document.getElementById('tw-overlay');
      if (twOverlay && twOverlay.style.display !== 'none') {
        closeTW();
        e.preventDefault();
      }
    }

    // Tab trapping in modals
    if (document.getElementById('practice-overlay')?.style.display === 'block') {
      trapFocusInModal('practice-overlay');
    }
  });

  // Make clickable divs keyboard accessible
  setupClickableKeyboard();
}

function setupClickableKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target;
      if (target.classList.contains('ch-item') || 
          target.classList.contains('practice-card') ||
          target.classList.contains('state-btn') ||
          target.getAttribute('role') === 'button') {
        e.preventDefault();
        target.click();
      }
    }
  });
}

function trapFocusInModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}

// ═══ FOCUS MANAGEMENT ═══
function setupFocusManagement() {
  // Restore focus after overlay closes
  let previousFocus = null;

  const observeFocus = () => {
    document.addEventListener('focusin', (e) => {
      const overlay = document.getElementById('practice-overlay');
      if (overlay && overlay.style.display === 'block') {
        const iframeContainer = overlay.querySelector('iframe, .practice-iframe');
        if (!iframeContainer?.contains(e.target)) {
          previousFocus = e.target;
        }
      }
    });
  };

  observeFocus();

  // Monkey-patch closePractice to restore focus
  const originalClosePractice = window.closePractice;
  window.closePractice = function() {
    originalClosePractice?.call(this);
    if (previousFocus && previousFocus !== document.body) {
      setTimeout(() => previousFocus?.focus(), 100);
    }
  };
}

// ═══ SCREEN READER ANNOUNCEMENTS ═══
function announceToScreenReader(message) {
  const area = document.getElementById('notification-area');
  if (area) {
    area.textContent = message;
  }
}

// ═══ DESCRIPTIVE LABELS FOR ICONS ═══
function setupIconLabels() {
  // Breath patterns
  document.querySelectorAll('[data-breath-pattern]').forEach(el => {
    const pattern = el.getAttribute('data-breath-pattern');
    const label = getBreathPatternLabel(pattern);
    el.setAttribute('aria-label', label);
  });

  // Axis icons
  const axisIcons = {
    body: 'Body awareness practice',
    breath: 'Breath practice',
    attention: 'Attention practice',
    space: 'Space and openness practice'
  };

  document.querySelectorAll('[data-axis]').forEach(el => {
    const axis = el.getAttribute('data-axis');
    if (axisIcons[axis]) {
      el.setAttribute('aria-label', axisIcons[axis]);
    }
  });
}

function getBreathPatternLabel(pattern) {
  const patterns = {
    '4-7-8': 'Four-seven-eight breath, deep calm',
    '4-2-6-1': 'Four-two-six-one breath, grounding and presence',
    '5-5': 'Five-five breath, focus and balance',
    'box': 'Box breathing, equal counts',
    'natural': 'Natural breathing, gentle awareness'
  };
  return patterns[pattern] || pattern;
}

// ═══ INITIALIZATION ON DOM LOAD ═══
document.addEventListener('DOMContentLoaded', () => {
  initARIA();
  setupButtonAccessibility();
  setupFormAccessibility();
  setupIconLabels();
});

// ═══ HOOK INTO SCREEN CHANGES ═══
const originalShowScreen = window.showScreen;
window.showScreen = function(id) {
  originalShowScreen.call(this, id);
  updateScreenAccessibility(id);
  setTimeout(() => {
    const newScreen = document.getElementById('screen-' + id);
    if (newScreen) {
      const focusTarget = newScreen.querySelector('h2, h3, .screen-title, button:not([class*="hidden"])');
      if (focusTarget) {
        focusTarget.focus();
      }
    }
  }, 100);
};

// ═══ SKIP LINK ═══
function setupSkipLink() {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-area';
  skipLink.textContent = 'Skip to main content';
  skipLink.style.cssText = `
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `;
  skipLink.addEventListener('focus', () => {
    skipLink.style.cssText = `
      position: fixed;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
      background: var(--teal);
      color: white;
      padding: 8px 16px;
      border-radius: 0 0 8px 8px;
      z-index: 10001;
      width: auto;
      height: auto;
      overflow: visible;
    `;
  });
  skipLink.addEventListener('blur', () => {
    skipLink.style.cssText = `
      position: absolute;
      left: -10000px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
  });
  document.body.insertBefore(skipLink, document.body.firstChild);
}

// Call on init
document.addEventListener('DOMContentLoaded', setupSkipLink);

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initARIA, updateScreenAccessibility, announceToScreenReader };
}
