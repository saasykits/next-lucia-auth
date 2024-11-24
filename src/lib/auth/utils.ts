import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import crypto from "crypto";
import { cookies } from "next/headers";
import "server-only";
import { sessionCookieName, sessionCookieOptions, sessionExpiration } from ".";
import type { AuthSession, AuthUser } from "./adapter";
import adapter from "./adapter";

const utils = {
  createSession,
  invalidateSession,
  invalidateUserSessions,
  validateSession,
  validateRequest,
  setCookie,
  clearCookie,
  generateId,
  hashPassword,
  verifyPassword,
  isWithinExpirationDate,
  createTimeSpanDate,
};
export default utils;

async function createSession(userId: string) {
  const session: AuthSession = {
    userId,
    id: generateIdFromEntropySize(25),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
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
    dbSession.expiresAt.getTime() - sessionExpiration.milliseconds() / 2,
  );
  if (!isWithinExpirationDate(activePeriodExpirationDate)) {
    const newExpirationDate = new Date(Date.now() + sessionExpiration.milliseconds());
    await adapter.updateSessionExpiration(sessionId, newExpirationDate);
    return { session, user, fresh: true };
  }

  return { session, user, fresh: false };
}

function setCookie(sessionId: string) {
  cookies().set(sessionCookieName, sessionId, {
    ...sessionCookieOptions,
    expires: Date.now() + sessionExpiration.milliseconds(),
  });
}
function clearCookie() {
  cookies().set(sessionCookieName, "", {
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

async function validateRequest(): Promise<Omit<ReturnType<typeof validateSession>, "fresh">> {
  const sessionId = cookies().get(sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return { user: null, session: null };
  }
  const result = await validateSession(sessionId);
  // next.js throws when you attempt to set cookie when rendering page
  try {
    if (result.session && result.fresh) {
      setCookie(result.session.id);
    }
    if (!result.session) {
      clearCookie();
    }
  } catch {
    console.error("Failed to set session cookie");
  }
  return result;
}

function generateId(length: number): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => alphabet[x % alphabet.length])
    .join("");
}

function createTimeSpanDate(timeSpan: TimeSpan) {
  return new Date(Date.now() + timeSpan.milliseconds());
}

export type TimeSpanUnit = "ms" | "s" | "m" | "h" | "d" | "w";
export class TimeSpan {
  constructor(value: number, unit: TimeSpanUnit) {
    this.value = value;
    this.unit = unit;
  }
  public value: number;
  public unit: TimeSpanUnit;
  public milliseconds(): number {
    switch (this.unit) {
      case "ms":
        return this.value;
      case "s":
        return this.value * 1000;
      case "m":
        return this.value * 1000 * 60;
      case "h":
        return this.value * 1000 * 60 * 60;
      case "d":
        return this.value * 1000 * 60 * 60 * 24;
      case "w":
        return this.value * 1000 * 60 * 60 * 24 * 7;
      default:
        throw new Error("Invalid unit");
    }
  }
  public seconds(): number {
    return this.milliseconds() / 1000;
  }
  public transform(x: number): TimeSpan {
    return new TimeSpan(Math.round(this.milliseconds() * x), "ms");
  }
}

async function hashPassword(str: string) {
  const salt = encodeHexLowerCase(crypto.getRandomValues(new Uint8Array(16)));
  const blockSize = 16;
  const key = await generateScryptKey(str, salt, blockSize);
  return `${salt}:${key}`;
}
async function verifyPassword(str: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  if (!salt || !key) return false;
  const keyToVerify = await generateScryptKey(str, salt);
  return key === keyToVerify;
}
function generateScryptKey(str: string, salt: string, blockSize = 16) {
  const encodedData = new TextEncoder().encode(str.normalize("NFKC"));
  const encodedSalt = new TextEncoder().encode(salt);
  const keyLength = 64;

  return new Promise<string>((resolve, reject) => {
    crypto.scrypt(
      encodedData,
      encodedSalt,
      keyLength,
      { N: 16384, r: blockSize, p: 1 },
      (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString("hex"));
      },
    );
  });
}
