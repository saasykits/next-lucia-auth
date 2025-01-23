import type {
  db,
  NewEmailVerificationCode,
  NewPasswordResetToken,
  NewSession,
  NewUser,
  schema,
  Session,
  User,
} from "@/server/db";
import { desc, eq } from "drizzle-orm";

type DBSchema = typeof schema;
type DBConnection = typeof db;

export interface Adapter {
  getUser(field: "email" | "id", value: string): Promise<User | undefined>;
  insertUser(data: NewUser): Promise<void>;
  updateUser(userId: string, data: Omit<Partial<User>, "id">): Promise<void>;
  getSession(sessionId: string): Promise<(Session & { user: User }) | undefined>;
  createSession(session: NewSession, deleteAllPrev?: boolean): Promise<Session>;
  deleteSession(sessionId: string): Promise<void>;
  updateSession(sessionId: string, data: Omit<Partial<Session>, "id">): Promise<void>;
  insertVerificationCode(data: NewEmailVerificationCode, deleteAllPrev?: boolean): Promise<void>;
  getVerificationCodes(userId: string, deleteAfter?: boolean): Promise<NewEmailVerificationCode[]>;
  insertPasswordResetToken(data: NewPasswordResetToken, deleteAllPrev?: boolean): Promise<void>;
  getPasswordResetToken(
    token: string,
    deleteAfter?: boolean,
  ): Promise<NewPasswordResetToken | undefined>;
}

export function initAdapter(db: DBConnection, schema: DBSchema): Adapter {
  const { users, sessions, verificationCodes: codes, passwordResetTokens: tokens } = schema;
  return {
    getUser(field, value) {
      return db.query.users.findFirst({
        where: (table, { eq }) => eq(field === "id" ? table.id : table.email, value),
      });
    },
    insertUser: async (data) => {
      await db.insert(users).values(data);
    },
    async updateUser(userId, data) {
      await db.update(users).set(data).where(eq(users.id, userId));
    },
    async getSession(id) {
      return db.query.sessions.findFirst({ where: eq(sessions.id, id), with: { user: true } });
    },
    async createSession(session, deleteAllPrev = true) {
      if (deleteAllPrev) {
        await db.delete(sessions).where(eq(sessions.userId, session.userId));
      }
      await db.insert(sessions).values(session);
      return session;
    },
    async deleteSession(sessionId) {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    },
    async updateSession(sessionId, data) {
      await db.update(sessions).set(data).where(eq(sessions.id, sessionId));
    },
    async insertVerificationCode(data, deleteAllPrev = true) {
      if (deleteAllPrev) {
        await db.delete(codes).where(eq(codes.userId, data.userId));
      }
      await db.insert(codes).values(data);
    },
    async getVerificationCodes(userId, deleteAfter = false) {
      const query = eq(codes.userId, userId);
      if (deleteAfter) {
        const items = await db.delete(codes).where(query).returning();
        items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return items;
      }
      return db.query.verificationCodes.findMany({ where: query, orderBy: desc(codes.createdAt) });
    },
    async insertPasswordResetToken(data, deleteAllPrev = true) {
      if (deleteAllPrev) {
        await db.delete(tokens).where(eq(tokens.userId, data.userId));
      }
      await db.insert(tokens).values(data);
    },
    async getPasswordResetToken(token, deleteAfter = false) {
      const item = await db.query.passwordResetTokens.findFirst({ where: eq(tokens.id, token) });
      if (deleteAfter && item) {
        await db.delete(tokens).where(eq(tokens.id, item.id));
      }
      return item;
    },
  };
}
