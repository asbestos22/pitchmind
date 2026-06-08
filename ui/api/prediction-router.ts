import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import {
  findAllPredictions,
  findPredictionsByUser,
  findPredictionsByMatch,
  findPredictionByUserAndMatch,
  createPrediction,
  deletePrediction,
} from "./queries/predictions";

export const predictionRouter = createRouter({
  list: publicQuery.query(() => findAllPredictions()),

  myPredictions: authedQuery.query(({ ctx }) =>
    findPredictionsByUser(ctx.user.id),
  ),

  byMatch: publicQuery
    .input(z.object({ matchId: z.number().positive() }))
    .query(({ input }) => findPredictionsByMatch(input.matchId)),

  create: authedQuery
    .input(
      z.object({
        matchId: z.number().positive(),
        userName: z.string().min(1),
        predictedA: z.number().min(0),
        predictedB: z.number().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await findPredictionByUserAndMatch(ctx.user.id, input.matchId);
      if (existing) {
        throw new Error("You already made a prediction for this match");
      }
      return createPrediction({
        userId: ctx.user.id,
        matchId: input.matchId,
        userName: input.userName,
        predictedA: input.predictedA,
        predictedB: input.predictedB,
      });
    }),

  delete: authedQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(({ input }) => deletePrediction(input.id)),
});
