# 🧠⚽ PitchMind

An AI agent that **remembers your FIFA World Cup 2026 predictions** and roasts your record with receipts — built for **Walrus Sessions 4: Walrus Memory World Cup**.

All agent state (every prediction, every result, every roast) is persisted to **Walrus Mainnet** via [Walrus Memory](https://docs.wal.app/walrus-memory). The agent holds **no durable local state** — when it roasts you, it is recalling facts from earlier sessions straight off Walrus. That is the whole point: on **day 1** it knows nothing about you; by **day 4+** it can quote a hot take you made days ago and use it against you. That before/after is impossible without persistent memory.

## Why this fits the brief

> "The agent must demonstrate genuine persistent memory — it must reference something it learned about the user in a previous session and use it in a way that would not have been possible on day one."

PitchMind's roast is a pure function of memories recalled from Walrus:
- Tracks every pick + confidence + free-form hot take.
- Scores them once results land.
- Detects your **bias** (the team you over-back) and your **overconfident misses**.
- Quotes your own past takes back at you as receipts.

Day 1 roast: *"I don't know you yet."*
Day 4 roast: *"You've backed Brazil 3 times, hit 0. 'I will never bet against Brazil, ever' — they've lost twice and drawn once. I kept the receipt."*

## Architecture

```
CLI / Web UI
     │
     ▼
PitchMind agent (src/agent/agent.ts)
     │  store(text)            recall(query)
     ▼                              ▲
WalrusMemory wrapper (src/walrus/memory.ts)
     │  @mysten-incubation/memwal
     ▼
Walrus Memory relayer (mainnet)  ── encrypts (Seal) + writes blobs ──▶  Walrus Mainnet
```

- **Memories** are stored as compact prefixed lines (`PRED | … | take="…"`, `RSLT | …`, `ROAST | …`) — human-readable in a blob viewer, machine-parseable on recall. See `src/data/model.ts`.
- **Scoring** is pure (`src/agent/score.ts`): record summary, favourite-team bias, overconfident misses.
- **Roast** (`src/agent/roast.ts`): LLM-backed (OpenAI-compatible) with a deterministic template fallback, so the demo works with **zero** API keys.

## Setup

```bash
npm install
cp .env.example .env
```

### Provision Walrus Memory (mainnet, one-time)

You need a **dedicated Sui mainnet wallet** (created for these sessions) with a little SUI for gas. Then either:

**A. Script:**
```bash
export SUI_PRIVATE_KEY=suiprivkey1...   # dedicated session wallet
npm run provision                        # prints MEMWAL_DELEGATE_KEY + MEMWAL_ACCOUNT_ID
```
Paste the printed values into `.env`. With the hosted relayer (`https://relayer.memory.walrus.xyz`), the **relayer pays WAL + SUI for blob storage** — your delegate key only authorizes writes.

**B. Dashboard:** provision at https://memory.walrus.xyz and paste the account id + delegate key into `.env`.

> ⚠️ Provisioning creates one on-chain account object on Sui mainnet (small SUI gas, paid by the wallet you sign with). It moves no other funds.

## Usage

```bash
npm run health                       # relayer reachable?

# log a prediction (writes a blob to Walrus)
npm run predict -- --user alex --match WC-A1 --home Brazil --away Croatia \
  --pick HOME --conf 85 --take "Brazil walks this, no contest"

# later, log the result
npm run result -- --match WC-A1 --home Brazil --away Croatia --hs 1 --as 2

# the payoff — recall everything from Walrus and roast it
npm run roast -- --user alex --day 4

# read-only record
npm run recap -- --user alex
```

### Demo seed (for the before/after video)

```bash
tsx scripts/seed-demo.ts alex      # stores ~6 picks + 4 results on Walrus
npm run roast -- --user alex --day 1   # (run before seeding to show the "I don't know you" state)
npm run roast -- --user alex --day 4   # the receipts roast
```

### Web UI (the public interface the rules require)

```bash
npm run serve     # http://localhost:8787
```
Log picks, log results, hit **Roast me** — the prediction history + roast render live, all backed by Walrus.

## Memory portability

```bash
# wipe local state, pull everything back from Walrus:
node -e "import('./dist/agent/agent.js').then(m=>m.PitchMind.fromEnv().restore().then(console.log))"
```

## Build / type-check

```bash
npm run build
```

## Project layout

```
src/
  walrus/memory.ts   Walrus Memory SDK wrapper (store / recall / restore)
  data/model.ts      memory line format + parsers
  agent/score.ts     pure scoring + bias detection
  agent/roast.ts     LLM roast + template fallback
  agent/agent.ts     orchestration
  cli.ts             command line
  server.ts          HTTP API + static UI
public/              the visible interface
scripts/             provision + demo seed
```

## License

MIT
