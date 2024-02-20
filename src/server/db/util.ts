import { mysqlTableCreator } from "drizzle-orm/mysql-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { twMerge } from "tailwind-merge";
import clsx, {type ClassValue } from "clsx";

export const mysqlTable = mysqlTableCreator((name) => `${prefix}_${name}`);


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
  }
  