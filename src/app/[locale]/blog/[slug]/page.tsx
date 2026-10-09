import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePage } from "@/components/blog/article-page";
import { isLocale } from "@/i18n/config";
import { getPublishedArticles } from "@/server/public-content";

type ArticleProps = { params: Promise<{ locale: string; slug: string }> };
// Generate newly published slugs on demand, without requiring a deployment.
export const revalidate = 300;
export const dynamicParams = true;
export function generateStaticParams() { return []; }
export async function generateMetadata({ params }: ArticleProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const article = (await getPublishedArticles(locale)).find(article => article.slug === slug);
  return { title: article?.title, description: article?.excerpt };
}
export default async function BlogArticle({ params }: ArticleProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const article = (await getPublishedArticles(locale)).find(article => article.slug === slug);
  if (!article) notFound();
  return <ArticlePage locale={locale} article={article} />;
}
