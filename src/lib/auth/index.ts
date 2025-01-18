import { env } from "@/env.js";
import { absoluteUrl } from "@/lib/utils";
import { Discord } from "arctic";
import { cookies } from "next/headers";
import { cache } from "react";
import { sessionCookieName } from "./config";
import utils from "./utils";

export const discord = new Discord(
  env.DISCORD_CLIENT_ID,
  env.DISCORD_CLIENT_SECRET,
  absoluteUrl("/login/discord/callback"),
);

export const validateRequest = cache(unCachedValidateRequest);

export async function unCachedValidateRequest(): Promise<
  Omit<ReturnType<typeof utils.validateSession>, "fresh">
> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return { user: null, session: null };
  }
  const result = await utils.validateSession(sessionId);
  // next.js throws when you attempt to set cookie when rendering page
  try {
    if (result.session && result.fresh) {
      await utils.setCookie(result.session.id);
    }
    if (!result.session) {
      await utils.clearCookie();
    }
  } catch {
    console.error("Failed to set session cookie");
  }
  return result;
}
