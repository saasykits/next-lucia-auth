import { Button } from "@/components/ui/button";
import { Pencil2Icon, TrashIcon } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewPost } from "./_components/new-post";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Posts</h1>
        <p className="text-sm text-muted-foreground">Manage your posts here</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NewPost />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Post 1</CardTitle>
            <CardDescription className="text-sm">
              <span>Published on 12th May 2021</span>
              <span>by John Doe</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm">asdasd asd asd</CardContent>
          <CardFooter className="gap-2">
            <Button variant="secondary" size="sm">
              <Pencil2Icon className="mr-1 h-4 w-4" />
              <span>Edit</span>
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 text-destructive"
            >
              <TrashIcon className="h-5 w-5" />
              <span className="sr-only">Delete</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
