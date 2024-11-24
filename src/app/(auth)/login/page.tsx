import { validateRequest } from "@/lib/auth";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { Login } from "./login";

export const metadata = {
  title: "Login",
  description: "Login Page",
};

export default async function LoginPage() {
  const { user } = await validateRequest();

  if (user) redirect(Paths.Dashboard);

  return <Login />;
}
