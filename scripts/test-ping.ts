import "dotenv/config";
import { MemWal } from "@mysten-incubation/memwal";
async function main() {
  const mem = MemWal.create({
    key: process.env.MEMWAL_DELEGATE_KEY!,
    accountId: process.env.MEMWAL_ACCOUNT_ID!,
    serverUrl: process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz",
    namespace: process.env.MEMWAL_NAMESPACE ?? "pitchmind-wc2026",
  });
  console.log("Rate limit check — sending single remember...");
  const t0 = Date.now();
  const res = await mem.remember("TEST | ping | " + Date.now());
  console.log("OK:", JSON.stringify(res), `(${Date.now() - t0}ms)`);
}
main().catch(e => { console.error("FAIL:", e.message); process.exit(1); });
