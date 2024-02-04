import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialOceanic } from "react-syntax-highlighter/dist/cjs/styles/prism";

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
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={options}
    >
      {text}
    </Markdown>
  );
};
