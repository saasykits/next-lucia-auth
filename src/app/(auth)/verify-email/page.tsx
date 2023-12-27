import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPageSession } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { SendVerification } from "./send-verification";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Verify Email",
  description: "Verify Email Page",
};

export default async function ForgotPasswordPage() {
  const session = await getPageSession();

  if (!session) redirect("/login");
  if (session.user.emailVerified) redirect("/");

  return (
    <main className="p-4">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Verify Email</CardTitle>
          <CardDescription>
            Verify your email address to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Welcome, {session.user.fullName}! Click the button below to send a
            verification link to your email. If you don't receive the email,
            check your spam folder.
          </p>
        </CardContent>
        <CardFooter className="items-start justify-between">
          <SendVerification />{" "}
          <form action="/api/auth/logout" method="POST">
            <Button variant="ghost">Logout</Button>
          </form>
        </CardFooter>
      </Card>
    </main>
  );
}
