"use client";
import { z } from "zod";
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
import { useEffect } from "react";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface Props {
  post: RouterOutputs["post"]["get"];
}

const schema = z.object({
  title: z.string().min(3).max(255),
  excerpt: z.string().min(3).max(255),
  content: z
    .string()
    .min(3)
    .max(2048 * 2),
});

export const PostEditor = ({ post }: Props) => {
  if (!post) return null;

  const updatePost = api.post.update.useMutation();

  const form = useForm({
    defaultValues: {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
    },
    resolver: zodResolver(schema),
  });
  const { title, excerpt, content } = useDebounce(form.watch(), 1000);

  useEffect(() => {
    if (title && excerpt && content) {
      updatePost.mutate({ id: post.id, title, excerpt, content });
    }
  }, [title, excerpt, content]);

  return (
    <div>
      <Form {...form}>
        <form className="block max-w-screen-md space-y-4">
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
                <FormDescription>
                  A short description of your post
                </FormDescription>
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
                    <FormDescription>Supports markdown</FormDescription>
                    <FormMessage />
                  </FormItem>
                </TabsContent>
                <TabsContent value="preview" className="space-y-2">
                  <div className="prose prose-sm dark:prose-invert min-h-[200px] max-w-[none] rounded-lg border px-3 py-2">
                    <PostPreview text={form.watch("content") || post.content} />
                  </div>
                  <p className="text-[0.8rem] text-muted-foreground">
                    Supports markdown
                  </p>
                </TabsContent>
              </Tabs>
            )}
          />
        </form>
      </Form>
      {/* <div>
        <p className="mb-2">Post Preview</p>
        <div className="rounded-lg border p-6">
          <p className="mb-2 text-sm text-muted-foreground">
            by {post.user.email} at{" "}
            {post.createdAt.toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <h2 className="mb-2 text-4xl font-bold">{post.title}</h2>
          <p className="mb-6 italic text-muted-foreground">{post.excerpt}</p>
          <div className="prose dark:prose-invert">
            <PostPreview text={form.watch("content") || post.content} />
          </div>
        </div>
      </div> */}
    </div>
  );
};
