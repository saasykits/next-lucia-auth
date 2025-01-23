import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { cache } from "react";
import type { AuthSession, AuthUser } from "./adapter";
import adapter from "./adapter";
import { sessionCookieName, sessionCookieOptions, sessionExpiration } from "./config";

export async function createSession(userId: string) {
  const session: AuthSession = {
    userId,
    id: nanoid(25),
    expiresAt: createExpiryDate(sessionExpiration),
  };
  await adapter.createSession(session);
  return session;
}

export async function invalidateSession(sessionId: string) {
  await adapter.deleteSession(sessionId);
}

export async function invalidateUserSessions(userId: string) {
  await adapter.deleteUserSessions(userId);
}

async function validateSession(
  sessionId: string,
): Promise<
  { session: AuthSession; user: AuthUser; fresh: boolean } | { session: null; user: null }
> {
  const dbSession = await adapter.getSessionAndUser(sessionId);

  if (!dbSession) {
    return { session: null, user: null };
  }

  if (!isWithinExpirationDate(dbSession.expiresAt)) {
    await adapter.deleteSession(sessionId);
    return { session: null, user: null };
  }
  const { user: dbUser, ...session } = dbSession;
  const { hashedPassword: _, ...user } = dbUser;

  const activePeriodExpirationDate = new Date(
    dbSession.expiresAt.getTime() - sessionExpiration / 2,
  );
  if (!isWithinExpirationDate(activePeriodExpirationDate)) {
    const newExpirationDate = createExpiryDate(sessionExpiration);
    await adapter.updateSessionExpiration(sessionId, newExpirationDate);
    return { session, user, fresh: true };
  }

  return { session, user, fresh: false };
}

export async function setCookie(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, sessionId, {
    ...sessionCookieOptions,
    expires: createExpiryDate(sessionExpiration),
  });
}
export async function clearCookie() {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, "", {
    ...sessionCookieOptions,
    expires: new Date(0),
  });
}

export function isWithinExpirationDate(date: Date): boolean {
  return Date.now() < date.getTime();
}

/** @param timeSpan The time span in milliseconds */
function createExpiryDate(timeSpan: number) {
  return new Date(Date.now() + timeSpan);
}

export const validateRequest = cache(unCachedValidateRequest);

export async function unCachedValidateRequest(): Promise<
  Omit<ReturnType<typeof validateSession>, "fresh">
> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return { user: null, session: null };
  }
  const result = await validateSession(sessionId);
  // next.js throws when you attempt to set cookie when rendering page
  try {
    if (result.session && result.fresh) {
      await setCookie(result.session.id);
    }
    if (!result.session) {
      await clearCookie();
    }
  } catch {
    console.warn("Failed to set session cookie");
  }
  return result;
}
