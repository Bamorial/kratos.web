import { getPageContent, getPublishedArticles } from "@/server/public-content";
import { localizedPath, type Locale } from "@/i18n/config";
import { ButtonLink, Photo, SectionHeading } from "../ui";
import { ArticleCard } from "./article-card";

export async function BlogPage({ locale }: { locale: Locale }) {
  const [{ blog: c }, articles] = await Promise.all([getPageContent(locale), getPublishedArticles(locale)]);
  const featured = articles[0];
  return <div className="container inner-page blog-page"><SectionHeading title={c.title} description={c.subtitle} />{featured && <article className="featured-article" lang={featured.language}><Photo file={featured.image} priority /><div className="featured-category">{featured.category}</div><div className="featured-copy"><time dateTime={featured.date}>{new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(`${featured.date}T12:00:00Z`))}</time><h1>{featured.title}</h1><p>{featured.excerpt}</p><ButtonLink href={localizedPath(locale, `blog/${featured.slug}`)}>{c.read}</ButtonLink></div></article>}<h2 className="center all-articles-heading">{c.all}</h2><div className="article-grid">{articles.slice(1).map(article => <ArticleCard key={article.slug} article={article} locale={locale} />)}</div></div>;
}
