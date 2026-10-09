import "server-only";
import { cache } from "react";
import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import { firebaseConfigured } from "@/lib/firebase/admin";
import { seedContent, seedPublicContent } from "@/cms/seeds";
import { resolveTranslation } from "@/cms/localization";
import type { Locale } from "@/i18n/config";
import type { LocalizedArticle, LocalizedService } from "@/cms/models";
import { readPublishedContent } from "./cms-repository";

const cachedContent = unstable_cache(readPublishedContent, ["cms-public-v1"], { revalidate: 300, tags: ["cms-content"] });
export const getPublicContent = cache(async () => firebaseConfigured() ? cachedContent() : seedPublicContent());
export const getPageContent = cache(async (locale: Locale) => {
  const snapshot = await getPublicContent();
  return snapshot.content[locale] ?? snapshot.content.de ?? seedContent(locale);
});
export const getPublishedArticles = cache(async (locale: Locale): Promise<LocalizedArticle[]> => {
  const { articles } = await getPublicContent();
  return articles.map(({ translations, ...article }) => {
    const resolved = resolveTranslation(translations, locale);
    return { ...article, ...resolved.value, language: resolved.language };
  }).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
});
export const getPublishedServices = cache(async (locale: Locale): Promise<LocalizedService[]> => {
  const { services } = await getPublicContent();
  return services.map(({ translations, ...service }) => {
    const resolved = resolveTranslation(translations, locale);
    return { ...service, ...resolved.value, language: resolved.language };
  }).sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
});
export function refreshPublishedContent() {
  revalidateTag("cms-content", { expire: 0 });
  revalidatePath("/[locale]", "layout");
}
