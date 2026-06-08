/**
 * Seed fake users with predictions to build demo data.
 * Run once: npx tsx scripts/seed-demo.ts
 * Or schedule daily for cumulative effect.
 */
import "dotenv/config";

const API = process.env.API_URL ?? "http://localhost:8787";

// ── Fake users with distinct personalities ──
const USERS = [
  {
    name: "F5",
    bias: "HOME",     // loves home wins
    confRange: [65, 90],
    takes: true,
  },
  {
    name: "Aleko",
    bias: "AWAY",     // contrarian, picks upsets
    confRange: [30, 60],
    takes: true,
  },
  {
    name: "Tita",
    bias: "DRAW",     // the cautious one
    confRange: [50, 75],
    takes: false,
  },
  {
    name: "Rex",
    bias: "HOME",     // confident homer
    confRange: [80, 95],
    takes: true,
  },
  {
    name: "Nina",
    bias: "none",     // genuine random
    confRange: [40, 70],
    takes: true,
  },
];

// ── WC2026 schedule (matches only) ──
const MATCHES = [
  { date: "2026-06-11", time: "17:00", home: "Mexico", away: "South Africa", group: "A", matchId: "MEX-RSA" },
  { date: "2026-06-11", time: "20:00", home: "Uruguay", away: "France", group: "A", matchId: "URU-FRA" },
  { date: "2026-06-11", time: "23:00", home: "Spain", away: "New Zealand", group: "B", matchId: "ESP-NZL" },
  { date: "2026-06-12", time: "17:00", home: "Germany", away: "Japan", group: "E", matchId: "GER-JPN" },
  { date: "2026-06-12", time: "20:00", home: "Argentina", away: "Saudi Arabia", group: "C", matchId: "ARG-KSA" },
  { date: "2026-06-12", time: "23:00", home: "England", away: "Iran", group: "B", matchId: "ENG-IRN" },
  { date: "2026-06-13", time: "14:00", home: "Senegal", away: "Netherlands", group: "A", matchId: "SEN-NED" },
  { date: "2026-06-13", time: "17:00", home: "Portugal", away: "Ghana", group: "H", matchId: "POR-GHA" },
  { date: "2026-06-13", time: "20:00", home: "Brazil", away: "Serbia", group: "G", matchId: "BRA-SRB" },
  { date: "2026-06-13", time: "23:00", home: "Belgium", away: "Canada", group: "F", matchId: "BEL-CAN" },
  { date: "2026-06-14", time: "14:00", home: "Morocco", away: "Croatia", group: "F", matchId: "MAR-CRO" },
  { date: "2026-06-14", time: "17:00", home: "Costa Rica", away: "Germany", group: "E", matchId: "CRC-GER" },
  { date: "2026-06-14", time: "20:00", home: "Switzerland", away: "Cameroon", group: "G", matchId: "SUI-CMR" },
  { date: "2026-06-14", time: "23:00", home: "Uruguay", away: "South Korea", group: "A", matchId: "URU-KOR" },
  { date: "2026-06-15", time: "14:00", home: "Portugal", away: "Uruguay", group: "H", matchId: "POR-URU" },
  { date: "2026-06-15", time: "17:00", home: "Nigeria", away: "Argentina", group: "C", matchId: "NGA-ARG" },
  { date: "2026-06-15", time: "20:00", home: "Japan", away: "Spain", group: "E", matchId: "JPN-ESP" },
  { date: "2026-06-15", time: "23:00", home: "France", away: "Denmark", group: "A", matchId: "FRA-DEN" },
  { date: "2026-06-16", time: "14:00", home: "Poland", away: "Mexico", group: "C", matchId: "POL-MEX" },
  { date: "2026-06-16", time: "17:00", home: "Saudi Arabia", away: "Poland", group: "C", matchId: "KSA-POL" },
  { date: "2026-06-16", time: "20:00", home: "Iran", away: "USA", group: "B", matchId: "IRN-USA" },
  { date: "2026-06-16", time: "23:00", home: "Australia", away: "Denmark", group: "D", matchId: "AUS-DEN" },
  { date: "2026-06-17", time: "14:00", home: "Tunisia", away: "France", group: "D", matchId: "TUN-FRA" },
  { date: "2026-06-17", time: "17:00", home: "Ecuador", away: "Senegal", group: "A", matchId: "ECU-SEN" },
  { date: "2026-06-17", time: "20:00", home: "Canada", away: "Morocco", group: "F", matchId: "CAN-MAR" },
  { date: "2026-06-17", time: "23:00", home: "Japan", away: "Costa Rica", group: "E", matchId: "JPN-CRC" },
  { date: "2026-06-18", time: "14:00", home: "Ghana", away: "South Korea", group: "H", matchId: "GHA-KOR" },
  { date: "2026-06-18", time: "17:00", home: "Brazil", away: "Switzerland", group: "G", matchId: "BRA-SUI" },
  { date: "2026-06-18", time: "20:00", home: "Cameroon", away: "Serbia", group: "G", matchId: "CMR-SRB" },
  { date: "2026-06-18", time: "23:00", home: "South Korea", away: "Portugal", group: "H", matchId: "KOR-POR" },
  { date: "2026-06-19", time: "14:00", home: "Netherlands", away: "Ecuador", group: "A", matchId: "NED-ECU" },
  { date: "2026-06-19", time: "17:00", home: "England", away: "USA", group: "B", matchId: "ENG-USA" },
  { date: "2026-06-19", time: "20:00", home: "Iran", away: "Wales", group: "B", matchId: "IRN-WAL" },
  { date: "2026-06-19", time: "23:00", home: "Argentina", away: "Mexico", group: "C", matchId: "ARG-MEX" },
];

// Hot takes for personality
const TAKES: Record<string, string[]> = {
  F5: [
    "Mexico opening game — crowd factor is everything",
    "Spain just too technical, easy pick",
    "Germany bounce-back tournament, they always show up",
    "Argentina without Messi is a different team",
    "England always chokes but Iran is worse",
    "Netherlands is the dark horse this year",
    "Portugal in cruise control vs Ghana",
    "Brazil is Brazil, enough said",
    "Belgium golden generation is done, Canada is hungry",
    "Morocco showed they belong in 2022, still believe",
    "Germany loses to Costa Rica, calling it now",
    "Switzerland always makes it out of groups",
    "Uruguay has the squad to go deep",
    "Portugal vs Uruguay is the real final",
    "Nigeria pulls off the upset vs Argentina",
    "Spain beats Japan but it's closer than expected",
    "France cruises past Denmark",
    "Poland and Mexico cancel each other out",
    "USA beats Iran, crowd goes wild",
    "Tunisia has nothing for France",
    "Canada shocks Morocco",
    "Brazil doesn't drop points vs Switzerland",
    "South Korea vs Portugal is pure chaos",
    "Netherlands finishes top of the group",
    "England vs USA is a tactical snooze fest",
    "Argentina bounces back vs Mexico",
  ],
  Aleko: [
    "South Africa will shock everyone, calling it",
    "Uruguay is overrated this cycle",
    "New Zealand has the underdog spirit",
    "Japan beats Germany, you heard it here first",
    "Saudi Arabia pulls off another miracle",
    "Iran is more dangerous than people think",
    "Ghana causes problems for Portugal",
    "Serbia is the team nobody wants to face",
    "Canada beats Belgium, the maple leaf rises",
    "Croatia's midfield is still elite",
    "Cameroon can upset anyone on their day",
    "South Korea vs Portugal — upsets happen",
    "Tunisia gets a result vs France",
    "Costa Rica learned from their 2014 run",
    "Australia vs Denmark is a coin flip",
    "Ecuador is underrated, Senegal should worry",
    "Nigeria has the pace to hurt Argentina",
    "Wales will fight Iran tooth and nail",
    "Saudi Arabia vs Poland, neither wants to win",
  ],
  Tita: [
    "Draw. Definitely a draw.",
    "Low scoring, probably 1-1",
    "Neither team has enough to break through",
    "Set piece decides it, but it's 0-0 before that",
    "Safe pick, both teams cancel each other out",
    "Defensive affair, draw written all over it",
    "Neither team will risk it early, draw",
    "Boring game incoming, but a point is valuable",
    "Both teams playing not to lose",
    "This screams 1-1 to me",
  ],
  Rex: [
    "Mexico wins, period. Home crowd, opening match.",
    "Uruguay beats France, they're built different",
    "Spain obliterates New Zealand, 4-0 vibes",
    "Germany destroys Japan, it's not even close",
    "Argentina wins comfortably, Messi's legacy match",
    "England cruises past Iran, 3-0 at least",
    "Netherlands wins easy, they always peak in groups",
    "Portugal dismantles Ghana, Ronaldo scores twice",
    "Brazil wins 3-0, Serbia can't handle the flair",
    "Belgium handles Canada with ease",
    "Morocco dominates Croatia, 2-0",
    "Germany bounces back HARD vs Costa Rica",
    "Switzerland cruises past Cameroon",
    "Uruguay beats South Korea, 2-0",
    "Portugal edges Uruguay in a classic",
    "Argentina batters Nigeria, 3-1",
    "Spain edges Japan but wins, 2-1",
    "France beats Denmark, Mbappe masterclass",
    "Poland beats Mexico, Lewandowski scores",
    "USA beats Iran convincingly",
    "France demolishes Tunisia, 4-0",
    "Netherlands finishes Senegal off, 2-0",
    "England beats USA, 2-0 clean sheet",
    "Argentina crushes Mexico, 3-0",
  ],
  Nina: [],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWinner(user: typeof USERS[0], match: typeof MATCHES[0]): "HOME" | "AWAY" | "DRAW" {
  if (user.bias === "HOME") return "HOME";
  if (user.bias === "AWAY") return "AWAY";
  if (user.bias === "DRAW") return "DRAW";
  // Random
  const picks: ("HOME" | "AWAY" | "DRAW")[] = ["HOME", "AWAY", "DRAW"];
  return pick(picks);
}

// Pick a subset of matches per user (not all, to feel realistic)
function pickMatches(user: typeof USERS[0]): typeof MATCHES {
  // Each user picks 15-25 matches total across the tournament
  const count = randInt(15, 25);
  const shuffled = [...MATCHES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

async function predict(user: string, match: typeof MATCHES[0], pick: string, confidence: number, take: string): Promise<boolean> {
  const body = {
    user,
    matchId: match.matchId,
    home: match.home,
    away: match.away,
    pick,
    confidence,
    take,
  };

  try {
    const r = await fetch(`${API}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (data.error) {
      console.error(`  ✗ ${user}: ${match.matchId} — ${data.error}`);
      return false;
    }
    console.log(`  ✓ ${user}: ${match.matchId} → ${pick} (${confidence}%)`);
    return true;
  } catch (e: any) {
    console.error(`  ✗ ${user}: ${match.matchId} — ${e.message}`);
    return false;
  }
}

async function main() {
  const dayArg = process.argv[2]; // optional: "1", "2", etc.
  const targetDay = dayArg ? parseInt(dayArg) : 1;

  // Map day to date ranges
  const dayDates: Record<number, string[]> = {
    1: ["2026-06-11"],
    2: ["2026-06-12"],
    3: ["2026-06-13"],
    4: ["2026-06-14"],
    5: ["2026-06-15"],
    6: ["2026-06-16"],
    7: ["2026-06-17"],
    8: ["2026-06-18"],
    9: ["2026-06-19"],
  };

  const dates = dayDates[targetDay] || dayDates[1];
  console.log(`\n=== Seeding day ${targetDay} (${dates.join(", ")}) ===\n`);

  let total = 0;

  for (const user of USERS) {
    console.log(`\n${user.name} (${user.bias} bias):`);

    const userMatches = pickMatches(user).filter(m => dates.includes(m.date));

    for (const match of userMatches) {
      const win = pickWinner(user, match);
      const conf = randInt(user.confRange[0], user.confRange[1]);
      const take = user.takes && TAKES[user.name]?.length
        ? pick(TAKES[user.name])
        : "";

      // Delete take from pool to avoid repeats
      if (user.takes && TAKES[user.name]) {
        const idx = TAKES[user.name].indexOf(take);
        if (idx > -1) TAKES[user.name].splice(idx, 1);
      }

      const ok = await predict(user.name, match, win, conf, take);
      if (ok) total++;

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log(`\n=== Done: ${total} predictions seeded ===`);
}

main().catch(console.error);
