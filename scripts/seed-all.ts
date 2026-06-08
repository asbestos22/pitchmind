/**
 * Seed fake users with ALL predictions across ALL group stage matches.
 * Run once: npx tsx scripts/seed-all.ts
 */
import "dotenv/config";

const API = process.env.API_URL ?? "http://localhost:8787";

// ── Fake users with distinct personalities ──
const USERS = [
  { name: "F5", bias: "HOME", confRange: [65, 90], takes: true },
  { name: "Aleko", bias: "AWAY", confRange: [30, 60], takes: true },
  { name: "Tita", bias: "DRAW", confRange: [50, 75], takes: false },
  { name: "Rex", bias: "HOME", confRange: [80, 95], takes: true },
  { name: "Nina", bias: "none", confRange: [40, 70], takes: true },
];

// ── Real WC2026 group stage schedule (ESPN) ──
const MATCHES = [
  { date: "2026-06-11", time: "19:00", home: "Mexico", away: "South Africa", matchId: "MEX-SOU" },
  { date: "2026-06-12", time: "02:00", home: "South Korea", away: "Czechia", matchId: "SOU-CZE" },
  { date: "2026-06-12", time: "19:00", home: "Canada", away: "Bosnia-Herzegovina", matchId: "CAN-BOS" },
  { date: "2026-06-13", time: "01:00", home: "United States", away: "Paraguay", matchId: "UNI-PAR" },
  { date: "2026-06-13", time: "19:00", home: "Qatar", away: "Switzerland", matchId: "QAT-SWI" },
  { date: "2026-06-13", time: "22:00", home: "Brazil", away: "Morocco", matchId: "BRA-MOR" },
  { date: "2026-06-14", time: "01:00", home: "Haiti", away: "Scotland", matchId: "HAI-SCO" },
  { date: "2026-06-14", time: "04:00", home: "Australia", away: "Türkiye", matchId: "AUS-TUR" },
  { date: "2026-06-14", time: "17:00", home: "Germany", away: "Curaçao", matchId: "GER-CUR" },
  { date: "2026-06-14", time: "20:00", home: "Netherlands", away: "Japan", matchId: "NET-JAP" },
  { date: "2026-06-14", time: "23:00", home: "Ivory Coast", away: "Ecuador", matchId: "IVO-ECU" },
  { date: "2026-06-15", time: "02:00", home: "Sweden", away: "Tunisia", matchId: "SWE-TUN" },
  { date: "2026-06-15", time: "16:00", home: "Spain", away: "Cape Verde", matchId: "SPA-CAP" },
  { date: "2026-06-15", time: "19:00", home: "Belgium", away: "Egypt", matchId: "BEL-EGY" },
  { date: "2026-06-15", time: "22:00", home: "Saudi Arabia", away: "Uruguay", matchId: "SAU-URU" },
  { date: "2026-06-16", time: "01:00", home: "Iran", away: "New Zealand", matchId: "IRA-NEW" },
  { date: "2026-06-16", time: "19:00", home: "France", away: "Senegal", matchId: "FRA-SEN" },
  { date: "2026-06-16", time: "22:00", home: "Iraq", away: "Norway", matchId: "IRA-NOR" },
  { date: "2026-06-17", time: "01:00", home: "Argentina", away: "Algeria", matchId: "ARG-ALG" },
  { date: "2026-06-17", time: "04:00", home: "Austria", away: "Jordan", matchId: "AUS-JOR" },
  { date: "2026-06-17", time: "17:00", home: "Portugal", away: "Congo DR", matchId: "POR-CON" },
  { date: "2026-06-17", time: "20:00", home: "England", away: "Croatia", matchId: "ENG-CRO" },
  { date: "2026-06-17", time: "23:00", home: "Ghana", away: "Panama", matchId: "GHA-PAN" },
  { date: "2026-06-18", time: "02:00", home: "Uzbekistan", away: "Colombia", matchId: "UZB-COL" },
  { date: "2026-06-18", time: "16:00", home: "Czechia", away: "South Africa", matchId: "CZE-SOU" },
  { date: "2026-06-18", time: "19:00", home: "Switzerland", away: "Bosnia-Herzegovina", matchId: "SWI-BOS" },
  { date: "2026-06-18", time: "22:00", home: "Canada", away: "Qatar", matchId: "CAN-QAT" },
  { date: "2026-06-19", time: "01:00", home: "Mexico", away: "South Korea", matchId: "MEX-SOU1" },
  { date: "2026-06-19", time: "19:00", home: "United States", away: "Australia", matchId: "UNI-AUS" },
  { date: "2026-06-19", time: "22:00", home: "Scotland", away: "Morocco", matchId: "SCO-MOR" },
  { date: "2026-06-20", time: "00:30", home: "Brazil", away: "Haiti", matchId: "BRA-HAI" },
  { date: "2026-06-20", time: "03:00", home: "Türkiye", away: "Paraguay", matchId: "TUR-PAR" },
  { date: "2026-06-20", time: "17:00", home: "Netherlands", away: "Sweden", matchId: "NET-SWE" },
  { date: "2026-06-20", time: "20:00", home: "Germany", away: "Ivory Coast", matchId: "GER-IVO" },
  { date: "2026-06-21", time: "00:00", home: "Ecuador", away: "Curaçao", matchId: "ECU-CUR" },
  { date: "2026-06-21", time: "04:00", home: "Tunisia", away: "Japan", matchId: "TUN-JAP" },
  { date: "2026-06-21", time: "16:00", home: "Spain", away: "Saudi Arabia", matchId: "SPA-SAU" },
  { date: "2026-06-21", time: "19:00", home: "Belgium", away: "Iran", matchId: "BEL-IRA" },
  { date: "2026-06-21", time: "22:00", home: "Uruguay", away: "Cape Verde", matchId: "URU-CAP" },
  { date: "2026-06-22", time: "01:00", home: "New Zealand", away: "Egypt", matchId: "NEW-EGY" },
  { date: "2026-06-22", time: "17:00", home: "Argentina", away: "Austria", matchId: "ARG-AUS" },
  { date: "2026-06-22", time: "21:00", home: "France", away: "Iraq", matchId: "FRA-IRA" },
  { date: "2026-06-23", time: "00:00", home: "Norway", away: "Senegal", matchId: "NOR-SEN" },
  { date: "2026-06-23", time: "03:00", home: "Jordan", away: "Algeria", matchId: "JOR-ALG" },
  { date: "2026-06-23", time: "17:00", home: "Portugal", away: "Uzbekistan", matchId: "POR-UZB" },
  { date: "2026-06-23", time: "20:00", home: "England", away: "Ghana", matchId: "ENG-GHA" },
  { date: "2026-06-23", time: "23:00", home: "Panama", away: "Croatia", matchId: "PAN-CRO" },
  { date: "2026-06-24", time: "02:00", home: "Colombia", away: "Congo DR", matchId: "COL-CON" },
  { date: "2026-06-24", time: "19:00", home: "Bosnia-Herzegovina", away: "Qatar", matchId: "BOS-QAT" },
  { date: "2026-06-24", time: "19:00", home: "Switzerland", away: "Canada", matchId: "SWI-CAN" },
  { date: "2026-06-24", time: "22:00", home: "Morocco", away: "Haiti", matchId: "MOR-HAI" },
  { date: "2026-06-24", time: "22:00", home: "Scotland", away: "Brazil", matchId: "SCO-BRA" },
  { date: "2026-06-25", time: "01:00", home: "Czechia", away: "Mexico", matchId: "CZE-MEX" },
  { date: "2026-06-25", time: "01:00", home: "South Africa", away: "South Korea", matchId: "SOU-SOU" },
  { date: "2026-06-25", time: "20:00", home: "Curaçao", away: "Ivory Coast", matchId: "CUR-IVO" },
  { date: "2026-06-25", time: "20:00", home: "Ecuador", away: "Germany", matchId: "ECU-GER" },
  { date: "2026-06-25", time: "23:00", home: "Japan", away: "Sweden", matchId: "JAP-SWE" },
  { date: "2026-06-25", time: "23:00", home: "Tunisia", away: "Netherlands", matchId: "TUN-NET" },
  { date: "2026-06-26", time: "02:00", home: "Paraguay", away: "Australia", matchId: "PAR-AUS" },
  { date: "2026-06-26", time: "02:00", home: "Türkiye", away: "United States", matchId: "TUR-UNI" },
  { date: "2026-06-26", time: "19:00", home: "Norway", away: "France", matchId: "NOR-FRA" },
  { date: "2026-06-26", time: "19:00", home: "Senegal", away: "Iraq", matchId: "SEN-IRA" },
  { date: "2026-06-27", time: "00:00", home: "Cape Verde", away: "Saudi Arabia", matchId: "CAP-SAU" },
  { date: "2026-06-27", time: "00:00", home: "Uruguay", away: "Spain", matchId: "URU-SPA" },
  { date: "2026-06-27", time: "03:00", home: "Egypt", away: "Iran", matchId: "EGY-IRA" },
  { date: "2026-06-27", time: "03:00", home: "New Zealand", away: "Belgium", matchId: "NEW-BEL" },
  { date: "2026-06-27", time: "21:00", home: "Croatia", away: "Ghana", matchId: "CRO-GHA" },
  { date: "2026-06-27", time: "21:00", home: "Panama", away: "England", matchId: "PAN-ENG" },
  { date: "2026-06-27", time: "23:30", home: "Colombia", away: "Portugal", matchId: "COL-POR" },
  { date: "2026-06-27", time: "23:30", home: "Congo DR", away: "Uzbekistan", matchId: "CON-UZB" },
  { date: "2026-06-28", time: "02:00", home: "Algeria", away: "Austria", matchId: "ALG-AUS" },
  { date: "2026-06-28", time: "02:00", home: "Jordan", away: "Argentina", matchId: "JOR-ARG" },
];

// Hot takes per user
const TAKES: Record<string, string[]> = {
  F5: [
    "Mexico opening night at Banorte, crowd goes insane",
    "South Korea always shows up in WC",
    "Canada hosting is a game changer",
    "USA at SoFi, home advantage is real",
    "Brazil vs Morocco is the match of the group",
    "Germany will destroy Curaçao",
    "Netherlands vs Japan is quality",
    "Spain too strong for Cape Verde",
    "Belgium's last dance with this generation",
    "France cruises through group",
    "England vs Croatia 2018 rematch",
    "Argentina still dangerous even post-Messi era",
    "Portugal destroys Congo DR",
    "Turkey at home soil, dangerous",
    "Uruguay always peaks in World Cups",
    "Japan beats Tunisia easily",
    "Brazil only needs 3 matches to top the group",
    "Colombia dark horse of the tournament",
    "USA beats Australia, book it",
    "Norway with Haaland is scary",
    "England vs Ghana will be interesting",
    "Croatia still has Modric magic",
    "Switzerland always makes knockout rounds",
    "Morocco rides 2022 momentum",
  ],
  Aleko: [
    "Czechia pulls off the upset vs South Korea",
    "Bosnia shocks Canada at BMO Field",
    "Paraguay takes points off USA",
    "Qatar proves 2022 wasn't a fluke",
    "Haiti beats Scotland, Caribbean pride",
    "Türkiye upsets Australia on home turf",
    "Ivory Coast silences Ecuador",
    "Tunisia gets result vs Sweden",
    "Saudi Arabia shocks Uruguay again",
    "New Zealand draws Iran, Kiwi resilience",
    "Iraq surprises Norway",
    "Jordan takes a point off Algeria",
    "Congo DR upsets Portugal",
    "Ghana beats Panama in opener",
    "Uzbekistan stuns Colombia",
    "Czechia beats South Africa comfortably",
    "Haiti draws Scotland again",
    "Ecuador beats Germany, calling it",
    "Japan beats Netherlands",
    "Tunisia takes a point off Netherlands",
    "Panama draws Croatia",
    "Congo DR beats Uzbekistan",
    "Jordan upsets Argentina",
    "Algeria takes down Austria",
  ],
  Tita: [
    "Draw. Definitely a draw.",
    "Low scoring, 1-1 at most",
    "Neither team breaks through",
    "Defensive affair, shared points",
    "Safe pick, both teams evenly matched",
    "0-0 written all over this one",
    "Boring game but a point is valuable",
    "Both teams playing not to lose",
    "This screams draw to me",
    "Set piece decides it, but it ends level",
    "Neither side has the cutting edge",
    "Conservative tactics, draw incoming",
  ],
  Rex: [
    "Mexico 2-0, easy opener",
    "South Korea 1-0, clinical finish",
    "Canada 3-1, home crowd carries them",
    "USA dominates Paraguay, 3-0",
    "Qatar is free points for Switzerland",
    "Brazil 4-0 Morocco, not even close",
    "Haiti can't handle Scotland",
    "Germany obliterates Curaçao, 5-0",
    "Netherlands 2-0 Japan, total football",
    "Spain 4-0 Cape Verde, stroll in the park",
    "Belgium 2-0 Egypt, golden gen farewell tour",
    "Uruguay 3-0 Saudi Arabia",
    "France 3-0 Senegal, Mbappe feast",
    "Argentina 2-0 Algeria, statement win",
    "Portugal 3-0 Congo DR, cruise control",
    "England 2-0 Croatia, revenge game",
    "Brazil cruises past Haiti 4-0",
    "Germany 3-0 Ivory Coast",
    "Argentina 2-0 Austria",
    "France 3-1 Iraq",
    "Portugal demolishes Uzbekistan 4-0",
    "England beats Ghana 3-0",
    "Norway 2-1 Senegal, Haaland brace",
    "Colombia 2-0 Congo DR",
  ],
  Nina: [],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWinner(user: typeof USERS[0]): "HOME" | "AWAY" | "DRAW" {
  if (user.bias === "HOME") return "HOME";
  if (user.bias === "AWAY") return "AWAY";
  if (user.bias === "DRAW") return "DRAW";
  return pick(["HOME", "AWAY", "DRAW"] as const);
}

async function predict(user: string, match: typeof MATCHES[0], win: string, confidence: number, take: string, attempt = 1): Promise<boolean> {
  try {
    const r = await fetch(`${API}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, matchId: match.matchId, home: match.home, away: match.away, pick: win, confidence, take }),
    });
    const data = await r.json();
    if (data.error) {
      if ((data.error.includes("429") || data.error.includes("Rate limit") || data.error.includes("retry_after")) && attempt < 4) {
        const wait = 65 * attempt;
        console.log(`  ⏳ ${user}: ${match.matchId} — rate limited, waiting ${wait}s (attempt ${attempt}/3)...`);
        await new Promise(r => setTimeout(r, wait * 1000));
        return predict(user, match, win, confidence, take, attempt + 1);
      }
      console.error(`  ✗ ${user}: ${match.matchId} — ${data.error}`);
      return false;
    }
    console.log(`  ✓ ${user}: ${match.matchId} → ${win} (${confidence}%)${take ? ' "' + take.substring(0, 40) + '..."' : ""}`);
    return true;
  } catch (e: any) {
    console.error(`  ✗ ${user}: ${match.matchId} — ${e.message}`);
    return false;
  }
}

async function main() {
  console.log(`\n=== Seeding ALL ${MATCHES.length} matches × ${USERS.length} users = ${MATCHES.length * USERS.length} predictions ===\n`);
  console.log(`Delay: 2.5s between requests (30 req/min limit)`);
  console.log(`Estimated time: ${Math.ceil(MATCHES.length * USERS.length * 2.5 / 60)} minutes\n`);

  let total = 0;
  let failed = 0;

  for (const user of USERS) {
    console.log(`\n── ${user.name} (${user.bias} bias) ──`);
    const takes = user.takes && TAKES[user.name] ? [...TAKES[user.name]] : [];

    for (const match of MATCHES) {
      const win = pickWinner(user);
      const conf = randInt(user.confRange[0], user.confRange[1]);
      const take = takes.length > 0 ? pick(takes) : "";
      if (take) {
        const idx = takes.indexOf(take);
        if (idx > -1) takes.splice(idx, 1);
      }

      const ok = await predict(user.name, match, win, conf, take);
      if (ok) total++;
      else failed++;

      await new Promise(r => setTimeout(r, 2500));
    }
  }

  console.log(`\n=== Done: ${total} predictions seeded, ${failed} failed ===`);
}

main().catch(console.error);
