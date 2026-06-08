import { relations } from "drizzle-orm";
import { users, predictions, roasts } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  predictions: many(predictions),
  roasts: many(roasts),
}));

export const predictionsRelations = relations(predictions, ({ one }) => ({
  user: one(users, { fields: [predictions.userId], references: [users.id] }),
}));

export const roastsRelations = relations(roasts, ({ one }) => ({
  user: one(users, { fields: [roasts.userId], references: [users.id] }),
}));
