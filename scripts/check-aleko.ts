import "dotenv/config";
import { MemWal } from "@mysten-incubation/memwal";
async function main() {
  const ns = process.env.MEMWAL_NAMESPACE ?? "pitchmind-wc2026";
  const mem = MemWal.create({
    key: process.env.MEMWAL_DELEGATE_KEY!,
    accountId: process.env.MEMWAL_ACCOUNT_ID!,
    serverUrl: process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz",
    namespace: ns,
  });
  console.log("Recalling Aleko predictions...");
  const t0 = Date.now();
  const hits = await mem.recall({ query: "predictions by Aleko", limit: 100, namespace: ns });
  const mine = (hits.results ?? []).filter((h: any) => h.text.includes("| Aleko |"));
  console.log(`Found ${mine.length} Aleko predictions in ${Date.now()-t0}ms`);
  if (mine.length > 0) console.log("Sample:", mine[0].text.slice(0, 120));
}
main().catch(e => console.error("FAIL:", e.message));
