/**
 * Domain model. Memories are stored on Walrus as compact, prefixed lines so they
 * are both human-readable in a blob viewer AND machine-parseable on recall.
 *
 * Line format (one fact per memory):
 *   PRED | <user> | <matchId> | <home> vs <away> | pick=<HOME|DRAW|AWAY> | conf=<0-100> | take="<freeform hot take>" | ts=<iso>
 *   RSLT | <matchId> | <home> <hs>-<as> <away> | outcome=<HOME|DRAW|AWAY> | ts=<iso>
 *   ROAST| <user> | day=<n> | text="<the roast that was shown>" | ts=<iso>
 */

export type Outcome = "HOME" | "DRAW" | "AWAY";

export interface Prediction {
  user: string;
  matchId: string;
  home: string;
  away: string;
  pick: Outcome;
  confidence: number; // 0-100
  take: string;
  ts: string;
}

export interface MatchResult {
  matchId: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  outcome: Outcome;
  ts: string;
}

export interface ScoredPick extends Prediction {
  correct: boolean | null; // null = no result yet
  actual?: Outcome;
}

export interface RecordSummary {
  user: string;
  total: number;
  decided: number;
  correct: number;
  accuracy: number; // 0-1 over decided
  byTeamPicked: Record<string, { picks: number; correct: number }>;
  avgConfidence: number;
  overconfidentMisses: number; // conf>=70 but wrong
}

const q = (s: string) => `"${s.replace(/"/g, "'")}"`;

export function predictionToMemory(p: Prediction): string {
  return [
    "PRED",
    p.user,
    p.matchId,
    `${p.home} vs ${p.away}`,
    `pick=${p.pick}`,
    `conf=${p.confidence}`,
    `take=${q(p.take)}`,
    `ts=${p.ts}`,
  ].join(" | ");
}

export function resultToMemory(r: MatchResult): string {
  return [
    "RSLT",
    r.matchId,
    `${r.home} ${r.homeScore}-${r.awayScore} ${r.away}`,
    `outcome=${r.outcome}`,
    `ts=${r.ts}`,
  ].join(" | ");
}

export function roastToMemory(user: string, day: number, text: string): string {
  return ["ROAST", user, `day=${day}`, `text=${q(text)}`, `ts=${new Date().toISOString()}`].join(" | ");
}

const field = (line: string, name: string): string | undefined => {
  const m = line.match(new RegExp(`${name}=(?:"([^"]*)"|([^|]+))`));
  if (!m) return undefined;
  return (m[1] ?? m[2] ?? "").trim();
};

export function parsePrediction(line: string): Prediction | null {
  if (!line.startsWith("PRED")) return null;
  const parts = line.split("|").map((s) => s.trim());
  // PRED | user | matchId | home vs away | ...
  const user = parts[1];
  const matchId = parts[2];
  const vs = (parts[3] ?? "").split(" vs ");
  const pick = field(line, "pick") as Outcome;
  const conf = Number(field(line, "conf") ?? "50");
  const take = field(line, "take") ?? "";
  const ts = field(line, "ts") ?? "";
  if (!user || !matchId || !pick) return null;
  return { user, matchId, home: vs[0] ?? "?", away: vs[1] ?? "?", pick, confidence: conf, take, ts };
}

export function parseResult(line: string): MatchResult | null {
  if (!line.startsWith("RSLT")) return null;
  const parts = line.split("|").map((s) => s.trim());
  const matchId = parts[1];
  const score = parts[2] ?? "";
  const m = score.match(/^(.+?)\s+(\d+)-(\d+)\s+(.+)$/);
  const outcome = field(line, "outcome") as Outcome;
  const ts = field(line, "ts") ?? "";
  if (!matchId || !m || !outcome) return null;
  return {
    matchId,
    home: m[1],
    homeScore: Number(m[2]),
    awayScore: Number(m[3]),
    away: m[4],
    outcome,
    ts,
  };
}
