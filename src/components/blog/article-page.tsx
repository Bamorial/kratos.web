import type { LocalizedArticle } from "@/cms/models";
import { getPageContent, getPublishedArticles } from "@/server/public-content";
import { localeNames, localizedPath, type Locale } from "@/i18n/config";
import { ButtonLink, Photo, SectionHeading } from "../ui";
import { ArticleCard } from "./article-card";
import { TextBlocks } from "../text-blocks";

export async function ArticlePage({ article, locale }: { article: LocalizedArticle; locale: Locale }) {
  const [{ blog: c, practice }, articles] = await Promise.all([getPageContent(locale), getPublishedArticles(locale)]);
  return <div className="container inner-page article-page"><article lang={article.language}><h1>{article.title}</h1><div className="article-byline"><span>{practice.practitioner} · {localeNames[article.language]}</span><time dateTime={article.date}>{new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(`${article.date}T12:00:00Z`))}</time></div><Photo file={article.image} className="article-cover" priority /><div className="prose article-body"><TextBlocks blocks={article.body} /></div></article><section className="related-articles"><SectionHeading title={c.related} /><div className="article-grid">{articles.filter(item => item.slug !== article.slug).slice(0, 2).map(item => <ArticleCard key={item.slug} article={item} locale={locale} />)}</div><div className="center section-action"><ButtonLink href={localizedPath(locale, "blog")}>{c.all}</ButtonLink></div></section></div>;
}
