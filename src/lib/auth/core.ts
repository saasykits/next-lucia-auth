"use server";

import { env } from "@/env";
import { EmailTemplate, sendMail } from "@/lib/email";
import type { Discord } from "arctic";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { action, validatedAction } from "../action-utils";
import { Paths } from "../constants";
import type { Adapter } from "./adapter";
import {
  clearCookie,
  createSession,
  invalidateSession,
  invalidateUserSessions,
  setCookie,
  validateRequest,
} from "./utils";

const SALT_ROUNDS = 10;
const SESSION_COOKIE_NAME = "auth_session";

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

interface Config {
  adapter: Adapter;
  discord: Discord;
  cookieOptions: {
    httpOnly: boolean;
    sameSite: "lax" | "strict" | "none";
    secure: boolean;
    path: string;
  };
  paths: {
    login: string;
    loginRedirect: string;
    signup: string;
    verifyEmail: string;
  };
  callbacks?: {
    onLogin?: (user: Auth["$User"]) => Promise<void> | void;
    onSignup?: (user: Auth["$User"], verificationCode?: string) => Promise<void> | void;
    onLogout?: () => Promise<void> | void;
  };
  sessionExpiration: number;
  verificationCodeExpiration: number;
  passwordResetTokenExpiration: number;
}
interface Auth {
  $User: Pick<
    NonNullable<Awaited<ReturnType<Adapter["getUser"]>>>,
    "id" | "email" | "emailVerified"
  >;
  $Session: NonNullable<Awaited<ReturnType<Adapter["getSession"]>>>;
  login: (input: { email: string; password: string }) => Promise<void>;
  signup: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (input: { code: string }) => Promise<void>;
  resetPassword: (input: { token: string; password: string }) => Promise<void>;
  sendPasswordResetEmail: (input: { email: string }) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

type AuthErrorCode =
  | "USER_NOT_FOUND"
  | "INVALID_PASSWORD"
  | "INVALID_SESSION"
  | "EMAIL_NOT_VERIFIED"
  | "EMAIL_ALREADY_EXISTS"
  | "INVALID_EMAIL"
  | "INVALID_PASSWORD_RESET_TOKEN"
  | "INVALID_EMAIL_VERIFICATION_CODE"
  | "EMAIL_VERIFICATION_CODE_EXPIRED"
  | "PASSWORD_RESET_TOKEN_EXPIRED";
export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    public message = "An error occurred",
  ) {
    super(message);
  }
}
const getExpiryDate = (timeSpan: number) => new Date(Date.now() + timeSpan);
const isWithinExpirationDate = (date: Date) => Date.now() < date.getTime();

function initAuth(config: Config): Auth {
  const {
    adapter,
    discord,
    cookieOptions,
    sessionExpiration,
    verificationCodeExpiration,
    passwordResetTokenExpiration,
    callbacks,
    paths,
  } = config;
  const setCookie = async (sessionId: string) =>
    (await cookies()).set(SESSION_COOKIE_NAME, sessionId, {
      ...cookieOptions,
      expires: getExpiryDate(sessionExpiration),
    });
  const clearCookie = async () =>
    (await cookies()).set(SESSION_COOKIE_NAME, "", { ...cookieOptions, expires: getExpiryDate(0) });
  const createSession = async (userId: string) =>
    adapter.createSession({ id: nanoid(25), userId, expiresAt: getExpiryDate(sessionExpiration) });
  const validateSession = async (sessionId: string) => {
    const session = await adapter.getSession(sessionId);
    if (!session) return { session: null, user: null };
    const { user, ...data } = session;
    if (!isWithinExpirationDate(data.expiresAt)) {
      await adapter.deleteSession(sessionId);
      return { session: null, user: null };
    }
    const activePeriodExpiration = new Date(data.expiresAt.getTime() - sessionExpiration / 2);
    let fresh = false;
    if (!isWithinExpirationDate(activePeriodExpiration)) {
      const newExpiration = getExpiryDate(sessionExpiration);
      await adapter.updateSession(sessionId, { expiresAt: newExpiration });
      fresh = true;
    }
    const { email, emailVerified, id } = user;
    return { session: data, user: { email, emailVerified, id } as Auth["$User"], fresh };
  };
  const validateRequest = async () => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
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
  };
  const createdVerificationCode = async (userId: string, email: string) => {
    const data = {
      email,
      userId,
      code: nanoid(8),
      expiresAt: getExpiryDate(verificationCodeExpiration),
    };
    await adapter.insertVerificationCode(data);
    return data;
  };

  return {
    $User: null as never,
    $Session: null as never,
    async login({ email, password }) {
      const existingUser = await adapter.getUser("email", email);
      if (!existingUser) throw new AuthError("USER_NOT_FOUND");
      if (!existingUser.hashedPassword) throw new AuthError("INVALID_PASSWORD");
      const validPassword = await bcrypt.compare(password, existingUser.hashedPassword);
      if (!validPassword) throw new AuthError("INVALID_PASSWORD");

      await callbacks?.onLogin?.({ id: userId, email, emailVerified: false }, code);

      const session = await createSession(existingUser.id);
      await setCookie(session.id);
      redirect(paths.loginRedirect);
    },
    async signup({ email, password }) {
      const existingUser = await adapter.getUser("email", email);
      if (existingUser) throw new AuthError("EMAIL_ALREADY_EXISTS");
      const userId = nanoid(21);
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await adapter.insertUser({ id: userId, email, hashedPassword });
      const { code } = await createdVerificationCode(userId, email);
      try {
        await callbacks?.onSignup?.({ id: userId, email, emailVerified: false }, code);
      } catch (err) {
        console.error(err);
      }
      const session = await createSession(userId);
      await setCookie(session.id);
      redirect(paths.verifyEmail);
    },
    async logout() {
      const { session } = await validateRequest();
      if (!session) throw new AuthError("INVALID_SESSION");
      await adapter.deleteSession(session.id);
      await clearCookie();
      redirect(paths.login);
    },
    async getNewVerificationCode() {
      const { user } = await validateRequest();
      if (!user) {
        return redirect(Paths.Login);
      }
      const [lastSent] = await adapter.getVerificationCodes(user.id);
      if (lastSent && isWithinExpirationDate(lastSent.expiresAt)) {
        return {
          success: false,
          message: `Please wait ${timeFromNow(lastSent.expiresAt)} before resending`,
        };
      }
      const verificationCode = await generateEmailVerificationCode(user.id, user.email);
      await sendMail(user.email, EmailTemplate.EmailVerification, { code: verificationCode });
      return { success: true, data: null };
    },
  };
}
class Auth2 {
  private adapter: Adapter;
  private discord: Discord;
  private cookieOptions: Config["cookieOptions"];
  private sessionExpiration: number;
  constructor(config: Config) {
    this.adapter = config.adapter;
    this.discord = config.discord;
    this.cookieOptions = config.cookieOptions;
    this.sessionExpiration = config.sessionExpiration;
  }
}

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
    if (!user?.emailVerified)
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
