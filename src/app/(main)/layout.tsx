import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";
import { validateRequest } from "@/lib/auth/validate-request";
import { redirects } from "@/lib/constants";

const MainLayout = async ({ children }: { children: ReactNode }) => {
  const { user } = await validateRequest();

  if (!user) redirect(redirects.toLogin);
  if (user.emailVerified === false) redirect(redirects.toVerify);

  return (
    <>
      <Header user={user} />
      {children}
      <Footer />
    </>
  );
};

export default MainLayout;
