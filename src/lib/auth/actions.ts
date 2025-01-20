"use server";

import { env } from "@/env";
import { EmailTemplate, sendMail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { z } from "zod";
import { action, validatedAction } from "../action-utils";
import { Paths } from "../constants";
import adapter from "./adapter";
import {
  clearCookie,
  createSession,
  invalidateSession,
  invalidateUserSessions,
  isWithinExpirationDate,
  setCookie,
  validateRequest,
} from "./utils";

const SALT_ROUNDS = 10;

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Please provide your password.").max(255),
});
const signupSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password is too short. Minimum 8 characters required.").max(255),
});
const resetPasswordSchema = z.object({
  token: z.string().min(1, "Invalid token"),
  password: z.string().min(8, "Password is too short").max(255),
});

export const loginAction = validatedAction(loginSchema, async (_, input) => {
  const { email, password } = input;
  try {
    const existingUser = await adapter.getUserWithEmail(email);

    if (!existingUser?.hashedPassword) {
      return {
        success: false,
        input,
        message: "Incorrect email or password",
      };
    }
    const validPassword = await bcrypt.compare(password, existingUser.hashedPassword);
    if (!validPassword) {
      return {
        success: false,
        input,
        message: "Incorrect email or password",
      };
    }
    const session = await createSession(existingUser.id);
    await setCookie(session.id);
  } catch (error) {
    console.error(error);
    return {
      success: false,
      input,
      message: "An error occurred",
    };
  }
  redirect(Paths.Dashboard);
});

export const signupAction = validatedAction(signupSchema, async (_, input) => {
  const { email, password } = input;
  const existingUser = await adapter.getUserWithEmail(email);
  if (existingUser) {
    return {
      input,
      success: false,
      message: "Cannot create account with that email",
    };
  }
  const userId = nanoid(21);
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  await adapter.insertUser({ id: userId, email, hashedPassword });
  const verificationCode = await generateEmailVerificationCode(userId, email);
  await sendMail(email, EmailTemplate.EmailVerification, { code: verificationCode });
  const session = await createSession(userId);
  await setCookie(session.id);
  return redirect(Paths.VerifyEmail);
});

export const logoutAction = action(async () => {
  const { session } = await validateRequest();
  if (!session) {
    return {
      success: false,
      message: "No session found",
    };
  }
  await invalidateSession(session.id);
  await clearCookie();
  redirect("/");
});

export const resendVerificationEmail = action(async () => {
  const { user } = await validateRequest();
  if (!user) {
    return redirect(Paths.Login);
  }
  const lastSent = await adapter.getEmailVerificationCodeWithUserId(user.id);
  if (lastSent && isWithinExpirationDate(lastSent.expiresAt)) {
    return {
      success: false,
      message: `Please wait ${timeFromNow(lastSent.expiresAt)} before resending`,
    };
  }
  const verificationCode = await generateEmailVerificationCode(user.id, user.email);
  await sendMail(user.email, EmailTemplate.EmailVerification, { code: verificationCode });
  return { success: true, data: null };
});

export const verifyEmailAction = validatedAction(
  z.object({ code: z.string().length(8) }),
  async (_, { code }) => {
    const { user } = await validateRequest();
    if (!user) {
      redirect(Paths.Login);
    }
    const dbCode = await adapter.retriveAndDeleteEmailVerificationCode(user.id);
    if (!dbCode || dbCode.code !== code) {
      return {
        success: false,
        message: "Invalid verification code",
      };
    }
    if (!isWithinExpirationDate(dbCode.expiresAt)) {
      return {
        success: false,
        message: "Verification code expired",
      };
    }
    if (dbCode.email !== user.email) {
      return {
        success: false,
        message: "Email does not match",
      };
    }
    await invalidateUserSessions(user.id);
    await adapter.updateUser(user.id, { emailVerified: true });
    const session = await createSession(user.id);
    await setCookie(session.id);
    redirect(Paths.Dashboard);
  },
);

export const resetPasswordAction = validatedAction(resetPasswordSchema, async (data, input) => {
  const { token, password } = input;

  const dbToken = await adapter.retriveAndDeletePasswordResetToken(token);
  if (!dbToken) {
    return {
      input,
      success: false,
      message: "Invalid password reset link",
    };
  }
  if (!isWithinExpirationDate(dbToken.expiresAt)) {
    return {
      input,
      success: false,
      message: "Password reset link expired.",
    };
  }
  await invalidateUserSessions(dbToken.userId);
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  await adapter.updateUser(dbToken.userId, { hashedPassword });
  const session = await createSession(dbToken.userId);
  await setCookie(session.id);
  redirect(Paths.Dashboard);
});

export const sendPasswordResetEmailAction = validatedAction(
  z.object({ email: z.string().trim().email() }),
  async (_, { email }) => {
    const user = await adapter.getUserWithEmail(email);
    if (!user || !user.emailVerified)
      return {
        success: false,
        message: "User not found",
      };
    const verificationToken = await generatePasswordResetToken(user.id);
    const verificationLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password/${verificationToken}`;
    await sendMail(user.email, EmailTemplate.PasswordReset, { link: verificationLink });
    return { success: true, message: "Email sent", data: null };
  },
);

const timeFromNow = (time: Date) => {
  const now = new Date();
  const diff = time.getTime() - now.getTime();
  const minutes = Math.floor(diff / 1000 / 60);
  const seconds = Math.floor(diff / 1000) % 60;
  return `${minutes}m ${seconds}s`;
};

async function generateEmailVerificationCode(userId: string, email: string): Promise<string> {
  await adapter.deleteUserEmailVerificationCodes(userId);
  const code = nanoid(8);
  await adapter.insertEmailVerificationCode({
    userId,
    email,
    code,
    expiresAt: new Date(Date.now() + 1000 * 60 * 10) /* 10 minutes */,
  });
  return code;
}

async function generatePasswordResetToken(userId: string): Promise<string> {
  await adapter.deleteUserPasswordResetTokens(userId);
  const tokenId = nanoid(40);
  await adapter.insertPasswordResetToken({
    id: tokenId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 120) /* 2 hours */,
  });
  return tokenId;
}
