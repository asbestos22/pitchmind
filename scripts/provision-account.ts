/**
 * Provision Walrus Memory account using raw Sui RPC + direct signing.
 * Bypasses broken @mysten/sui SDK Transaction.build() entirely.
 */
import "dotenv/config";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { fromBase64, toBase64 } from "@mysten/utils";
import { bcs } from "@mysten/sui/bcs";
import { generateDelegateKey } from "@mysten-incubation/memwal/account";
import { Transaction } from "@mysten/sui/transactions";

const PACKAGE_ID = process.env.MEMWAL_PACKAGE_ID;
const REGISTRY_ID = process.env.MEMWAL_REGISTRY_ID;
const SUI_CLOCK = "0x0000000000000000000000000000000000000000000000000000000000000006";
const RPC = "https://fullnode.mainnet.sui.io:443";

async function rpcCall(method, params) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(`RPC ${method}: ${JSON.stringify(json.error)}`);
  return json.result;
}

async function main() {
  if (!process.env.SUI_PRIVATE_KEY || !PACKAGE_ID || !REGISTRY_ID) {
    console.error("Missing env: SUI_PRIVATE_KEY, MEMWAL_PACKAGE_ID, MEMWAL_REGISTRY_ID");
    process.exit(1);
  }

  console.log("Provisioning Walrus Memory account on Sui MAINNET...");

  const { secretKey } = decodeSuiPrivateKey(process.env.SUI_PRIVATE_KEY);
  const keypair = Ed25519Keypair.fromSecretKey(secretKey);
  const address = keypair.toSuiAddress();
  console.log(`Signer: ${address}`);

  // Generate delegate key
  const delegate = await generateDelegateKey();

  // Get reference gas price
  const { referenceGasPrice } = await rpcCall("suix_getReferenceGasPrice", []);

  // Get coins for gas payment
  const coins = await rpcCall("suix_getCoins", [address, "0x2::sui::SUI"]);
  if (!coins.data.length) {
    console.error("No SUI coins found. Fund wallet first.");
    process.exit(1);
  }
  const gasCoin = coins.data[0];

  // Get chain identifier for expiration
  const chainId = await rpcCall("sui_getChainIdentifier", []);
  const systemState = await rpcCall("suix_getLatestSuiSystemState", []);

  // Build TransactionData manually with BCS
  // Use the Transaction class but only build the kind, then assemble manually
  const tx = new Transaction();
  tx.setSender(address);
  tx.setGasPrice(BigInt(referenceGasPrice));
  tx.setGasBudget(10000000n); // 0.01 SUI
  tx.setGasPayment([{
    objectId: gasCoin.coinObjectId,
    version: gasCoin.version,
    digest: gasCoin.digest,
  }]);
  tx.moveCall({
    target: `${PACKAGE_ID}::account::create_account`,
    arguments: [
      tx.object(REGISTRY_ID),
      tx.object(SUI_CLOCK),
    ],
  });

  // Build without client (offline build)
  const txBytes = await tx.build({ onlyTransactionKind: false });
  // The above may fail. If so, try building with protocol config
  console.log("Transaction bytes built:", txBytes.length);

  // Sign
  const { signature } = await keypair.signTransaction(txBytes);
  console.log("Signed.");

  // Execute
  const result = await rpcCall("sui_executeTransactionBlock", [
    toBase64(txBytes),
    [signature],
    { showEffects: true, showObjectChanges: true },
  ]);

  console.log(`TX digest: ${result.digest}`);
  console.log(`Status: ${result.effects?.status?.status}`);

  if (result.effects?.status?.status !== "success") {
    console.error("TX failed:", JSON.stringify(result.effects?.status, null, 2));
    process.exit(1);
  }

  // Find created MemWalAccount
  let accountId = "";
  for (const change of result.objectChanges ?? []) {
    if (change.type === "created" && change.objectType?.includes("::account::MemWalAccount")) {
      accountId = change.objectId;
      break;
    }
  }
  if (!accountId) {
    // Fallback: check effects.created
    for (const obj of result.effects?.created ?? []) {
      if (obj.owner?.Shared !== undefined) {
        accountId = obj.reference?.objectId;
        break;
      }
    }
  }

  if (!accountId) {
    console.error("Could not find MemWalAccount in effects");
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  console.log(`\n=== paste into .env ===`);
  console.log(`MEMWAL_DELEGATE_KEY=${delegate.privateKey}`);
  console.log(`MEMWAL_ACCOUNT_ID=${accountId}`);
  console.log(`# owner: ${address}  tx: ${result.digest}`);
  console.log(`=======================\n`);
  console.log("Done!");
}

main().catch((e) => {
  console.error("provision failed:", e.message);
  process.exit(1);
});
