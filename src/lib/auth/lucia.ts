import { lucia } from "lucia";
import { nextjs_future } from "lucia/middleware";
import { planetscale } from "@lucia-auth/adapter-mysql";
import { env } from "@/env.js";
import { connection } from "@/server/db";
import { DATABASE_PREFIX } from "@/lib/constants";
import { discord } from "@lucia-auth/oauth/providers";

export const auth = lucia({
  env: env.NODE_ENV === "development" ? "DEV" : "PROD",
  adapter: planetscale(connection, {
    user: `${DATABASE_PREFIX}_users`,
    key: `${DATABASE_PREFIX}_user_keys`,
    session: `${DATABASE_PREFIX}_user_sessions`,
  }),
  middleware: nextjs_future(),
  sessionCookie: { expires: false },
  getUserAttributes: (data) => ({
    fullName: data.full_name,
    email: data.email,
    emailVerified: data.email_verified,
  }),
});

export const discordAuth = discord(auth, {
  clientId: env.DISCORD_CLIENT_ID,
  clientSecret: env.DISCORD_CLIENT_SECRET,
  redirectUri: env.NEXT_PUBLIC_APP_URL+"/api/auth/login/discord/callback",
  scope: ["identify", "email"],
});

export type Auth = typeof auth;
