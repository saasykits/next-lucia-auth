"use client";
 
import {
  Pencil2Icon,
  CheckCircledIcon,
  UpdateIcon,
  PlayIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ResetIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEffect } from "react";

export const Tasks = () => {
  const utils = api.useUtils();
  const tasks = api.task.list.useQuery();
  const updateTask = api.task.update.useMutation({
    onMutate: async (data) => {
      await utils.task.list.cancel();
      const prevData = utils.task.list.getData();
      utils.task.list.setData(
        undefined,
        (old) => old?.map((t) => (t.id === data.id ? { ...t, ...data } : t)),
      );
      return { prevData };
    },
    onError: (e, _, ctx) => {
      utils.task.list.setData(undefined, ctx?.prevData);
      if (e instanceof Error) {
        toast("Couldn't update task", {
          icon: (
            <ExclamationTriangleIcon className="h-4 w-4 text-destructive" />
          ),
          description: e.message,
        });
      }
    },
    onSettled: () => utils.task.list.invalidate(),
  });
  const removeTask = api.task.delete.useMutation({
    onMutate: async (id) => {
      await utils.task.list.cancel();
      const prevData = utils.task.list.getData();
      utils.task.list.setData(
        undefined,
        (old) => old?.filter((t) => t.id !== id),
      );
      return { prevData };
    },
    onError: (e, _, ctx) => {
      utils.task.list.setData(undefined, ctx?.prevData);
      if (e instanceof Error) {
        toast("Couldn't remove task", {
          icon: (
            <ExclamationTriangleIcon className="h-4 w-4 text-destructive" />
          ),
          description: e.message,
        });
      }
    },
    onSettled: () => utils.task.list.invalidate(),
  });
  const todoTasks = tasks.data?.filter((t) => t.status === "todo") ?? [];
  const doingTasks = tasks.data?.filter((t) => t.status === "doing") ?? [];
  const doneTasks = tasks.data?.filter((t) => t.status === "done") ?? [];

  const [todoAnimate, enableTodoAnimations] = useAutoAnimate();
  const [doingAnimate] = useAutoAnimate();
  const [doneAnimate] = useAutoAnimate();

  useEffect(() => {
    if (tasks.isRefetching) return enableTodoAnimations(false);
    const timeout = setTimeout(() => {
      enableTodoAnimations(true);
    }, 100);
    return () => clearTimeout(timeout);
  }, [tasks.isRefetching]);

  return (
    <div className="grid gap-10 md:grid-cols-3 md:gap-6">
      <div>
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-medium">
          <Pencil2Icon className="h-6 w-6" /> Tasks To Do
        </h2>
        <div className="space-y-4" ref={todoAnimate}>
          {tasks.isLoading ? (
            <CardSkeleton />
          ) : todoTasks.length ? (
            todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                title={task.title}
                description={task.description}
              >
                <Button
                  aria-label="delete task"
                  variant="outline"
                  className="h-8 w-8"
                  size="icon"
                  onClick={() => removeTask.mutate(task.id)}
                >
                  <TrashIcon className="h-5 w-5" />
                </Button>
                <Button
                  aria-label="mark as in progress"
                  variant="outline"
                  className="h-8 w-8"
                  size="icon"
                  onClick={() =>
                    updateTask.mutate({ id: task.id, status: "doing" })
                  }
                >
                  <PlayIcon className="h-5 w-5" />
                </Button>
              </TaskCard>
            ))
          ) : (
            <p className="italic text-muted-foreground">
              No tasks to do yet. Create one!
            </p>
          )}
        </div>
      </div>
      <div>
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-medium">
          <UpdateIcon className="h-6 w-6" /> Tasks In Progress
        </h2>
        <div className="space-y-4" ref={doingAnimate}>
          {tasks.isLoading ? (
            <CardSkeleton />
          ) : doingTasks.length ? (
            doingTasks.map((task) => (
              <TaskCard
                key={task.id}
                title={task.title}
                description={task.description}
              >
                <Button
                  aria-label="reset task"
                  variant="outline"
                  className="h-8 w-8"
                  size="icon"
                  onClick={() =>
                    updateTask.mutate({ id: task.id, status: "todo" })
                  }
                >
                  <ResetIcon className="h-5 w-5" />
                </Button>
                <Button
                  aria-label="mark as done"
                  variant="outline"
                  className="h-8 w-8"
                  size="icon"
                  onClick={() =>
                    updateTask.mutate({ id: task.id, status: "done" })
                  }
                >
                  <CheckCircledIcon className="h-5 w-5" />
                </Button>
              </TaskCard>
            ))
          ) : (
            <p className="italic text-muted-foreground">No tasks in progress</p>
          )}
        </div>
      </div>
      <div>
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-medium">
          <CheckCircledIcon className="h-6 w-6" /> Tasks Completed
        </h2>
        <div className="space-y-4" ref={doneAnimate}>
          {tasks.isLoading ? (
            <CardSkeleton />
          ) : doneTasks.length ? (
            doneTasks.map((task) => (
              <TaskCard
                key={task.id}
                title={task.title}
                description={task.description}
              >
                <Button
                  aria-label="reset task"
                  variant="outline"
                  className="h-8 w-8"
                  size="icon"
                  onClick={() =>
                    updateTask.mutate({ id: task.id, status: "todo" })
                  }
                >
                  <ResetIcon className="h-5 w-5" />
                </Button>
                <Button
                  aria-label="remove task"
                  variant="outline"
                  className="h-8 w-8"
                  size="icon"
                  onClick={() => removeTask.mutate(task.id)}
                >
                  <TrashIcon className="h-5 w-5" />
                </Button>
              </TaskCard>
            ))
          ) : (
            <p className="italic text-muted-foreground">
              No completed tasks yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string | null;
  children: React.ReactNode | React.ReactNode[];
}) => {
  return (
    <div className="flex rounded-lg border bg-card p-4 text-card-foreground">
      <div className="w-full">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
};

const CardSkeleton = () => {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground">
      <div>
        <Skeleton className="mb-3 h-4" />
        <Skeleton className="mb-2 h-2.5" />
        <Skeleton className="h-2.5 w-1/2" />
      </div>
      <div className="mt-6 flex gap-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/5" />
      </div>
    </div>
  );
};
