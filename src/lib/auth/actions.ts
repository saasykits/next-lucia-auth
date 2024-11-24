"use server";

import { env } from "@/env";
import { EmailTemplate, sendMail } from "@/lib/email";
import {
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  type LoginInput,
  type SignupInput,
} from "@/lib/validators/auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Paths } from "../constants";
import adapter from "./adapter";
import utils, { TimeSpan } from "./utils";

export interface ActionResponse<T> {
  fieldError?: Partial<Record<keyof T, string | undefined>>;
  formError?: string;
}

export async function login(_: unknown, formData: FormData): Promise<ActionResponse<LoginInput>> {
  const obj = Object.fromEntries(formData.entries());

  const parsed = loginSchema.safeParse(obj);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      fieldError: {
        email: err.fieldErrors.email?.[0],
        password: err.fieldErrors.password?.[0],
      },
    };
  }

  const { email, password } = parsed.data;

  const existingUser = await adapter.getUserWithEmail(email);

  if (!existingUser?.hashedPassword) {
    return {
      formError: "Incorrect email or password",
    };
  }
  const validPassword = await utils.verifyPassword(password, existingUser.hashedPassword);
  if (!validPassword) {
    return {
      formError: "Incorrect email or password",
    };
  }
  const session = await utils.createSession(existingUser.id);
  utils.setCookie(session.id);
  return redirect(Paths.Dashboard);
}

export async function signup(_: unknown, formData: FormData): Promise<ActionResponse<SignupInput>> {
  const obj = Object.fromEntries(formData.entries());

  const parsed = signupSchema.safeParse(obj);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      fieldError: {
        email: err.fieldErrors.email?.[0],
        password: err.fieldErrors.password?.[0],
      },
    };
  }

  const { email, password } = parsed.data;

  const existingUser = await adapter.getUserWithEmail(email);

  if (existingUser) {
    return {
      formError: "Cannot create account with that email",
    };
  }

  const userId = utils.generateId(21);
  const hashedPassword = await utils.hashPassword(password);
  await adapter.insertUser({ id: userId, email, hashedPassword });
  const verificationCode = await generateEmailVerificationCode(userId, email);
  await sendMail(email, EmailTemplate.EmailVerification, { code: verificationCode });

  const session = await utils.createSession(userId);
  utils.setCookie(session.id);
  return redirect(Paths.VerifyEmail);
}

export async function logout(): Promise<{ error: string } | void> {
  const { session } = await utils.validateRequest();
  if (!session) {
    return {
      error: "No session found",
    };
  }
  await utils.invalidateSession(session.id);
  utils.clearCookie();
  return redirect("/");
}

export async function resendVerificationEmail(): Promise<{
  error?: string;
  success?: boolean;
}> {
  const { user } = await utils.validateRequest();
  if (!user) {
    return redirect(Paths.Login);
  }

  const lastSent = await adapter.getEmailVerificationCodeWithUserId(user.id);
  if (lastSent && utils.isWithinExpirationDate(lastSent.expiresAt)) {
    return {
      error: `Please wait ${timeFromNow(lastSent.expiresAt)} before resending`,
    };
  }
  const verificationCode = await generateEmailVerificationCode(user.id, user.email);
  await sendMail(user.email, EmailTemplate.EmailVerification, { code: verificationCode });

  return { success: true };
}

export async function verifyEmail(
  _: unknown,
  formData: FormData,
): Promise<{ error: string } | void> {
  const code = formData.get("code");
  if (typeof code !== "string" || code.length !== 8) {
    return { error: "Invalid code" };
  }
  const { user } = await utils.validateRequest();
  if (!user) {
    return redirect(Paths.Login);
  }

  const dbCode = await adapter.getAndDeleteEmailVerificationCodeWithUserId(user.id);

  if (!dbCode || dbCode.code !== code) return { error: "Invalid verification code" };

  if (!utils.isWithinExpirationDate(dbCode.expiresAt))
    return { error: "Verification code expired" };

  if (dbCode.email !== user.email) return { error: "Email does not match" };

  await utils.invalidateUserSessions(user.id);
  await adapter.updateUser(user.id, { emailVerified: true });
  const session = await utils.createSession(user.id);
  utils.setCookie(session.id);
  redirect(Paths.Dashboard);
}

export async function sendPasswordResetLink(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get("email");
  const parsed = z.string().trim().email().safeParse(email);
  if (!parsed.success) {
    return { error: "Provided email is invalid." };
  }
  try {
    const user = await adapter.getUserWithEmail(parsed.data);

    if (!user || !user.emailVerified) return { error: "Provided email is invalid." };

    const verificationToken = await generatePasswordResetToken(user.id);

    const verificationLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password/${verificationToken}`;

    await sendMail(user.email, EmailTemplate.PasswordReset, { link: verificationLink });

    return { success: true };
  } catch (error) {
    return { error: "Failed to send verification email." };
  }
}

export async function resetPassword(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const obj = Object.fromEntries(formData.entries());

  const parsed = resetPasswordSchema.safeParse(obj);

  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      error: err.fieldErrors.password?.[0] ?? err.fieldErrors.token?.[0],
    };
  }
  const { token, password } = parsed.data;

  const dbToken = await adapter.getAndDeletePasswordResetToken(token);
  if (!dbToken) return { error: "Invalid password reset link" };

  if (!utils.isWithinExpirationDate(dbToken.expiresAt)) {
    return { error: "Password reset link expired." };
  }

  await utils.invalidateUserSessions(dbToken.userId);
  const hashedPassword = await utils.hashPassword(password);
  await adapter.updateUser(dbToken.userId, { hashedPassword });
  const session = await utils.createSession(dbToken.userId);
  utils.setCookie(session.id);
  redirect(Paths.Dashboard);
}

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
    expiresAt: utils.createTimeSpanDate(new TimeSpan(10, "m")),
  });
  return code;
}

async function generatePasswordResetToken(userId: string): Promise<string> {
  await adapter.deleteUserPasswordResetTokens(userId);
  const tokenId = utils.generateId(40);
  await adapter.insertPasswordResetToken({
    id: tokenId,
    userId,
    expiresAt: utils.createTimeSpanDate(new TimeSpan(2, "h")),
  });
  return tokenId;
}
