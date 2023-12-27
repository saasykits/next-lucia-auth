import { type Config } from "drizzle-kit";

import { env } from "@/env";
import { DATABASE_PREFIX } from "@/lib/constants";

export default {
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
  tablesFilter: [`${DATABASE_PREFIX}_*`],
} satisfies Config;
