import { mysqlTableCreator } from "drizzle-orm/mysql-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";

export const mysqlTable = mysqlTableCreator((name) => `${prefix}_${name}`);
