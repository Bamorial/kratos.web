"use client";
import type { ArticleData, ServiceData } from "@/cms/models";
import { TextField } from "./fields";
import { TranslationEditor } from "./translation-editor";

export function ArticleEditor({ value, onChange, existing }: { value: ArticleData; onChange: (value: ArticleData) => void; existing: boolean }) {
  return <><div className="admin-form-grid"><TextField label="URL slug" value={value.slug} disabled={existing} onChange={slug => onChange({ ...value, slug })} /><TextField label="Publication date" type="date" value={value.date} onChange={date => onChange({ ...value, date })} /></div><TextField label="Cover image (HTTPS URL or existing filename)" value={value.image} onChange={image => onChange({ ...value, image })} /><TranslationEditor value={value.translations} onChange={translations => onChange({ ...value, translations })} /></>;
}
export function ServiceEditor({ value, onChange, existing }: { value: ServiceData; onChange: (value: ServiceData) => void; existing: boolean }) {
  return <><TextField label="URL slug" value={value.slug} disabled={existing} onChange={slug => onChange({ ...value, slug })} /><TextField label="Image (HTTPS URL or existing filename)" value={value.image} onChange={image => onChange({ ...value, image })} />
    <div className="admin-form-grid"><label>Price in EUR (blank = on request)<input type="number" min="0" step="0.01" value={value.priceCents === null ? "" : value.priceCents / 100} onChange={event => onChange({ ...value, priceCents: event.target.value === "" ? null : Math.round(Number(event.target.value) * 100) })} /></label><label>Duration in minutes<input type="number" min="1" max="1440" value={value.durationMinutes ?? ""} onChange={event => onChange({ ...value, durationMinutes: event.target.value === "" ? null : Number(event.target.value) })} /></label><label>Display order<input type="number" min="0" value={value.order} onChange={event => onChange({ ...value, order: Number(event.target.value) })} /></label></div>
    <TranslationEditor value={value.translations} onChange={translations => onChange({ ...value, translations })} /></>;
}
