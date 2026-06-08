/**
 * One-time account provisioning for Walrus Memory on MAINNET.
 *
 * Generates an Ed25519 delegate key and creates a MemWalAccount tied to your
 * dedicated Sui session wallet, then prints the values to paste into .env.
 *
 * SAFETY: this creates an on-chain account object on Sui mainnet, which costs a
 * small amount of SUI gas paid by the wallet you sign with. It does NOT move any
 * other funds. Review the printed plan and run only when you intend to provision.
 *
 * Usage:
 *   1. Have a dedicated Sui mainnet wallet funded with a little SUI (gas only).
 *   2. In .env set: SUI_PRIVATE_KEY, MEMWAL_PACKAGE_ID, MEMWAL_REGISTRY_ID
 *      (mainnet contract IDs — from https://docs.wal.app/walrus-memory or the
 *       dashboard at https://memory.walrus.xyz).
 *   3. npm run provision
 *   4. Paste MEMWAL_DELEGATE_KEY / MEMWAL_ACCOUNT_ID into .env
 *
 * Easiest path: provision via the dashboard (https://memory.walrus.xyz) and skip
 * this script entirely — paste the account id + a generated delegate key into .env.
 *
 * Refs: https://docs.wal.app/walrus-memory/sdk/quick-start
 */
import "dotenv/config";
import { generateDelegateKey, createAccount } from "@mysten-incubation/memwal/account";

async function main() {
  const suiPrivateKey = process.env.SUI_PRIVATE_KEY;
  const packageId = process.env.MEMWAL_PACKAGE_ID;
  const registryId = process.env.MEMWAL_REGISTRY_ID;

  if (!suiPrivateKey) {
    console.error("Set SUI_PRIVATE_KEY (dedicated mainnet session wallet, suiprivkey1...).");
    process.exit(1);
  }
  if (!packageId || !registryId) {
    console.error(
      "Set MEMWAL_PACKAGE_ID and MEMWAL_REGISTRY_ID (mainnet contract IDs).\n" +
        "Find them at https://docs.wal.app/walrus-memory or provision via the dashboard\n" +
        "(https://memory.walrus.xyz) and paste accountId + delegate key into .env directly.",
    );
    process.exit(1);
  }

  console.log("Provisioning Walrus Memory account on Sui MAINNET (costs small SUI gas)...");

  // The delegate private key is what the agent uses with MemWal.create({ key }).
  const delegate = await generateDelegateKey();

  const account = await createAccount({
    suiPrivateKey,
    suiNetwork: "mainnet",
    packageId,
    registryId,
    publicKey: delegate.publicKey,
    label: "pitchmind-agent",
  } as Parameters<typeof createAccount>[0]);

  console.log("\n=== paste into .env ===");
  console.log(`MEMWAL_DELEGATE_KEY=${delegate.privateKey}`);
  console.log(`MEMWAL_ACCOUNT_ID=${account.accountId}`);
  console.log(`# owner: ${account.owner}  tx: ${account.digest}`);
  console.log("=======================\n");
  console.log("Done. Keep MEMWAL_DELEGATE_KEY secret — it authorizes writes to your memory.");
}

main().catch((e) => {
  console.error("provision failed:", e instanceof Error ? e.message : e);
  console.error(
    "\nFallback: provision via the dashboard at https://memory.walrus.xyz,\n" +
      "then paste MEMWAL_ACCOUNT_ID and a delegate key into .env.\n" +
      "API reference: https://docs.wal.app/walrus-memory/sdk/api-reference",
  );
  process.exit(1);
});
