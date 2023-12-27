import { redirect } from "next/navigation";
import { getPageSession } from "@/lib/auth/helpers";
import { Login } from "./login";

export const metadata = {
  title: "Login",
  description: "Login Page",
};

export default async function LoginPage() {
  const session = await getPageSession();

  if (session) redirect("/");
  return (
    <main className="p-4">
      <Login />
    </main>
  );
}
