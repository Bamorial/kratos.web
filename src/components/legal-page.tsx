import { legalDocuments, type LegalDocument } from "@/content/legal";
import type { SiteContent } from "@/content/site";
import type { Locale } from "@/i18n/config";

export function LegalPage({ document, locale, content: c }: { document: LegalDocument; locale: Locale; content: SiteContent }) {
  const blocks = legalDocuments[document];
  return <div className="container inner-page legal-page"><h1 className="page-title">{blocks[5].text}</h1>{locale !== "de" && <p className="translation-note">{c.ui.original}</p>}<div className="prose" lang="de">{blocks.slice(6).map((block, index) => block.type === "heading" ? <h2 id={document === "terms" && block.text.startsWith("2.") ? "prices" : undefined} key={index}>{block.text}</h2> : block.type === "list" ? <ul key={index}><li>{block.text}</li></ul> : <p key={index}>{block.text}</p>)}</div></div>;
}
