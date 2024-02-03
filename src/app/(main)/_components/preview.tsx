import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export const Preview = ({
  children,
}: {
  children: string | null | undefined;
}) => {
  return (
    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
      {children}
    </Markdown>
  );
};
