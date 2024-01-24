import { ResetPassword } from "./reset-password";

export const metadata = {
  title: "Reset Password",
  description: "Reset Password Page",
};

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  return (
    <main className="p-4">
      <ResetPassword token={params.token} />
    </main>
  );
}
