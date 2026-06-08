import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import {
  findAllRoasts,
  findRoastsByPrediction,
  findRoastsByUser,
  createRoast,
  likeRoast,
} from "./queries/roasts";

export const roastRouter = createRouter({
  list: publicQuery.query(() => findAllRoasts()),

  byPrediction: publicQuery
    .input(z.object({ predictionId: z.number().positive() }))
    .query(({ input }) => findRoastsByPrediction(input.predictionId)),

  myRoasts: authedQuery.query(({ ctx }) =>
    findRoastsByUser(ctx.user.id),
  ),

  create: authedQuery
    .input(
      z.object({
        userName: z.string().min(1),
        targetUserId: z.number().positive().optional(),
        targetUserName: z.string().optional(),
        predictionId: z.number().positive().optional(),
        message: z.string().min(1).max(500),
        burnLevel: z.number().min(1).max(5).optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      createRoast({
        userId: ctx.user.id,
        userName: input.userName,
        targetUserId: input.targetUserId,
        targetUserName: input.targetUserName,
        predictionId: input.predictionId,
        message: input.message,
        burnLevel: input.burnLevel,
      }),
    ),

  like: publicQuery
    .input(z.object({ id: z.number().positive() }))
    .mutation(({ input }) => likeRoast(input.id)),
});
