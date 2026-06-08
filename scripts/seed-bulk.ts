/**
 * Bulk seed: ALL 72 matches × 5 users via Walrus Memory bulk API.
 * Batches 20 items at a time, waits for completion, moves to next batch.
 * Run: npx tsx scripts/seed-bulk.ts
 */
import "dotenv/config";
import { MemWal } from "@mysten-incubation/memwal";

const BATCH_SIZE = 20;

const mem = MemWal.create({
  key: process.env.MEMWAL_DELEGATE_KEY!,
  accountId: process.env.MEMWAL_ACCOUNT_ID!,
  serverUrl: process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz",
  namespace: process.env.MEMWAL_NAMESPACE ?? "pitchmind-wc2026",
});

const USERS = [
  { name: "F5",    bias: "HOME", conf: [65, 90] as [number, number] },
  { name: "Aleko", bias: "AWAY", conf: [30, 60] as [number, number] },
  { name: "Tita",  bias: "DRAW", conf: [50, 75] as [number, number] },
  { name: "Rex",   bias: "HOME", conf: [80, 95] as [number, number] },
  { name: "Nina",  bias: "none", conf: [40, 70] as [number, number] },
];

const MATCHES: [string, string, string, string, string][] = [
  ["2026-06-11","19:00","Mexico","South Africa","MEX-SOU"],
  ["2026-06-12","02:00","South Korea","Czechia","SOU-CZE"],
  ["2026-06-12","19:00","Canada","Bosnia-Herzegovina","CAN-BOS"],
  ["2026-06-13","01:00","United States","Paraguay","UNI-PAR"],
  ["2026-06-13","19:00","Qatar","Switzerland","QAT-SWI"],
  ["2026-06-13","22:00","Brazil","Morocco","BRA-MOR"],
  ["2026-06-14","01:00","Haiti","Scotland","HAI-SCO"],
  ["2026-06-14","04:00","Australia","Türkiye","AUS-TUR"],
  ["2026-06-14","17:00","Germany","Curaçao","GER-CUR"],
  ["2026-06-14","20:00","Netherlands","Japan","NET-JAP"],
  ["2026-06-14","23:00","Ivory Coast","Ecuador","IVO-ECU"],
  ["2026-06-15","02:00","Sweden","Tunisia","SWE-TUN"],
  ["2026-06-15","16:00","Spain","Cape Verde","SPA-CAP"],
  ["2026-06-15","19:00","Belgium","Egypt","BEL-EGY"],
  ["2026-06-15","22:00","Saudi Arabia","Uruguay","SAU-URU"],
  ["2026-06-16","01:00","Iran","New Zealand","IRA-NEW"],
  ["2026-06-16","19:00","France","Senegal","FRA-SEN"],
  ["2026-06-16","22:00","Iraq","Norway","IRA-NOR"],
  ["2026-06-17","01:00","Argentina","Algeria","ARG-ALG"],
  ["2026-06-17","04:00","Austria","Jordan","AUS-JOR"],
  ["2026-06-17","17:00","Portugal","Congo DR","POR-CON"],
  ["2026-06-17","20:00","England","Croatia","ENG-CRO"],
  ["2026-06-17","23:00","Ghana","Panama","GHA-PAN"],
  ["2026-06-18","02:00","Uzbekistan","Colombia","UZB-COL"],
  ["2026-06-18","16:00","Czechia","South Africa","CZE-SOU"],
  ["2026-06-18","19:00","Switzerland","Bosnia-Herzegovina","SWI-BOS"],
  ["2026-06-18","22:00","Canada","Qatar","CAN-QAT"],
  ["2026-06-19","01:00","Mexico","South Korea","MEX-SOU1"],
  ["2026-06-19","19:00","United States","Australia","UNI-AUS"],
  ["2026-06-19","22:00","Scotland","Morocco","SCO-MOR"],
  ["2026-06-20","00:30","Brazil","Haiti","BRA-HAI"],
  ["2026-06-20","03:00","Türkiye","Paraguay","TUR-PAR"],
  ["2026-06-20","17:00","Netherlands","Sweden","NET-SWE"],
  ["2026-06-20","20:00","Germany","Ivory Coast","GER-IVO"],
  ["2026-06-21","00:00","Ecuador","Curaçao","ECU-CUR"],
  ["2026-06-21","04:00","Tunisia","Japan","TUN-JAP"],
  ["2026-06-21","16:00","Spain","Saudi Arabia","SPA-SAU"],
  ["2026-06-21","19:00","Belgium","Iran","BEL-IRA"],
  ["2026-06-21","22:00","Uruguay","Cape Verde","URU-CAP"],
  ["2026-06-22","01:00","New Zealand","Egypt","NEW-EGY"],
  ["2026-06-22","17:00","Argentina","Austria","ARG-AUS"],
  ["2026-06-22","21:00","France","Iraq","FRA-IRA"],
  ["2026-06-23","00:00","Norway","Senegal","NOR-SEN"],
  ["2026-06-23","03:00","Jordan","Algeria","JOR-ALG"],
  ["2026-06-23","17:00","Portugal","Uzbekistan","POR-UZB"],
  ["2026-06-23","20:00","England","Ghana","ENG-GHA"],
  ["2026-06-23","23:00","Panama","Croatia","PAN-CRO"],
  ["2026-06-24","02:00","Colombia","Congo DR","COL-CON"],
  ["2026-06-24","19:00","Bosnia-Herzegovina","Qatar","BOS-QAT"],
  ["2026-06-24","19:00","Switzerland","Canada","SWI-CAN"],
  ["2026-06-24","22:00","Morocco","Haiti","MOR-HAI"],
  ["2026-06-24","22:00","Scotland","Brazil","SCO-BRA"],
  ["2026-06-25","01:00","Czechia","Mexico","CZE-MEX"],
  ["2026-06-25","01:00","South Africa","South Korea","SOU-SOU"],
  ["2026-06-25","20:00","Curaçao","Ivory Coast","CUR-IVO"],
  ["2026-06-25","20:00","Ecuador","Germany","ECU-GER"],
  ["2026-06-25","23:00","Japan","Sweden","JAP-SWE"],
  ["2026-06-25","23:00","Tunisia","Netherlands","TUN-NET"],
  ["2026-06-26","02:00","Paraguay","Australia","PAR-AUS"],
  ["2026-06-26","02:00","Türkiye","United States","TUR-UNI"],
  ["2026-06-26","19:00","Norway","France","NOR-FRA"],
  ["2026-06-26","19:00","Senegal","Iraq","SEN-IRA"],
  ["2026-06-27","00:00","Cape Verde","Saudi Arabia","CAP-SAU"],
  ["2026-06-27","00:00","Uruguay","Spain","URU-SPA"],
  ["2026-06-27","03:00","Egypt","Iran","EGY-IRA"],
  ["2026-06-27","03:00","New Zealand","Belgium","NEW-BEL"],
  ["2026-06-27","21:00","Croatia","Ghana","CRO-GHA"],
  ["2026-06-27","21:00","Panama","England","PAN-ENG"],
  ["2026-06-27","23:30","Colombia","Portugal","COL-POR"],
  ["2026-06-27","23:30","Congo DR","Uzbekistan","CON-UZB"],
  ["2026-06-28","02:00","Algeria","Austria","ALG-AUS"],
  ["2026-06-28","02:00","Jordan","Argentina","JOR-ARG"],
];

function pickWinner(bias: string): "HOME" | "AWAY" | "DRAW" {
  if (bias === "HOME") return "HOME";
  if (bias === "AWAY") return "AWAY";
  if (bias === "DRAW") return "DRAW";
  return ["HOME", "AWAY", "DRAW"][Math.floor(Math.random() * 3)] as any;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeMemory(user: typeof USERS[0], match: typeof MATCHES[0]): string {
  const [date, time, home, away, matchId] = match;
  const pick = pickWinner(user.bias);
  const conf = randInt(user.conf[0], user.conf[1]);
  const ts = new Date().toISOString();
  return `PRED | ${user.name} | ${matchId} | ${home} vs ${away} | pick=${pick} | conf=${conf} | take="" | ts=${ts}`;
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const total = MATCHES.length * USERS.length;
  console.log(`\n=== Bulk seeding: ${MATCHES.length} matches × ${USERS.length} users = ${total} predictions ===`);
  console.log(`Batch size: ${BATCH_SIZE}, ~${Math.ceil(total / BATCH_SIZE)} batches\n`);

  // Build all memory texts
  const allItems: { text: string; user: string; matchId: string }[] = [];
  for (const user of USERS) {
    for (const match of MATCHES) {
      allItems.push({ text: makeMemory(user, match), user: user.name, matchId: match[4] });
    }
  }

  // Shuffle to spread user load evenly
  for (let i = allItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allItems[i], allItems[j]] = [allItems[j], allItems[i]];
  }

  let done = 0;
  let failed = 0;

  // Send in batches
  for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
    const batch = allItems.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(allItems.length / BATCH_SIZE);

    console.log(`\nBatch ${batchNum}/${totalBatches} (${batch.length} items)...`);

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const items = batch.map(b => ({ text: b.text }));
        const accepted = await mem.rememberBulk(items);
        console.log(`  Accepted: ${accepted.job_ids.length} jobs`);

        // Wait for jobs to complete
        const result = await mem.waitForRememberJobs(accepted.job_ids, [], {
          pollIntervalMs: 2000,
          timeoutMs: 120_000,
        });

        for (const r of result.results) {
          if (r.status === "done") {
            done++;
          } else {
            failed++;
            console.log(`  Job ${r.id}: ${r.status} - ${r.error || ""}`);
          }
        }
        console.log(`  Batch done ✓ [${done}/${total}] (${failed} failed)`);
        break;
      } catch (e: any) {
        const msg = e.message || String(e);
        if (msg.includes("429") || msg.includes("Rate limit")) {
          const wait = 60 * (attempt + 2);
          console.log(`  ⏳ Rate limited, waiting ${wait}s (attempt ${attempt + 1}/5)...`);
          await sleep(wait * 1000);
        } else {
          console.error(`  ✗ Batch error: ${msg}`);
          failed += batch.length;
          break;
        }
      }
    }

    // Small delay between batches
    await sleep(3000);
  }

  console.log(`\n=== Done: ${done} stored, ${failed} failed ===`);
}

main().catch(console.error);
