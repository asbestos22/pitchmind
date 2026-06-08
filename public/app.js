// PitchMind — app.js v4
// Schedule-driven prediction picker, yellow dominant

const API = '';
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ── WC2026 Schedule (real group stage from ESPN) ──
const SCHEDULE = [
  {date:'2026-06-11',time:'19:00',home:'Mexico',away:'South Africa',group:'',venue:'Estadio Banorte'},
  {date:'2026-06-12',time:'02:00',home:'South Korea',away:'Czechia',group:'',venue:'Estadio Akron'},
  {date:'2026-06-12',time:'19:00',home:'Canada',away:'Bosnia-Herzegovina',group:'',venue:'BMO Field'},
  {date:'2026-06-13',time:'01:00',home:'United States',away:'Paraguay',group:'',venue:'SoFi Stadium'},
  {date:'2026-06-13',time:'19:00',home:'Qatar',away:'Switzerland',group:'',venue:"Levi's Stadium"},
  {date:'2026-06-13',time:'22:00',home:'Brazil',away:'Morocco',group:'',venue:'MetLife Stadium'},
  {date:'2026-06-14',time:'01:00',home:'Haiti',away:'Scotland',group:'',venue:'Gillette Stadium'},
  {date:'2026-06-14',time:'04:00',home:'Australia',away:'Türkiye',group:'',venue:'BC Place'},
  {date:'2026-06-14',time:'17:00',home:'Germany',away:'Curaçao',group:'',venue:'NRG Stadium'},
  {date:'2026-06-14',time:'20:00',home:'Netherlands',away:'Japan',group:'',venue:'AT&T Stadium'},
  {date:'2026-06-14',time:'23:00',home:'Ivory Coast',away:'Ecuador',group:'',venue:'Lincoln Financial Field'},
  {date:'2026-06-15',time:'02:00',home:'Sweden',away:'Tunisia',group:'',venue:'Estadio BBVA'},
  {date:'2026-06-15',time:'16:00',home:'Spain',away:'Cape Verde',group:'',venue:'Mercedes-Benz Stadium'},
  {date:'2026-06-15',time:'19:00',home:'Belgium',away:'Egypt',group:'',venue:'Lumen Field'},
  {date:'2026-06-15',time:'22:00',home:'Saudi Arabia',away:'Uruguay',group:'',venue:'Hard Rock Stadium'},
  {date:'2026-06-16',time:'01:00',home:'Iran',away:'New Zealand',group:'',venue:'SoFi Stadium'},
  {date:'2026-06-16',time:'19:00',home:'France',away:'Senegal',group:'',venue:'MetLife Stadium'},
  {date:'2026-06-16',time:'22:00',home:'Iraq',away:'Norway',group:'',venue:'Gillette Stadium'},
  {date:'2026-06-17',time:'01:00',home:'Argentina',away:'Algeria',group:'',venue:'GEHA Field at Arrowhead Stadium'},
  {date:'2026-06-17',time:'04:00',home:'Austria',away:'Jordan',group:'',venue:"Levi's Stadium"},
  {date:'2026-06-17',time:'17:00',home:'Portugal',away:'Congo DR',group:'',venue:'NRG Stadium'},
  {date:'2026-06-17',time:'20:00',home:'England',away:'Croatia',group:'',venue:'AT&T Stadium'},
  {date:'2026-06-17',time:'23:00',home:'Ghana',away:'Panama',group:'',venue:'BMO Field'},
  {date:'2026-06-18',time:'02:00',home:'Uzbekistan',away:'Colombia',group:'',venue:'Estadio Banorte'},
  {date:'2026-06-18',time:'16:00',home:'Czechia',away:'South Africa',group:'',venue:'Mercedes-Benz Stadium'},
  {date:'2026-06-18',time:'19:00',home:'Switzerland',away:'Bosnia-Herzegovina',group:'',venue:'SoFi Stadium'},
  {date:'2026-06-18',time:'22:00',home:'Canada',away:'Qatar',group:'',venue:'BC Place'},
  {date:'2026-06-19',time:'01:00',home:'Mexico',away:'South Korea',group:'',venue:'Estadio Akron'},
  {date:'2026-06-19',time:'19:00',home:'United States',away:'Australia',group:'',venue:'Lumen Field'},
  {date:'2026-06-19',time:'22:00',home:'Scotland',away:'Morocco',group:'',venue:'Gillette Stadium'},
  {date:'2026-06-20',time:'00:30',home:'Brazil',away:'Haiti',group:'',venue:'Lincoln Financial Field'},
  {date:'2026-06-20',time:'03:00',home:'Türkiye',away:'Paraguay',group:'',venue:"Levi's Stadium"},
  {date:'2026-06-20',time:'17:00',home:'Netherlands',away:'Sweden',group:'',venue:'NRG Stadium'},
  {date:'2026-06-20',time:'20:00',home:'Germany',away:'Ivory Coast',group:'',venue:'BMO Field'},
  {date:'2026-06-21',time:'00:00',home:'Ecuador',away:'Curaçao',group:'',venue:'GEHA Field at Arrowhead Stadium'},
  {date:'2026-06-21',time:'04:00',home:'Tunisia',away:'Japan',group:'',venue:'Estadio BBVA'},
  {date:'2026-06-21',time:'16:00',home:'Spain',away:'Saudi Arabia',group:'',venue:'Mercedes-Benz Stadium'},
  {date:'2026-06-21',time:'19:00',home:'Belgium',away:'Iran',group:'',venue:'SoFi Stadium'},
  {date:'2026-06-21',time:'22:00',home:'Uruguay',away:'Cape Verde',group:'',venue:'Hard Rock Stadium'},
  {date:'2026-06-22',time:'01:00',home:'New Zealand',away:'Egypt',group:'',venue:'BC Place'},
  {date:'2026-06-22',time:'17:00',home:'Argentina',away:'Austria',group:'',venue:'AT&T Stadium'},
  {date:'2026-06-22',time:'21:00',home:'France',away:'Iraq',group:'',venue:'Lincoln Financial Field'},
  {date:'2026-06-23',time:'00:00',home:'Norway',away:'Senegal',group:'',venue:'MetLife Stadium'},
  {date:'2026-06-23',time:'03:00',home:'Jordan',away:'Algeria',group:'',venue:"Levi's Stadium"},
  {date:'2026-06-23',time:'17:00',home:'Portugal',away:'Uzbekistan',group:'',venue:'NRG Stadium'},
  {date:'2026-06-23',time:'20:00',home:'England',away:'Ghana',group:'',venue:'Gillette Stadium'},
  {date:'2026-06-23',time:'23:00',home:'Panama',away:'Croatia',group:'',venue:'BMO Field'},
  {date:'2026-06-24',time:'02:00',home:'Colombia',away:'Congo DR',group:'',venue:'Estadio Akron'},
  {date:'2026-06-24',time:'19:00',home:'Bosnia-Herzegovina',away:'Qatar',group:'',venue:'Lumen Field'},
  {date:'2026-06-24',time:'19:00',home:'Switzerland',away:'Canada',group:'',venue:'BC Place'},
  {date:'2026-06-24',time:'22:00',home:'Morocco',away:'Haiti',group:'',venue:'Mercedes-Benz Stadium'},
  {date:'2026-06-24',time:'22:00',home:'Scotland',away:'Brazil',group:'',venue:'Hard Rock Stadium'},
  {date:'2026-06-25',time:'01:00',home:'Czechia',away:'Mexico',group:'',venue:'Estadio Banorte'},
  {date:'2026-06-25',time:'01:00',home:'South Africa',away:'South Korea',group:'',venue:'Estadio BBVA'},
  {date:'2026-06-25',time:'20:00',home:'Curaçao',away:'Ivory Coast',group:'',venue:'Lincoln Financial Field'},
  {date:'2026-06-25',time:'20:00',home:'Ecuador',away:'Germany',group:'',venue:'MetLife Stadium'},
  {date:'2026-06-25',time:'23:00',home:'Japan',away:'Sweden',group:'',venue:'AT&T Stadium'},
  {date:'2026-06-25',time:'23:00',home:'Tunisia',away:'Netherlands',group:'',venue:'GEHA Field at Arrowhead Stadium'},
  {date:'2026-06-26',time:'02:00',home:'Paraguay',away:'Australia',group:'',venue:"Levi's Stadium"},
  {date:'2026-06-26',time:'02:00',home:'Türkiye',away:'United States',group:'',venue:'SoFi Stadium'},
  {date:'2026-06-26',time:'19:00',home:'Norway',away:'France',group:'',venue:'Gillette Stadium'},
  {date:'2026-06-26',time:'19:00',home:'Senegal',away:'Iraq',group:'',venue:'BMO Field'},
  {date:'2026-06-27',time:'00:00',home:'Cape Verde',away:'Saudi Arabia',group:'',venue:'NRG Stadium'},
  {date:'2026-06-27',time:'00:00',home:'Uruguay',away:'Spain',group:'',venue:'Estadio Akron'},
  {date:'2026-06-27',time:'03:00',home:'Egypt',away:'Iran',group:'',venue:'Lumen Field'},
  {date:'2026-06-27',time:'03:00',home:'New Zealand',away:'Belgium',group:'',venue:'BC Place'},
  {date:'2026-06-27',time:'21:00',home:'Croatia',away:'Ghana',group:'',venue:'Lincoln Financial Field'},
  {date:'2026-06-27',time:'21:00',home:'Panama',away:'England',group:'',venue:'MetLife Stadium'},
  {date:'2026-06-27',time:'23:30',home:'Colombia',away:'Portugal',group:'',venue:'Hard Rock Stadium'},
  {date:'2026-06-27',time:'23:30',home:'Congo DR',away:'Uzbekistan',group:'',venue:'Mercedes-Benz Stadium'},
  {date:'2026-06-28',time:'02:00',home:'Algeria',away:'Austria',group:'',venue:'GEHA Field at Arrowhead Stadium'},
  {date:'2026-06-28',time:'02:00',home:'Jordan',away:'Argentina',group:'',venue:'AT&T Stadium'},
];

// Add matchId + flag
SCHEDULE.forEach((m, i) => {
  m.matchId = m.home.slice(0,3).toUpperCase() + '-' + m.away.slice(0,3).toUpperCase();
  m.idx = i;
});

// ── State ──
let selectedMatch = null;
let selectedPick = null;

// ── Toast ──
function toast(msg, type = 'info') {
  const c = $('#toasts');
  if (!c) return;
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .2s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 200);
  }, 3000);
}

// ── Tabs ──
function switchTo(name) {
  $$('.nav-tab').forEach(t => t.classList.remove('active'));
  $$('.panel').forEach(p => p.classList.remove('active'));
  const tab = document.querySelector('.nav-tab[data-panel="' + name + '"]');
  const panel = document.getElementById(name);
  if (tab) tab.classList.add('active');
  if (panel) panel.classList.add('active');
  if (name === 'predictions') loadPredictions();
  if (name === 'health') loadHealth();
  if (name === 'submit') renderSchedule();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const panel = tab.getAttribute('data-panel');
      if (panel) switchTo(panel);
    });
  });
});

// ── Schedule Renderer ──
let activeDate = null;

function renderSchedule() {
  const grid = $('#sched-grid');
  const dateTabs = $('#date-tabs');
  const countEl = $('#sched-count');
  if (!grid || !dateTabs) return;

  // Load user from localStorage
  const savedUser = localStorage.getItem('pitchmind_user') || '';
  const userInput = $('#pred-user');
  if (userInput && savedUser) userInput.value = savedUser;

  // Get unique dates
  const dates = [...new Set(SCHEDULE.map(m => m.date))];
  if (!activeDate) activeDate = dates[0];

  if (countEl) countEl.textContent = '// ' + SCHEDULE.length + ' matches';

  // Date tabs
  dateTabs.innerHTML = dates.map(d => {
    const label = new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const count = SCHEDULE.filter(m => m.date === d).length;
    const active = d === activeDate ? ' active' : '';
    return '<div class="date-tab' + active + '" data-date="' + d + '">' + label + ' <span style="opacity:.5">(' + count + ')</span></div>';
  }).join('');

  dateTabs.querySelectorAll('.date-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeDate = tab.getAttribute('data-date');
      renderSchedule();
    });
  });

  // Matches for active date
  const matches = SCHEDULE.filter(m => m.date === activeDate);
  grid.innerHTML = matches.map(m => {
    const picked = hasPick(m.matchId);
    const pickedClass = picked ? ' picked' : '';
    const time = m.time;
    return '<div class="match-card' + pickedClass + '" data-idx="' + m.idx + '">' +
      '<div class="time">' + time + '</div>' +
      '<div class="home-team">' + m.home + '</div>' +
      '<div class="vs">vs</div>' +
      '<div class="away-team">' + m.away + '</div>' +
      (picked ? '<div class="tag">picked</div>' : '<div class="venue">' + m.venue + '</div>') +
      '</div>';
  }).join('');

  // Click handlers
  grid.querySelectorAll('.match-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.getAttribute('data-idx'));
      selectMatch(SCHEDULE[idx]);
    });
  });
}

function hasPick(matchId) {
  const user = ($('#pred-user') || {}).value || localStorage.getItem('pitchmind_user') || '';
  if (!user) return false;
  const picks = JSON.parse(localStorage.getItem('pm_picks_' + user) || '{}');
  return !!picks[matchId];
}

function selectMatch(m) {
  selectedMatch = m;
  selectedPick = null;

  // Mark selected card
  $$('.match-card').forEach(c => c.classList.remove('selected'));
  const card = document.querySelector('.match-card[data-idx="' + m.idx + '"]');
  if (card) card.classList.add('selected');

  // Show pred bar
  const bar = $('#pred-bar');
  const barMatch = $('#pred-bar-match');
  if (bar) bar.style.display = 'block';
  if (barMatch) barMatch.textContent = m.home + ' vs ' + m.away + '  ·  ' + m.date + ' ' + m.time + '  ·  ' + m.venue;

  // Build pick buttons with team names
  const pg = $('#pick-group');
  if (pg) {
    pg.innerHTML =
      '<button class="pick-btn" data-pick="HOME">' + m.home.toUpperCase() + '</button>' +
      '<button class="pick-btn" data-pick="DRAW">DRAW</button>' +
      '<button class="pick-btn" data-pick="AWAY">' + m.away.toUpperCase() + '</button>';
    // Attach listeners to new buttons
    pg.querySelectorAll('.pick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        pg.querySelectorAll('.pick-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedPick = btn.getAttribute('data-pick');
        const submitBtn = $('#submitBtn');
        if (submitBtn) submitBtn.disabled = false;
      });
    });
  }

  const submitBtn = $('#submitBtn');
  if (submitBtn) submitBtn.disabled = true;

  // Scroll to bar
  bar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Pick Buttons ──
document.addEventListener('DOMContentLoaded', () => {
  // Confidence slider
  const slider = $('#confSlider');
  const sliderVal = $('#confVal');
  if (slider && sliderVal) {
    slider.addEventListener('input', () => {
      sliderVal.textContent = slider.value + '%';
    });
  }

  // Submit button
  const submitBtn = $('#submitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', doSubmit);
  }
});

// ── Submit ──
async function doSubmit() {
  if (!selectedMatch || !selectedPick) return toast('select match + pick', 'error');
  const userInput = $('#pred-user');
  const user = userInput ? userInput.value.trim() : '';
  if (!user) return toast('enter your name first', 'error');

  // Save name
  localStorage.setItem('pitchmind_user', user);

  const btn = $('#submitBtn');
  const confSlider = $('#confSlider');
  const takeInput = $('#pred-take');

  btn.disabled = true;
  btn.textContent = 'SAVING...';

  try {
    const r = await fetch(API + '/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user,
        matchId: selectedMatch.matchId,
        home: selectedMatch.home,
        away: selectedMatch.away,
        pick: selectedPick,
        confidence: Number(confSlider ? confSlider.value : 70),
        take: takeInput ? takeInput.value.trim() : '',
      }),
    });
    const data = await r.json();
    if (data.error) throw new Error(data.error);

    // Save to localStorage
    const picks = JSON.parse(localStorage.getItem('pm_picks_' + user) || '{}');
    picks[selectedMatch.matchId] = selectedPick;
    localStorage.setItem('pm_picks_' + user, JSON.stringify(picks));

    toast(selectedMatch.home + ' vs ' + selectedMatch.away + ' — ' + selectedPick.toLowerCase(), 'success');

    // Reset
    selectedMatch = null;
    selectedPick = null;
    if (takeInput) takeInput.value = '';
    if (confSlider) confSlider.value = 70;
    const confVal = $('#confVal');
    if (confVal) confVal.textContent = '70%';
    $$('.pick-btn').forEach(b => b.classList.remove('active'));
    const pg = $('#pick-group');
    if (pg) pg.innerHTML = '';
    $('#pred-bar').style.display = 'none';

    // Re-render to show "picked" tag
    renderSchedule();

  } catch (e) {
    toast(e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'SUBMIT';
  }
}

// ── Predictions Feed ──
async function loadPredictions() {
  const el = $('#pred-list');
  const statsEl = $('#pred-stats');
  const countEl = $('#pred-count');
  if (!el) return;

  const user = new URLSearchParams(location.search).get('user') || localStorage.getItem('pitchmind_user') || 'F5';
  el.innerHTML = '<div class="loading">loading predictions</div>';

  try {
    const r = await fetch(API + '/api/recap?user=' + encodeURIComponent(user));
    const data = await r.json();
    const scored = data.scored || [];
    const rec = data.record || {};

    if (countEl) countEl.textContent = scored.length > 0 ? '// ' + scored.length + ' picks' : '';

    if (statsEl) {
      if (rec.total > 0) {
        const pct = rec.accuracy ? Math.round(rec.accuracy * 100) : 0;
        statsEl.innerHTML =
          '<div class="stats-row">' +
          '<div class="stat-cell"><div class="label">Total</div><div class="value">' + rec.total + '</div></div>' +
          '<div class="stat-cell"><div class="label">Accuracy</div><div class="value ' + (pct >= 50 ? 'green' : 'red') + '">' + pct + '%</div></div>' +
          '<div class="stat-cell"><div class="label">Correct</div><div class="value">' + (rec.correct || 0) + '/' + (rec.decided || 0) + '</div></div>' +
          '<div class="stat-cell"><div class="label">Avg Conf</div><div class="value yellow">' + (rec.avgConfidence || 0) + '%</div></div>' +
          '</div>';
      } else {
        statsEl.innerHTML = '';
      }
    }

    if (!scored.length) {
      el.innerHTML = '<div class="empty-state">no predictions for <strong>' + user + '</strong> yet.<br>pick a match to get started.</div>';
      return;
    }

    var html = '<div class="pred-feed">';
    for (var i = 0; i < scored.length; i++) {
      var p = scored[i];
      var pick = p.pick || '?';
      var pickLabel = pick === 'HOME' ? 'home' : pick === 'AWAY' ? 'away' : 'draw';
      var status = p.correct === true ? '[W]' : p.correct === false ? '[L]' : '[\u2014]';
      var conf = p.confidence || 0;
      html += '<div class="pred-row" style="opacity:0;transform:translateY(8px)">' +
        '<div><span class="match">' + (p.home || '?') + '</span> <span class="vs">v</span> <span class="match">' + (p.away || '?') + '</span></div>' +
        '<div class="pick ' + pick + '">' + pickLabel + '</div>' +
        '<div class="conf">' + conf + '%</div>' +
        '<div class="status">' + status + '</div>' +
        '</div>';
    }
    html += '</div>';

    html += '<div class="raw-toggle" onclick="this.nextElementSibling.classList.toggle(\'open\')">[ toggle raw json ]</div>';
    html += '<div class="raw-data">' + JSON.stringify(data, null, 2) + '</div>';

    el.innerHTML = html;

    var rows = el.querySelectorAll('.pred-row');
    for (var j = 0; j < rows.length; j++) {
      (function(row, idx) {
        setTimeout(function() {
          row.style.transition = 'opacity .3s ease, transform .3s ease';
          row.style.opacity = '1';
          row.style.transform = 'translateY(0)';
        }, idx * 60 + 50);
      })(rows[j], j);
    }

  } catch (e) {
    el.innerHTML = '<div class="empty-state">failed: ' + e.message + '</div>';
  }
}

// ── Roast ──
async function doRoast() {
  var userInput = $('#roast-user');
  var user = userInput ? userInput.value.trim() : '';
  if (!user) return toast('enter a username', 'error');

  var btn = $('#roastBtn');
  var out = $('#roast-output');
  var rawWrap = $('#roast-raw');
  var rawEl = $('#roast-raw-data');

  btn.disabled = true;
  btn.textContent = 'ROASTING...';

  out.innerHTML =
    '<div class="label">generating roast for ' + user + '...</div>' +
    '<div class="loading" style="padding:20px 0;text-align:left">computing</div>';

  try {
    var r = await fetch(API + '/api/roast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: user }),
    });
    var data = await r.json();
    if (data.error) throw new Error(data.error);

    var text = data.roast || 'no roast available \u2014 add predictions first';
    var words = text.split(' ');

    out.innerHTML =
      '<div class="label">roast // ' + user + '</div>' +
      '<div class="roast-text" id="roastText"></div>';

    var revealEl = $('#roastText');
    var cursor = document.createElement('span');
    cursor.className = 'roast-cursor';
    revealEl.parentNode.insertBefore(cursor, revealEl.nextSibling);
    var idx = 0;
    var interval = setInterval(function() {
      if (idx >= words.length) {
        clearInterval(interval);
        cursor.remove();
        return;
      }
      var span = document.createElement('span');
      span.className = 'word';
      span.textContent = words[idx] + ' ';
      revealEl.appendChild(span);
      requestAnimationFrame(function() { span.classList.add('visible'); });
      idx++;
    }, 65);

    if (rawWrap) {
      rawWrap.style.display = 'block';
      if (rawEl) rawEl.textContent = JSON.stringify(data, null, 2);
    }

    toast('roast delivered // ' + user, 'success');

  } catch (e) {
    out.innerHTML = '<div class="label">error</div><div class="roast-text" style="color:var(--red)">' + e.message + '</div>';
    toast(e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'ROAST';
  }
}

// ── Health ──
async function loadHealth() {
  var el = $('#health-content');
  if (!el) return;
  el.innerHTML = '<div class="loading">pinging relay</div>';
  try {
    var r = await fetch(API + '/api/health');
    var data = await r.json();

    var entries = Object.entries(data).filter(function(kv) { return typeof data[kv[0]] !== 'object'; });
    var nested = Object.entries(data).filter(function(kv) { return typeof data[kv[0]] === 'object' && data[kv[0]] !== null; });

    var html = '<div class="health-grid">';
    for (var i = 0; i < entries.length; i++) {
      var k = entries[i][0], v = entries[i][1];
      var isOk = v === 'ok' || v === true || v === 'production';
      html += '<div class="health-cell"><div class="k">' + k + '</div><div class="v ' + (isOk ? 'ok' : '') + '">' + (typeof v === 'boolean' ? (v ? 'true' : 'false') : v) + '</div></div>';
    }
    for (var j = 0; j < nested.length; j++) {
      var sk = nested[j][0], sv = nested[j][1];
      var flat = Object.entries(sv).slice(0, 4).map(function(e) { return e[0] + ': ' + e[1]; }).join(', ');
      html += '<div class="health-cell"><div class="k">' + sk + '</div><div class="v">' + flat + '</div></div>';
    }
    html += '</div>';

    html += '<div class="raw-toggle" onclick="this.nextElementSibling.classList.toggle(\'open\')">[ toggle raw json ]</div>';
    html += '<div class="raw-data">' + JSON.stringify(data, null, 2) + '</div>';

    el.innerHTML = html;
    toast('relay status OK', 'success');
  } catch (e) {
    el.innerHTML = '<div class="empty-state">health check failed: ' + e.message + '</div>';
    toast(e.message, 'error');
  }
}
