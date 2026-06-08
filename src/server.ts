/**
 * Minimal HTTP server exposing PitchMind over a public UI.
 *
 * Endpoints:
 *   GET  /                      -> static UI (public/index.html)
 *   GET  /api/recap?user=alex   -> record + scored picks (read from Walrus)
 *   POST /api/predict           -> {user,matchId,home,away,pick,confidence,take}
 *   POST /api/result            -> {matchId,home,away,homeScore,awayScore}
 *   POST /api/roast             -> {user,day}
 *   GET  /api/health            -> relayer health
 *
 * The UI renders the prediction history + the roast, satisfying the rule that the
 * memory must be visible in a public interface.
 */
import "dotenv/config";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PitchMind } from "./agent/agent.js";
import { Outcome } from "./data/model.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, "..", "public");
const PORT = Number(process.env.PORT ?? 8787);
const agent = PitchMind.fromEnv();

function send(res: any, code: number, body: unknown, type = "application/json") {
  const data = type === "application/json" ? JSON.stringify(body) : (body as string);
  res.writeHead(code, { "Content-Type": type, "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" });
  res.end(data);
}

async function readJson(req: any): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
    if (req.method === "OPTIONS") return send(res, 204, "");

    if (req.method === "GET" && url.pathname === "/") {
      return send(res, 200, readFileSync(join(PUBLIC, "index.html"), "utf8"), "text/html");
    }
    if (req.method === "GET" && url.pathname === "/app.js") {
      return send(res, 200, readFileSync(join(PUBLIC, "app.js"), "utf8"), "text/javascript");
    }
    if (req.method === "GET" && url.pathname === "/api/health") {
      return send(res, 200, await agent.health());
    }
    if (req.method === "GET" && url.pathname === "/api/recap") {
      const user = url.searchParams.get("user") ?? "";
      if (!user) return send(res, 400, { error: "user required" });
      return send(res, 200, await agent.recap(user));
    }
    if (req.method === "POST" && url.pathname === "/api/predict") {
      const b = await readJson(req);
      const out = await agent.predict({
        user: b.user, matchId: b.matchId, home: b.home, away: b.away,
        pick: (b.pick as string).toUpperCase() as Outcome,
        confidence: Number(b.confidence ?? 50), take: b.take ?? "",
      });
      return send(res, 200, out);
    }
    if (req.method === "POST" && url.pathname === "/api/result") {
      const b = await readJson(req);
      const hs = Number(b.homeScore), as = Number(b.awayScore);
      const out = await agent.result({
        matchId: b.matchId, home: b.home, away: b.away, homeScore: hs, awayScore: as,
        outcome: hs > as ? "HOME" : hs < as ? "AWAY" : "DRAW",
      });
      return send(res, 200, out);
    }
    if (req.method === "POST" && url.pathname === "/api/roast") {
      const b = await readJson(req);
      if (!b.user) return send(res, 400, { error: "user required" });
      return send(res, 200, await agent.roast(b.user, Number(b.day ?? 1)));
    }
    return send(res, 404, { error: "not found" });
  } catch (e) {
    return send(res, 500, { error: e instanceof Error ? e.message : String(e) });
  }
});

server.listen(PORT, () => {
  console.log(`PitchMind UI on http://localhost:${PORT}`);
  console.log(`memory namespace: ${process.env.MEMWAL_NAMESPACE ?? "pitchmind-wc2026"} (Walrus Mainnet)`);
});
