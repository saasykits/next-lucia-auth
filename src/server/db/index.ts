import { env } from "@/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as posts from "./schema/posts";
import * as users from "./schema/users";

export type DB = typeof db;
const globalForDb = globalThis as unknown as { connection: postgres.Sql | undefined };

export const connection = globalForDb.connection ?? postgres(env.DATABASE_URL);

if (env.NODE_ENV !== "production") globalForDb.connection = connection;

export const schema = {
  ...users,
  ...posts,
} as const;
export * from "./types";
export const db = drizzle(connection, { schema });
