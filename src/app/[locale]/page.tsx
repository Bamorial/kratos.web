import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing/landing-page";
import { getPageContent } from "@/server/public-content";
import { isLocale } from "@/i18n/config";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LandingPage locale={locale} content={(await getPageContent(locale)).site} />;
}
