import * as context from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth/lucia";
import { getExceptionType } from "@/lib/utils";
import { registerSchema } from "@/lib/validators/auth";

export const POST = async (request: NextRequest) => {
  const body = (await request.json()) as Record<string, unknown>;

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { data } = parsed;

  try {
    const user = await auth.createUser({
      key: {
        providerId: "email", // auth method
        providerUserId: data.email.toLowerCase(),
        password: data.password,
      },
      attributes: {
        full_name: data.fullName,
        email: data.email,
        email_verified: false,
        active: true,
        role: "user",
      },
    });

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
