import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SendResetEmail } from "./send-reset-email";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";

export const metadata = {
  title: "Reset Password",
  description: "Reset Password Page",
};

export default async function ResetPasswordPage() {
  const { user } = await validateRequest();

  if (user) redirect(Paths.Dashboard);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Password reset link will be sent to your email.</CardDescription>
      </CardHeader>
      <CardContent>
        <SendResetEmail />
      </CardContent>
    </Card>
  );
}
