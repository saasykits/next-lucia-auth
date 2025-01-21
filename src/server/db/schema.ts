import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTableCreator,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

/***********************
 * Enums
 ***********************/
export const postStatusEnum = pgEnum(prefix + "_post_status", ["draft", "published", "archived"]);
export const authProviderEnum = pgEnum(prefix + "_auth_provider", [
  "discord",
  "email",
  "credentials",
]);

/***********************
 * Table definitions
 ***********************/
const timestampColumns = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
};
const idKey = varchar({ length: 21 })
  .primaryKey()
  .$defaultFn(() => nanoid(21));

export const users = pgTable(
  "users",
  {
    id: idKey,
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

const userIdFk = varchar("user_id", { length: 21 }).references(() => users.id, {
  onDelete: "cascade",
});

export const accounts = pgTable("accounts", {
  id: idKey,
  userId: userIdFk.notNull(),
  providerType: varchar("provider_type", { length: 63 }).notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: varchar({ length: 255 }).primaryKey(),
    userId: userIdFk.notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const emailVerificationCodes = pgTable(
  "email_verification_codes",
  {
    id: serial().primaryKey(),
    userId: userIdFk.unique().notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    code: varchar("code", { length: 8 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => [
    index("verification_code_user_idx").on(t.userId),
    index("verification_code_email_idx").on(t.email),
  ],
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: idKey,
    userId: userIdFk.notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => [index("password_token_user_idx").on(t.userId)],
);

export const posts = pgTable(
  "posts",
  {
    id: idKey,
    userId: userIdFk.notNull(),
    title: varchar({ length: 255 }).notNull(),
    excerpt: varchar({ length: 255 }).notNull(),
    content: text().notNull(),
    status: postStatusEnum().default("draft").notNull(),
    tags: varchar({ length: 255 }),
    ...timestampColumns,
  },
  (t) => [index("post_status_idx").on(t.status), index("post_tags_idx").on(t.tags)],
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

export type PostStatus = (typeof postStatusEnum.enumValues)[number];
export type AuthProvider = (typeof authProviderEnum.enumValues)[number];
