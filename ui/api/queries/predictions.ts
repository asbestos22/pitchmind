import { eq, desc, and } from "drizzle-orm";
import { getDb } from "./connection";
import { predictions } from "@db/schema";

export async function findAllPredictions() {
  return getDb()
    .select()
    .from(predictions)
    .orderBy(desc(predictions.createdAt));
}

export async function findPredictionsByUser(userId: number) {
  return getDb()
    .select()
    .from(predictions)
    .where(eq(predictions.userId, userId))
    .orderBy(desc(predictions.createdAt));
}

export async function findPredictionsByMatch(matchId: number) {
  return getDb()
    .select()
    .from(predictions)
    .where(eq(predictions.matchId, matchId))
    .orderBy(desc(predictions.createdAt));
}

export async function findPredictionByUserAndMatch(userId: number, matchId: number) {
  const rows = await getDb()
    .select()
    .from(predictions)
    .where(and(eq(predictions.userId, userId), eq(predictions.matchId, matchId)))
    .limit(1);
  return rows.at(0);
}

export async function createPrediction(data: {
  userId: number;
  matchId: number;
  userName: string;
  predictedA: number;
  predictedB: number;
}) {
  const result = await getDb()
    .insert(predictions)
    .values({
      userId: data.userId,
      matchId: data.matchId,
      userName: data.userName,
      predictedA: data.predictedA,
      predictedB: data.predictedB,
    })
    .$returningId();
  return result[0].id;
}

export async function deletePrediction(id: number) {
  await getDb()
    .delete(predictions)
    .where(eq(predictions.id, id));
}

export async function updatePredictionPoints(id: number, points: number) {
  await getDb()
    .update(predictions)
    .set({ points })
    .where(eq(predictions.id, id));
}
