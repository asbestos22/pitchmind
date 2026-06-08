import "dotenv/config";
import { MemWal } from "@mysten-incubation/memwal";
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
async function main() {
  const ns = process.env.MEMWAL_NAMESPACE ?? "pitchmind-wc2026";
  const mem = MemWal.create({
    key: process.env.MEMWAL_DELEGATE_KEY!,
    accountId: process.env.MEMWAL_ACCOUNT_ID!,
    serverUrl: process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz",
    namespace: ns,
  });
  for (const u of ["F5", "Aleko", "Tita", "Rex", "Nina"]) {
    for (let a = 0; a < 5; a++) {
      try {
        const t0 = Date.now();
        const hits = await mem.recall({ query: `predictions by ${u}`, limit: 100, namespace: ns });
        const mine = (hits.results ?? []).filter((h: any) => h.text.includes(`| ${u} |`));
        console.log(`${u}: ${mine.length} found (${Date.now()-t0}ms)`);
        break;
      } catch (e: any) {
        console.log(`${u}: retry ${a+1} — ${e.message.slice(0, 50)}`);
        await sleep(3000 * (a + 1));
      }
    }
    await sleep(2000);
  }
}
main().catch(e => console.error("FAIL:", e.message));
