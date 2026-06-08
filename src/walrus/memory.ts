/**
 * Thin wrapper around @mysten-incubation/memwal (Walrus Memory SDK).
 *
 * All agent state — every prediction, every result, every roast — is written to
 * Walrus Mainnet via the hosted relayer. Nothing about the user's record lives in
 * local files; `recall()` reads it back from Walrus. That is what makes the
 * before/after (day 1 vs day 4+) real: the memory is on-chain, not in RAM.
 *
 * Docs: https://docs.wal.app/walrus-memory/sdk/quick-start
 */
import { MemWal } from "@mysten-incubation/memwal";

export interface MemoryConfig {
  key: string;
  accountId: string;
  serverUrl: string;
  namespace: string;
}

export interface RecallHit {
  blob_id: string;
  text: string;
  distance: number;
}

export class WalrusMemory {
  private client: MemWal;
  readonly namespace: string;

  constructor(cfg: MemoryConfig) {
    if (!cfg.key) throw new Error("MEMWAL_DELEGATE_KEY missing — run `npm run provision`");
    if (!cfg.accountId) throw new Error("MEMWAL_ACCOUNT_ID missing — run `npm run provision`");
    this.namespace = cfg.namespace;
    this.client = MemWal.create({
      key: cfg.key,
      accountId: cfg.accountId,
      serverUrl: cfg.serverUrl,
      namespace: cfg.namespace,
    });
  }

  static fromEnv(): WalrusMemory {
    return new WalrusMemory({
      key: process.env.MEMWAL_DELEGATE_KEY ?? "",
      accountId: process.env.MEMWAL_ACCOUNT_ID ?? "",
      serverUrl: process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz",
      namespace: process.env.MEMWAL_NAMESPACE ?? "pitchmind-wc2026",
    });
  }

  /** Relayer health — no auth, good for readiness checks. */
  async health(): Promise<unknown> {
    return this.client.health();
  }

  /**
   * Persist one memory to Walrus Mainnet and wait until the blob is certified.
   * Returns the Walrus blob_id — the on-chain proof the memory exists.
   */
  async store(text: string): Promise<{ blob_id: string; id: string }> {
    const res = await this.client.rememberAndWait(text, this.namespace);
    return { blob_id: res.blob_id, id: res.id };
  }

  /** Fire-and-forget store (returns a job id). Used for bulk seeding. */
  async storeAsync(text: string): Promise<{ job_id: string }> {
    const res = await this.client.remember(text, this.namespace);
    return { job_id: res.job_id };
  }

  /** Semantic recall from Walrus. Lower distance = closer match. Retries on transient aborts. */
  async recall(query: string, limit = 20): Promise<RecallHit[]> {
    let lastErr: unknown;
    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        const res = await this.client.recall({ query, limit, namespace: this.namespace });
        return res.results ?? [];
      } catch (e) {
        lastErr = e;
        const msg = e instanceof Error ? e.message : String(e);
        // Relayer occasionally aborts heavy recalls — back off and retry.
        if (msg.includes("aborted") || msg.includes("timed out") || msg.includes("429")) {
          await new Promise((r) => setTimeout(r, 4000 * (attempt + 1)));
          continue;
        }
        throw e;
      }
    }
    throw lastErr;
  }

  /**
   * Rebuild the local search index from Walrus. Proves memory portability:
   * wipe the machine, restore() pulls everything back from on-chain storage.
   */
  async restore(limit = 500): Promise<unknown> {
    return this.client.restore(this.namespace, limit);
  }
}
