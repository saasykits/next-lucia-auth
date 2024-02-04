import { createTRPCRouter } from "./trpc";
import { userRouter } from "./routers/user";
import { postRouter } from "./routers/post";

export const appRouter = createTRPCRouter({
  user: userRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;
