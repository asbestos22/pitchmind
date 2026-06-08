import { predictionToMemory, resultToMemory, parsePrediction, parseResult, Prediction, MatchResult } from "../src/data/model.js";
import { scorePicks, summarize } from "../src/agent/score.js";
import { templateRoast } from "../src/agent/roast.js";

const preds: Prediction[] = [
  { user: "alex", matchId: "WC-A1", home: "Brazil", away: "Croatia", pick: "HOME", confidence: 85, take: "Brazil walks this, no contest", ts: "2026-06-05T10:00:00Z" },
  { user: "alex", matchId: "WC-B1", home: "Brazil", away: "Germany", pick: "HOME", confidence: 80, take: "7-1 revenge irrelevant, Brazil again", ts: "2026-06-06T10:00:00Z" },
  { user: "alex", matchId: "WC-C1", home: "Brazil", away: "Spain", pick: "HOME", confidence: 75, take: "I will never bet against Brazil", ts: "2026-06-07T10:00:00Z" },
  { user: "alex", matchId: "WC-A2", home: "Argentina", away: "Nigeria", pick: "HOME", confidence: 70, take: "Messi rolls", ts: "2026-06-05T11:00:00Z" },
];
const results: MatchResult[] = [
  { matchId: "WC-A1", home: "Brazil", away: "Croatia", homeScore: 1, awayScore: 2, outcome: "AWAY", ts: "t" },
  { matchId: "WC-B1", home: "Brazil", away: "Germany", homeScore: 0, awayScore: 2, outcome: "AWAY", ts: "t" },
  { matchId: "WC-C1", home: "Brazil", away: "Spain", homeScore: 1, awayScore: 1, outcome: "DRAW", ts: "t" },
  { matchId: "WC-A2", home: "Argentina", away: "Nigeria", homeScore: 3, awayScore: 1, outcome: "HOME", ts: "t" },
];

let fail = 0;
const check = (label: string, cond: boolean) => { console.log((cond ? "PASS" : "FAIL") + " " + label); if (!cond) fail++; };

const line = predictionToMemory(preds[0]);
const rp = parsePrediction(line);
check("prediction round-trip", !!rp && rp.pick === "HOME" && rp.confidence === 85 && rp.take.includes("Brazil") && rp.matchId === "WC-A1");

const rl = parseResult(resultToMemory(results[0]));
check("result round-trip", !!rl && rl.outcome === "AWAY" && rl.homeScore === 1 && rl.awayScore === 2 && rl.away === "Croatia");

const scored = scorePicks(preds, results);
const sum = summarize("alex", scored);
check("record 1/4 correct", sum.correct === 1 && sum.decided === 4);
check("brazil bias detected 0/3", sum.byTeamPicked["Brazil"]?.picks === 3 && sum.byTeamPicked["Brazil"]?.correct === 0);
check("overconfident misses counted", sum.overconfidentMisses === 3);

const day1 = templateRoast({ summary: summarize("alex", []), scored: [], day: 1 });
check("day1 says doesn't know you", day1.includes("don't know you"));

const day4 = templateRoast({ summary: sum, scored, day: 4 });
check("day4 cites Brazil bias", day4.includes("Brazil"));
check("day4 quotes a past take (receipt)", day4.includes("I kept the receipt"));

console.log("\n--- DAY 1 ---\n" + day1);
console.log("\n--- DAY 4 ---\n" + day4);
console.log("\n" + (fail === 0 ? "ALL TESTS PASSED" : fail + " TEST(S) FAILED"));
process.exit(fail === 0 ? 0 : 1);
