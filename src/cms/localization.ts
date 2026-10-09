import type { Locale } from "@/i18n/config";
import type { Translations } from "./models";

// Fall back for an entire translation, avoiding mixed-language article bodies.
export function resolveTranslation<T>(translations: Translations<T>, locale: Locale) {
  const translated = translations[locale];
  return { value: translated ?? translations.de, language: translated ? locale : "de" as Locale };
}
