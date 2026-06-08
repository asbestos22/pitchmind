import { authRouter } from "./auth-router";
import { matchRouter } from "./match-router";
import { predictionRouter } from "./prediction-router";
import { roastRouter } from "./roast-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  match: matchRouter,
  prediction: predictionRouter,
  roast: roastRouter,
});

export type AppRouter = typeof appRouter;
