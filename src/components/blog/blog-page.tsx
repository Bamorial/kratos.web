import { getBlogContent } from "@/content/blog";
import { localizedPath, type Locale } from "@/i18n/config";
import { ButtonLink, Photo, SectionHeading } from "../ui";
import { ArticleCard } from "./article-card";

export function BlogPage({ locale }: { locale: Locale }) {
  const c = getBlogContent(locale);
  const featured = c.articles[0];
  return <div className="container inner-page blog-page"><SectionHeading title={c.title} description={c.subtitle} /><article className="featured-article"><Photo file={featured.image} priority /><div className="featured-category">{featured.category}</div><div className="featured-copy"><time dateTime={featured.date}>07.09.2026</time><h1>{featured.title}</h1><p>{featured.excerpt}</p><ButtonLink href={localizedPath(locale, `blog/${featured.slug}`)}>{c.read}</ButtonLink></div></article><h2 className="center all-articles-heading">{c.all}</h2><div className="article-grid">{c.articles.slice(1).map(article => <ArticleCard key={article.slug} article={article} locale={locale} />)}</div></div>;
}
