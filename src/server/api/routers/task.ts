import crypto from "crypto";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { tasks } from "@/server/db/schema";
import { protectedProcedure, createTRPCRouter } from "../trpc";

export const taskRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.query.tasks.findMany({
      where: and(
        eq(tasks.userId, ctx.session.user.userId),
        eq(tasks.archived, false),
      ),
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
  archivedList: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.tasks.findMany({
      where: and(
        eq(tasks.userId, ctx.session.user.userId),
        eq(tasks.archived, true),
      ),
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
      const id = generateRandomString();

      await ctx.db.insert(tasks).values({
        id,
        userId: ctx.session.user.userId,
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
        .where(
          and(eq(tasks.id, input), eq(tasks.userId, ctx.session.user.userId)),
        );
      return { id: input };
    }),
});

function generateRandomString(length = 15) {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomBytes = crypto.randomBytes(length);
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i]! % characters.length;
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}
