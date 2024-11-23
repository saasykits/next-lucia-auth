import { db } from "@/server/db";
import {
  sessions as sessionTable,
  users as userTable,
  type Session,
  type User,
} from "@/server/db/schema";
import { eq, getTableColumns } from "drizzle-orm";

export const adapter = {
  getUserWithEmail: (email: string) =>
    db.query.users.findFirst({ where: (table, { eq }) => eq(table.email, email) }),

  createSession: (session: Session) => db.insert(sessionTable).values(session),

  deleteSession: (sessionId: string) =>
    db.delete(sessionTable).where(eq(sessionTable.id, sessionId)),

  getSessionAndUser: (sessionId: string) =>
    db.query.sessions.findFirst({
      where: (table, { eq }) => eq(table.id, sessionId),
      with: { user: { columns: { hashedPassword: false } } },
    }),
};
export type Adapter = typeof adapter;

export type AuthSession = Session;
export type AuthUser = Omit<User, "hashedPassword">;
