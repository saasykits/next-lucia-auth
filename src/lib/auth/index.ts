import { env } from "@/env.js";
import { absoluteUrl } from "@/lib/utils";
import { Discord } from "arctic";
import { cache } from "react";
import utils, { TimeSpan } from "./utils";

export const discord = new Discord(
  env.DISCORD_CLIENT_ID,
  env.DISCORD_CLIENT_SECRET,
  absoluteUrl("/login/discord/callback"),
);

export const sessionExpiration = new TimeSpan(30, "d");
export const sessionCookieName = "auth_session";
export const sessionCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

export const validateRequest = cache(utils.validateRequest);
