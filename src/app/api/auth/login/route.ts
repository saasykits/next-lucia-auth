import { auth } from "@/lib/auth/lucia";
import * as context from "next/headers";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import { loginSchema } from "@/lib/validators/auth";
import { getExceptionType } from "@/lib/utils";

export const POST = async (request: NextRequest) => {
  const body = (await request.json()) as Record<string, unknown>;
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { email, password } = parsed.data;
  try {
    const key = await auth.useKey("email", email.toLowerCase(), password);
    const session = await auth.createSession({
      userId: key.userId,
      attributes: {},
    });
    const authRequest = auth.handleRequest(request.method, context);
    authRequest.setSession(session);
    return NextResponse.json({ user: key.userId });
  } catch (e) {
    const { status, message } = getExceptionType(e);
    return NextResponse.json({ error: message }, { status: status });
  }
};
