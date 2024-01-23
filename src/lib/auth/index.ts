import { DrizzleMySQLAdapter } from "@lucia-auth/adapter-drizzle";
import { env } from "@/env.js";
import { db } from "@/server/db";
// import { discord } from "@lucia-auth/oauth/providers";
import { Lucia, TimeSpan } from "lucia";
import { sessions, users, type User as DbUser } from "@/server/db/schema";

const adapter = new DrizzleMySQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  getSessionAttributes: (attributes) => {
    return {};
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      email: attributes.email,
      emailVerified: attributes.emailVerified,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
    };
  },
  sessionExpiresIn: new TimeSpan(30, "d"),
  sessionCookie: {
    name: "session",

    expires: false, // session cookies have very long lifespan (2 years)
    attributes: {
      secure: env.NODE_ENV === "production",
    },
  },
});

// export const discordAuth = discord(auth, {
//   clientId: env.DISCORD_CLIENT_ID,
//   clientSecret: env.DISCORD_CLIENT_SECRET,
//   redirectUri: env.NEXT_PUBLIC_APP_URL + "/api/auth/login/discord/callback",
//   scope: ["identify", "email"],
// });

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseSessionAttributes {}
interface DatabaseUserAttributes extends Omit<DbUser, "hashedPassword"> {}
