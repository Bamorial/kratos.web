import type { LegalDocument } from "@/content/legal";
import type { SiteContent } from "@/content/site";
import type { Locale } from "@/i18n/config";
import { getPageContent } from "@/server/public-content";
import { TextBlocks } from "./text-blocks";

export async function LegalPage({ document, locale, content: c }: { document: LegalDocument; locale: Locale; content: SiteContent }) {
  const { legal } = await getPageContent(locale);
  const entry = legal[document];
  return <div className="container inner-page legal-page"><h1 className="page-title">{entry.title}</h1>{entry.language !== locale && <p className="translation-note">{c.ui.original}</p>}<div className="prose" lang={entry.language}><TextBlocks blocks={entry.blocks} pricesAnchor={document === "terms"} /></div></div>;
}
