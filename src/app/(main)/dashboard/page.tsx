import { env } from "@/env";
import { api } from "@/trpc/server";
import { type Metadata } from "next";
import { z } from "zod";
import { Posts } from "./_components/posts";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Posts",
  description: "Manage your posts here",
};

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

const schmea = z.object({
  page: z.coerce.number().default(1).optional(),
  perPage: z.coerce.number().default(12).optional(),
});

export default async function DashboardPage({ searchParams }: Props) {
  const { page } = schmea.parse(searchParams);

  const [posts, subscriptionPlan] = await Promise.all([
    api.post.myPosts.query({ page }),
    api.stripe.getSubscriptionPlan.query(),
  ]);

  return (
    <div className="py-10 md:py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Posts</h1>
        <p className="text-sm text-muted-foreground">Manage your posts here</p>
      </div>
      <Posts posts={posts} subscriptionPlan={subscriptionPlan} />
    </div>
  );
}
