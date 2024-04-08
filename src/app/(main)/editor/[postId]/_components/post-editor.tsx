"use client";
import { useRef } from "react";
import { type RouterOutputs } from "@/trpc/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PostPreview } from "./post-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { Pencil2Icon } from "@/components/icons";
import { LoadingButton } from "@/components/loading-button";
import Link from "next/link";
import { createPostSchema } from "@/server/api/routers/post/post.input";

const markdownlink = "https://remarkjs.github.io/react-markdown/";

interface Props {
  post: RouterOutputs["post"]["get"];
}

export const PostEditor = ({ post }: Props) => {
  if (!post) return null;
  const formRef = useRef<HTMLFormElement>(null);
  const updatePost = api.post.update.useMutation();
  const form = useForm({
    defaultValues: {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
    },
    resolver: zodResolver(createPostSchema),
  });
  const onSubmit = form.handleSubmit(async (values) => {
    updatePost.mutate({ id: post.id, ...values });
  });

  return (
    <>
      <div className="flex items-center gap-2">
        <Pencil2Icon className="h-5 w-5" />
        <h1 className="text-2xl font-bold">{post.title}</h1>

        <LoadingButton
          disabled={!form.formState.isDirty}
          loading={updatePost.isLoading}
          onClick={() => formRef.current?.requestSubmit()}
          className="ml-auto"
        >
          Save
        </LoadingButton>
      </div>
      <div className="h-6"></div>
      <Form {...form}>
        <form ref={formRef} onSubmit={onSubmit} className="block max-w-screen-md space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Post Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} className="min-h-0" />
                </FormControl>
                <FormDescription>A short description of your post</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <Tabs defaultValue="code">
                <TabsList>
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="code">
                  <FormItem>
                    <FormControl>
                      <Textarea {...field} className="min-h-[200px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </TabsContent>
                <TabsContent value="preview" className="space-y-2">
                  <div className="prose prose-sm min-h-[200px] max-w-[none] rounded-lg border px-3 py-2 dark:prose-invert">
                    <PostPreview text={form.watch("content") || post.content} />
                  </div>
                </TabsContent>
                <Link href={markdownlink}>
                  <span className="text-[0.8rem] text-muted-foreground underline underline-offset-4">
                    Supports markdown
                  </span>
                </Link>
              </Tabs>
            )}
          />
        </form>
      </Form>
    </>
  );
};
