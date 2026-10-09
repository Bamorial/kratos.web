import type { TextBlock } from "@/cms/models";

// Text is rendered as React children, never as raw HTML from the CMS.
export function TextBlocks({ blocks, pricesAnchor = false }: { blocks: TextBlock[]; pricesAnchor?: boolean }) {
  return blocks.map((block, index) => block.type === "heading"
    ? <h2 key={index} id={pricesAnchor && block.text.startsWith("2.") ? "prices" : undefined}>{block.text}</h2>
    : block.type === "list" ? <ul key={index}><li>{block.text}</li></ul> : <p key={index} style={{ whiteSpace: "pre-line" }}>{block.text}</p>);
}
