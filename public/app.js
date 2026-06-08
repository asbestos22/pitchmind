/* PitchMind v6 — Kimi-inspired UI with Three.js gold icosahedron */
(function () {
  'use strict';

  const API = '';
  const DEFAULT_USERS = ['F5', 'Aleko', 'Tita', 'Rex', 'Nina'];
  // Custom users added via UI or by submitting a prediction, persisted locally.
  function getCustomUsers() {
    try { return JSON.parse(localStorage.getItem('pm_custom_users') || '[]'); }
    catch { return []; }
  }
  function addCustomUser(name) {
    name = (name || '').trim();
    if (!name) return false;
    const all = [...DEFAULT_USERS, ...getCustomUsers()];
    if (all.some(u => u.toLowerCase() === name.toLowerCase())) return false; // dup
    const custom = getCustomUsers();
    custom.push(name);
    localStorage.setItem('pm_custom_users', JSON.stringify(custom));
    return true;
  }
  function allUsers() { return [...DEFAULT_USERS, ...getCustomUsers()]; }

  /* ==================== THREE.JS GOLD ICOSAHEDRON ==================== */
  function initLogo() {
    const canvas = document.getElementById('logo3d');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(36, 36);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);

    const geo = new THREE.IcosahedronGeometry(1.1, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xD4A017,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x8B6914,
      emissiveIntensity: 0.3,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const amb = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xE6AF2E, 1.2);
    dir.position.set(2, 3, 4);
    scene.add(dir);

    function animate() {
      requestAnimationFrame(animate);
      mesh.rotation.y += 0.008;
      mesh.rotation.x += 0.003;
      renderer.render(scene, camera);
    }
    animate();
  }

  /* ==================== STATE ==================== */
  let activeTab = 'feed';
  let feedUser = 'F5';
  let feedFilter = 'all';
  let roastUser = 'F5';
  let statusUser = 'F5';
  let selectedMatch = null;
  let selectedPick = null;
  let confidence = 70;
  let schedule = [];

  /* ==================== NAV ==================== */
  document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('tab-' + tab).classList.add('active');
      activeTab = tab;
      if (tab === 'feed') loadFeed();
      if (tab === 'status') loadStatus();
    });
  });

  /* ==================== USER SELECTORS (dynamic) ==================== */
  // Each selector tracks its own active user + reload callback.
  const SELECTORS = [
    { id: 'roast-users', getActive: () => roastUser, onPick: u => { roastUser = u; } },
    { id: 'status-users', getActive: () => statusUser, onPick: u => { statusUser = u; loadStatus(); } },
  ];

  function renderUserSelector(sel) {
    const container = document.getElementById(sel.id);
    if (!container) return;
    const active = sel.getActive();
    container.innerHTML = '';
    allUsers().forEach(u => {
      const btn = document.createElement('button');
      btn.dataset.user = u;
      btn.textContent = u.toUpperCase();
      if (u === active) btn.classList.add('active');
      btn.addEventListener('click', () => {
        container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        sel.onPick(u);
      });
      container.appendChild(btn);
    });
    // + ADD button
    const add = document.createElement('button');
    add.textContent = '+ ADD';
    add.style.cssText = 'border-style:dashed;opacity:0.7';
    add.title = 'Add a new user';
    add.addEventListener('click', () => {
      const name = prompt('New user name:');
      if (!name) return;
      if (!addCustomUser(name)) { alert('User already exists or invalid name.'); return; }
      // Re-render all selectors so the new chip appears everywhere.
      SELECTORS.forEach(renderUserSelector);
    });
    container.appendChild(add);
  }

  function renderAllSelectors() { SELECTORS.forEach(renderUserSelector); }
  renderAllSelectors();

  /* ==================== FEED ==================== */
  let feedLoadId = 0; // monotonic counter — discard stale responses

  document.querySelectorAll('.filter-bar button[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-bar button[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      feedFilter = btn.dataset.filter;
      loadFeed();
    });
  });

  // FIND USER dropdown — filters the global feed to one user (or EVERYONE)
  let feedFilterUser = '';
  const findSel = document.getElementById('feed-find-user');
  if (findSel) {
    findSel.addEventListener('change', () => {
      feedFilterUser = findSel.value;
      renderFeed();
    });
  }

  let feedCache = []; // last global feed payload (all users), scored

  function renderFeed() {
    const list = document.getElementById('feed-list');
    const count = document.getElementById('feed-count');
    let picks = feedCache.slice();
    if (feedFilterUser) picks = picks.filter(p => p.user === feedFilterUser);
    if (feedFilter === 'recent') {
      picks = picks.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
    }
    count.textContent = picks.length + ' PICKS';
    if (picks.length === 0) {
      list.innerHTML = '<div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg><span>NO PREDICTIONS YET</span></div>';
      return;
    }
    list.innerHTML = picks.map(p => {
      const correctCls = p.correct === true ? 'correct' : p.correct === false ? 'wrong' : '';
      const correctLabel = p.correct === true ? '✓' : p.correct === false ? '✗' : '';
      const ts = p.ts ? new Date(p.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
      const take = p.take ? '<div class="card-take">"' + escHtml(p.take) + '"</div>' : '';
      return '<div class="card">' +
        '<div class="card-header"><span class="teams">' + escHtml(p.home) + ' vs ' + escHtml(p.away) + '</span>' +
        '<span class="pick ' + p.pick + '">' + p.pick + '</span></div>' +
        '<div class="card-meta"><span class="feed-user">' + escHtml((p.user || '').toUpperCase()) + '</span>' +
        '<span class="conf">' + p.confidence + '% CONF</span>' +
        '<span>' + ts + '</span>' +
        (correctLabel ? '<span class="' + correctCls + '">' + correctLabel + '</span>' : '') +
        '</div>' + take + '</div>';
    }).join('');
  }

  function populateFindUsers(users) {
    if (!findSel) return;
    const prev = findSel.value;
    const opts = ['<option value="">EVERYONE</option>']
      .concat(users.map(u => '<option value="' + escHtml(u) + '">' + escHtml(u.toUpperCase()) + '</option>'));
    findSel.innerHTML = opts.join('');
    if (users.includes(prev)) findSel.value = prev;
  }

  async function loadFeed() {
    const thisLoad = ++feedLoadId; // capture current load id
    const list = document.getElementById('feed-list');
    const count = document.getElementById('feed-count');

    // Defer the loading indicator: with the warm server-side cache the feed
    // returns in ~10ms, so we only paint the "RECALLING FROM WALRUS" message
    // if the fetch is genuinely slow (cold cache). Avoids a one-frame flash.
    let loadTimer = null;
    const spinnerDelay = setTimeout(() => {
      list.innerHTML = '<div class="loading" id="loading-msg" style="font-size:14px;line-height:1.3"><span id="loading-title">RECALLING FROM WALRUS...</span><br><span style="font-size:11px;color:var(--text-muted)">Querying onchain memory - may take 20-40s</span></div>';
      count.textContent = '...';
      let dots = 0;
      loadTimer = setInterval(() => {
        dots = (dots + 1) % 4;
        const el = document.getElementById('loading-title');
        if (el) el.textContent = 'RECALLING FROM WALRUS' + '.'.repeat(dots);
      }, 600);
    }, 300);

    const stopLoading = () => { clearTimeout(spinnerDelay); if (loadTimer) clearInterval(loadTimer); };

    try {
      const res = await fetch(API + '/api/feed');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      // Stale check — reloaded while we were loading
      if (thisLoad !== feedLoadId) { stopLoading(); return; }

      stopLoading();
      feedCache = data.scored || [];
      populateFindUsers(data.users || []);
      renderFeed();
    } catch (e) {
      if (thisLoad !== feedLoadId) { stopLoading(); return; } // stale
      stopLoading();
      list.innerHTML = '<div class="empty"><span>FAILED TO LOAD: ' + escHtml(e.message) + '</span></div>';
    }
  }

  /* ==================== ROAST ==================== */
  document.getElementById('roast-btn').addEventListener('click', async () => {
    const content = document.getElementById('roast-content');
    const btn = document.getElementById('roast-btn');
    btn.disabled = true;
    btn.textContent = 'ROASTING...';
    content.innerHTML = '<div class="loading">GENERATING ROAST...</div>';
    try {
      const res = await fetch(API + '/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: roastUser, day: 1 }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      content.innerHTML = '<div class="roast-text">' + escHtml(data.roast) + '</div>' +
        (data.blob_id ? '<div class="roast-blob">WALRUS BLOB: ' + data.blob_id + '</div>' : '');
    } catch (e) {
      content.innerHTML = '<div class="empty"><span>ROAST FAILED: ' + escHtml(e.message) + '</span></div>';
    }
    btn.disabled = false;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg> ROAST ME';
  });

  /* ==================== SCHEDULE / PICKS ==================== */
  const SCHEDULE = [
    {id:"MEX-SOU",home:"Mexico",away:"South Africa",date:"2026-06-11",time:"19:00"},
    {id:"SOU-CZE",home:"South Korea",away:"Czechia",date:"2026-06-12",time:"02:00"},
    {id:"CAN-BOS",home:"Canada",away:"Bosnia-Herzegovina",date:"2026-06-12",time:"19:00"},
    {id:"UNI-PAR",home:"United States",away:"Paraguay",date:"2026-06-13",time:"01:00"},
    {id:"QAT-SWI",home:"Qatar",away:"Switzerland",date:"2026-06-13",time:"19:00"},
    {id:"BRA-MOR",home:"Brazil",away:"Morocco",date:"2026-06-13",time:"22:00"},
    {id:"HAI-SCO",home:"Haiti",away:"Scotland",date:"2026-06-14",time:"01:00"},
    {id:"AUS-TUR",home:"Australia",away:"Türkiye",date:"2026-06-14",time:"04:00"},
    {id:"GER-CUR",home:"Germany",away:"Curaçao",date:"2026-06-14",time:"17:00"},
    {id:"NET-JAP",home:"Netherlands",away:"Japan",date:"2026-06-14",time:"20:00"},
    {id:"IVO-ECU",home:"Ivory Coast",away:"Ecuador",date:"2026-06-14",time:"23:00"},
    {id:"SWE-TUN",home:"Sweden",away:"Tunisia",date:"2026-06-15",time:"02:00"},
    {id:"SPA-CAP",home:"Spain",away:"Cape Verde",date:"2026-06-15",time:"16:00"},
    {id:"BEL-EGY",home:"Belgium",away:"Egypt",date:"2026-06-15",time:"19:00"},
    {id:"SAU-URU",home:"Saudi Arabia",away:"Uruguay",date:"2026-06-15",time:"22:00"},
    {id:"IRA-NEW",home:"Iran",away:"New Zealand",date:"2026-06-16",time:"01:00"},
    {id:"FRA-SEN",home:"France",away:"Senegal",date:"2026-06-16",time:"19:00"},
    {id:"IRA-NOR",home:"Iraq",away:"Norway",date:"2026-06-16",time:"22:00"},
    {id:"ARG-ALG",home:"Argentina",away:"Algeria",date:"2026-06-17",time:"01:00"},
    {id:"AUS-JOR",home:"Austria",away:"Jordan",date:"2026-06-17",time:"04:00"},
    {id:"POR-CON",home:"Portugal",away:"Congo DR",date:"2026-06-17",time:"17:00"},
    {id:"ENG-CRO",home:"England",away:"Croatia",date:"2026-06-17",time:"20:00"},
    {id:"GHA-PAN",home:"Ghana",away:"Panama",date:"2026-06-17",time:"23:00"},
    {id:"UZB-COL",home:"Uzbekistan",away:"Colombia",date:"2026-06-18",time:"02:00"},
    {id:"CZE-SOU",home:"Czechia",away:"South Africa",date:"2026-06-18",time:"16:00"},
    {id:"SWI-BOS",home:"Switzerland",away:"Bosnia-Herzegovina",date:"2026-06-18",time:"19:00"},
    {id:"CAN-QAT",home:"Canada",away:"Qatar",date:"2026-06-18",time:"22:00"},
    {id:"MEX-SOU1",home:"Mexico",away:"South Korea",date:"2026-06-19",time:"01:00"},
    {id:"UNI-AUS",home:"United States",away:"Australia",date:"2026-06-19",time:"19:00"},
    {id:"SCO-MOR",home:"Scotland",away:"Morocco",date:"2026-06-19",time:"22:00"},
    {id:"BRA-HAI",home:"Brazil",away:"Haiti",date:"2026-06-20",time:"00:30"},
    {id:"TUR-PAR",home:"Türkiye",away:"Paraguay",date:"2026-06-20",time:"03:00"},
    {id:"NET-SWE",home:"Netherlands",away:"Sweden",date:"2026-06-20",time:"17:00"},
    {id:"GER-IVO",home:"Germany",away:"Ivory Coast",date:"2026-06-20",time:"20:00"},
    {id:"ECU-CUR",home:"Ecuador",away:"Curaçao",date:"2026-06-21",time:"00:00"},
    {id:"TUN-JAP",home:"Tunisia",away:"Japan",date:"2026-06-21",time:"04:00"},
    {id:"SPA-SAU",home:"Spain",away:"Saudi Arabia",date:"2026-06-21",time:"16:00"},
    {id:"BEL-IRA",home:"Belgium",away:"Iran",date:"2026-06-21",time:"19:00"},
    {id:"URU-CAP",home:"Uruguay",away:"Cape Verde",date:"2026-06-21",time:"22:00"},
    {id:"NEW-EGY",home:"New Zealand",away:"Egypt",date:"2026-06-22",time:"01:00"},
    {id:"ARG-AUS",home:"Argentina",away:"Austria",date:"2026-06-22",time:"17:00"},
    {id:"FRA-IRA",home:"France",away:"Iraq",date:"2026-06-22",time:"21:00"},
    {id:"NOR-SEN",home:"Norway",away:"Senegal",date:"2026-06-23",time:"00:00"},
    {id:"JOR-ALG",home:"Jordan",away:"Algeria",date:"2026-06-23",time:"03:00"},
    {id:"POR-UZB",home:"Portugal",away:"Uzbekistan",date:"2026-06-23",time:"17:00"},
    {id:"ENG-GHA",home:"England",away:"Ghana",date:"2026-06-23",time:"20:00"},
    {id:"PAN-CRO",home:"Panama",away:"Croatia",date:"2026-06-23",time:"23:00"},
    {id:"COL-CON",home:"Colombia",away:"Congo DR",date:"2026-06-24",time:"02:00"},
    {id:"BOS-QAT",home:"Bosnia-Herzegovina",away:"Qatar",date:"2026-06-24",time:"19:00"},
    {id:"SWI-CAN",home:"Switzerland",away:"Canada",date:"2026-06-24",time:"19:00"},
    {id:"MOR-HAI",home:"Morocco",away:"Haiti",date:"2026-06-24",time:"22:00"},
    {id:"SCO-BRA",home:"Scotland",away:"Brazil",date:"2026-06-24",time:"22:00"},
    {id:"CZE-MEX",home:"Czechia",away:"Mexico",date:"2026-06-25",time:"01:00"},
    {id:"SOU-SOU",home:"South Africa",away:"South Korea",date:"2026-06-25",time:"01:00"},
    {id:"CUR-IVO",home:"Curaçao",away:"Ivory Coast",date:"2026-06-25",time:"20:00"},
    {id:"ECU-GER",home:"Ecuador",away:"Germany",date:"2026-06-25",time:"20:00"},
    {id:"JAP-SWE",home:"Japan",away:"Sweden",date:"2026-06-25",time:"23:00"},
    {id:"TUN-NET",home:"Tunisia",away:"Netherlands",date:"2026-06-25",time:"23:00"},
    {id:"PAR-AUS",home:"Paraguay",away:"Australia",date:"2026-06-26",time:"02:00"},
    {id:"TUR-UNI",home:"Türkiye",away:"United States",date:"2026-06-26",time:"02:00"},
    {id:"NOR-FRA",home:"Norway",away:"France",date:"2026-06-26",time:"19:00"},
    {id:"SEN-IRA",home:"Senegal",away:"Iraq",date:"2026-06-26",time:"19:00"},
    {id:"CAP-SAU",home:"Cape Verde",away:"Saudi Arabia",date:"2026-06-27",time:"00:00"},
    {id:"URU-SPA",home:"Uruguay",away:"Spain",date:"2026-06-27",time:"00:00"},
    {id:"EGY-IRA",home:"Egypt",away:"Iran",date:"2026-06-27",time:"03:00"},
    {id:"NEW-BEL",home:"New Zealand",away:"Belgium",date:"2026-06-27",time:"03:00"},
    {id:"CRO-GHA",home:"Croatia",away:"Ghana",date:"2026-06-27",time:"21:00"},
    {id:"PAN-ENG",home:"Panama",away:"England",date:"2026-06-27",time:"21:00"},
    {id:"COL-POR",home:"Colombia",away:"Portugal",date:"2026-06-27",time:"23:30"},
    {id:"CON-UZB",home:"Congo DR",away:"Uzbekistan",date:"2026-06-27",time:"23:30"},
    {id:"ALG-AUS",home:"Algeria",away:"Austria",date:"2026-06-28",time:"02:00"},
    {id:"JOR-ARG",home:"Jordan",away:"Argentina",date:"2026-06-28",time:"02:00"},
  ];

  function renderMatchList() {
    const container = document.getElementById('match-list');
    const byDate = {};
    SCHEDULE.forEach(m => {
      if (!byDate[m.date]) byDate[m.date] = [];
      byDate[m.date].push(m);
    });
    let html = '';
    Object.keys(byDate).sort().forEach(date => {
      const d = new Date(date + 'T00:00:00');
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      html += '<div style="font-size:9px;font-weight:700;color:var(--accent);letter-spacing:0.1em;padding:8px 14px 4px">' + label + '</div>';
      byDate[date].forEach(m => {
        const sel = selectedMatch && selectedMatch.id === m.id ? ' selected' : '';
        html += '<div class="card match-card' + sel + '" data-mid="' + m.id + '">' +
          '<div class="vs">' + escHtml(m.home) + ' vs ' + escHtml(m.away) + '</div>' +
          '<div class="meta">' + m.time + ' UTC · ' + m.id + '</div></div>';
      });
    });
    container.innerHTML = html;
    container.querySelectorAll('.match-card').forEach(card => {
      card.addEventListener('click', () => {
        const m = SCHEDULE.find(s => s.id === card.dataset.mid);
        if (m) selectMatch(m);
      });
    });
  }

  function selectMatch(m) {
    selectedMatch = m;
    selectedPick = null;
    document.querySelectorAll('.match-card').forEach(c => c.classList.toggle('selected', c.dataset.mid === m.id));
    const form = document.getElementById('pick-form');
    form.style.display = 'block';
    document.getElementById('pick-match-name').textContent = m.home + ' vs ' + m.away;
    const btns = document.getElementById('pick-buttons');
    btns.innerHTML = '';
    [m.home.toUpperCase(), 'DRAW', m.away.toUpperCase()].forEach(label => {
      const b = document.createElement('button');
      b.textContent = label;
      b.addEventListener('click', () => {
        btns.querySelectorAll('button').forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
        selectedPick = label === 'DRAW' ? 'DRAW' : label === m.home.toUpperCase() ? 'HOME' : 'AWAY';
      });
      btns.appendChild(b);
    });
  }

  // Confidence slider
  document.getElementById('conf-slider').addEventListener('input', e => {
    confidence = parseInt(e.target.value);
    document.getElementById('conf-val').textContent = confidence + '%';
  });

  // Submit pick
  document.getElementById('submit-pick').addEventListener('click', async () => {
    if (!selectedMatch || !selectedPick) return;
    const btn = document.getElementById('submit-pick');
    const user = localStorage.getItem('pm_user') || prompt('Your username:') || 'anon';
    localStorage.setItem('pm_user', user);
    // Register new user as a chip so their picks are browsable in Feed/Roast/Status.
    if (addCustomUser(user)) renderAllSelectors();
    btn.disabled = true;
    btn.textContent = 'SUBMITTING...';
    try {
      const take = document.getElementById('take-input').value;
      const res = await fetch(API + '/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user, matchId: selectedMatch.id,
          home: selectedMatch.home, away: selectedMatch.away,
          pick: selectedPick, confidence, take,
        }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      btn.textContent = '✓ STORED ON WALRUS';
      btn.style.borderColor = '#4ade80';
      btn.style.color = '#4ade80';
      setTimeout(() => {
        btn.textContent = 'SUBMIT PREDICTION';
        btn.style.borderColor = '';
        btn.style.color = '';
        selectedMatch = null;
        selectedPick = null;
        document.getElementById('pick-form').style.display = 'none';
        document.querySelectorAll('.match-card').forEach(c => c.classList.remove('selected'));
      }, 2000);
    } catch (e) {
      btn.textContent = 'FAILED: ' + e.message;
      setTimeout(() => { btn.textContent = 'SUBMIT PREDICTION'; }, 3000);
    }
    btn.disabled = false;
  });

  /* ==================== STATUS ==================== */
  const STATUS_LOADING = '<div class="loading" style="font-size:14px;padding-top:20px;line-height:1.3">RECALLING FROM WALRUS...<br><span style="font-size:11px;color:var(--text-muted);animation:none">Querying onchain memory - may take 20-40s</span></div>';
  let statusLoadId = 0;
  async function loadStatus() {
    const thisLoad = ++statusLoadId;
    // Show loading state immediately
    const loadEl = document.getElementById('status-loading');
    if (loadEl) loadEl.style.display = '';
    document.getElementById('stat-total').innerHTML = '<span style="font-size:12px;font-weight:600">...</span>';
    document.getElementById('stat-correct').innerHTML = '<span style="font-size:12px;font-weight:600">...</span>';
    document.getElementById('stat-accuracy').innerHTML = '<span style="font-size:12px;font-weight:600">...</span>';
    document.getElementById('stat-conf').innerHTML = '<span style="font-size:12px;font-weight:600">...</span>';
    document.getElementById('team-stats').innerHTML = '';
    try {
      const res = await fetch(API + '/api/recap?user=' + encodeURIComponent(statusUser));
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (thisLoad !== statusLoadId) return; // stale
      if (loadEl) loadEl.style.display = 'none';
      const r = data.record || {};
      document.getElementById('stat-total').textContent = r.total || 0;
      document.getElementById('stat-correct').textContent = r.correct || 0;
      document.getElementById('stat-accuracy').textContent = r.accuracy ? Math.round(r.accuracy * 100) + '%' : '0%';
      document.getElementById('stat-conf').textContent = r.avgConfidence ? r.avgConfidence + '%' : '-';

      // Team breakdown
      const teams = r.byTeamPicked || {};
      const sorted = Object.entries(teams).sort((a, b) => b[1].picks - a[1].picks).slice(0, 15);
      const container = document.getElementById('team-stats');
      if (sorted.length === 0) {
        container.innerHTML = '<div class="empty"><span>NO TEAM DATA YET</span></div>';
        return;
      }
      container.innerHTML = '<div style="font-size:9px;font-weight:700;color:var(--accent);letter-spacing:0.1em;padding:4px 0 8px">TOP PICKED TEAMS</div>' +
        sorted.map(([team, d]) =>
          '<div class="card" style="padding:8px 14px"><div style="display:flex;justify-content:space-between;align-items:center">' +
          '<span style="font-size:11px;font-weight:700;color:#fff">' + escHtml(team) + '</span>' +
          '<span style="font-size:10px;font-weight:700;color:var(--accent-soft)">' + d.picks + ' picks</span>' +
          '</div></div>'
        ).join('');
    } catch (e) {
      if (thisLoad !== statusLoadId) return;
      if (loadEl) loadEl.style.display = 'none';
      document.getElementById('team-stats').innerHTML = '<div class="empty"><span>FAILED TO LOAD: ' + escHtml(e.message) + '</span></div>';
    }
  }

  /* ==================== HELPERS ==================== */
  function escHtml(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ==================== INIT ==================== */
  renderMatchList();
  loadFeed();
  initLogo();

})();
