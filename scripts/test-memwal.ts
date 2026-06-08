import "dotenv/config";
import { MemWal } from "@mysten-incubation/memwal";

async function main() {
  const memwal = MemWal.create({
    key: process.env.MEMWAL_DELEGATE_KEY!,
    accountId: process.env.MEMWAL_ACCOUNT_ID!,
    serverUrl: process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz",
    namespace: "pitchmind-wc2026",
  });

  console.log("Testing remember...");
  try {
    await memwal.rememberAndWait(
      "Test memory: PitchMind Walrus Memory integration is working.",
      undefined,
      { timeoutMs: 30000 },
    );
    console.log("Remember: OK");
  } catch (e: any) {
    console.error("Remember failed:", e.message);
    process.exit(1);
  }

  console.log("Testing recall...");
  try {
    const memories = await memwal.recall({
      query: "test memory",
      topK: 3,
      maxDistance: 0.8,
    });
    console.log("Recall results:", JSON.stringify(memories, null, 2));
  } catch (e: any) {
    console.error("Recall failed:", e.message);
    process.exit(1);
  }
}

main();
