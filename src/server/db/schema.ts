import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTableCreator,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

/***********************
 * Table definitions
 ***********************/
const timestampColumns = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
};

export const users = pgTable(
  "users",
  {
    id: varchar({ length: 21 })
      .primaryKey()
      .$defaultFn(() => nanoid(21)),
    discordId: varchar("discord_id", { length: 255 }).unique(),
    email: varchar({ length: 255 }).unique().notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    hashedPassword: varchar("hashed_password", { length: 63 }),
    avatar: varchar({ length: 255 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 191 }),
    stripePriceId: varchar("stripe_price_id", { length: 191 }),
    stripeCustomerId: varchar("stripe_customer_id", { length: 191 }),
    stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),
    ...timestampColumns,
  },
  (t) => [index("user_email_idx").on(t.email), index("user_discord_id_idx").on(t.discordId)],
);

export const sessions = pgTable("sessions", {
  id: varchar({ length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 21 })
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const emailVerificationCodes = pgTable(
  "email_verification_codes",
  {
    id: serial().primaryKey(),
    userId: varchar("user_id", { length: 21 })
      .references(() => users.id, { onDelete: "cascade" })
      .unique()
      .notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    code: varchar("code", { length: 8 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => [index("verification_code_email_idx").on(t.email)],
);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar({ length: 21 })
    .primaryKey()
    .$defaultFn(() => nanoid(21)),
  userId: varchar("user_id", { length: 21 })
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const posts = pgTable(
  "posts",
  {
    id: varchar({ length: 21 })
      .primaryKey()
      .$defaultFn(() => nanoid(21)),
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

/***********************
 * Table relations
 ***********************/
export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const postRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

/***********************
 * Table data types
 ***********************/
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type EmailVerificationCode = typeof emailVerificationCodes.$inferSelect;
export type NewEmailVerificationCode = typeof emailVerificationCodes.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
