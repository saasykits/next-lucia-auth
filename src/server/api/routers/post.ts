import { posts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().default(1),
        perPage: z.number().int().default(12),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.db.query.posts.findMany({
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
      }),
    ),
  get: protectedProcedure.input(z.string()).query(({ ctx, input }) =>
    ctx.db.query.posts.findFirst({
      where: (table, { eq }) => eq(table.id, input),
      with: { user: { columns: { email: true } } },
    }),
  ),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(255),
        excerpt: z.string().min(3).max(255),
        content: z.string().min(3),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = generateId(15);

      await ctx.db.insert(posts).values({
        id,
        userId: ctx.user.id,
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
      });

      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3).max(255),
        excerpt: z.string().min(3).max(255),
        content: z.string().min(3),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(posts)
        .set({
          title: input.title,
          excerpt: input.excerpt,
          content: input.content,
        })
        .where(eq(posts.id, input.id));
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(posts).where(eq(posts.id, input.id));
    }),

  myPosts: protectedProcedure
    .input(
      z.object({
        page: z.number().int().default(1),
        perPage: z.number().int().default(12),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.db.query.posts.findMany({
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
      }),
    ),
});
