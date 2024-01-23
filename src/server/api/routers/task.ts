import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { tasks } from "@/server/db/schema";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { generateId } from "lucia";

export const taskRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.query.tasks.findMany({
      where: and(eq(tasks.userId, ctx.user.id), eq(tasks.archived, false)),
      orderBy: desc(tasks.createdAt),
      columns: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return data;
  }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().trim().length(15),
        status: z.enum(["todo", "doing", "done"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(tasks)
        .set({ status: input.status })
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)));
      return { id: input.id };
    }),
  archivedList: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.tasks.findMany({
      where: and(eq(tasks.userId, ctx.user.id), eq(tasks.archived, true)),
      orderBy: desc(tasks.createdAt),
    }),
  ),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().trim().min(1).max(255),
        description: z.string().trim().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = generateId(15);

      await ctx.db.insert(tasks).values({
        id,
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
      });
      return { id };
    }),
  delete: protectedProcedure
    .input(z.string().trim().length(15))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(tasks)
        .where(and(eq(tasks.id, input), eq(tasks.userId, ctx.user.id)));
      return { id: input };
    }),
});
