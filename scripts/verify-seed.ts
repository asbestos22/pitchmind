import "dotenv/config";
import { MemWal } from "@mysten-incubation/memwal";
const sleep = (ms:number)=>new Promise(r=>setTimeout(r,ms));
async function main() {
  const ns = process.env.MEMWAL_NAMESPACE ?? "pitchmind-wc2026";
  const mem = MemWal.create({
    key: process.env.MEMWAL_DELEGATE_KEY!,
    accountId: process.env.MEMWAL_ACCOUNT_ID!,
    serverUrl: process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz",
    namespace: ns,
  });
  for (const u of ["Aleko","Tita","Rex","Nina"]) {
    for (let a=0;a<3;a++){
      try {
        const hits = await mem.recall({ query: `predictions by ${u}`, limit: 100, namespace: ns });
        const mine = (hits.results ?? []).filter((h:any)=> h.text.includes(`| ${u} |`));
        console.log(`${u}: ${mine.length} found (of ${(hits.results??[]).length} recalled)`);
        break;
      } catch(e:any){ console.log(`${u}: retry ${a+1} (${e.message.slice(0,40)})`); await sleep(5000); }
    }
    await sleep(3000);
  }
}
main().catch(e => { console.error("FAIL:", e.message); process.exit(1); });
