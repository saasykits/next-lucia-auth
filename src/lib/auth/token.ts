import "server-only";

import { generateRandomString, isWithinExpiration } from "lucia/utils";
import { db } from "@/server/db";
import { RESET_TOKEN_EXPIRATION } from "@/lib/constants";
import {
  passwordResetTokens,
  emailVerificationTokens,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const generatePasswordResetToken = async (userId: string) => {
  const currentTime = new Date().getTime();
  const storedUserTokens = await db.query.passwordResetTokens.findMany({
    where: (table, { and, eq, gte }) =>
      and(eq(table.userId, userId), gte(table.expires, currentTime)),
    orderBy: (table, { desc }) => desc(table.expires),
  });

  if (storedUserTokens.length > 0) {
    const reusableStoredToken = storedUserTokens.find((token) => {
      return isWithinExpiration(
        Number(token.expires) - RESET_TOKEN_EXPIRATION / 2,
      );
    });
    if (reusableStoredToken) return reusableStoredToken.id;
  }

  const token = generateRandomString(63);

  await db.insert(passwordResetTokens).values({
    expires: new Date().getTime() + RESET_TOKEN_EXPIRATION,
    id: token,
    userId,
  });

  return token;
};

export const validatePasswordResetToken = async (token: string) => {
  const stored = await db.transaction(async (tx) => {
    const stored = await tx.query.passwordResetTokens.findFirst({
      where: (table, { eq }) => eq(table.id, token),
    });
    if (!stored) throw new Error("Invalid token");
    await tx
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, token));

    return stored;
  });

  const tokenExpires = Number(stored.expires);

  if (!isWithinExpiration(tokenExpires)) throw new Error("Expired token");

  return stored.userId;
};

export const generateEmailVerificationToken = async (userId: string) => {
  const currentTime = new Date().getTime();
  const storedUserTokens = await db.query.emailVerificationTokens.findMany({
    where: (table, { and, eq, gte }) =>
      and(eq(table.userId, userId), gte(table.expires, currentTime)),
    orderBy: (table, { desc }) => desc(table.expires),
  });

  if (storedUserTokens.length > 0) {
    const reusableStoredToken = storedUserTokens.find((token) => {
      return isWithinExpiration(
        Number(token.expires) - RESET_TOKEN_EXPIRATION / 2,
      );
    });
    if (reusableStoredToken) return reusableStoredToken.id;
  }

  const token = generateRandomString(63);

  await db.insert(emailVerificationTokens).values({
    expires: new Date().getTime() + RESET_TOKEN_EXPIRATION,
    id: token,
    userId,
  });

  return token;
};

export const validateEmailVerificationToken = async (token: string) => {
  const stored = await db.transaction(async (tx) => {
    const stored = await tx.query.emailVerificationTokens.findFirst({
      where: (table, { eq }) => eq(table.id, token),
    });
    if (!stored) throw new Error("Invalid token");
    await tx
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.id, token));

    return stored;
  });

  const tokenExpires = Number(stored.expires);

  if (!isWithinExpiration(tokenExpires)) throw new Error("Expired token");

  return stored.userId;
};
