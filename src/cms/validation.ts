import { z } from "zod";
import { seedContent } from "./seeds";
import type { Collection, CollectionData } from "./models";

const shortText = z.string().trim().min(1).max(300);
export const documentIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/);
const imageSchema = z.string().max(2048).refine(value => {
  if (/^[a-zA-Z0-9_-]+\.(png|jpe?g|webp|gif|svg|avif)$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}, "Use a bundled image filename or an HTTPS image URL.");
const blockSchema = z.object({ type: z.enum(["heading", "paragraph", "list"]), text: z.string().trim().min(1).max(20000) }).strict();
const articleTranslation = z.object({ title: shortText, excerpt: z.string().trim().min(1).max(2000), category: shortText, body: z.array(blockSchema).min(1).max(200) }).strict();
const serviceTranslation = z.object({ title: shortText, description: z.string().trim().min(1).max(5000), details: z.array(z.string().trim().min(1).max(10000)).max(50) }).strict();
const translations = <T extends z.ZodType>(schema: T) => z.object({ de: schema, en: schema.optional(), ro: schema.optional() }).strict();
export const articleSchema = z.object({
  slug: documentIdSchema, image: imageSchema,
  date: z.iso.date(), translations: translations(articleTranslation),
}).strict();
export const serviceSchema = z.object({
  slug: documentIdSchema, image: imageSchema, priceCents: z.number().int().min(0).max(10000000).nullable(),
  currency: z.literal("EUR"), durationMinutes: z.number().int().min(1).max(1440).nullable(), order: z.number().int().min(0).max(10000),
  translations: translations(serviceTranslation),
}).strict();

// Derive the fixed page-copy shape from the existing typed content; reject unknown keys.
function schemaFromTemplate(value: unknown, key = ""): z.ZodType {
  if (typeof value === "string") {
    if (key === "image") return imageSchema;
    if (key === "path") return z.string().regex(/^[a-z0-9/#-]+$/).max(200);
    return z.string().max(20000);
  }
  if (Array.isArray(value)) return z.array(schemaFromTemplate(value[0])).min(1).max(100);
  return z.object(Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([name, child]) => [name, schemaFromTemplate(child, name)]))).strict();
}
const template = seedContent("de");
export const contentSchema = z.object({
  site: schemaFromTemplate(template.site), about: schemaFromTemplate(template.about), blog: schemaFromTemplate(template.blog),
  practice: z.object({ name: shortText, practitioner: shortText, email: z.email().max(254), phone: shortText, phoneHref: z.string().regex(/^tel:\+?[0-9 ()-]+$/).max(80), address: shortText }).strict(),
  legal: z.object(Object.fromEntries(Object.keys(template.legal).map(key => [key, z.object({ title: shortText, language: z.enum(["de", "en", "ro"]), blocks: z.array(blockSchema).min(1).max(250) }).strict()]))).strict(),
}).strict();
const schemas = { content: contentSchema, articles: articleSchema, services: serviceSchema };
export function validateData<K extends Collection>(collection: K, value: unknown): CollectionData[K] {
  return schemas[collection].parse(value) as CollectionData[K];
}
export const mutationSchema = z.object({ action: z.enum(["save", "publish", "unpublish", "delete"]), version: z.number().int().min(0), data: z.unknown().optional() }).strict();
export const bookingSchema = z.object({
  requestId: z.uuid(), name: z.string().trim().min(1).max(120), email: z.email().max(254),
  message: z.string().trim().min(1).max(4000), locale: z.enum(["de", "en", "ro"]),
  serviceId: z.union([documentIdSchema, z.literal("")]), website: z.string().max(200).default(""), consent: z.literal(true),
}).strict();
