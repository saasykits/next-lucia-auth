"use client";
 
import { LoadingButton } from "@/components/loading-button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ExclamationTriangleIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import type { Dispatch, SetStateAction } from "react";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  title: z.string().min(1, { message: "Task title is required" }).max(255),
  description: z.string().max(255),
});

export const NewTaskDialog = () => {
  return (
    <ResponsiveDialog
      trigger={
        <Button>
          <PlusIcon className="mr-1 h-5 w-5" /> New Task
        </Button>
      }
      title="New Task"
      description="Create a new task"
    >
      {({ setOpen }) => <CreateTask onChange={setOpen} />}
    </ResponsiveDialog>
  );
};

function CreateTask({
  onChange,
}: {
  onChange: Dispatch<SetStateAction<boolean>>;
}) {
  const utils = api.useUtils();
  const form = useForm<{ title: string; description: string }>({
    defaultValues: { title: "", description: "" },
    resolver: zodResolver(schema),
  });

  const newTask = api.task.create.useMutation({
    onMutate: async (data) => {
      await utils.task.list.cancel();
      const prevData = utils.task.list.getData();
      utils.task.list.setData(undefined, (old) => [
        {
          id: new Date().getTime().toString(),
          title: data.title,
          description: data.description ?? null,
          status: "todo",
          createdAt: new Date(),
          updatedAt: null,
        },
        ...(old ?? []),
      ]);
      onChange(false);
      return { prevData };
    },
    onError: (e, _, ctx) => {
      utils.task.list.setData(undefined, ctx?.prevData);
      if (e instanceof Error) {
        toast("Couldn't create task", {
          icon: (
            <ExclamationTriangleIcon className="h-4 w-4 text-destructive" />
          ),
          description: e.message,
        });
      }
    },
    onSettled: () => {
      void utils.task.list.invalidate();
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => newTask.mutate(data))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="e.g. go to supermarket"
                  {...field}
                />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Buy some coffee." {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton className="w-full sm:w-auto" loading={newTask.isLoading}>
          Create Task
        </LoadingButton>
      </form>
    </Form>
  );
}
