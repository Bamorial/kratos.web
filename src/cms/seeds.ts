import { getAboutContent } from "@/content/about";
import { getBlogContent, getFeaturedArticleBody } from "@/content/blog";
import { legalDocuments } from "@/content/legal";
import { getSiteContent, practice } from "@/content/site";
import { locales, type Locale } from "@/i18n/config";
import type { ArticleData, ContentData, PublicContent, ServiceData, TextBlock, Translations } from "./models";

function translated<T>(factory: (locale: Locale) => T): Translations<T> {
  return { de: factory("de"), en: factory("en"), ro: factory("ro") };
}

export function seedContent(locale: Locale): ContentData {
  const { articles: _articles, ...blog } = getBlogContent(locale);
  void _articles;
  return {
    site: getSiteContent(locale), about: getAboutContent(locale), practice: { ...practice }, blog,
    legal: Object.fromEntries(Object.entries(legalDocuments).map(([key, blocks]) => [key, {
      title: blocks[5].text, language: "de", blocks: blocks.slice(6).map(block => ({
        type: ["heading", "list"].includes(block.type) ? block.type : "paragraph", text: block.text,
      })),
    }])) as ContentData["legal"],
  };
}

export function seedArticles(): ArticleData[] {
  return getBlogContent("de").articles.map((article, index) => ({
    slug: article.slug, image: article.image, date: article.date,
    translations: translated(locale => {
      const source = getBlogContent(locale).articles[index];
      return {
        title: source.title, excerpt: source.excerpt, category: source.category,
        body: index === 0 ? getFeaturedArticleBody(locale).map(block => ({ type: block.type === "heading" ? "heading" : "paragraph", text: block.text })) as TextBlock[] : [{ type: "paragraph", text: source.excerpt }],
      };
    }),
  }));
}

export function seedServices(): ServiceData[] {
  return ["qigong", "therapy"].map((slug, order) => ({
    slug, order, image: slug === "qigong" ? "760cb.png" : "137d0.svg", priceCents: null, currency: "EUR", durationMinutes: null,
    translations: translated(locale => {
      const c = getSiteContent(locale);
      return slug === "qigong"
        ? { title: c.services.qigong, description: c.services.qigongText, details: [c.services.description, ...c.services.exercises] }
        : { title: c.services.therapy, description: c.services.therapyText, details: c.about.paragraphs };
    }),
  }));
}

export function seedPublicContent(): PublicContent {
  return { content: Object.fromEntries(locales.map(locale => [locale, seedContent(locale)])), articles: seedArticles(), services: seedServices() };
}
