import { protectedProcedure, createTRPCRouter } from "../trpc";

export const userRouter = createTRPCRouter({
  get: protectedProcedure.query(({ ctx }) => ctx.user),
});
