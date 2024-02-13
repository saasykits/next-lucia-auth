import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PostCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3 w-36" />
      </CardHeader>
      <CardContent className="line-clamp-3 text-sm">
        <Skeleton className="h-5 w-24" />
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <Skeleton className="h-6 w-16" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-12" />
        </div>
      </CardFooter>
    </Card>
  );
}
