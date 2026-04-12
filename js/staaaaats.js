// js/stats.js
/* ═══════════════════════════════════════════
   stats.js — Session tracking & localStorage
   ═══════════════════════════════════════════ */

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem('mindful_stats')) || {sessions:0,minutes:0,streak:0,lastDate:'',explored:[]};
  } catch { return {sessions:0,minutes:0,streak:0,lastDate:'',explored:[]}; }
}
function saveStats(s) { localStorage.setItem('mindful_stats', JSON.stringify(s)); }

let stats = loadStats();
if (!stats.explored) stats.explored = [];

function recordSession(minutes) {
  const today = new Date().toDateString();
  stats.sessions++;
  stats.minutes += minutes;
  if (stats.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    stats.streak = (stats.streak || 0) + (stats.lastDate !== today ? 1 : 0);
    stats.lastDate = today;
  }
  saveStats(stats);
}

function trackExerciseOpened(file) {
  if (!stats.explored) stats.explored = [];
  const id = file.replace('.html', '');
  if (!stats.explored.includes(id)) {
    stats.explored.push(id);
    saveStats(stats);
  }
}
