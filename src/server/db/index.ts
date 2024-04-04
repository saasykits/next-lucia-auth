import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import * as schema from "./schema";

export const connection = postgres(env.DATABASE_URL, {
  max_lifetime: 10, // Remove this line if you're deploying to Docker / VPS
  // idle_timeout: 20, // Uncomment this line if you're deploying to Docker / VPS
});

export const db = drizzle(connection, { schema });
