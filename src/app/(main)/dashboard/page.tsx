import { Button } from "@/components/ui/button";
import { Pencil2Icon, TrashIcon } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewPost } from "./_components/new-post";
import { api } from "@/trpc/server";
import { PostCard } from "./_components/post-card";
import { z } from "zod";
import { type Metadata } from "next";
import { env } from "@/env";
import { revalidatePath } from "next/cache";

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
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Posts</h1>
        <p className="text-sm text-muted-foreground">Manage your posts here</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NewPost isEligible={subscriptionPlan.isPro || posts.length < 3} />
        {posts.map((post) => (
          <PostCard
            key={post.id}
            postId={post.id}
            title={post.title}
            status={post.status}
            createdAt={post.createdAt.toJSON()}
            excerpt={post.excerpt}
          />
        ))}
      </div>
    </div>
  );
}
