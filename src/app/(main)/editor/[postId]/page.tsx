import React from "react";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import { PostEditor } from "./_components/post-editor";
import { ArrowLeftIcon } from "@/components/icons";
import Link from "next/link";

interface Props {
  params: {
    postId: string;
  };
}

export default async function EditPostPage({ params }: Props) {
  const post = await api.post.get.query(params.postId);

  if (!post) notFound();

  return (
    <main className="container min-h-[calc(100vh-160px)] pt-3 md:max-w-screen-md">
      <Link
        href="/dashboard"
        className="mb-3 flex items-center gap-2 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeftIcon className="h-5 w-5" /> back to dashboard
      </Link>

      <PostEditor post={post} />
    </main>
  );
}
