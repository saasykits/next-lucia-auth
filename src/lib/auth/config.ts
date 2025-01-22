import { env } from "@/env";
import { Discord } from "arctic";
import { absoluteUrl } from "../utils";

export const discord = new Discord(
  env.DISCORD_CLIENT_ID,
  env.DISCORD_CLIENT_SECRET,
  absoluteUrl("/login/discord/callback"),
);

export const sessionCookieName = "auth_session";
export const sessionCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;
export const sessionExpiration = 1000 * 60 * 60 * 24 * 7; // 1 week
