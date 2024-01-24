import { env } from "@/env";
import { discordAuth } from "@/lib/auth/lucia";
import * as context from "next/headers";

export const GET = async () => {
  const [url, state] = await discordAuth.getAuthorizationUrl();

  context.cookies().set("discord_oauth_state", state, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  return new Response(null, {
    status: 302,
    headers: { Location: url.toString() },
  });
};
