import { redirect } from "next/navigation";
import { getPageSession } from "@/lib/auth/helpers";
import { Register } from "./register";

export const metadata = {
  title: "Sign Up",
  description: "Signup Page",
};

export default async function RegisterPage() {
  const session = await getPageSession();

  if (session) redirect("/");

  return (
    <main className="p-4">
      <Register />
    </main>
  );
}
