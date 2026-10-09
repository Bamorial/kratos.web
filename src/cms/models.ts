import type { Locale } from "@/i18n/config";
import type { getSiteContent, practice } from "@/content/site";
import type { getAboutContent } from "@/content/about";

export type Translations<T> = { de: T; en?: T; ro?: T };
export type TextBlock = { type: "heading" | "paragraph" | "list"; text: string };
export type ArticleTranslation = { title: string; excerpt: string; category: string; body: TextBlock[] };
export type ArticleData = {
  slug: string;
  image: string;
  date: string;
  translations: Translations<ArticleTranslation>;
};
export type ServiceTranslation = { title: string; description: string; details: string[] };
export type ServiceData = {
  slug: string;
  image: string;
  priceCents: number | null;
  currency: "EUR";
  durationMinutes: number | null;
  order: number;
  translations: Translations<ServiceTranslation>;
};
export type ContentData = {
  site: ReturnType<typeof getSiteContent>;
  about: ReturnType<typeof getAboutContent>;
  practice: typeof practice;
  blog: { title: string; subtitle: string; all: string; read: string; related: string; excerptLabel: string };
  legal: Record<"impressum" | "terms" | "privacy" | "disclaimer", { title: string; language: Locale; blocks: TextBlock[] }>;
};
export type Collection = "content" | "articles" | "services";
export type CollectionData = { content: ContentData; articles: ArticleData; services: ServiceData };
export type CmsRecord<T> = { id: string; draft: T; published: T | null; version: number; updatedAt: string };
export type PublicContent = {
  content: Partial<Record<Locale, ContentData>>;
  articles: ArticleData[];
  services: ServiceData[];
};
export type LocalizedArticle = ArticleTranslation & { slug: string; image: string; date: string; language: Locale };
export type LocalizedService = ServiceTranslation & Omit<ServiceData, "translations"> & { language: Locale };
export type BookingStatus = "new" | "contacted" | "closed";
export type Booking = {
  id: string;
  name: string;
  email: string;
  message: string;
  locale: Locale;
  serviceId: string;
  serviceTitle: string;
  priceCents: number | null;
  status: BookingStatus;
  createdAt: string;
};
