import { getDb } from "../api/queries/connection";

async function drop() {
  const db = getDb();
  await db.execute("DROP TABLE IF EXISTS _drizzle_migrations");
  await db.execute("DROP TABLE IF EXISTS roasts");
  await db.execute("DROP TABLE IF EXISTS predictions");
  await db.execute("DROP TABLE IF EXISTS matches");
  await db.execute("DROP TABLE IF EXISTS todos");
  await db.execute("DROP TABLE IF EXISTS users");
  console.log("Dropped all tables");
  process.exit(0);
}

drop().catch((e) => { console.error(e); process.exit(1); });
