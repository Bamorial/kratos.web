import { getPageContent } from "@/server/public-content";
import type { SiteContent } from "@/content/site";
import { localizedPath, type Locale } from "@/i18n/config";
import { ButtonLink, Photo } from "./ui";

export async function AboutPage({ locale, content: c }: { locale: Locale; content: SiteContent }) {
  const { about } = await getPageContent(locale);
  return <div className="container inner-page about-page"><h1 className="page-title about-title">{about.title}</h1><div className="two-column biography"><Photo file="0e5e9.png" className="biography-photo" alt="Simona Facalau" priority /><div><h2 className="large-heading">{about.name}</h2><ul>{about.qualifications.map(text => <li key={text}>{text}</li>)}</ul><hr /><h2>{about.experienceTitle}</h2><ul className="experience-list">{about.experience.map(text => <li key={text}>{text}</li>)}</ul></div></div><div className="button-row section-action"><ButtonLink href={localizedPath(locale, "services")}>{c.nav.services}</ButtonLink><ButtonLink href={localizedPath(locale, "contact")}>{c.nav.contact}</ButtonLink></div></div>;
}
