import { Button } from "@/components/ui/button";
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

export default async function AccountPage() {
  const session = await getPageSession();
  if (!session) redirect("/login");

  return (
    <main className="container  mx-auto p-4">
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Welcome, {session.user.fullName}!</CardTitle>
          <CardDescription>You've successfully logged in!</CardDescription>
        </CardHeader>
        <CardContent>This is a private page.</CardContent>
        <CardFooter>
          <form action="/api/auth/logout" method="post">
            <Button variant="outline">Logout</Button>
          </form>
        </CardFooter>
      </Card>
    </main>
  );
}
