"use server";

import { env } from "@/env";
import { EmailTemplate, sendMail } from "@/lib/email";
import { loginSchema, resetPasswordSchema, signupSchema } from "@/lib/validators/auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Paths } from "../constants";
import adapter from "./adapter";
import utils from "./utils";

export type ActionOutput<T extends z.ZodRawShape> = {
  success: boolean;
  message?: string;
  input: z.input<z.ZodObject<T>> | null | undefined;
  errors?: z.typeToFlattenedError<T>;
};
export type ActionFn<T extends z.ZodRawShape> = (
  prevState: ActionOutput<T> | null | undefined,
  formData: FormData,
) => Promise<ActionOutput<T>>;

export type ActionCallback<T extends z.ZodRawShape> = (
  prevState: ActionOutput<T> | null | undefined,
  data: z.infer<z.ZodObject<T>>,
) => Promise<ActionOutput<T>>;

function action<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  callback: ActionCallback<T>,
): ActionFn<T> {
  return async (prevState, formData) => {
    const obj = Object.fromEntries(formData.entries());
    const parsed = schema.safeParse(obj);
    if (!parsed.success) {
      const errors = parsed.error.flatten();
      return {
        success: false,
        message: "Invalid form input",
        input: obj,
        errors,
      } as ActionOutput<T>;
    }
    return callback(prevState, parsed.data);
  };
}

export const loginAction = action(loginSchema, async (_, input) => {
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

export const signupAction = action(signupSchema, async (_, input) => {
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

export async function logout(): Promise<{ error: string } | void> {
  const { session } = await utils.validateRequest();
  if (!session) {
    return {
      error: "No session found",
    };
  }
  await utils.invalidateSession(session.id);
  await utils.clearCookie();
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
  await utils.setCookie(session.id);
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
  await utils.setCookie(session.id);
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
