import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/config";
import { getPageContent, getPublishedServices } from "@/server/public-content";
import { isLegalDocument, legalDocuments } from "@/content/legal";
import { AboutPage } from "@/components/about-page";
import { ServicesPage } from "@/components/services-page";
import { BlogPage } from "@/components/blog/blog-page";
import { LegalPage } from "@/components/legal-page";
import { ContactDetails } from "@/components/contact-details";
import { ContactForm } from "@/components/contact-form";

const pages = ["about", "services", "blog", "contact", ...Object.keys(legalDocuments)];
type PageProps = { params: Promise<{ locale: string; page: string }>; searchParams: Promise<{ service?: string }> };
export const revalidate = 300;
export function generateStaticParams() { return locales.flatMap(locale => pages.map(page => ({ locale, page }))); }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, page } = await params;
  if (!isLocale(locale)) return {};
  const { site: c, blog, legal } = await getPageContent(locale);
  const titles: Record<string, string> = { about: c.nav.about, services: c.nav.services, contact: c.nav.contact, blog: blog.title };
  return { title: titles[page] ?? (isLegalDocument(page) ? legal[page].title : undefined) };
}
export default async function ContentPage({ params, searchParams }: PageProps) {
  const { locale, page } = await params;
  if (!isLocale(locale) || !pages.includes(page)) notFound();
  const { site: content, practice } = await getPageContent(locale);
  switch (page) {
    case "about": return <AboutPage locale={locale} content={content} />;
    case "services": return <ServicesPage locale={locale} content={content} services={await getPublishedServices(locale)} />;
    case "blog": return <BlogPage locale={locale} />;
    case "contact": {
      const services = await getPublishedServices(locale);
      const { service } = await searchParams;
      return <div className="container inner-page contact-page"><h1 className="page-title">{content.contact.title}</h1><ContactDetails content={content} practice={practice} full /><ContactForm content={content} locale={locale} services={services} email={practice.email} selectedService={services.some(item => item.slug === service) ? service : ""} /></div>;
    }
    default: if (isLegalDocument(page)) return <LegalPage document={page} locale={locale} content={content} />; notFound();
  }
}
