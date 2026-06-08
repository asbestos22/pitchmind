// PitchMind — app.js v3
// Yellow-dominant anti-AI design, fixed tab switching

const API = '';
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

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

// ── Confidence slider ──
document.addEventListener('DOMContentLoaded', () => {
  const slider = $('#confSlider');
  const sliderVal = $('#confVal');
  if (slider && sliderVal) {
    slider.addEventListener('input', () => {
      sliderVal.textContent = slider.value + '%';
    });
  }
  // Init
  loadPredictions();
});

// ── Predictions ──
async function loadPredictions() {
  const el = $('#pred-list');
  const statsEl = $('#pred-stats');
  const countEl = $('#pred-count');
  if (!el) return;

  const user = new URLSearchParams(location.search).get('user') || 'F5';
  el.innerHTML = '<div class="loading">loading predictions</div>';

  try {
    const r = await fetch(API + '/api/recap?user=' + encodeURIComponent(user));
    const data = await r.json();
    const scored = data.scored || [];
    const rec = data.record || {};

    if (countEl) countEl.textContent = scored.length > 0 ? '// ' + scored.length + ' picks' : '';

    // Stats bar
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
      el.innerHTML = '<div class="empty-state">no predictions for <strong>' + user + '</strong> yet.<br>submit one to get started.</div>';
      return;
    }

    // Feed rows
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

    // Raw toggle
    html += '<div class="raw-toggle" onclick="this.nextElementSibling.classList.toggle(\'open\')">[ toggle raw json ]</div>';
    html += '<div class="raw-data">' + JSON.stringify(data, null, 2) + '</div>';

    el.innerHTML = html;

    // Staggered reveal
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

// ── Submit Prediction ──
document.addEventListener('DOMContentLoaded', () => {
  var form = $('#pred-form');
  if (!form) return;
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    var btn = $('#submitBtn');
    var slider = $('#confSlider');
    var sliderVal = $('#confVal');
    var fd = new FormData(e.target);
    btn.disabled = true;
    btn.textContent = 'SAVING TO WALRUS...';
    try {
      var r = await fetch(API + '/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: fd.get('user'),
          matchId: fd.get('matchId'),
          home: fd.get('home'),
          away: fd.get('away'),
          pick: fd.get('pick'),
          confidence: Number(fd.get('confidence')),
          take: fd.get('take'),
        }),
      });
      var data = await r.json();
      if (data.error) throw new Error(data.error);
      toast('prediction stored', 'success');
      e.target.reset();
      if (slider) slider.value = 70;
      if (sliderVal) sliderVal.textContent = '70%';
      setTimeout(function() { switchTo('predictions'); }, 600);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'SUBMIT TO WALRUS';
    }
  });
});

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

    // Word-by-word reveal with cursor
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

    // Show raw JSON
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
