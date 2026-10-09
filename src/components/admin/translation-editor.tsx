"use client";
import { useState } from "react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import type { Translations } from "@/cms/models";
import { ContentFields, type EditableValue } from "./fields";

export function TranslationEditor<T>({ value, onChange }: { value: Translations<T>; onChange: (value: Translations<T>) => void }) {
  const [locale, setLocale] = useState<Locale>("de");
  const translation = value[locale];
  return <div><div className="admin-tabs" role="group" aria-label="Translation language">{locales.map(language => <button type="button" key={language} aria-pressed={locale === language} onClick={() => setLocale(language)}>{localeNames[language]}{language === "de" ? <span className="admin-tab-tag">Required</span> : !value[language] && <span className="admin-tab-tag is-missing">Missing</span>}</button>)}</div>
    {translation ? <><ContentFields value={translation as EditableValue} onChange={next => onChange({ ...value, [locale]: next as T })} />{locale !== "de" && <button type="button" className="admin-btn admin-btn-danger-ghost admin-btn-sm" onClick={() => { if (window.confirm(`Remove the ${localeNames[locale]} translation? German will be shown instead.`)) { const next = { ...value }; delete next[locale]; onChange(next); } }}>Remove {localeNames[locale]} translation</button>}</>
      : <div className="admin-empty admin-empty-inline"><h3>No {localeNames[locale]} translation yet</h3><p>Visitors will see the German version until you add one.</p><button type="button" className="admin-btn admin-btn-primary" onClick={() => onChange({ ...value, [locale]: structuredClone(value.de) })}>Start from German text</button></div>}
  </div>;
}
