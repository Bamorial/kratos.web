"use client";
import { useEffect, useRef, useState } from "react";
import type { User } from "firebase/auth";
import type { ArticleData, CmsRecord, Collection, CollectionData, ContentData, ServiceData } from "@/cms/models";
import { localeNames, type Locale } from "@/i18n/config";
import { adminRequest } from "./api";
import { ContentFields, type EditableValue } from "./fields";
import { ArticleEditor, ServiceEditor } from "./item-editor";
import { Icon } from "./icons";

type Data = CollectionData[Collection];
type RecordItem = CmsRecord<Data>;
type Action = "save" | "publish" | "unpublish" | "delete";
const emptyArticle = (): ArticleData => ({ slug: "", image: "06606.png", date: new Date().toISOString().slice(0, 10), translations: { de: { title: "", excerpt: "", category: "", body: [{ type: "paragraph", text: "" }] } } });
const emptyService = (): ServiceData => ({ slug: "", image: "760cb.png", priceCents: null, currency: "EUR", durationMinutes: null, order: 0, translations: { de: { title: "", description: "", details: [""] } } });
function title(record: RecordItem) { return "translations" in record.draft ? record.draft.translations.de.title || "Untitled" : localeNames[record.id as Locale]; }
function hasPendingChanges(record: RecordItem) { return Boolean(record.published && JSON.stringify(record.draft) !== JSON.stringify(record.published)); }
const pendingLabels: Record<Action, string> = { save: "Saving…", publish: "Publishing…", unpublish: "Unpublishing…", delete: "Deleting…" };

function StatusBadges({ record }: { record: RecordItem }) {
  return <span className="admin-badges">{record.published ? <span className="admin-badge admin-badge-success">Published</span> : <span className="admin-badge">Draft</span>}{hasPendingChanges(record) && <span className="admin-badge admin-badge-warning">Unpublished changes</span>}</span>;
}

export function ContentManager({ user, collection, onDirtyChange }: { user: User; collection: Collection; onDirtyChange: (dirty: boolean) => void }) {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [selected, setSelected] = useState<RecordItem | null>(null);
  const [draft, setDraft] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState<Action | "reload" | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const editorRef = useRef<HTMLElement>(null);
  const busy = pending !== null;
  const dirty = Boolean(draft && JSON.stringify(draft) !== JSON.stringify(selected?.draft));
  const noun = collection === "articles" ? "article" : "service";
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
  // Ctrl/Cmd + S saves the current draft.
  const saveShortcut = useRef<() => void>(() => {});
  useEffect(() => { saveShortcut.current = () => { if (draft && dirty && !busy) void mutate("save"); }; });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") { event.preventDefault(); saveShortcut.current(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  function choose(record: RecordItem | null) {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setSelected(record); setDraft(record ? structuredClone(record.draft) : collection === "articles" ? emptyArticle() : emptyService()); setNotice(""); setError("");
    // On phones the list is replaced by the editor, so bring its top into view.
    if (window.matchMedia("(max-width: 900px)").matches) requestAnimationFrame(() => editorRef.current?.scrollIntoView({ block: "start" }));
  }
  function close() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setSelected(null); setDraft(null); setNotice(""); setError("");
  }
  async function mutate(action: Action) {
    if (!draft) return;
    if ((action === "delete" || action === "unpublish") && !window.confirm(action === "delete" ? "Permanently delete this draft?" : "Remove this item from the live website?")) return;
    const id = selected?.id ?? ("slug" in draft ? draft.slug : "");
    if (!id) { setError("Enter a URL slug first."); return; }
    setPending(action); setError(""); setNotice("");
    try {
      const result = await adminRequest<RecordItem | null>(user, `${collection}/${encodeURIComponent(id)}`, {
        method: "PUT", body: JSON.stringify({ action, version: selected?.version ?? 0, ...(action === "save" || action === "publish" ? { data: draft } : {}) }),
      });
      setItems(previous => result ? [result, ...previous.filter(item => item.id !== id)] : previous.filter(item => item.id !== id));
      setSelected(result); setDraft(result ? structuredClone(result.draft) : null);
      setNotice(action === "publish" ? "Published. The website now uses this version." : action === "save" ? "Draft saved. The live version has not changed." : action === "delete" ? "Draft deleted." : "Item unpublished.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save."); }
    finally { setPending(null); }
  }
  async function reload() {
    if (dirty && !window.confirm("Discard unsaved changes and reload?")) return;
    setPending("reload"); setError("");
    try { const records = await adminRequest<RecordItem[]>(user, collection); setItems(records); const latest = records.find(item => item.id === selected?.id) ?? null; setSelected(latest); setDraft(latest ? structuredClone(latest.draft) : null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to reload."); }
    finally { setPending(null); }
  }
  const visible = items.filter(record => !query || title(record).toLowerCase().includes(query.trim().toLowerCase()));
  const banners = <>{error && <p className="admin-banner admin-banner-error" role="alert"><Icon name="alert" />{error}</p>}{notice && <p className="admin-banner admin-banner-success" role="status"><Icon name="check" /><span>{notice}</span><button type="button" className="admin-icon-btn" aria-label="Dismiss" onClick={() => setNotice("")}><Icon name="close" size={16} /></button></p>}</>;
  return <div className="admin-manager" data-view={draft ? "editor" : "list"}>
    <aside className="admin-record-list admin-card" aria-label="Items">
      <div className="admin-list-header"><span className="admin-list-count">{loading ? "Loading…" : `${items.length} ${collection === "content" ? (items.length === 1 ? "language" : "languages") : items.length === 1 ? noun : `${noun}s`}`}</span>
        <div className="admin-list-actions"><button type="button" className="admin-icon-btn" aria-label="Refresh" title="Refresh" disabled={busy} onClick={reload}><Icon name="refresh" /></button>{collection !== "content" && <button type="button" className="admin-btn admin-btn-primary admin-btn-sm" disabled={busy} onClick={() => choose(null)}><Icon name="plus" size={16} />New {noun}</button>}</div></div>
      {items.length > 5 && <label className="admin-search"><span className="sr-only">Search {noun}s</span><Icon name="search" size={16} /><input type="search" placeholder={`Search ${noun}s`} value={query} onChange={event => setQuery(event.target.value)} /></label>}
      {!draft && <div className="admin-list-banners">{banners}</div>}
      <div className="admin-records">
        {loading && [0, 1, 2].map(index => <span key={index} className="admin-skeleton" aria-hidden="true" />)}
        {!loading && !items.length && <p className="admin-muted">No items yet.</p>}
        {!loading && items.length > 0 && !visible.length && <p className="admin-muted">No matches for “{query}”.</p>}
        {visible.map(record => <button type="button" disabled={busy} key={record.id} className="admin-record" aria-pressed={selected?.id === record.id} onClick={() => choose(record)}><strong>{title(record)}</strong><StatusBadges record={record} /><Icon name="chevron" size={16} /></button>)}
      </div>
    </aside>
    <section className="admin-editor admin-card" ref={editorRef} aria-label="Editor">
      {draft ? <>
        <header className="admin-editor-heading">
          <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm admin-editor-back" onClick={close}><Icon name="back" size={16} />All {collection === "content" ? "languages" : `${noun}s`}</button>
          <div className="admin-editor-title"><h2>{selected ? title(selected) : `New ${noun}`}</h2>{selected && <StatusBadges record={selected} />}</div>
          <span className={`admin-save-state${dirty ? " is-dirty" : ""}`} role="status"><span aria-hidden="true" />{dirty ? "Unsaved changes" : selected ? "All changes saved" : "Not saved yet"}</span>
        </header>
        {banners}
        <fieldset disabled={busy} className="admin-editor-fields">
          {collection === "content" ? <ContentFields value={draft as unknown as EditableValue} onChange={next => setDraft(next as unknown as ContentData)} /> : collection === "articles" ? <ArticleEditor value={draft as ArticleData} onChange={setDraft} existing={Boolean(selected)} /> : <ServiceEditor value={draft as ServiceData} onChange={setDraft} existing={Boolean(selected)} />}
        </fieldset>
        <div className="admin-publish-actions">
          <div className="admin-publish-secondary">{selected?.published && collection !== "content" && <button type="button" className="admin-btn admin-btn-danger-ghost" disabled={busy} onClick={() => mutate("unpublish")}>{pending === "unpublish" ? pendingLabels.unpublish : "Unpublish"}</button>}{selected && !selected.published && collection !== "content" && <button type="button" className="admin-btn admin-btn-danger-ghost" disabled={busy} onClick={() => mutate("delete")}><Icon name="trash" size={16} />{pending === "delete" ? pendingLabels.delete : "Delete draft"}</button>}</div>
          <div className="admin-publish-primary"><button type="button" className="admin-btn" disabled={busy || (!dirty && Boolean(selected))} onClick={() => mutate("save")} title="Ctrl/⌘ + S">{pending === "save" ? pendingLabels.save : "Save draft"}</button><button type="button" className="admin-btn admin-btn-primary" disabled={busy} onClick={() => mutate("publish")}>{pending === "publish" ? pendingLabels.publish : "Publish"}</button></div>
        </div>
      </> : <div className="admin-empty"><span className="admin-empty-icon"><Icon name={collection === "content" ? "text" : collection === "articles" ? "article" : "tag"} size={26} /></span><h2>Select an item to edit</h2><p>{collection === "content" ? "Choose a language, then open a section to edit its text. Publish when the translation is ready." : "Select an existing item or create a new one. German is required; English and Romanian are optional translations."}</p></div>}
    </section>
  </div>;
}
