import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing/landing-page";
import { getSiteContent } from "@/content/site";
import { isLocale } from "@/i18n/config";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LandingPage locale={locale} content={getSiteContent(locale)} />;
}
