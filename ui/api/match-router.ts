import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findAllMatches,
  findMatchById,
  findMatchesByStatus,
  createMatch,
  updateMatchResult,
} from "./queries/matches";

export const matchRouter = createRouter({
  list: publicQuery.query(() => findAllMatches()),

  byStatus: publicQuery
    .input(z.object({ status: z.enum(["upcoming", "live", "finished"]) }))
    .query(({ input }) => findMatchesByStatus(input.status)),

  byId: publicQuery
    .input(z.object({ id: z.number().positive() }))
    .query(({ input }) => findMatchById(input.id)),

  create: publicQuery
    .input(
      z.object({
        teamA: z.string().min(1),
        teamB: z.string().min(1),
        teamAFlag: z.string().min(1),
        teamBFlag: z.string().min(1),
        matchDate: z.string().transform((s) => new Date(s)),
        stage: z.string().min(1),
        status: z.enum(["upcoming", "live", "finished"]).optional(),
        resultA: z.number().optional(),
        resultB: z.number().optional(),
      }),
    )
    .mutation(({ input }) =>
      createMatch({
        teamA: input.teamA,
        teamB: input.teamB,
        teamAFlag: input.teamAFlag,
        teamBFlag: input.teamBFlag,
        matchDate: input.matchDate,
        stage: input.stage,
        status: input.status,
        resultA: input.resultA,
        resultB: input.resultB,
      }),
    ),

  setResult: publicQuery
    .input(
      z.object({
        id: z.number().positive(),
        resultA: z.number().min(0),
        resultB: z.number().min(0),
      }),
    )
    .mutation(({ input }) =>
      updateMatchResult(input.id, input.resultA, input.resultB),
    ),
});
