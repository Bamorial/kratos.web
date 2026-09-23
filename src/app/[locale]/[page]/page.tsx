import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/config";
import { getSiteContent } from "@/content/site";
import { getBlogContent } from "@/content/blog";
import { isLegalDocument, legalDocuments } from "@/content/legal";
import { AboutPage } from "@/components/about-page";
import { ServicesPage } from "@/components/services-page";
import { BlogPage } from "@/components/blog/blog-page";
import { LegalPage } from "@/components/legal-page";
import { ContactDetails } from "@/components/contact-details";
import { ContactForm } from "@/components/contact-form";

const pages = ["about", "services", "blog", "contact", ...Object.keys(legalDocuments)];
type PageProps = { params: Promise<{ locale: string; page: string }> };

export function generateStaticParams() { return locales.flatMap(locale => pages.map(page => ({ locale, page }))); }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, page } = await params;
  if (!isLocale(locale)) return {};
  const c = getSiteContent(locale);
  const titles: Record<string, string> = { about: c.nav.about, services: c.nav.services, contact: c.nav.contact, blog: getBlogContent(locale).title };
  return { title: titles[page] ?? (isLegalDocument(page) ? legalDocuments[page][5].text : undefined) };
}

export default async function ContentPage({ params }: PageProps) {
  const { locale, page } = await params;
  if (!isLocale(locale) || !pages.includes(page)) notFound();
  const content = getSiteContent(locale);
  switch (page) {
    case "about": return <AboutPage locale={locale} content={content} />;
    case "services": return <ServicesPage locale={locale} content={content} />;
    case "blog": return <BlogPage locale={locale} />;
    case "contact": return <div className="container inner-page contact-page"><h1 className="page-title">{content.contact.title}</h1><ContactDetails content={content} full /><ContactForm content={content} /></div>;
    default: if (isLegalDocument(page)) return <LegalPage document={page} locale={locale} content={content} />; notFound();
  }
}
