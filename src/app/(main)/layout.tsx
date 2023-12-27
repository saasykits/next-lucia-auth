import { type ReactNode } from "react";
import { redirect } from "next/navigation";

import { getPageSession } from "@/lib/auth/helpers";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_TITLE } from "@/lib/constants";

const MainLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getPageSession();

  if (!session) redirect("/login");

  return (
    <>
      <div className="flex items-center justify-between border-b bg-card px-4 py-3 text-card-foreground shadow-sm md:mb-12">
        <h2 className="text-xl font-bold">{APP_TITLE}</h2>
        <ThemeToggle />
      </div>
      {children}
    </>
  );
};

export default MainLayout;
