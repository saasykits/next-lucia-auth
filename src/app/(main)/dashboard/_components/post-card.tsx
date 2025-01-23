import { Pencil2Icon, TrashIcon } from "@/components/icons";
import { LinkButton } from "@/components/link-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type RouterOutputs } from "@/trpc/shared";

interface PostCardProps {
  post: RouterOutputs["post"]["myPosts"][number];
  onDelete: (id: string) => void;
}

export const PostCard = ({ post, onDelete }: PostCardProps) => {
  const isOptimistic = post.id.startsWith("optimistic-");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-2 text-base">{post.title}</CardTitle>
        <CardDescription className="line-clamp-1 text-sm">
          {new Date(post.createdAt.toJSON()).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="line-clamp-3 text-sm">{post.excerpt}</CardContent>
      <CardFooter className="flex-row-reverse gap-2">
        <LinkButton
          size="sm"
          variant="secondary"
          disabled={isOptimistic}
          href={`/editor/${post.id}`}
        >
          <Pencil2Icon className="mr-1 h-4 w-4" />
          <span>Edit</span>
        </LinkButton>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => onDelete(post.id)}
          disabled={isOptimistic}
        >
          <TrashIcon className="h-5 w-5" />
          <span className="sr-only">Delete</span>
        </Button>
        <Badge variant="outline" className="mr-auto rounded-lg capitalize">
          {post.status} Post
        </Badge>
      </CardFooter>
    </Card>
  );
};
