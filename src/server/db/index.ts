import { env } from "@/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type DB = typeof db;
const globalForDb = globalThis as unknown as { connection: postgres.Sql | undefined };

export const connection = globalForDb.connection ?? postgres(env.DATABASE_URL);

if (env.NODE_ENV !== "production") globalForDb.connection = connection;

export const db = drizzle(connection, { schema });
