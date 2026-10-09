import "server-only";
import { adminDatabase } from "@/lib/firebase/admin";
import { locales, type Locale } from "@/i18n/config";
import { seedPublicContent } from "@/cms/seeds";
import type { CmsRecord, Collection, CollectionData, PublicContent } from "@/cms/models";
import { HttpError } from "./http";

const records = (collection: Collection) => adminDatabase().collection(`cms_${collection}`);
const stateRef = () => adminDatabase().doc("cms_meta/state");

export async function listRecords<K extends Collection>(collection: K): Promise<CmsRecord<CollectionData[K]>[]> {
  const snapshot = await records(collection).orderBy("updatedAt", "desc").limit(500).get();
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as CmsRecord<CollectionData[K]>);
}

export async function initializeContent() {
  const seed = seedPublicContent();
  const db = adminDatabase();
  await db.runTransaction(async transaction => {
    if ((await transaction.get(stateRef())).exists) throw new HttpError(409, "Content has already been initialized.");
    const timestamp = new Date().toISOString();
    const insert = <K extends Collection>(collection: K, id: string, data: CollectionData[K]) => {
      transaction.create(records(collection).doc(id), { draft: data, published: data, version: 1, updatedAt: timestamp });
    };
    for (const locale of locales) insert("content", locale, seed.content[locale]!);
    for (const article of seed.articles) insert("articles", article.slug, article);
    for (const service of seed.services) insert("services", service.slug, service);
    transaction.create(stateRef(), { initializedAt: timestamp });
  });
}

export async function isInitialized() { return (await stateRef().get()).exists; }

export async function mutateRecord<K extends Collection>(collection: K, id: string, action: "save" | "publish" | "unpublish" | "delete", version: number, data?: CollectionData[K]) {
  if (collection === "content" && (action === "delete" || action === "unpublish")) throw new HttpError(400, "Website translations cannot be deleted or unpublished.");
  const ref = records(collection).doc(id);
  return adminDatabase().runTransaction(async transaction => {
    const [state, existing] = await transaction.getAll(stateRef(), ref);
    if (!state.exists) throw new HttpError(409, "Initialize the existing website content first.");
    const current = existing.data() as CmsRecord<CollectionData[K]> | undefined;
    if ((current?.version ?? 0) !== version) throw new HttpError(409, "This item changed in another session. Reload it before saving.");
    if (action === "delete") {
      if (current?.published) throw new HttpError(409, "Unpublish this item before deleting it.");
      transaction.delete(ref);
      return null;
    }
    if (!data && !current) throw new HttpError(404, "Item not found.");
    const draft = data ?? current!.draft;
    const result: CmsRecord<CollectionData[K]> = {
      id, draft, published: action === "publish" ? draft : action === "unpublish" ? null : current?.published ?? null,
      version: version + 1, updatedAt: new Date().toISOString(),
    };
    transaction.set(ref, result);
    return result;
  });
}

export async function readPublishedContent(): Promise<PublicContent> {
  if (!await isInitialized()) return seedPublicContent();
  // Public reads return only the published snapshot, never an editor's draft.
  const [content, articles, services] = await Promise.all([records("content").get(), records("articles").get(), records("services").get()]);
  return {
    content: Object.fromEntries(content.docs.filter(doc => doc.data().published).map(doc => [doc.id as Locale, doc.data().published])),
    articles: articles.docs.map(doc => doc.data().published).filter(Boolean),
    services: services.docs.map(doc => doc.data().published).filter(Boolean),
  };
}
