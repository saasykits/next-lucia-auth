"use client";

import { FilePlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { PostCard } from "./post-card";
import { PostCardSkeleton } from "./post-card-skeleton";

interface PostsProps {
  page?: number;
  perPage?: number;
}

export function Posts({ page, perPage }: PostsProps) {
  const utils = api.useUtils();
  const postsQuery = api.post.myPosts.useQuery({ page, perPage });
  const postCreateMutation = api.post.create.useMutation({
    onMutate: async (newPost) => {
      await utils.post.myPosts.cancel();
      const prevData = utils.post.myPosts.getData();
      utils.post.myPosts.setData({ page, perPage }, (old) => [
        ...(old ?? []),
        {
          id: "optimistic-" + Math.random(),
          status: "draft",
          ...newPost,
          createdAt: new Date(),
        },
      ]);
      return { prevData };
    },
    onSettled: () => void utils.post.myPosts.invalidate(),
    onSuccess: (post) => toast.success("Post created", post),
    onError: (_err, _newPost, ctx) => {
      toast.error("Failed to create post");
      utils.post.myPosts.setData({ page, perPage }, ctx?.prevData);
    },
  });
  const postDeleteMutation = api.post.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.post.myPosts.cancel();
      const prevData = utils.post.myPosts.getData();
      utils.post.myPosts.setData({ page, perPage }, (old) =>
        (old ?? []).filter((post) => post.id !== id),
      );
      return { prevData };
    },
    onSettled: () => void utils.post.myPosts.invalidate(),
    onSuccess: () => toast.success("Post deleted"),
    onError: (_err, _input, ctx) => {
      toast.error("Failed to delete post");
      utils.post.myPosts.setData({ page, perPage }, ctx?.prevData);
    },
  });
  const createPost = () => {
    if (postCreateMutation.isLoading) {
      toast.info("Already creating a post");
      return;
    }
    postCreateMutation.mutate({
      title: "Untitled Post",
      content: "Write your content here",
      excerpt: "untitled post",
    });
  };
  const deletePost = (id: string) => {
    postDeleteMutation.mutate({ id });
  };
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Button
        onClick={createPost}
        className="flex h-full min-h-[200px] cursor-pointer items-center justify-center bg-card p-6 text-muted-foreground transition-colors hover:bg-secondary/10 dark:border-none dark:bg-secondary/30 dark:hover:bg-secondary/50"
        disabled={postCreateMutation.isLoading}
      >
        <div className="flex flex-col items-center gap-4">
          <FilePlusIcon className="h-10 w-10" />
          <p className="text-sm">New Post</p>
        </div>
      </Button>

      {postsQuery.isLoading
        ? Array.from({ length: 2 }).map((_, i) => <PostCardSkeleton key={i} />)
        : null}
      {postsQuery.data?.map((post) => <PostCard key={post.id} post={post} onDelete={deletePost} />)}
    </div>
  );
}
