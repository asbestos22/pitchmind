const $ = (id) => document.getElementById(id);
const api = async (path, opts) => {
  const r = await fetch(path, opts);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
};

const outLabel = (o) => ({ HOME: "Home win", DRAW: "Draw", AWAY: "Away win" }[o] || o);

async function health() {
  try {
    await api("/api/health");
    $("net").textContent = "memory: Walrus Mainnet ✓";
    $("net").style.color = "var(--acc)";
  } catch {
    $("net").textContent = "memory: relayer unreachable";
    $("net").style.color = "var(--warn)";
  }
}

async function loadRecord() {
  const user = $("user").value.trim();
  if (!user) return;
  const { record, scored } = await api(`/api/recap?user=${encodeURIComponent(user)}`);
  $("recordCard").style.display = "block";
  const pct = Math.round((record.accuracy || 0) * 100);
  $("stats").innerHTML =
    `<span class="stat"><b>${record.correct}/${record.decided}</b><br>correct</span>` +
    `<span class="stat"><b>${pct}%</b><br>accuracy</span>` +
    `<span class="stat"><b>${record.avgConfidence}</b><br>avg conf</span>` +
    `<span class="stat"><b>${record.overconfidentMisses}</b><br>cocky misses</span>`;
  $("rows").innerHTML = scored
    .map((s) => {
      const res = s.correct === null
        ? '<span class="pend">pending</span>'
        : s.correct ? '<span class="ok">✓ hit</span>' : '<span class="no">✗ miss</span>';
      return `<tr><td>${s.home} vs ${s.away}</td><td>${outLabel(s.pick)}</td><td>${s.confidence}%</td><td>${res}</td><td>${s.take || ""}</td></tr>`;
    })
    .join("");
}

async function roastMe() {
  const user = $("user").value.trim();
  const day = Number($("day").value || 1);
  if (!user) return;
  $("roastBtn").textContent = "thinking…";
  try {
    const { roast, record, blob_id } = await api("/api/roast", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, day }),
    });
    $("roastCard").style.display = "block";
    $("roastText").textContent = roast;
    $("roastMeta").textContent = `record ${record.correct}/${record.decided} · roast persisted to Walrus → blob ${blob_id}`;
    await loadRecord();
  } catch (e) {
    $("roastCard").style.display = "block";
    $("roastText").textContent = "Error: " + e.message;
  } finally {
    $("roastBtn").textContent = "Roast me";
  }
}

async function savePred() {
  $("predMsg").textContent = "";
  try {
    const out = await api("/api/predict", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: $("user").value.trim(), matchId: $("p_match").value.trim(),
        home: $("p_home").value.trim(), away: $("p_away").value.trim(),
        pick: $("p_pick").value, confidence: Number($("p_conf").value), take: $("p_take").value.trim(),
      }),
    });
    $("predMsg").style.color = "var(--acc)";
    $("predMsg").textContent = `saved → Walrus blob ${out.blob_id}`;
    await loadRecord();
  } catch (e) {
    $("predMsg").style.color = "var(--warn)";
    $("predMsg").textContent = e.message;
  }
}

async function saveResult() {
  $("resMsg").textContent = "";
  try {
    const out = await api("/api/result", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId: $("r_match").value.trim(), home: $("r_home").value.trim(), away: $("r_away").value.trim(),
        homeScore: Number($("r_hs").value), awayScore: Number($("r_as").value),
      }),
    });
    $("resMsg").style.color = "var(--acc)";
    $("resMsg").textContent = `saved → Walrus blob ${out.blob_id}`;
    await loadRecord();
  } catch (e) {
    $("resMsg").style.color = "var(--warn)";
    $("resMsg").textContent = e.message;
  }
}

$("loadBtn").onclick = loadRecord;
$("roastBtn").onclick = roastMe;
$("predBtn").onclick = savePred;
$("resBtn").onclick = saveResult;
health();
