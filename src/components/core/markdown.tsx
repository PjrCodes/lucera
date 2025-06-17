/* eslint-disable @typescript-eslint/no-unused-vars */
import Markdown, { MarkdownProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MyMarkdownProps extends MarkdownProps {
  children: string;
  components?: Record<string, React.ComponentType<any>>;
}

export function MyMarkdown({ children, components, ...props }: MyMarkdownProps) {
  return (
    <Markdown
      components={{
        h1(props) {
          const { node, ...rest } = props;
          return <h1 className="text-2xl font-bold" {...rest} />;
        },
        h2(props) {
          const { node, ...rest } = props;
          return <h2 className="text-xl font-semibold" {...rest} />;
        },
        h3(props) {
          const { node, ...rest } = props;
          return <h3 className="text-lg font-semibold" {...rest} />;
        },
        strong(props) {
          const { node, ...rest } = props;
          return <strong className="font-semibold" {...rest} />;
        },
        em(props) {
          const { node, ...rest } = props;
          return <span className="italic" {...rest}></span>;
        },
        // ...add more overrides if needed...
        a(props) {
          const { node, ...rest } = props;
          return (
            <a
              className="text-blue-600 hover:underline"
              {...rest}
              target="_blank"
              rel="noopener noreferrer"
            />
          );
        },
        ...components,
      }}
      remarkPlugins={[remarkGfm, ...(props.remarkPlugins ?? [])]}
      rehypePlugins={[rehypeRaw]}
      {...props}
    >
      {children}
    </Markdown>
  );
}
