import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { logout } from "@/lib/auth/actions";
import { validateRequest } from "@/lib/auth/validate-request";
import { redirects } from "@/lib/constants";

export default async function AccountPage() {
  const { user } = await validateRequest();
  if (!user) redirect(redirects.toLogin);

  return (
    <main className="container mx-auto min-h-screen p-4">
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle> {user.email}!</CardTitle>
          <CardDescription>You've successfully logged in!</CardDescription>
        </CardHeader>
        <CardContent>This is a private page.</CardContent>
        <CardFooter>
          <form action={logout}>
            <SubmitButton variant="outline">Logout</SubmitButton>
          </form>
        </CardFooter>
      </Card>
    </main>
  );
}
