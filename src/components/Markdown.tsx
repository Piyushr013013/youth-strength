import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Coach replies: clean typography, no runaway asterisks or giant headings. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="text-foreground">{children}</p>,
          strong: ({ children }) => <span className="font-semibold text-foreground">{children}</span>,
          em: ({ children }) => <span className="italic">{children}</span>,
          ul: ({ children }) => <ul className="ml-4 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="ml-4 list-decimal space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-foreground">{children}</li>,
          h1: ({ children }) => (
            <p className="font-display text-base font-bold uppercase tracking-wide">{children}</p>
          ),
          h2: ({ children }) => (
            <p className="font-display text-sm font-bold uppercase tracking-wide">{children}</p>
          ),
          h3: ({ children }) => <p className="text-sm font-semibold">{children}</p>,
          a: ({ children, href }) => (
            <a href={href} className="text-cyan underline" target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[13px]">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-xl bg-surface-2 p-3 text-[13px]">{children}</pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border py-1 pr-3 font-semibold">{children}</th>
          ),
          td: ({ children }) => <td className="py-1 pr-3">{children}</td>,
          hr: () => <hr className="border-border" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
