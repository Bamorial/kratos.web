import type { SiteContent } from "@/content/site";
import { ContactDetails } from "../contact-details";
import { AssetIcon, Photo, SectionHeading } from "../ui";

export function Process({ content: c }: { content: SiteContent }) {
  return <section className="section container" id="how-it-works"><SectionHeading title={c.process.title} description={c.process.intro} /><div className="two-column process-grid"><Photo file="ce26d.png" className="process-photo" /><div><ol className="process-steps">{c.process.steps.map((step, index) => <li key={step.title}><h3><span>{String(index + 1).padStart(2, "0")}</span> {step.title}</h3><p>{step.text}</p>{index === 0 && <ContactDetails content={c} />}</li>)}</ol><div className="course-callout"><h3><AssetIcon file="f2a3c.svg" width={30} height={26} />{c.process.courses}</h3><p>{c.services.qigongText}</p></div></div></div></section>;
}
