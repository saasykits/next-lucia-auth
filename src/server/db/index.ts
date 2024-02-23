import { drizzle } from "drizzle-orm/planetscale-serverless";
import { Client } from "@planetscale/database";

import { env } from "@/env";
import * as schema from "./schema";

export const connection = new Client({ url: env.DATABASE_URL });

export const db = drizzle(connection, { schema });
