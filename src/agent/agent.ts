/**
 * PitchMind agent. Orchestrates: recall everything from Walrus -> parse ->
 * score -> roast. Every write goes to Walrus Mainnet; every read comes back
 * from Walrus via semantic recall. The agent holds no durable local state.
 */
import { WalrusMemory } from "../walrus/memory.js";
import {
  Prediction,
  MatchResult,
  predictionToMemory,
  resultToMemory,
  roastToMemory,
  parsePrediction,
  parseResult,
} from "../data/model.js";
import { scorePicks, summarize } from "./score.js";
import { llmRoast } from "./roast.js";

const RECALL_LIMIT = 100;

export class PitchMind {
  constructor(private mem: WalrusMemory) {}

  static fromEnv(): PitchMind {
    return new PitchMind(WalrusMemory.fromEnv());
  }

  async health() {
    return this.mem.health();
  }

  /** Record a prediction on Walrus. Returns the on-chain blob id. */
  async predict(p: Omit<Prediction, "ts">): Promise<{ blob_id: string }> {
    const full: Prediction = { ...p, ts: new Date().toISOString() };
    const { blob_id } = await this.mem.store(predictionToMemory(full));
    return { blob_id };
  }

  /** Record a match result on Walrus. */
  async result(r: Omit<MatchResult, "ts">): Promise<{ blob_id: string }> {
    const full: MatchResult = { ...r, ts: new Date().toISOString() };
    const { blob_id } = await this.mem.store(resultToMemory(full));
    return { blob_id };
  }

  /** Pull this user's predictions + all results back from Walrus. */
  private async load(user: string): Promise<{ preds: Prediction[]; results: MatchResult[] }> {
    // Sequential recalls to avoid overloading the relayer
    const predHits = await this.mem.recall(`predictions and hot takes by ${user}`, RECALL_LIMIT);
    const resHits = await this.mem.recall(`final match results and scores`, RECALL_LIMIT);
    const preds = dedupePreds(
      predHits
        .map((h) => parsePrediction(h.text))
        .filter((x): x is Prediction => !!x && x.user === user),
    );
    const results = dedupeResults(
      resHits.map((h) => parseResult(h.text)).filter((x): x is MatchResult => !!x),
    );
    return { preds, results };
  }

  /**
   * The headline feature: recall the record from past sessions and roast it.
   * `day` is the tournament day, used to make the before/after explicit.
   */
  async roast(user: string, day: number): Promise<{ roast: string; record: ReturnType<typeof summarize>; blob_id: string }> {
    const { preds, results } = await this.load(user);
    const scored = scorePicks(preds, results);
    const record = summarize(user, scored);
    const roast = await llmRoast({ summary: record, scored, day });
    // persist the roast itself so the memory trail is complete + auditable on Walrus
    const { blob_id } = await this.mem.store(roastToMemory(user, day, roast));
    return { roast, record, blob_id };
  }

  /** Read-only recap for the public UI (does not write a new memory). */
  async recap(user: string) {
    const { preds, results } = await this.load(user);
    const scored = scorePicks(preds, results);
    const record = summarize(user, scored);
    return { scored, record };
  }

  async restore() {
    return this.mem.restore();
  }
}

function dedupePreds(preds: Prediction[]): Prediction[] {
  const seen = new Map<string, Prediction>();
  for (const p of preds) {
    const k = `${p.user}:${p.matchId}`;
    const prev = seen.get(k);
    // keep the latest prediction per match (users can change their mind)
    if (!prev || p.ts > prev.ts) seen.set(k, p);
  }
  return [...seen.values()];
}

function dedupeResults(results: MatchResult[]): MatchResult[] {
  const seen = new Map<string, MatchResult>();
  for (const r of results) {
    const prev = seen.get(r.matchId);
    if (!prev || r.ts > prev.ts) seen.set(r.matchId, r);
  }
  return [...seen.values()];
}
