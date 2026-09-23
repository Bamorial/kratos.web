import Image from "next/image";
import Link from "next/link";
import type { SiteContent } from "@/content/site";
import { localizedPath, type Locale } from "@/i18n/config";

export function SiteFooter({ locale, content: c }: { locale: Locale; content: SiteContent }) {
  const groups = [
    { title: c.ui.discover, links: [[c.nav.about, "about"], [c.nav.services, "services"], [c.process.title, "#how-it-works"]] },
    { title: c.ui.moreLinks, links: [[c.nav.blog, "blog"], [c.testimonials.title, "#testimonials"], [c.faq.title, "#faq"], [c.nav.contact, "contact"]] },
    { title: c.ui.legal, links: [[c.ui.prices, "terms#prices"], [c.ui.imprint, "impressum"], [c.ui.privacy, "privacy"], [c.ui.terms, "terms"], [c.ui.disclaimer, "disclaimer"]] },
  ];
  const href = (path: string) => path.startsWith("#") ? `${localizedPath(locale)}${path}` : localizedPath(locale, path);
  return <footer className="site-footer"><div className="container">
    <div className="footer-grid"><Link href={localizedPath(locale)} aria-label="Systhera"><Image className="footer-logo" src="/images/64933.svg" alt="Systhera" width={260} height={56} /></Link>
      {groups.map(group => <div key={group.title}><h3>{group.title}</h3><ul>{group.links.map(([label, path]) => <li key={path}><Link href={href(path)}>{label}</Link></li>)}</ul></div>)}
    </div>
    <div className="footer-bottom"><p>©{new Date().getFullYear()} Systhera Beratung. {c.ui.rights}</p><div className="social-icons">{[["65c27.svg", "Facebook"], ["7a13a.svg", "X"], ["507bc.svg", "Instagram"]].map(([file, name]) => <Image key={file} src={`/images/${file}`} alt={name} width={23} height={23} />)}</div></div>
    <p className="credits">Powered by Rares Faur &amp; Vlad Veltan</p>
  </div></footer>;
}
