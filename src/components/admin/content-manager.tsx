"use client";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import type { ArticleData, CmsRecord, Collection, CollectionData, ContentData, ServiceData } from "@/cms/models";
import { localeNames, type Locale } from "@/i18n/config";
import { adminRequest } from "./api";
import { ContentFields, type EditableValue } from "./fields";
import { ArticleEditor, ServiceEditor } from "./item-editor";

type Data = CollectionData[Collection];
type RecordItem = CmsRecord<Data>;
const emptyArticle = (): ArticleData => ({ slug: "", image: "06606.png", date: new Date().toISOString().slice(0, 10), translations: { de: { title: "", excerpt: "", category: "", body: [{ type: "paragraph", text: "" }] } } });
const emptyService = (): ServiceData => ({ slug: "", image: "760cb.png", priceCents: null, currency: "EUR", durationMinutes: null, order: 0, translations: { de: { title: "", description: "", details: [""] } } });
function title(record: RecordItem) { return "translations" in record.draft ? record.draft.translations.de.title || "Untitled" : localeNames[record.id as Locale]; }

export function ContentManager({ user, collection, onDirtyChange }: { user: User; collection: Collection; onDirtyChange: (dirty: boolean) => void }) {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [selected, setSelected] = useState<RecordItem | null>(null);
  const [draft, setDraft] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const dirty = Boolean(draft && JSON.stringify(draft) !== JSON.stringify(selected?.draft));
  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => {
    let active = true;
    adminRequest<RecordItem[]>(user, collection).then(records => { if (active) { setItems(records); setLoading(false); } }).catch(cause => { if (active) { setError(cause.message); setLoading(false); } });
    return () => { active = false; };
  }, [collection, user]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function choose(record: RecordItem | null) {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setSelected(record); setDraft(record ? structuredClone(record.draft) : collection === "articles" ? emptyArticle() : emptyService()); setNotice(""); setError("");
  }
  async function mutate(action: "save" | "publish" | "unpublish" | "delete") {
    if (!draft) return;
    if ((action === "delete" || action === "unpublish") && !window.confirm(action === "delete" ? "Permanently delete this draft?" : "Remove this item from the live website?")) return;
    const id = selected?.id ?? ("slug" in draft ? draft.slug : "");
    if (!id) { setError("Enter a URL slug first."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const result = await adminRequest<RecordItem | null>(user, `${collection}/${encodeURIComponent(id)}`, {
        method: "PUT", body: JSON.stringify({ action, version: selected?.version ?? 0, ...(action === "save" || action === "publish" ? { data: draft } : {}) }),
      });
      setItems(previous => result ? [result, ...previous.filter(item => item.id !== id)] : previous.filter(item => item.id !== id));
      setSelected(result); setDraft(result ? structuredClone(result.draft) : null);
      setNotice(action === "publish" ? "Published. The website now uses this version." : action === "save" ? "Draft saved. The live version has not changed." : action === "delete" ? "Draft deleted." : "Item unpublished.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save."); }
    finally { setBusy(false); }
  }
  async function reload() {
    if (dirty && !window.confirm("Discard unsaved changes and reload?")) return;
    setBusy(true); setError("");
    try { const records = await adminRequest<RecordItem[]>(user, collection); setItems(records); const latest = records.find(item => item.id === selected?.id) ?? null; setSelected(latest); setDraft(latest ? structuredClone(latest.draft) : null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to reload."); }
    finally { setBusy(false); }
  }
  return <div className="admin-manager"><aside className="admin-record-list"><div className="admin-list-actions"><button disabled={busy} onClick={reload}>Refresh</button>{collection !== "content" && <button disabled={busy} onClick={() => choose(null)}>+ New {collection === "articles" ? "article" : "service"}</button>}</div>
    {loading && <p>Loading…</p>}{!loading && !items.length && <p>No items yet.</p>}{items.map(record => <button disabled={busy} key={record.id} className="admin-record" aria-pressed={selected?.id === record.id} onClick={() => choose(record)}><strong>{title(record)}</strong><small>{record.published ? "Published" : "Draft"}{record.published && JSON.stringify(record.draft) !== JSON.stringify(record.published) ? " · unpublished changes" : ""}</small></button>)}
  </aside><section className="admin-editor">{error && <p className="admin-error" role="alert">{error}</p>}{notice && <p className="admin-notice" role="status">{notice}</p>}
    {draft ? <><div className="admin-editor-heading"><h2>{selected ? title(selected) : "New item"}</h2><span>{dirty ? "Unsaved changes" : "Saved"}</span></div><fieldset disabled={busy} className="admin-editor-fields">
      {collection === "content" ? <ContentFields value={draft as unknown as EditableValue} onChange={next => setDraft(next as unknown as ContentData)} /> : collection === "articles" ? <ArticleEditor value={draft as ArticleData} onChange={setDraft} existing={Boolean(selected)} /> : <ServiceEditor value={draft as ServiceData} onChange={setDraft} existing={Boolean(selected)} />}
    </fieldset><div className="admin-publish-actions"><button disabled={busy} onClick={() => mutate("save")}>Save draft</button><button disabled={busy} className="button" onClick={() => mutate("publish")}>{busy ? "Working…" : "Publish"}</button>{selected?.published && collection !== "content" && <button disabled={busy} onClick={() => mutate("unpublish")}>Unpublish</button>}{selected && !selected.published && collection !== "content" && <button disabled={busy} onClick={() => mutate("delete")}>Delete draft</button>}</div></>
      : <div className="admin-empty"><h2>Select an item to edit</h2><p>{collection === "content" ? "Choose a language, then open a section to edit its text. Publish when the translation is ready." : "Select an existing item or create a new one. German is required; English and Romanian are optional translations."}</p></div>}
  </section></div>;
}
