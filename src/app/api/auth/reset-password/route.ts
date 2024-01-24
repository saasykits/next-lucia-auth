import * as context from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth/lucia";
import { getExceptionType } from "@/lib/utils";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { validatePasswordResetToken } from "@/lib/auth/token";

export const POST = async (request: NextRequest) => {
  const body = (await request.json()) as Record<string, unknown>;

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { data } = parsed;

  const userId = await validatePasswordResetToken(data.token);
  try {
    let user = await auth.getUser(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    await auth.invalidateAllUserSessions(user.userId);
    await auth.updateKeyPassword("email", user.email, data.password);

    if (!user.emailVerified) {
      user = await auth.updateUserAttributes(user.userId, {
        email_verified: true,
      });
    }
    const session = await auth.createSession({
      userId: user.userId,
      attributes: {},
    });
    const authRequest = auth.handleRequest(request.method, context);
    authRequest.setSession(session);
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    const { status, message } = getExceptionType(e);
    return NextResponse.json({ error: message }, { status: status });
  }
};
