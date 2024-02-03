import React from "react";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";

const Editor = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, ref) => {
    return <Textarea ref={ref} {...props} />;
  },
);

Editor.displayName = "Editor";

export { Editor };
