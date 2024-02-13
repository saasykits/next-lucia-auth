"use client";

import { type RouterOutputs } from "@/trpc/shared";
import * as React from "react";
import { NewPost } from "./new-post";
import { PostCard } from "./post-card";

interface PostsProps {
  promises: Promise<
    [RouterOutputs["post"]["myPosts"], RouterOutputs["stripe"]["getPlan"]]
  >;
}

export function Posts({ promises }: PostsProps) {
  /**
   * use is a React Hook that lets you read the value of a resource like a Promise or context.
   * @see https://react.dev/reference/react/use
   */
  const [posts, subscriptionPlan] = React.use(promises);

  /**
   * useOptimistic is a React Hook that lets you show a different state while an async action is underway.
   * It accepts some state as an argument and returns a copy of that state that can be different during the duration of an async action such as a network request.
   * @see https://react.dev/reference/react/useOptimistic
   */
  const [optimisticPosts, setOptimisticPosts] = React.useOptimistic(
    posts,
    (
      state,
      {
        action,
        post,
      }: {
        action: "add" | "delete" | "update";
        post: RouterOutputs["post"]["myPosts"][number];
      },
    ) => {
      switch (action) {
        case "delete":
          return state.filter((p) => p.id !== post.id);
        case "update":
          return state.map((p) => (p.id === post.id ? post : p));
        default:
          return [...state, post];
      }
    },
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <NewPost
        isEligible={
          (optimisticPosts.length < 3 || subscriptionPlan?.isPro) ?? false
        }
        setOptimisticPosts={setOptimisticPosts}
      />
      {optimisticPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          setOptimisticPosts={setOptimisticPosts}
        />
      ))}
    </div>
  );
}
