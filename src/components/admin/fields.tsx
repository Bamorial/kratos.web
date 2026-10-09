"use client";
import { useId, type ReactNode } from "react";
import { Icon } from "./icons";

export type EditableValue = string | number | boolean | null | EditableValue[] | { [key: string]: EditableValue };
export function fieldLabel(value: string) { return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, first => first.toUpperCase()); }

export function TextField({ label, value, onChange, multiline = false, hint, ...props }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; hint?: ReactNode; type?: string; disabled?: boolean; placeholder?: string }) {
  const id = useId();
  return <label htmlFor={id}>{label}{multiline ? <textarea id={id} value={value} onChange={event => onChange(event.target.value)} rows={value.length > 250 ? 6 : 3} aria-describedby={hint ? `${id}-hint` : undefined} /> : <input id={id} value={value} onChange={event => onChange(event.target.value)} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />}{hint && <small id={`${id}-hint`} className="admin-hint">{hint}</small>}</label>;
}

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className="admin-form-section"><header><h3>{title}</h3>{description && <p>{description}</p>}</header>{children}</section>;
}

function move<T>(list: T[], from: number, to: number) { const next = [...list]; [next[from], next[to]] = [next[to], next[from]]; return next; }

// One recursive editor for structured page copy; storage and publishing remain elsewhere.
export function ContentFields({ value, onChange, name = "Content" }: { value: EditableValue; onChange: (value: EditableValue) => void; name?: string }) {
  if (typeof value === "string") {
    if (name === "type" || (name === "language" && ["de", "en", "ro"].includes(value))) return <label>{fieldLabel(name)}<select value={value} onChange={event => onChange(event.target.value)}>{(name === "type" ? ["paragraph", "heading", "list"] : ["de", "en", "ro"]).map(option => <option key={option}>{option}</option>)}</select></label>;
    return <TextField label={fieldLabel(name)} value={value} onChange={onChange} multiline={value.length > 90 || ["text", "description", "message", "answer"].includes(name)} />;
  }
  if (Array.isArray(value)) return <fieldset className="admin-array"><legend>{fieldLabel(name)} <span className="admin-count">{value.length}</span></legend>{value.map((child, index) => <div className="admin-array-item" key={index}>
    <div className="admin-array-item-header"><span className="admin-array-index">{index + 1}</span><div className="admin-inline-actions">
      <button type="button" className="admin-icon-btn" aria-label={`Move ${fieldLabel(name)} ${index + 1} up`} title="Move up" disabled={index === 0} onClick={() => onChange(move(value, index, index - 1))}><Icon name="up" size={16} /></button>
      <button type="button" className="admin-icon-btn" aria-label={`Move ${fieldLabel(name)} ${index + 1} down`} title="Move down" disabled={index === value.length - 1} onClick={() => onChange(move(value, index, index + 1))}><Icon name="down" size={16} /></button>
      <button type="button" className="admin-icon-btn admin-icon-btn-danger" aria-label={`Remove ${fieldLabel(name)} ${index + 1}`} title="Remove" disabled={value.length <= 1} onClick={() => onChange(value.filter((_, i) => i !== index))}><Icon name="trash" size={16} /></button>
    </div></div>
    <ContentFields name={`${name} ${index + 1}`} value={child} onChange={next => onChange(value.map((item, i) => i === index ? next : item))} />
  </div>)}<button type="button" className="admin-btn admin-btn-dashed" onClick={() => onChange([...value, structuredClone(value[0] ?? "")])}><Icon name="plus" size={16} />Add item</button></fieldset>;
  if (value && typeof value === "object") return <div className="admin-fields">{Object.entries(value).map(([key, child]) => typeof child === "object" && child !== null && !Array.isArray(child)
    ? <details key={key} className="admin-group"><summary><span>{fieldLabel(key)}</span><Icon name="chevron" size={16} /></summary><div className="admin-group-body"><ContentFields value={child} name={key} onChange={next => onChange({ ...value, [key]: next })} /></div></details>
    : <ContentFields key={key} name={key} value={child} onChange={next => onChange({ ...value, [key]: next })} />)}</div>;
  return null;
}
