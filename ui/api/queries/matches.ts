import { eq, asc } from "drizzle-orm";
import { getDb } from "./connection";
import { matches } from "@db/schema";

export async function findAllMatches() {
  return getDb()
    .select()
    .from(matches)
    .orderBy(asc(matches.matchDate));
}

export async function findMatchById(id: number) {
  const rows = await getDb()
    .select()
    .from(matches)
    .where(eq(matches.id, id))
    .limit(1);
  return rows.at(0);
}

export async function findMatchesByStatus(status: "upcoming" | "live" | "finished") {
  return getDb()
    .select()
    .from(matches)
    .where(eq(matches.status, status))
    .orderBy(asc(matches.matchDate));
}

export async function createMatch(data: {
  teamA: string;
  teamB: string;
  teamAFlag: string;
  teamBFlag: string;
  matchDate: Date;
  stage: string;
  status?: "upcoming" | "live" | "finished";
  resultA?: number;
  resultB?: number;
}) {
  const result = await getDb()
    .insert(matches)
    .values({
      teamA: data.teamA,
      teamB: data.teamB,
      teamAFlag: data.teamAFlag,
      teamBFlag: data.teamBFlag,
      matchDate: data.matchDate,
      stage: data.stage,
      status: data.status || "upcoming",
      resultA: data.resultA,
      resultB: data.resultB,
    })
    .$returningId();
  return result[0].id;
}

export async function updateMatchResult(id: number, resultA: number, resultB: number) {
  await getDb()
    .update(matches)
    .set({ resultA, resultB, status: "finished" })
    .where(eq(matches.id, id));
}
