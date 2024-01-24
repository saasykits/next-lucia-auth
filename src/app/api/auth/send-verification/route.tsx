import { auth } from "@/lib/auth/lucia";
import { generateEmailVerificationToken } from "@/lib/auth/token";
import { sendMail } from "@/server/send-mail";
import { render } from "@react-email/render";
import { EmailVerificationEmail } from "@/lib/email-templates/email-verification";

import type { NextRequest } from "next/server";
import { env } from "@/env";

export const POST = async (request: NextRequest) => {
  const authRequest = auth.handleRequest(request);
  const session = await authRequest.validate();
  if (!session) {
    return new Response(null, { status: 401 });
  }
  if (session.user.emailVerified) {
    return new Response(JSON.stringify({ error: "Email already verified" }), {
      status: 422,
    });
  }
  try {
    const token = await generateEmailVerificationToken(session.user.userId);
    await sendMail({
      to: session.user.email,
      subject: "Verify your email",
      body: render(
        <EmailVerificationEmail
          username={session.user.fullName.split(" ")[0] ?? ""}
          link={`${env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email/${token}`}
        />,
      ),
    });
    return new Response(JSON.stringify({ message: "success" }));
  } catch {
    return new Response(
      JSON.stringify({ error: "An unknown error occurred" }),
      { status: 500 },
    );
  }
};
