import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_TITLE } from "@/lib/constants";
import type { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <div className="flex items-center justify-between border-b bg-card px-4 py-3 text-card-foreground shadow-sm md:mb-12">
        <Link href="/" className="text-xl font-bold">
          {APP_TITLE}
        </Link>
        <ThemeToggle />
      </div>
      {children}
    </>
  );
};

export default AuthLayout;
