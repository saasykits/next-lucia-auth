import React from "react";
import Markdown, { type Components } from "react-markdown";
import { Prism } from "react-syntax-highlighter";
import { materialOceanic } from "react-syntax-highlighter/dist/cjs/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SyntaxHighlighter = Prism as unknown as React.FC<any>;

const options: Components = {
  code: (props) => (
    <SyntaxHighlighter
      language={props.className?.replace(/(?:lang(?:uage)?-)/, "")}
      style={materialOceanic}
      wrapLines={true}
      className="not-prose rounded-md"
    >
      {String(props.children)}
    </SyntaxHighlighter>
  ),
};

export const PostPreview = ({ text }: { text: string }) => {
  return (
    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={options}>
      {text}
    </Markdown>
  );
};
