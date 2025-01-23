import { DATABASE_PREFIX } from "@/lib/constants";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: [`${DATABASE_PREFIX}_*`],
});
