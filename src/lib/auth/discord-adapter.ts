import { env } from "@/env";

export const validateOAuth2AuthorizationCode = async (
  authorizationCode: string,
) => {
  const url = "https://discord.com/api/oauth2/token";
  const redirectUri = "http://localhost:3000/api/auth/login/discord/callback";
  const body = new URLSearchParams({
    code: authorizationCode,
    client_id: env.DISCORD_CLIENT_ID,
    grant_type: "authorization_code",
  });

  body.set("redirect_uri", redirectUri);
  body.set("client_secret", env.DISCORD_CLIENT_SECRET);

  const headers = new Headers({
    "Content-Type": "application/x-www-form-urlencoded",
  });

  const request = new Request(new URL(url), {
    method: "POST",
    headers,
    body,
  });
  request.headers.set("User-Agent", "lucia");
  request.headers.set("Accept", "application/json");
  const res = await fetch(request);
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const data = (await res.json()) as Record<string, unknown>;
  return data;
};
