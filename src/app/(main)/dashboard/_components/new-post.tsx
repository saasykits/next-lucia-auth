"use client";

import React from "react";
import { FilePlusIcon } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const NewPost = () => {
  const router = useRouter();
  const post = api.post.create.useMutation();

  const createPost = () => {
    const promise = post.mutateAsync({
      title: "Untitled Post",
      content: "Write your content here",
      excerpt: "untitled post",
    });
    toast.promise(
      promise.then(({ id }) => {
        router.push("/editor/" + id);
      }),
      {
        loading: "Creating post...",
        success: "Post created",
        error: "Failed to create post",
      },
    );
  };

  return (
    <Card
      onClick={createPost}
      className="flex cursor-pointer items-center justify-center bg-card p-6 text-muted-foreground transition-colors hover:bg-secondary/10 dark:border-none dark:bg-secondary/30 dark:hover:bg-secondary/50"
    >
      <div className="flex flex-col items-center gap-4">
        <FilePlusIcon className="h-10 w-10" />
        <p className="text-sm">New Post</p>
      </div>
    </Card>
  );
};
