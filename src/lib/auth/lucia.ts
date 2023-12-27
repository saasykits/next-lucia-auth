import { lucia } from "lucia";
import { nextjs_future } from "lucia/middleware";
import { planetscale } from "@lucia-auth/adapter-mysql";
import { env } from "@/env.js";
import { connection } from "@/server/db";
import { DATABASE_PREFIX } from "@/lib/constants";

export const auth = lucia({
  env: env.NODE_ENV === "development" ? "DEV" : "PROD",
  adapter: planetscale(connection, {
    user: `${DATABASE_PREFIX}_users`,
    key: `${DATABASE_PREFIX}_user_keys`,
    session: `${DATABASE_PREFIX}_user_sessions`,
  }),
  middleware: nextjs_future(),
  csrfProtection: false,
  sessionCookie: { expires: false },
  getUserAttributes: (data) => ({
    fullName: data.full_name,
    email: data.email,
    emailVerified: data.email_verified,
  }),
});

export type Auth = typeof auth;
