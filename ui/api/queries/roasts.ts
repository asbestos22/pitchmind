import { eq, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { roasts } from "@db/schema";

export async function findAllRoasts() {
  return getDb()
    .select()
    .from(roasts)
    .orderBy(desc(roasts.createdAt));
}

export async function findRoastsByPrediction(predictionId: number) {
  return getDb()
    .select()
    .from(roasts)
    .where(eq(roasts.predictionId, predictionId))
    .orderBy(desc(roasts.createdAt));
}

export async function findRoastsByUser(userId: number) {
  return getDb()
    .select()
    .from(roasts)
    .where(eq(roasts.userId, userId))
    .orderBy(desc(roasts.createdAt));
}

export async function createRoast(data: {
  userId: number;
  userName: string;
  targetUserId?: number;
  targetUserName?: string;
  predictionId?: number;
  message: string;
  burnLevel?: number;
}) {
  const result = await getDb()
    .insert(roasts)
    .values({
      userId: data.userId,
      userName: data.userName,
      targetUserId: data.targetUserId,
      targetUserName: data.targetUserName,
      predictionId: data.predictionId,
      message: data.message,
      burnLevel: data.burnLevel || 1,
    })
    .$returningId();
  return result[0].id;
}

export async function likeRoast(id: number) {
  const existing = await getDb()
    .select()
    .from(roasts)
    .where(eq(roasts.id, id))
    .limit(1);
  const roast = existing.at(0);
  if (!roast) return;
  await getDb()
    .update(roasts)
    .set({ likes: (roast.likes || 0) + 1 })
    .where(eq(roasts.id, id));
}
