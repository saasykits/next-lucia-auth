import { z } from "zod";

export const listPostsSchema = z.object({
  page: z.number().int().default(1),
  perPage: z.number().int().default(12),
});
export type ListPostsInput = z.infer<typeof listPostsSchema>;

export const getPostSchema = z.object({
  id: z.string(),
});
export type GetPostInput = z.infer<typeof getPostSchema>;

export const createPostSchema = z.object({
  title: z.string().min(3).max(255),
  excerpt: z.string().min(3).max(255),
  content: z.string().min(3),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = createPostSchema.extend({
  id: z.string(),
});
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export const deletePostSchema = z.object({
  id: z.string(),
});
export type DeletePostInput = z.infer<typeof deletePostSchema>;

export const myPostsSchema = z.object({
  page: z.number().int().default(1),
  perPage: z.number().int().default(12),
});
export type MyPostsInput = z.infer<typeof myPostsSchema>;
