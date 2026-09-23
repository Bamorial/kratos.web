"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { SiteContent } from "@/content/site";
import { localeFlags, localeNames, locales, localizedPath, type Locale } from "@/i18n/config";

export function SiteHeader({ locale, content }: { locale: Locale; content: SiteContent }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const isHome = pathname === `/${locale}`;
  const links = isHome
    ? [[content.nav.qigong, "services#qigong"], [content.nav.therapy, "services#therapy"], [content.nav.blog, "blog"], [content.nav.contact, "contact"], [content.nav.about, "about"]]
    : [[content.nav.services, "services"], [content.nav.contact, "contact"], [content.nav.blog, "blog"], [content.nav.about, "about"]];

  function closeMenus() { setMenuOpen(false); setLanguageOpen(false); }

  return <header className={`site-header${isHome ? " header-home" : ""}`} onKeyDown={(event) => { if (event.key === "Escape") closeMenus(); }}>
    <a className="skip-link" href="#main">{content.ui.skip}</a>
    <div className="container header-inner">
      <Link href={localizedPath(locale)} aria-label="Systhera" onClick={closeMenus}><Image src={`/images/${isHome ? "e19a1.svg" : "a9866.svg"}`} alt="Systhera" width={100} height={22} priority /></Link>
      <nav className={`main-nav${menuOpen ? " is-open" : ""}`} id="main-navigation" aria-label={content.ui.menu}>
        {links.map(([label, path]) => <Link key={path} href={localizedPath(locale, path)} onClick={closeMenus} aria-current={pathname === localizedPath(locale, path) ? "page" : undefined}>{label}</Link>)}
      </nav>
      <div className="header-actions">
        <div className="language-control">
          <button className="language-trigger" aria-label={content.ui.language} aria-expanded={languageOpen} aria-controls="language-options" onClick={() => setLanguageOpen(!languageOpen)}>
            <Image src={`/images/${isHome ? "e1712.svg" : "66a74.svg"}`} alt="" width={28} height={26} /><span className="flag" aria-hidden="true">{localeFlags[locale]}</span>
          </button>
          {languageOpen && <nav className="language-options" id="language-options" aria-label={content.ui.language}>{locales.map((language) => <Link key={language} href={pathname.replace(/^\/(de|en|ro)(?=\/|$)/, `/${language}`)} lang={language} hrefLang={language} aria-current={locale === language ? "true" : undefined} onClick={closeMenus}>{localeFlags[language]} {localeNames[language]}</Link>)}</nav>}
        </div>
        <button className="menu-toggle" aria-label={menuOpen ? content.ui.close : content.ui.menu} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}><span aria-hidden="true">{menuOpen ? "×" : "☰"}</span></button>
      </div>
    </div>
  </header>;
}
