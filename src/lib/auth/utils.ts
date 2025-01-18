import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import crypto from "crypto";
import { cookies } from "next/headers";
import "server-only";
import type { AuthSession, AuthUser } from "./adapter";
import adapter from "./adapter";
import { sessionCookieName, sessionCookieOptions } from "./config";

const sessionExpiration = 30 * 24 * 60 * 60 * 1000; // 30 days

const utils = {
  createSession,
  invalidateSession,
  invalidateUserSessions,
  validateSession,
  setCookie,
  clearCookie,
  generateId,
  hashPassword,
  verifyPassword,
  isWithinExpirationDate,
  verifyRequestOrigin,
};
export default utils;

async function createSession(userId: string) {
  const session: AuthSession = {
    userId,
    id: generateIdFromEntropySize(25),
    expiresAt: createExpiryDate(sessionExpiration),
  };
  await adapter.createSession(session);
  return session;
}

async function invalidateSession(sessionId: string) {
  await adapter.deleteSession(sessionId);
}

async function invalidateUserSessions(userId: string) {
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

async function setCookie(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, sessionId, {
    ...sessionCookieOptions,
    expires: createExpiryDate(sessionExpiration),
  });
}
async function clearCookie() {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, "", {
    ...sessionCookieOptions,
    expires: new Date(0),
  });
}

function generateIdFromEntropySize(size: number): string {
  const buffer = crypto.getRandomValues(new Uint8Array(size));
  return encodeBase32LowerCaseNoPadding(buffer);
}
function isWithinExpirationDate(date: Date): boolean {
  return Date.now() < date.getTime();
}

function generateId(length: number): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => alphabet[x % alphabet.length])
    .join("");
}

/** @param timeSpan The time span in milliseconds */
function createExpiryDate(timeSpan: number) {
  return new Date(Date.now() + timeSpan);
}

async function hashPassword(str: string) {
  const salt = encodeHexLowerCase(crypto.getRandomValues(new Uint8Array(16)));
  const key = await generateScryptKey(str, salt);
  return `${salt}:${key}`;
}

async function verifyPassword(str: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  if (!salt || !key) return false;
  const keyToVerify = await generateScryptKey(str, salt);
  return key === keyToVerify;
}

function generateScryptKey(str: string, salt: string) {
  const encodedData = new TextEncoder().encode(str.normalize("NFKC"));
  const encodedSalt = new TextEncoder().encode(salt);
  const keyLength = 64;
  return new Promise<string>((resolve, reject) => {
    crypto.scrypt(
      encodedData,
      encodedSalt,
      keyLength,
      { N: 16384, r: 16, p: 1, maxmem: 64 * 1024 * 1024 },
      (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString("hex"));
      },
    );
  });
}

function verifyRequestOrigin(origin: string, allowedDomains: string[]): boolean {
  if (!origin || allowedDomains.length === 0) {
    return false;
  }
  const originHost = safeURL(origin)?.host ?? null;
  if (!originHost) {
    return false;
  }
  for (const domain of allowedDomains) {
    let host: string | null;
    if (domain.startsWith("http://") || domain.startsWith("https://")) {
      host = safeURL(domain)?.host ?? null;
    } else {
      host = safeURL("https://" + domain)?.host ?? null;
    }
    if (originHost === host) {
      return true;
    }
  }
  return false;
}

function safeURL(url: URL | string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}
