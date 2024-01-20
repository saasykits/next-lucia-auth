"use client";

import { useMemo } from "react";
import { Pencil2Icon, CheckCircledIcon, UpdateIcon } from "@/components/icons";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export const Tasks = () => {
  const tasks = api.task.list.useQuery();

  const todoTasks = tasks.data?.filter((t) => t.status === "todo") ?? [];
  const doingTasks = tasks.data?.filter((t) => t.status === "doing") ?? [];
  const doneTasks = tasks.data?.filter((t) => t.status === "done") ?? [];

  console.log(tasks.isLoading);

  return (
    <>
      <div>
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-medium">
          <Pencil2Icon className="h-6 w-6" /> Tasks To Do
        </h2>
        {tasks.isLoading ? (
          <CardSkeleton />
        ) : todoTasks.length ? (
          todoTasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <CardTitle>{task.title}</CardTitle>
                <CardDescription>{task.description}</CardDescription>
              </CardHeader>
              <CardFooter className="gap-4">
                <button className="btn btn-primary">Start</button>
                <button className="btn btn-primary">Delete</button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="italic text-muted-foreground">
            No tasks to do yet. Create one!
          </p>
        )}
      </div>
      <div>
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-medium">
          <UpdateIcon className="h-6 w-6" /> Tasks In Progress
        </h2>
        {tasks.isLoading ? (
          <CardSkeleton />
        ) : doingTasks.length ? (
          doingTasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <CardTitle>{task.title}</CardTitle>
                <CardDescription>{task.description}</CardDescription>
              </CardHeader>
              <CardFooter className="gap-4">
                <button className="btn btn-primary">Start</button>
                <button className="btn btn-primary">Delete</button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="italic text-muted-foreground">No tasks in progress</p>
        )}
      </div>
      <div>
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-medium">
          <CheckCircledIcon className="h-6 w-6" /> Tasks Completed
        </h2>
        {tasks.isLoading ? (
          <CardSkeleton />
        ) : doneTasks.length ? (
          doneTasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <CardTitle>{task.title}</CardTitle>
                <CardDescription>{task.description}</CardDescription>
              </CardHeader>
              <CardFooter className="gap-4">
                <button className="btn btn-primary">Start</button>
                <button className="btn btn-primary">Delete</button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="italic text-muted-foreground">No completed tasks yet</p>
        )}
      </div>
    </>
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
