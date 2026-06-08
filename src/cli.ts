/**
 * PitchMind CLI.
 *
 *   npm run health
 *   npm run predict -- --user alex --match WC-A1 --home Mexico --away Poland --pick HOME --conf 80 --take "Mexico opener at home, easy"
 *   npm run result  -- --match WC-A1 --home Mexico --away Poland --hs 1 --as 2
 *   npm run roast    -- --user alex --day 4
 *   npm run recap    -- --user alex
 *   npm run export   -- --user alex   (writes data/export-<user>.json for the demo)
 */
import "dotenv/config";
import { writeFileSync, mkdirSync } from "node:fs";
import { PitchMind } from "./agent/agent.js";
import { Outcome } from "./data/model.js";

function arg(name: string, fallback?: string): string {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  if (fallback !== undefined) return fallback;
  throw new Error(`missing --${name}`);
}

async function main() {
  const cmd = process.argv[2];
  const agent = PitchMind.fromEnv();

  switch (cmd) {
    case "health": {
      console.log(JSON.stringify(await agent.health(), null, 2));
      break;
    }
    case "predict": {
      const out = await agent.predict({
        user: arg("user"),
        matchId: arg("match"),
        home: arg("home"),
        away: arg("away"),
        pick: arg("pick").toUpperCase() as Outcome,
        confidence: Number(arg("conf", "50")),
        take: arg("take", ""),
      });
      console.log(`stored prediction on Walrus -> blob ${out.blob_id}`);
      break;
    }
    case "result": {
      const hs = Number(arg("hs"));
      const as = Number(arg("as"));
      const outcome: Outcome = hs > as ? "HOME" : hs < as ? "AWAY" : "DRAW";
      const out = await agent.result({
        matchId: arg("match"),
        home: arg("home"),
        away: arg("away"),
        homeScore: hs,
        awayScore: as,
        outcome,
      });
      console.log(`stored result on Walrus -> blob ${out.blob_id}`);
      break;
    }
    case "roast": {
      const { roast, record, blob_id } = await agent.roast(arg("user"), Number(arg("day", "1")));
      console.log("\n" + roast + "\n");
      console.log(`record: ${record.correct}/${record.decided} | roast saved -> blob ${blob_id}`);
      break;
    }
    case "recap": {
      const { record } = await agent.recap(arg("user"));
      console.log(JSON.stringify(record, null, 2));
      break;
    }
    case "export": {
      const user = arg("user");
      const data = await agent.recap(user);
      mkdirSync("data", { recursive: true });
      const path = `data/export-${user}.json`;
      writeFileSync(path, JSON.stringify(data, null, 2));
      console.log(`wrote ${path}`);
      break;
    }
    default:
      console.error("commands: health | predict | result | roast | recap | export");
      process.exit(1);
  }
}

main().catch((e) => {
  console.error("ERROR:", e instanceof Error ? e.message : e);
  process.exit(1);
});
