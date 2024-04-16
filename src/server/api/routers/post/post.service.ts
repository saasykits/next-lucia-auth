import { generateId } from "lucia";
import type { ProtectedTRPCContext } from "../../trpc";
import type {
  CreatePostInput,
  DeletePostInput,
  GetPostInput,
  ListPostsInput,
  MyPostsInput,
  UpdatePostInput,
} from "./post.input";
import { posts } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const listPosts = async (ctx: ProtectedTRPCContext, input: ListPostsInput) => {
  return ctx.db.query.posts.findMany({
    where: (table, { eq }) => eq(table.status, "published"),
    offset: (input.page - 1) * input.perPage,
    limit: input.perPage,
    orderBy: (table, { desc }) => desc(table.createdAt),
    columns: {
      id: true,
      title: true,
      excerpt: true,
      status: true,
      createdAt: true,
    },
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
  const id = generateId(15);

  await ctx.db.insert(posts).values({
    id,
    userId: ctx.user.id,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
  });

  return { id };
};

export const updatePost = async (ctx: ProtectedTRPCContext, input: UpdatePostInput) => {
  const [item] = await ctx.db
    .update(posts)
    .set({
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
    })
    .where(eq(posts.id, input.id))
    .returning();

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
    columns: {
      id: true,
      title: true,
      excerpt: true,
      status: true,
      createdAt: true,
    },
  });
};
