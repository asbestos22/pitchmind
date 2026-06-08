import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const matches = mysqlTable("matches", {
  id: serial("id").primaryKey(),
  teamA: varchar("teamA", { length: 100 }).notNull(),
  teamB: varchar("teamB", { length: 100 }).notNull(),
  teamAFlag: varchar("teamAFlag", { length: 10 }).notNull(),
  teamBFlag: varchar("teamBFlag", { length: 10 }).notNull(),
  matchDate: timestamp("matchDate").notNull(),
  stage: varchar("stage", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["upcoming", "live", "finished"]).default("upcoming").notNull(),
  resultA: int("resultA"),
  resultB: int("resultB"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

export const predictions = mysqlTable("predictions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  matchId: bigint("matchId", { mode: "number", unsigned: true }).notNull(),
  userName: varchar("userName", { length: 255 }).notNull(),
  predictedA: int("predictedA").notNull(),
  predictedB: int("predictedB").notNull(),
  points: int("points").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = typeof predictions.$inferInsert;

export const roasts = mysqlTable("roasts", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  userName: varchar("userName", { length: 255 }).notNull(),
  targetUserId: bigint("targetUserId", { mode: "number", unsigned: true }),
  targetUserName: varchar("targetUserName", { length: 255 }),
  predictionId: bigint("predictionId", { mode: "number", unsigned: true }),
  message: text("message").notNull(),
  burnLevel: int("burnLevel").default(1).notNull(),
  likes: int("likes").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Roast = typeof roasts.$inferSelect;
export type InsertRoast = typeof roasts.$inferInsert;
