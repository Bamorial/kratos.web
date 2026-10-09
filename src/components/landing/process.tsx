import { getPageContent } from "@/server/public-content";
import type { Locale } from "@/i18n/config";
import type { SiteContent } from "@/content/site";
import { ContactDetails } from "../contact-details";
import { AssetIcon, Photo, SectionHeading } from "../ui";

export async function Process({ content: c, locale }: { content: SiteContent; locale: Locale }) {
  const { practice } = await getPageContent(locale);
  return <section className="section container" id="how-it-works"><SectionHeading title={c.process.title} description={c.process.intro} /><div className="two-column process-grid"><Photo file="ce26d.png" className="process-photo" /><div><ol className="process-steps">{c.process.steps.map((step, index) => <li key={step.title}><h3><span>{String(index + 1).padStart(2, "0")}</span> {step.title}</h3><p>{step.text}</p>{index === 0 && <ContactDetails content={c} practice={practice} />}</li>)}</ol><div className="course-callout"><h3><AssetIcon file="f2a3c.svg" width={30} height={26} />{c.process.courses}</h3><p>{c.services.qigongText}</p></div></div></div></section>;
}
