import { type ReactNode } from "react";
import { redirect } from "next/navigation";

import { getPageSession } from "@/lib/auth/helpers";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_TITLE } from "@/lib/constants";
import Header from "./header";

const MainLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getPageSession();

  if (!session) redirect("/login");

  return (
    <>
      <Header user={session.user}></Header>
      {children}
    </>
  );
};

export default MainLayout;
