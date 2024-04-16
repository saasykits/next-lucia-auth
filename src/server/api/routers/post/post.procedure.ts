import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as inputs from "./post.input";
import * as services from "./post.service";

export const postRouter = createTRPCRouter({
  list: protectedProcedure
    .input(inputs.listPostsSchema)
    .query(({ ctx, input }) => services.listPosts(ctx, input)),

  get: protectedProcedure
    .input(inputs.getPostSchema)
    .query(({ ctx, input }) => services.getPost(ctx, input)),

  create: protectedProcedure
    .input(inputs.createPostSchema)
    .mutation(({ ctx, input }) => services.createPost(ctx, input)),

  update: protectedProcedure
    .input(inputs.updatePostSchema)
    .mutation(({ ctx, input }) => services.updatePost(ctx, input)),

  delete: protectedProcedure
    .input(inputs.deletePostSchema)
    .mutation(async ({ ctx, input }) => services.deletePost(ctx, input)),

  myPosts: protectedProcedure
    .input(inputs.myPostsSchema)
    .query(({ ctx, input }) => services.myPosts(ctx, input)),
});
