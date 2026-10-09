import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/config";
import { getPageContent } from "@/server/public-content";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "../globals.css";

export const revalidate = 300;

export function generateStaticParams() { return locales.map(locale => ({ locale })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const content = (await getPageContent(locale)).site;
  return {
    title: { default: "Systhera Beratung | Simona Facalau", template: "%s | Systhera Beratung" },
    description: content.approach.intro,
    icons: { icon: "/favicon.ico", shortcut: "/favicon.ico" },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = (await getPageContent(locale)).site;
  return <html lang={locale}><body><SiteHeader locale={locale} content={content} /><main id="main">{children}</main><SiteFooter locale={locale} content={content} /></body></html>;
}
