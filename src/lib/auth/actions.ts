"use server";

import { env } from "@/env";
import { EmailTemplate, sendMail } from "@/lib/email";
import { redirect } from "next/navigation";
import { z } from "zod";
import { validateRequest } from ".";
import { action, validatedAction } from "../action-utils";
import { Paths } from "../constants";
import adapter from "./adapter";
import utils from "./utils";

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
    const validPassword = await utils.verifyPassword(password, existingUser.hashedPassword);
    if (!validPassword) {
      return {
        success: false,
        input,
        message: "Incorrect email or password",
      };
    }
    const session = await utils.createSession(existingUser.id);
    await utils.setCookie(session.id);
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
  const userId = utils.generateId(21);
  const hashedPassword = await utils.hashPassword(password);
  await adapter.insertUser({ id: userId, email, hashedPassword });
  const verificationCode = await generateEmailVerificationCode(userId, email);
  await sendMail(email, EmailTemplate.EmailVerification, { code: verificationCode });
  const session = await utils.createSession(userId);
  await utils.setCookie(session.id);
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
  await utils.invalidateSession(session.id);
  await utils.clearCookie();
  redirect("/");
});

export const resendVerificationEmail = action(async () => {
  const { user } = await validateRequest();
  if (!user) {
    return redirect(Paths.Login);
  }
  const lastSent = await adapter.getEmailVerificationCodeWithUserId(user.id);
  if (lastSent && utils.isWithinExpirationDate(lastSent.expiresAt)) {
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
    const dbCode = await adapter.getAndDeleteEmailVerificationCodeWithUserId(user.id);
    if (!dbCode || dbCode.code !== code) {
      return {
        success: false,
        message: "Invalid verification code",
      };
    }
    if (!utils.isWithinExpirationDate(dbCode.expiresAt)) {
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
    await utils.invalidateUserSessions(user.id);
    await adapter.updateUser(user.id, { emailVerified: true });
    const session = await utils.createSession(user.id);
    await utils.setCookie(session.id);
    redirect(Paths.Dashboard);
  },
);

export const resetPasswordAction = validatedAction(resetPasswordSchema, async (data, input) => {
  const { token, password } = input;

  const dbToken = await adapter.getAndDeletePasswordResetToken(token);
  if (!dbToken) {
    return {
      input,
      success: false,
      message: "Invalid password reset link",
    };
  }
  if (!utils.isWithinExpirationDate(dbToken.expiresAt)) {
    return {
      input,
      success: false,
      message: "Password reset link expired.",
    };
  }
  await utils.invalidateUserSessions(dbToken.userId);
  const hashedPassword = await utils.hashPassword(password);
  await adapter.updateUser(dbToken.userId, { hashedPassword });
  const session = await utils.createSession(dbToken.userId);
  await utils.setCookie(session.id);
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
  const code = utils.generateId(8);
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
  const tokenId = utils.generateId(40);
  await adapter.insertPasswordResetToken({
    id: tokenId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 120) /* 2 hours */,
  });
  return tokenId;
}
