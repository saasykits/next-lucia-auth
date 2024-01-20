import { auth, discordAuth } from "@/lib/auth/lucia";
import { db } from "@/server/db";
import { OAuthRequestError } from "@lucia-auth/oauth";
import { cookies, headers } from "next/headers";

import type { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  const storedState = cookies().get("discord_oauth_state")?.value;
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  // validate state
  if (!storedState || !state || storedState !== state || !code) {
    return new Response(null, {
      status: 400,
    });
  }
  try {
    const { getExistingUser, discordUser, createUser, createKey } =
      await discordAuth.validateCallback(code);

    const getUser = async () => {
      const existingUser = await getExistingUser();
      if (existingUser) return existingUser;
      if (!discordUser.email || !discordUser.verified) {
        throw new Error("Discord user email not verified");
      }
      const dbUser = await db.query.users.findFirst({
        where: (table, { eq }) => eq(table.email, discordUser.email!),
      });

      if (!dbUser) {
        return await createUser({
          attributes: {
            email: discordUser.email,
            email_verified: discordUser.verified ?? false,
            full_name: discordUser.username,
          },
        });
      }

      const user = auth.transformDatabaseUser({
        id: dbUser.id,
        email: dbUser.email,
        email_verified: dbUser.emailVerified,
        full_name: dbUser.fullName,
      });
      if (!user.emailVerified) {
        await auth.updateUserAttributes(user.userId, {
          email_verified: true,
        });
      }
      await createKey(user.userId);
      return user;
    };
    const user = await getUser();
    const session = await auth.createSession({
      userId: user.userId,
      attributes: {},
    });
    const authRequest = auth.handleRequest(request.method, {
      cookies,
      headers,
    });
    authRequest.setSession(session);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/dashboard", // redirect to profile page
      },
    });
  } catch (e) {
    console.error(e);
    if (e instanceof OAuthRequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
};
