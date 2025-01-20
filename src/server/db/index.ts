import { env } from "@/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type DB = typeof db;
const globalForDb = globalThis as unknown as { connection: postgres.Sql | undefined };

export const connection =
  globalForDb.connection ??
  postgres(env.DATABASE_URL, {
    max_lifetime: 10, // Remove this line if you're deploying to Docker / VPS
    // idle_timeout: 20, // Uncomment this line if you're deploying to Docker / VPS
  });

if (env.NODE_ENV !== "production") globalForDb.connection = connection;

export const db = drizzle(connection, { schema });
