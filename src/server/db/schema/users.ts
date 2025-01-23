import { relations } from "drizzle-orm";
import { boolean, index, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { pgTable, timestampColumns } from "../db-utils";

export const users = pgTable(
  "users",
  {
    id: varchar({ length: 21 }).primaryKey(),
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

export const verificationCodes = pgTable(
  "email_verification_codes",
  {
    id: serial().primaryKey(),
    userId: varchar("user_id", { length: 21 })
      .references(() => users.id, { onDelete: "cascade" })
      .unique()
      .notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    code: varchar("code", { length: 8 }).notNull(),
    createdAt: timestampColumns.createdAt,
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => [index("verification_code_email_idx").on(t.email)],
);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar({ length: 21 }).primaryKey(),
  userId: varchar("user_id", { length: 21 })
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
