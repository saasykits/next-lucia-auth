"use client";

import { FilePlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { type RouterOutputs } from "@/trpc/shared";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
interface NewPostProps {
  isEligible: boolean;
  setOptimisticPosts: (action: {
    action: "add" | "delete" | "update";
    post: RouterOutputs["post"]["myPosts"][number];
  }) => void;
}

export const NewPost = ({ isEligible, setOptimisticPosts }: NewPostProps) => {
  const router = useRouter();
  const post = api.post.create.useMutation();
  const [isCreatePending, startCreateTransaction] = React.useTransition();

  const createPost = () => {
    if (!isEligible) {
      toast.message("You've reached the limit of posts for your current plan", {
        description: "Upgrade to create more posts",
      });
      return;
    }

    startCreateTransaction(async () => {
      await post.mutateAsync(
        {
          title: "Untitled Post",
          content: "Write your content here",
          excerpt: "untitled post",
        },
        {
          onSettled: () => {
            setOptimisticPosts({
              action: "add",
              post: {
                id: crypto.randomUUID(),
                title: "Untitled Post",
                excerpt: "untitled post",
                status: "draft",
                createdAt: new Date(),
              },
            });
          },
          onSuccess: ({ id }) => {
            toast.success("Post created");
            router.refresh();
            // This is a workaround for a bug in navigation because of router.refresh()
            setTimeout(() => {
              router.push(`/editor/${id}`);
            }, 100);
          },
          onError: () => {
            toast.error("Failed to create post");
          },
        },
      );
    });
  };

  return (
    <Button
      onClick={createPost}
      className="flex h-full cursor-pointer items-center justify-center bg-card p-6 text-muted-foreground transition-colors hover:bg-secondary/10 dark:border-none dark:bg-secondary/30 dark:hover:bg-secondary/50"
      disabled={isCreatePending}
    >
      <div className="flex flex-col items-center gap-4">
        <FilePlusIcon className="h-10 w-10" />
        <p className="text-sm">New Post</p>
      </div>
    </Button>
  );
};
