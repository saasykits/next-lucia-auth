import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { env } from "@/env";
import { validateRequest } from "@/lib/auth/validate-request";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Billing",
  description: "Manage your billing and subscription",
};

export default async function BillingPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="grid gap-8 py-10 md:py-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold md:text-4xl">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings
        </p>
      </div>
      <p>Work in progress...</p>
    </div>
  );
}
