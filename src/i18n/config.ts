export const locales = ["de", "en", "ro"] as const;
export type Locale = (typeof locales)[number];
export const localeNames: Record<Locale, string> = { de: "Deutsch", en: "English", ro: "Română" };
export const localeFlags: Record<Locale, string> = { de: "🇩🇪", en: "🇬🇧", ro: "🇷🇴" };

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function translator(locale: Locale) {
  return (de: string, en: string, ro: string) => ({ de, en, ro })[locale];
}

export function localizedPath(locale: Locale, path = "") {
  return `/${locale}${path ? `/${path}` : ""}`;
}
