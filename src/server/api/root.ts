import { createTRPCRouter } from "./trpc";
import { userRouter } from "./routers/user";
import { taskRouter } from "./routers/task";

export const appRouter = createTRPCRouter({
  user: userRouter,
  task: taskRouter,
});

export type AppRouter = typeof appRouter;
