import { defineConfig } from "drizzle-kit";
import { DATABASE_PREFIX } from "@/lib/constants";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: [`${DATABASE_PREFIX}_*`],
});
