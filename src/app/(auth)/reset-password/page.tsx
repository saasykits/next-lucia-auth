import { redirect } from "next/navigation";
import { getPageSession } from "@/lib/auth/helpers";
import { ForgotPassword } from "./forgot-password";

export const metadata = {
  title: "Forgot Password",
  description: "Forgot Password Page",
};

export default async function ForgotPasswordPage() {
  const session = await getPageSession();

  if (session) redirect("/dashboard");

  return (
    <main className="p-4">
      <ForgotPassword />
    </main>
  );
}
