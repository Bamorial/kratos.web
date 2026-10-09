"use client";
import { useState } from "react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import type { Translations } from "@/cms/models";
import { ContentFields, type EditableValue } from "./fields";

export function TranslationEditor<T>({ value, onChange }: { value: Translations<T>; onChange: (value: Translations<T>) => void }) {
  const [locale, setLocale] = useState<Locale>("de");
  const translation = value[locale];
  return <section><div className="admin-tabs" aria-label="Translation language">{locales.map(language => <button type="button" key={language} aria-pressed={locale === language} onClick={() => setLocale(language)}>{localeNames[language]}{!value[language] && " · missing"}</button>)}</div>
    {translation ? <><ContentFields value={translation as EditableValue} onChange={next => onChange({ ...value, [locale]: next as T })} />{locale !== "de" && <button type="button" className="admin-subtle" onClick={() => { if (window.confirm(`Remove the ${localeNames[locale]} translation? German will be shown instead.`)) { const next = { ...value }; delete next[locale]; onChange(next); } }}>Remove this translation</button>}</>
      : <div className="admin-empty"><p>This translation is missing. Visitors will see the German version.</p><button type="button" onClick={() => onChange({ ...value, [locale]: structuredClone(value.de) })}>Start from German text</button></div>}
  </section>;
}
