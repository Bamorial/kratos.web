import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articleSlugs, getBlogContent } from "@/content/blog";
import { ArticlePage } from "@/components/blog/article-page";
import { isLocale, locales } from "@/i18n/config";

type ArticleProps = { params: Promise<{ locale: string; slug: string }> };
export function generateStaticParams() { return locales.flatMap(locale => articleSlugs.map(slug => ({ locale, slug }))); }

export async function generateMetadata({ params }: ArticleProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const article = getBlogContent(locale).articles.find(article => article.slug === slug);
  return { title: article?.title, description: article?.excerpt };
}

export default async function BlogArticle({ params }: ArticleProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const article = getBlogContent(locale).articles.find(article => article.slug === slug);
  if (!article) notFound();
  return <ArticlePage locale={locale} article={article} />;
}
