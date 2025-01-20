import { env } from "@/env";
import { validateRequest } from "@/lib/auth";
import { Paths } from "@/lib/constants";
import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Posts } from "./_components/posts";
import { PostsSkeleton } from "./_components/posts-skeleton";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Posts",
  description: "Manage your posts here",
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardPage(props: Props) {
  const { page, perPage } = await props.searchParams;
  const { user } = await validateRequest();
  if (!user) redirect(Paths.Login);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Posts</h1>
        <p className="text-sm text-muted-foreground">Manage your posts here</p>
      </div>
      <Suspense fallback={<PostsSkeleton />}>
        <Posts
          page={page ? parseInt(page as string) : 1}
          perPage={perPage ? parseInt(perPage as string) : 10}
        />
      </Suspense>
    </div>
  );
}
