import { NextResponse, type NextRequest } from "next/server";

import { getExceptionType } from "@/lib/utils";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { db } from "@/server/db";
import { env } from "@/env";
import { sendMail } from "@/server/send-mail";
import { render } from "@react-email/render";
import { generatePasswordResetToken } from "@/lib/auth/token";
import { ResetPasswordEmail } from "@/lib/email-templates/reset-password";

export const POST = async (request: NextRequest) => {
  const body = (await request.json()) as Record<string, unknown>;

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { data } = parsed;

  try {
    const user = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.email, data.email),
      columns: { id: true, email: true, fullName: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }
    const token = await generatePasswordResetToken(user.id);

    const resetLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;

    const mailOptions = {
      to: user.email,
      subject: "Password Reset",
      body: render(
        <ResetPasswordEmail
          username={user.fullName.split(" ")[0] ?? ""}
          link={resetLink}
        />,
      ),
    } as const;

    await sendMail(mailOptions);

    return NextResponse.json({ message: "Email sent" }, { status: 200 });
  } catch (e) {
    console.log(e);
    const { status, message } = getExceptionType(e);
    return NextResponse.json({ error: message }, { status: status });
  }
};
