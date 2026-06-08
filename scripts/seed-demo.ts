/**
 * Seed a believable multi-day record so the before/after (day 1 vs day 4+) can be
 * demoed end-to-end against Walrus Mainnet. Run AFTER provisioning .env.
 *
 *   tsx scripts/seed-demo.ts alex
 *
 * It stores ~6 predictions and 4 results to Walrus, leaving a clear bias pattern
 * (user over-backs one team) for the roast to find.
 */
import "dotenv/config";
import { PitchMind } from "../src/agent/agent.js";

const user = process.argv[2] ?? "alex";

const preds = [
  { matchId: "WC-A1", home: "Brazil", away: "Croatia", pick: "HOME", confidence: 85, take: "Brazil walks this, samba time, no contest" },
  { matchId: "WC-A2", home: "Argentina", away: "Nigeria", pick: "HOME", confidence: 78, take: "Messi farewell tour, they roll" },
  { matchId: "WC-B1", home: "Brazil", away: "Germany", pick: "HOME", confidence: 80, take: "7-1 revenge is irrelevant, Brazil again" },
  { matchId: "WC-B2", home: "England", away: "France", pick: "AWAY", confidence: 60, take: "France midfield too strong" },
  { matchId: "WC-C1", home: "Brazil", away: "Spain", pick: "HOME", confidence: 75, take: "I will never bet against Brazil, ever" },
  { matchId: "WC-C2", home: "Portugal", away: "Morocco", pick: "DRAW", confidence: 55, take: "Morocco are no joke, scrappy draw" },
] as const;

const results = [
  { matchId: "WC-A1", home: "Brazil", away: "Croatia", homeScore: 1, awayScore: 2 }, // Brazil L
  { matchId: "WC-A2", home: "Argentina", away: "Nigeria", homeScore: 3, awayScore: 1 }, // hit
  { matchId: "WC-B1", home: "Brazil", away: "Germany", homeScore: 0, awayScore: 2 }, // Brazil L
  { matchId: "WC-C1", home: "Brazil", away: "Spain", homeScore: 1, awayScore: 1 }, // Brazil draw -> pick HOME miss
] as const;

async function main() {
  const agent = PitchMind.fromEnv();
  console.log("health:", JSON.stringify(await agent.health()));
  for (const p of preds) {
    const o = await agent.predict({ ...p, user });
    console.log(`pred ${p.matchId} -> ${o.blob_id}`);
  }
  for (const r of results) {
    const hs = r.homeScore, as = r.awayScore;
    const o = await agent.result({ ...r, outcome: hs > as ? "HOME" : hs < as ? "AWAY" : "DRAW" });
    console.log(`rslt ${r.matchId} -> ${o.blob_id}`);
  }
  console.log("\nseeded. Now: npm run roast -- --user " + user + " --day 4");
}

main().catch((e) => { console.error(e); process.exit(1); });
