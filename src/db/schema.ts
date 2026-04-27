import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";

export const scores = pgTable("scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameName: text("game_name").notNull(),
  playerName: text("player_name").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
