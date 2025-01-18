import { SubmitButton } from "@/components/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { validateRequest } from "@/lib/auth";
import { logoutAction } from "@/lib/auth/actions";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";

const logout = async () => {
  await logoutAction(null);
};

export default async function AccountPage() {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

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
