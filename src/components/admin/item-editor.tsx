"use client";
import type { ArticleData, ServiceData } from "@/cms/models";
import { FormSection, TextField } from "./fields";
import { TranslationEditor } from "./translation-editor";

const slugHint = (path: string, slug: string, existing: boolean) => <>{existing ? "The URL cannot change after the first save. " : "Lowercase letters, numbers and hyphens. "}<code>/de/{path}{slug || "your-slug"}</code></>;

export function ArticleEditor({ value, onChange, existing }: { value: ArticleData; onChange: (value: ArticleData) => void; existing: boolean }) {
  return <>
    <FormSection title="Details" description="How the article is addressed and listed on the blog.">
      <div className="admin-form-grid"><TextField label="URL slug" value={value.slug} disabled={existing} hint={slugHint("blog/", value.slug, existing)} onChange={slug => onChange({ ...value, slug })} /><TextField label="Publication date" type="date" value={value.date} onChange={date => onChange({ ...value, date })} /></div>
      <TextField label="Cover image" hint="An HTTPS URL or the filename of an existing image." value={value.image} onChange={image => onChange({ ...value, image })} />
    </FormSection>
    <FormSection title="Content" description="Visitors see German when a translation is missing.">
      <TranslationEditor value={value.translations} onChange={translations => onChange({ ...value, translations })} />
    </FormSection>
  </>;
}
export function ServiceEditor({ value, onChange, existing }: { value: ServiceData; onChange: (value: ServiceData) => void; existing: boolean }) {
  return <>
    <FormSection title="Details">
      <TextField label="URL slug" value={value.slug} disabled={existing} hint={slugHint("services#", value.slug, existing)} onChange={slug => onChange({ ...value, slug })} />
      <TextField label="Image" hint="An HTTPS URL or the filename of an existing image." value={value.image} onChange={image => onChange({ ...value, image })} />
    </FormSection>
    <FormSection title="Pricing & order" description="Leave the price blank to show “on request”.">
      <div className="admin-form-grid admin-form-grid-3"><label>Price (EUR)<span className="admin-input-affix"><span aria-hidden="true">€</span><input type="number" min="0" step="0.01" inputMode="decimal" placeholder="On request" value={value.priceCents === null ? "" : value.priceCents / 100} onChange={event => onChange({ ...value, priceCents: event.target.value === "" ? null : Math.round(Number(event.target.value) * 100) })} /></span></label><label>Duration (minutes)<input type="number" min="1" max="1440" inputMode="numeric" value={value.durationMinutes ?? ""} onChange={event => onChange({ ...value, durationMinutes: event.target.value === "" ? null : Number(event.target.value) })} /></label><label>Display order<input type="number" min="0" inputMode="numeric" value={value.order} onChange={event => onChange({ ...value, order: Number(event.target.value) })} /></label></div>
    </FormSection>
    <FormSection title="Content" description="Visitors see German when a translation is missing.">
      <TranslationEditor value={value.translations} onChange={translations => onChange({ ...value, translations })} />
    </FormSection>
  </>;
}
