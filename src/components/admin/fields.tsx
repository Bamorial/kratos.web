"use client";
import { useId } from "react";

export type EditableValue = string | number | boolean | null | EditableValue[] | { [key: string]: EditableValue };
export function fieldLabel(value: string) { return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, first => first.toUpperCase()); }

export function TextField({ label, value, onChange, multiline = false, ...props }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; type?: string; disabled?: boolean }) {
  const id = useId();
  return <label htmlFor={id}>{label}{multiline ? <textarea id={id} value={value} onChange={event => onChange(event.target.value)} rows={value.length > 250 ? 6 : 3} /> : <input id={id} value={value} onChange={event => onChange(event.target.value)} {...props} />}</label>;
}

// One recursive editor for structured page copy; storage and publishing remain elsewhere.
export function ContentFields({ value, onChange, name = "Content" }: { value: EditableValue; onChange: (value: EditableValue) => void; name?: string }) {
  if (typeof value === "string") {
    if (name === "type" || (name === "language" && ["de", "en", "ro"].includes(value))) return <label>{fieldLabel(name)}<select value={value} onChange={event => onChange(event.target.value)}>{(name === "type" ? ["paragraph", "heading", "list"] : ["de", "en", "ro"]).map(option => <option key={option}>{option}</option>)}</select></label>;
    return <TextField label={fieldLabel(name)} value={value} onChange={onChange} multiline={value.length > 90 || ["text", "description", "message", "answer"].includes(name)} />;
  }
  if (Array.isArray(value)) return <fieldset className="admin-array"><legend>{fieldLabel(name)}</legend>{value.map((child, index) => <div className="admin-array-item" key={index}>
    <ContentFields name={`${name} ${index + 1}`} value={child} onChange={next => onChange(value.map((item, i) => i === index ? next : item))} />
    <div className="admin-inline-actions"><button type="button" disabled={index === 0} onClick={() => { const next = [...value]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next); }}>Move up</button><button type="button" disabled={value.length <= 1} onClick={() => onChange(value.filter((_, i) => i !== index))}>Remove</button></div>
  </div>)}<button type="button" onClick={() => onChange([...value, structuredClone(value[0] ?? "")])}>Add item</button></fieldset>;
  if (value && typeof value === "object") return <div className="admin-fields">{Object.entries(value).map(([key, child]) => typeof child === "object" && child !== null && !Array.isArray(child)
    ? <details key={key} className="admin-group"><summary>{fieldLabel(key)}</summary><ContentFields value={child} name={key} onChange={next => onChange({ ...value, [key]: next })} /></details>
    : <ContentFields key={key} name={key} value={child} onChange={next => onChange({ ...value, [key]: next })} />)}</div>;
  return null;
}
