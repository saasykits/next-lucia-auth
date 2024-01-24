import { TimeSpan, createDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/random";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { emailVerificationCodes } from "@/server/db/schema";

export async function generateEmailVerificationCode(
  userId: string,
  email: string,
): Promise<string> {
  await db
    .delete(emailVerificationCodes)
    .where(eq(emailVerificationCodes.userId, userId));
  const code = generateRandomString(8, alphabet("0-9")); // 8 digit code
  await db.insert(emailVerificationCodes).values({
    userId,
    email,
    code,
    expiresAt: createDate(new TimeSpan(10, "m")), // 10 minutes
  });
  return code;
}
