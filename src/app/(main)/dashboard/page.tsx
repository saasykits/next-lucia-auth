import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { env } from "@/env";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { api } from "@/trpc/server";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Posts",
  description: "Manage your posts here",
};

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  const promises = Promise.all([api.stripe.getPlan.query()]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Posts</h1>
        <p className="text-sm text-muted-foreground">Manage your posts here</p>
      </div>
      <h1>Path to greatness</h1>
    </div>
  );
}
