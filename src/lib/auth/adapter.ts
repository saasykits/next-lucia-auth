import type { db, schema } from "@/server/db";
import { eq } from "drizzle-orm";

type DBSchema = typeof schema;
type DBConnection = typeof db;

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Adapter {
  export type DBSchema = typeof schema;
  export type DBConnection = typeof db;
  export type NewUser = DBSchema["users"]["$inferInsert"];
  export type NewSession = DBSchema["sessions"]["$inferInsert"];
  export type NewVerificationCode = DBSchema["verificationCodes"]["$inferInsert"];
  export type NewPasswordResetToken = DBSchema["passwordResetTokens"]["$inferInsert"];
}
export class Adapter {
  constructor(
    private db: DBConnection,
    private schema: DBSchema,
  ) {}
  async getUser(field: "email" | "id" = "id", value: string) {
    return this.db.query.users.findFirst({
      where: (table, { eq }) => eq(field === "id" ? table.id : table.email, value),
    });
  }
  async insertUser(data: Adapter.NewUser) {
    return this.db.insert(this.schema.users).values(data);
  }
  async updateUser(userId: string, data: typeof this.schema.users.$inferInsert) {
    return this.db.update(this.schema.users).set(data).where(eq(this.schema.users.id, userId));
  }
  async getSession(sessionId: string) {
    return this.db.query.sessions.findFirst({
      where: (table, { eq }) => eq(table.id, sessionId),
      with: { user: true },
    });
  }
  async createSession(session: Adapter.NewSession, deleteAllPrevSessions = true) {
    if (deleteAllPrevSessions) {
      await this.db
        .delete(this.schema.sessions)
        .where(eq(this.schema.sessions.userId, session.userId));
    }
    return this.db.insert(this.schema.sessions).values(session);
  }
  async deleteSession(sessionId: string) {
    return this.db.delete(this.schema.sessions).where(eq(this.schema.sessions.id, sessionId));
  }
  async updateSession(sessionId: string, data: Omit<Adapter.NewSession, "id">) {
    return this.db
      .update(this.schema.sessions)
      .set(data)
      .where(eq(this.schema.sessions.id, sessionId));
  }
  async insertVerificationCode(data: Adapter.NewVerificationCode, deleteAllPrevCodes = true) {
    if (deleteAllPrevCodes) {
      await this.db
        .delete(this.schema.verificationCodes)
        .where(eq(this.schema.verificationCodes.userId, data.userId));
    }
    return this.db.insert(this.schema.verificationCodes).values(data);
  }
  async getVerificationCode(userId: string, deleteAfter = false) {
    const item = await this.db.query.verificationCodes.findFirst({
      where: (table, { eq }) => eq(table.userId, userId),
    });
    if (deleteAfter && item) {
      await this.db
        .delete(this.schema.verificationCodes)
        .where(eq(this.schema.verificationCodes.id, item.id));
    }
    return item ?? null;
  }
  async insertPasswordResetToken(data: Adapter.NewPasswordResetToken, deleteAllPrevTokens = true) {
    if (deleteAllPrevTokens) {
      await this.db
        .delete(this.schema.passwordResetTokens)
        .where(eq(this.schema.passwordResetTokens.userId, data.userId));
    }
    return this.db.insert(this.schema.passwordResetTokens).values(data);
  }
  async getPasswordResetToken(token: string, deleteAfter = false) {
    const item = await this.db.query.passwordResetTokens.findFirst({
      where: (table, { eq }) => eq(table.id, token),
    });
    if (deleteAfter && item) {
      await this.db
        .delete(this.schema.passwordResetTokens)
        .where(eq(this.schema.passwordResetTokens.id, item.id));
    }
    return item ?? null;
  }
}
