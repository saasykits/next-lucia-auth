import { ratelimit } from "@/lib/ratelimit";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { TRPCError } from "@trpc/server";
export const userRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const {success} = await ratelimit.limit(ctx.user.id)
    if(!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" }); 
    return ctx.user

  }),
});