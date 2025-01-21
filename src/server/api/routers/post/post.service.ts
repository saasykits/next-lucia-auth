import { posts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { ProtectedTRPCContext } from "../../trpc";
import type {
  CreatePostInput,
  DeletePostInput,
  GetPostInput,
  ListPostsInput,
  MyPostsInput,
  UpdatePostInput,
} from "./post.input";

export const listPosts = async (ctx: ProtectedTRPCContext, input: ListPostsInput) => {
  return ctx.db.query.posts.findMany({
    where: (table, { eq }) => eq(table.status, "published"),
    offset: (input.page - 1) * input.perPage,
    limit: input.perPage,
    orderBy: (table, { desc }) => desc(table.createdAt),
    columns: { content: false },
    with: { user: { columns: { email: true } } },
  });
};

export const getPost = async (ctx: ProtectedTRPCContext, { id }: GetPostInput) => {
  return ctx.db.query.posts.findFirst({
    where: (table, { eq }) => eq(table.id, id),
    with: { user: { columns: { email: true } } },
  });
};

export const createPost = async (ctx: ProtectedTRPCContext, input: CreatePostInput) => {
  const data = { id: nanoid(15), userId: ctx.user.id, ...input };
  const userPosts = await ctx.db.query.posts.findMany({
    where: (table, { eq }) => eq(table.userId, ctx.user.id),
    columns: { id: true },
  });
  if (userPosts.length >= 5) {
    throw new Error("You can't have more than 5 posts");
  }
  await ctx.db.insert(posts).values(data);
  return data;
};

export const updatePost = async (ctx: ProtectedTRPCContext, { id, ...input }: UpdatePostInput) => {
  const [item] = await ctx.db.update(posts).set(input).where(eq(posts.id, id)).returning();
  return item;
};

export const deletePost = async (ctx: ProtectedTRPCContext, { id }: DeletePostInput) => {
  const [item] = await ctx.db.delete(posts).where(eq(posts.id, id)).returning();
  return item;
};

export const myPosts = async (ctx: ProtectedTRPCContext, input: MyPostsInput) => {
  return ctx.db.query.posts.findMany({
    where: (table, { eq }) => eq(table.userId, ctx.user.id),
    offset: (input.page - 1) * input.perPage,
    limit: input.perPage,
    orderBy: (table, { desc }) => desc(table.createdAt),
    columns: { id: true, title: true, status: true, excerpt: true, createdAt: true },
  });
};
