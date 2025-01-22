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
import { eq } from "drizzle-orm";

type DBSchema = typeof schema;
type DBConnection = typeof db;

interface Adapter {
  getUser(field: "email" | "id", value: string): Promise<User | undefined>;
  insertUser(data: NewUser): Promise<void>;
  updateUser(userId: string, data: Omit<NewUser, "id">): Promise<void>;
  getSession(sessionId: string): Promise<(Session & { user: User }) | undefined>;
  createSession(session: NewSession, deleteAllPrev?: boolean): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  updateSession(sessionId: string, data: Omit<NewSession, "id">): Promise<void>;
  insertVerificationCode(data: NewEmailVerificationCode, deleteAllPrev?: boolean): Promise<void>;
  getVerificationCode(
    code: string,
    deleteAfter?: boolean,
  ): Promise<NewEmailVerificationCode | undefined>;
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
    async getSession(sessionId) {
      return db.query.sessions.findFirst({
        where: (table, { eq }) => eq(table.id, sessionId),
        with: { user: true },
      });
    },
    async createSession(session, deleteAllPrev = true) {
      if (deleteAllPrev) {
        await db.delete(sessions).where(eq(sessions.userId, session.userId));
      }
      await db.insert(sessions).values(session);
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
    async getVerificationCode(userId, deleteAfter = false) {
      if (deleteAfter) {
        const [item] = await db.delete(codes).where(eq(codes.userId, userId)).returning();
        return item;
      }
      const [item] = await db.select().from(codes).where(eq(codes.userId, userId));
      return item;
    },
    async insertPasswordResetToken(data, deleteAllPrev = true) {
      if (deleteAllPrev) {
        await db.delete(tokens).where(eq(tokens.userId, data.userId));
      }
      await db.insert(tokens).values(data);
    },
    async getPasswordResetToken(token, deleteAfter = false) {
      const item = await db.query.passwordResetTokens.findFirst({
        where: (table, { eq }) => eq(table.id, token),
      });
      if (deleteAfter && item) {
        await db.delete(tokens).where(eq(tokens.id, item.id));
      }
      return item;
    },
  };
}
export class Adapter2 {
  constructor(
    private db: DBConnection,
    private schema: DBSchema,
  ) {}
  async getUser(field: "email" | "id", value: string) {
    return this.db.query.users.findFirst({
      where: (table, { eq }) => eq(field === "id" ? table.id : table.email, value),
    });
  }
  async insertUser(data: NewUser) {
    const [item] = await this.db.insert(this.schema.users).values(data);
    return item!;
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
  async createSession(session: NewSession, deleteAllPrevSessions = true) {
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
  async updateSession(sessionId: string, data: Omit<NewSession, "id">) {
    return this.db
      .update(this.schema.sessions)
      .set(data)
      .where(eq(this.schema.sessions.id, sessionId));
  }
  async insertVerificationCode(data: NewEmailVerificationCode, deleteAllPrevCodes = true) {
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
  async insertPasswordResetToken(data: NewPasswordResetToken, deleteAllPrevTokens = true) {
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
