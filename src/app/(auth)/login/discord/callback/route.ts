import { discord } from "@/lib/auth/config";
import { createSession, setCookie } from "@/lib/auth/utils";
import { Paths } from "@/lib/constants";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const storedState = cookieStore.get("discord_oauth_state")?.value ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
      headers: { Location: Paths.Login },
    });
  }

  try {
    const tokens = await discord.validateAuthorizationCode(code);

    const discordUserRes = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    const discordUser = (await discordUserRes.json()) as DiscordUser;

    if (!discordUser.email || !discordUser.verified) {
      return new Response(
        JSON.stringify({
          error: "Your Discord account must have a verified email address.",
        }),
        { status: 400, headers: { Location: Paths.Login } },
      );
    }
    const existingUser = await db.query.users.findFirst({
      where: (table, { eq, or }) =>
        or(eq(table.discordId, discordUser.id), eq(table.email, discordUser.email!)),
    });

    const avatar = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.webp`
      : null;

    if (!existingUser) {
      const userId = nanoid(21);
      await db.insert(users).values({
        id: userId,
        email: discordUser.email,
        emailVerified: true,
        discordId: discordUser.id,
        avatar,
      });
      const session = await createSession(userId);
      await setCookie(session.id);
      return new Response(null, {
        status: 302,
        headers: { Location: Paths.Dashboard },
      });
    }

    if (existingUser.discordId !== discordUser.id || existingUser.avatar !== avatar) {
      await db
        .update(users)
        .set({
          discordId: discordUser.id,
          emailVerified: true,
          avatar,
        })
        .where(eq(users.id, existingUser.id));
    }
    const session = await createSession(existingUser.id);
    await setCookie(session.id);

    return new Response(null, {
      status: 302,
      headers: { Location: Paths.Dashboard },
    });
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(JSON.stringify({ message: "Invalid code" }), {
        status: 400,
      });
    }
    console.error(e);

    return new Response(JSON.stringify({ message: "internal server error" }), {
      status: 500,
    });
  }
}

interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  banner: string | null;
  global_name: string | null;
  banner_color: string | null;
  mfa_enabled: boolean;
  locale: string;
  email: string | null;
  verified: boolean;
}
