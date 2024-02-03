import React from "react";
import { FilePlusIcon } from "@/components/icons";
import { Card } from "@/components/ui/card";

export const NewPost = () => {
  return (
    <Card className="flex cursor-pointer items-center justify-center border-none bg-secondary/30 p-6 text-muted-foreground transition-colors hover:bg-secondary/50">
      <div className="flex flex-col items-center gap-4">
        <FilePlusIcon className="h-10 w-10" />
        <p className="text-sm">New Post</p>
      </div>
    </Card>
  );
};
