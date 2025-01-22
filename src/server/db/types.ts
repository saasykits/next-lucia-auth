import type { posts } from "./schema/posts";
import type { passwordResetTokens, sessions, users, verificationCodes } from "./schema/users";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type EmailVerificationCode = typeof verificationCodes.$inferSelect;
export type NewEmailVerificationCode = typeof verificationCodes.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
