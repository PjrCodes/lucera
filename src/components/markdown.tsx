/* eslint-disable @typescript-eslint/no-unused-vars */
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MyMarkdown(props: React.ComponentProps<typeof Markdown>) {
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
        ...props.components,
      }}
      remarkPlugins={[remarkGfm, ...(props.remarkPlugins ?? [])]}
      {...props}
    />
  );
}