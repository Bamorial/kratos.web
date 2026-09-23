import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/content/blog";
import { localeNames, localizedPath, type Locale } from "@/i18n/config";
import { Photo } from "../ui";

export function ArticleCard({ article, locale }: { article: Article; locale: Locale }) {
  return <Link className="article-card" href={localizedPath(locale, `blog/${article.slug}`)}><div className="article-image"><Photo file={article.image} /><span className="author-pill"><Image src="/images/0e5e9.png" width={24} height={24} alt="" />Simona Facalau</span><div className="article-tags"><span>{article.category}</span><span>{localeNames[locale]}</span><time dateTime={article.date}>{new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(`${article.date}T12:00:00Z`))}</time></div></div><div className="article-copy"><h3>{article.title}</h3><p>{article.excerpt}…</p></div></Link>;
}
