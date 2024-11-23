import { Discord } from "arctic";
import { env } from "@/env.js";
import { absoluteUrl } from "@/lib/utils";
import { TimeSpan } from "./utils";

export const discord = new Discord(
  env.DISCORD_CLIENT_ID,
  env.DISCORD_CLIENT_SECRET,
  absoluteUrl("/login/discord/callback"),
);

export const sessionExpiration = new TimeSpan(30, "d");
export const sessionCookieName = "auth_session";
export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
} as const;
