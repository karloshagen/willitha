import Link from "next/link";
import { isHttpUrl } from "@/lib/text";

function safeHref(href: string): string | null {
  const value = href.trim();
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  if (isHttpUrl(value)) return value;
  return null;
}

function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(\[[^\]\n]+\]\([^)\n]+\))/g;
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(pattern)) {
    const token = match[0];
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    const key = `n${index}`;
    index += 1;
    if (token.startsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      const href = link ? safeHref(link[2]) : null;
      if (link && href?.startsWith("/")) {
        nodes.push(
          <Link key={key} href={href}>
            {link[1]}
          </Link>,
        );
      } else if (link && href) {
        nodes.push(
          <a key={key} href={href} rel="noreferrer">
            {link[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    }
    last = start + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

type Block =
  | { kind: "h2" | "h3"; text: string }
  | { kind: "p" | "quote"; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "code"; text: string };

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let quote: string[] = [];
  let list: { kind: "ul" | "ol"; items: string[] } | null = null;
  let code: string[] | null = null;

  function flushParagraph() {
    if (paragraph.length === 0) return;
    blocks.push({ kind: "p", text: paragraph.join(" ") });
    paragraph = [];
  }
  function flushQuote() {
    if (quote.length === 0) return;
    blocks.push({ kind: "quote", text: quote.join(" ") });
    quote = [];
  }
  function flushList() {
    if (!list) return;
    blocks.push(list);
    list = null;
  }
  function flushText() {
    flushParagraph();
    flushQuote();
    flushList();
  }

  for (const line of lines) {
    if (code) {
      if (line.trim().startsWith("```")) {
        blocks.push({ kind: "code", text: code.join("\n") });
        code = null;
      } else {
        code.push(line);
      }
      continue;
    }
    if (line.trim().startsWith("```")) {
      flushText();
      code = [];
      continue;
    }
    if (!line.trim()) {
      flushText();
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      flushText();
      blocks.push({ kind: heading[1].length >= 3 ? "h3" : "h2", text: heading[2] });
      continue;
    }
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    if (bullet) {
      flushParagraph();
      flushQuote();
      if (!list || list.kind !== "ul") {
        flushList();
        list = { kind: "ul", items: [] };
      }
      list.items.push(bullet[1]);
      continue;
    }
    const numbered = /^\d+\.\s+(.+)$/.exec(line);
    if (numbered) {
      flushParagraph();
      flushQuote();
      if (!list || list.kind !== "ol") {
        flushList();
        list = { kind: "ol", items: [] };
      }
      list.items.push(numbered[1]);
      continue;
    }
    if (line.startsWith(">")) {
      flushParagraph();
      flushList();
      quote.push(line.replace(/^>\s?/, ""));
      continue;
    }
    flushQuote();
    flushList();
    paragraph.push(line.trim());
  }
  if (code) blocks.push({ kind: "code", text: code.join("\n") });
  flushText();
  return blocks;
}

export function Markdown({ source }: { source: string }) {
  const blocks = parseBlocks(source);
  return (
    <div className="review-body">
      {blocks.map((block, index) => {
        const key = `b${index}`;
        if (block.kind === "h2") return <h2 key={key}>{parseInline(block.text)}</h2>;
        if (block.kind === "h3") return <h3 key={key}>{parseInline(block.text)}</h3>;
        if (block.kind === "quote") return <blockquote key={key}>{parseInline(block.text)}</blockquote>;
        if (block.kind === "code") {
          return (
            <pre key={key}>
              <code>{block.text}</code>
            </pre>
          );
        }
        if (block.kind === "ul" || block.kind === "ol") {
          const Tag = block.kind;
          return (
            <Tag key={key}>
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}>{parseInline(item)}</li>
              ))}
            </Tag>
          );
        }
        if (block.kind === "p") return <p key={key}>{parseInline(block.text)}</p>;
        return null;
      })}
    </div>
  );
}
