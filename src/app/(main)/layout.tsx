import { type ReactNode } from "react";
import { redirect } from "next/navigation";
 
import Header from "./header";
import { Footer } from "./footer";
import { validateRequest } from "@/lib/auth/validate-request";

const MainLayout = async ({ children }: { children: ReactNode }) => {
  const { user } = await validateRequest();

  if (!user) redirect("/login");

  return (
    <>
      <Header user={user} />
      {children}
      <div className="h-20"></div>
      <Footer />
    </>
  );
};

export default MainLayout;
