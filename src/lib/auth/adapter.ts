import { db } from "@/server/db";
import {
  emailVerificationCodes,
  passwordResetTokens,
  sessions as sessionTable,
  users as userTable,
  type NewEmailVerificationCode,
  type NewPasswordResetToken,
  type NewUser,
  type Session,
  type User,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";

const adapter = {
  getUserWithEmail: (email: string) =>
    db.query.users.findFirst({ where: (table, { eq }) => eq(table.email, email) }),
  insertUser: (data: NewUser) => db.insert(userTable).values(data),
  updateUser: (userId: string, data: Omit<Partial<NewUser>, "id">) =>
    db.update(userTable).set(data).where(eq(userTable.id, userId)),

  createSession: (session: Session) => db.insert(sessionTable).values(session),
  deleteSession: (sessionId: string) =>
    db.delete(sessionTable).where(eq(sessionTable.id, sessionId)),
  getSessionAndUser: (sessionId: string) =>
    db.query.sessions.findFirst({
      where: (table, { eq }) => eq(table.id, sessionId),
      with: { user: true },
    }),
  updateSessionExpiration: (sessionId: string, expiresAt: Date) =>
    db.update(sessionTable).set({ expiresAt }).where(eq(sessionTable.id, sessionId)),
  deleteUserSessions: (userId: string) =>
    db.delete(sessionTable).where(eq(sessionTable.userId, userId)),

  insertEmailVerificationCode: (data: NewEmailVerificationCode) =>
    db.insert(emailVerificationCodes).values(data),
  getEmailVerificationCodeWithUserId: (userId: string) =>
    db.query.emailVerificationCodes.findFirst({
      where: (table, { eq }) => eq(table.userId, userId),
    }),
  deleteUserEmailVerificationCodes: (id: string) =>
    db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, id)),
  getAndDeleteEmailVerificationCodeWithUserId: (userId: string) =>
    db.transaction(async (tx) => {
      const item = await tx.query.emailVerificationCodes.findFirst({
        where: (table, { eq }) => eq(table.userId, userId),
      });
      if (item) {
        await tx.delete(emailVerificationCodes).where(eq(emailVerificationCodes.id, item.id));
      }
      return item;
    }),

  insertPasswordResetToken: (data: NewPasswordResetToken) =>
    db.insert(passwordResetTokens).values(data),
  deleteUserPasswordResetTokens: (userId: string) =>
    db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId)),
  getAndDeletePasswordResetToken: (token: string) =>
    db.transaction(async (tx) => {
      const item = await tx.query.passwordResetTokens.findFirst({
        where: (table, { eq }) => eq(table.id, token),
      });
      if (item) {
        await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.id, item.id));
      }
      return item;
    }),
};
export type Adapter = typeof adapter;

export type AuthSession = Session;
export type AuthUser = Omit<User, "hashedPassword">;

export default adapter;
