/**
 * Scoring engine. Pure functions over recalled memories — no I/O.
 * This is where "memory does real work": the agent's behaviour (the roast) is a
 * function of facts it learned in PAST sessions, recalled from Walrus.
 */
import {
  Prediction,
  MatchResult,
  ScoredPick,
  RecordSummary,
} from "../data/model.js";

export function scorePicks(
  preds: Prediction[],
  results: MatchResult[],
): ScoredPick[] {
  const byMatch = new Map(results.map((r) => [r.matchId, r]));
  return preds.map((p) => {
    const r = byMatch.get(p.matchId);
    if (!r) return { ...p, correct: null };
    return { ...p, correct: p.pick === r.outcome, actual: r.outcome };
  });
}

export function summarize(user: string, scored: ScoredPick[]): RecordSummary {
  const decided = scored.filter((s) => s.correct !== null);
  const correct = decided.filter((s) => s.correct).length;
  const byTeamPicked: RecordSummary["byTeamPicked"] = {};

  for (const s of scored) {
    // attribute the pick to the team the user backed
    const team =
      s.pick === "HOME" ? s.home : s.pick === "AWAY" ? s.away : "DRAW";
    byTeamPicked[team] ??= { picks: 0, correct: 0 };
    byTeamPicked[team].picks += 1;
    if (s.correct) byTeamPicked[team].correct += 1;
  }

  const avgConfidence =
    scored.length === 0
      ? 0
      : Math.round(
          scored.reduce((a, s) => a + s.confidence, 0) / scored.length,
        );

  const overconfidentMisses = decided.filter(
    (s) => s.confidence >= 70 && s.correct === false,
  ).length;

  return {
    user,
    total: scored.length,
    decided: decided.length,
    correct,
    accuracy: decided.length ? correct / decided.length : 0,
    byTeamPicked,
    avgConfidence,
    overconfidentMisses,
  };
}

/** The team the user backs most — the bias the roast will target. */
export function favouriteBias(
  summary: RecordSummary,
): { team: string; picks: number; correct: number } | null {
  const entries = Object.entries(summary.byTeamPicked)
    .filter(([t]) => t !== "DRAW")
    .sort((a, b) => b[1].picks - a[1].picks);
  if (entries.length === 0) return null;
  const [team, rec] = entries[0];
  if (rec.picks < 2) return null; // need a pattern, not a one-off
  return { team, picks: rec.picks, correct: rec.correct };
}
