import { getBlogContent, getFeaturedArticleBody, type Article } from "@/content/blog";
import { localeNames, localizedPath, type Locale } from "@/i18n/config";
import { ButtonLink, Photo, SectionHeading } from "../ui";
import { ArticleCard } from "./article-card";

export function ArticlePage({ article, locale }: { article: Article; locale: Locale }) {
  const c = getBlogContent(locale);
  return <div className="container inner-page article-page"><article><h1>{article.title}</h1><div className="article-byline"><span>Simona Facalau · {localeNames[locale]}</span><time dateTime={article.date}>{new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(`${article.date}T12:00:00Z`))}</time></div><Photo file={article.image} className="article-cover" priority /><div className="prose article-body">{article.slug === "self-understanding" ? getFeaturedArticleBody(locale).map((block, index) => block.type === "heading" ? <h2 key={index}>{block.text}</h2> : <p key={index}>{block.text}</p>) : <><h2>{c.excerptLabel}</h2><p>{article.excerpt}</p></>}</div></article><section className="related-articles"><SectionHeading title={c.related} /><div className="article-grid">{c.articles.filter(item => item.slug !== article.slug).slice(0, 2).map(item => <ArticleCard key={item.slug} article={item} locale={locale} />)}</div><div className="center section-action"><ButtonLink href={localizedPath(locale, "blog")}>{c.all}</ButtonLink></div></section></div>;
}
