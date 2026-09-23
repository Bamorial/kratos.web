import type { SiteContent } from "@/content/site";
import { localizedPath, type Locale } from "@/i18n/config";
import { ButtonLink, Photo } from "../ui";

export function AboutPreview({ locale, content: c }: { locale: Locale; content: SiteContent }) {
  return <section className="section tinted" id="about"><div className="container">
    <div className="about-preview"><Photo file="0e5e9.png" alt="Simona Facalau" className="portrait-preview" /><div><h2 className="large-heading">Simona Facalau</h2><h3 className="about-subtitle">{c.about.heading}</h3>{c.about.paragraphs.map(text => <p key={text}>{text}</p>)}</div></div>
    <h2 className="center principles-heading">{c.about.principlesTitle}</h2><div className="principles">{c.about.principles.map(item => <div key={item.title}><h3>{item.title}</h3><p>{item.text}</p></div>)}</div>
    <div className="center section-action"><ButtonLink href={localizedPath(locale, "about")}>{c.ui.more}</ButtonLink></div>
  </div></section>;
}
