import Image from "next/image";
import type { SiteContent } from "@/content/site";
import { localizedPath, type Locale } from "@/i18n/config";
import { ButtonLink } from "../ui";

export function Hero({ locale, content: c }: { locale: Locale; content: SiteContent }) {
  return <section className="hero"><Image className="hero-image" src="/images/98ea8.png" alt="" fill sizes="100vw" preload /><div className="hero-shade" />
    <div className="hero-content"><h1>{c.hero.quote}</h1><p className="quote-author">{c.hero.author}</p><p className="hero-description">{c.hero.description}</p><p className="hero-motto">„Met’n Lief begripen“</p>
      <div className="button-row"><ButtonLink href={localizedPath(locale, "contact")}>{c.ui.book}</ButtonLink><ButtonLink href="#services" outline>{c.nav.services}</ButtonLink></div>
    </div>
  </section>;
}
