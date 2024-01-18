import { type ReactNode } from "react";
import { redirect } from "next/navigation";

import { getPageSession } from "@/lib/auth/helpers";
import Header from "./header";
import { Footer } from "./footer";

const MainLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getPageSession();

  if (!session) redirect("/login");

  return (
    <>
      <Header user={session.user} />
      {children}
      <Footer />
    </>
  );
};

export default MainLayout;
