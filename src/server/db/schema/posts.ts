import { relations } from "drizzle-orm";
import { index, text, varchar } from "drizzle-orm/pg-core";
import { pgTable, timestampColumns } from "../db-utils";
import { users } from "./users";

export const posts = pgTable(
  "posts",
  {
    id: varchar({ length: 21 }).primaryKey(),
    userId: varchar("user_id", { length: 21 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar({ length: 255 }).notNull(),
    excerpt: varchar({ length: 255 }).notNull(),
    content: text().notNull(),
    status: varchar({ length: 31, enum: ["draft", "published"] }).default("draft"),
    ...timestampColumns,
  },
  (t) => [index("post_status_idx").on(t.status)],
);

export const postRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));
