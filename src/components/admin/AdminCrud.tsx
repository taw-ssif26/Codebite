'use client';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type CrudField = {
  key: string; label: string; help?: string; required?: boolean;
  type: 'text' | 'textarea' | 'number' | 'select' | 'boolean' | 'datetime' | 'tags' | 'image' | 'file';
  options?: { value: string; label: string }[];
  bucket?: string; // image -> public bucket (stores URL); file -> private bucket (stores path)
  showIf?: (row: Row) => boolean;
};
type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const toLocal = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso); const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export function AdminCrud({ table, title, fields, orderBy, listTitle, listSub, defaults = {} }: {
  table: string; title: string; fields: CrudField[]; orderBy: { col: string; asc?: boolean };
  listTitle: (r: Row) => string; listSub?: (r: Row) => string; defaults?: Row;
}) {
  const sb = createClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [edit, setEdit] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await sb.from(table).select('*').order(orderBy.col, { ascending: orderBy.asc ?? true });
    if (error) setMsg(error.message);
    setRows(data ?? []); setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);
  useEffect(() => { load(); }, [load]);

  async function upload(f: CrudField, file: File) {
    setBusy(true); setMsg('');
    const path = `${Date.now()}-${file.name.replace(/[^\w.-]+/g, '_')}`;
    const { error } = await sb.storage.from(f.bucket!).upload(path, file, { upsert: false });
    setBusy(false);
    if (error) { setMsg(`Upload failed: ${error.message}`); return; }
    const value = f.type === 'image' ? sb.storage.from(f.bucket!).getPublicUrl(path).data.publicUrl : path;
    setEdit((p) => ({ ...p, [f.key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    setBusy(true); setMsg('');
    const payload: Row = {};
    for (const f of fields) {
      let v = edit[f.key];
      if (f.type === 'tags') v = Array.isArray(v) ? v : String(v ?? '').split(',').map((t) => t.trim()).filter(Boolean);
      if (f.type === 'number') v = Number(v ?? 0);
      if (f.type === 'datetime') v = v ? new Date(v).toISOString() : null;
      if (v === '' && (f.type === 'image' || f.type === 'file' || f.type === 'datetime')) v = null;
      payload[f.key] = v ?? (f.type === 'boolean' ? false : null);
    }
    const res = edit.id ? await sb.from(table).update(payload).eq('id', edit.id) : await sb.from(table).insert(payload);
    setBusy(false);
    if (res.error) { setMsg(res.error.message); return; }
    setEdit(null); setMsg('Saved.'); load();
  }

  async function remove(r: Row) {
    if (!confirm(`Delete "${listTitle(r)}"? This cannot be undone.`)) return;
    const { error } = await sb.from(table).delete().eq('id', r.id);
    if (error) setMsg(error.message); else { setMsg('Deleted.'); load(); }
  }

  const startEdit = (r: Row | null) => {
    setMsg('');
    if (!r) { setEdit({ ...defaults }); return; }
    const copy: Row = { ...r };
    fields.forEach((f) => {
      if (f.type === 'datetime') copy[f.key] = toLocal(r[f.key]);
      if (f.type === 'tags') copy[f.key] = (r[f.key] ?? []).join(', ');
    });
    setEdit(copy);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="display text-4xl">{title}</h1>
        <button className="btn-primary !py-2.5" onClick={() => startEdit(null)}>Add new</button>
      </div>
      {msg && <p role="status" className="mb-4 text-sm text-glacial">{msg}</p>}

      {edit && (
        <form onSubmit={save} className="glass mb-8 space-y-5 p-6">
          <p className="micro">{edit.id ? 'Editing' : 'New'}</p>
          {fields.filter((f) => !f.showIf || f.showIf(edit)).map((f) => (
            <div key={f.key}>
              <label className="micro mb-2 block">{f.label}{f.required ? ' *' : ''}</label>
              {f.type === 'text' && <input className="input" required={f.required} value={edit[f.key] ?? ''} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })} />}
              {f.type === 'textarea' && <textarea className="input min-h-28" required={f.required} value={edit[f.key] ?? ''} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })} />}
              {f.type === 'number' && <input type="number" className="input" value={edit[f.key] ?? 0} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })} />}
              {f.type === 'datetime' && <input type="datetime-local" className="input" value={edit[f.key] ?? ''} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })} />}
              {f.type === 'tags' && <input className="input" placeholder="comma, separated" value={edit[f.key] ?? ''} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })} />}
              {f.type === 'select' && (
                <select className="input" value={edit[f.key] ?? ''} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })}>
                  {f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              )}
              {f.type === 'boolean' && (
                <button type="button" role="switch" aria-checked={Boolean(edit[f.key])} onClick={() => setEdit({ ...edit, [f.key]: !edit[f.key] })}
                  className={`relative h-7 w-12 rounded-full transition ${edit[f.key] ? 'bg-ember' : 'bg-white/15'}`}>
                  <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-snow transition-all ${edit[f.key] ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              )}
              {(f.type === 'image' || f.type === 'file') && (
                <div className="space-y-2">
                  {f.type === 'image' && edit[f.key] && /* eslint-disable-next-line @next/next/no-img-element */ <img src={edit[f.key]} alt="" className="h-24 w-24 rounded-xl object-cover" />}
                  {f.type === 'file' && edit[f.key] && <p className="tnum text-sm text-silver">{edit[f.key]}</p>}
                  <input type="file" accept={f.type === 'image' ? 'image/*' : undefined} onChange={(e) => e.target.files?.[0] && upload(f, e.target.files[0])} className="block text-sm text-silver" />
                </div>
              )}
              {f.help && <p className="mt-1 text-xs text-silver">{f.help}</p>}
            </div>
          ))}
          <div className="flex gap-3">
            <button className="btn-primary" disabled={busy}>{busy ? 'Working…' : 'Save'}</button>
            <button type="button" className="btn-ghost" onClick={() => setEdit(null)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <p className="text-silver">Loading…</p> : rows.length === 0 ? <p className="text-silver">Nothing here yet. Use “Add new”.</p> : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="glass flex items-center justify-between gap-4 p-4">
              <div className="min-w-0"><p className="truncate font-semibold">{listTitle(r)}</p>{listSub && <p className="truncate text-sm text-silver">{listSub(r)}</p>}</div>
              <div className="flex shrink-0 gap-2">
                <button className="btn-ghost !px-4 !py-1.5 text-sm" onClick={() => startEdit(r)}>Edit</button>
                <button className="btn-ghost !px-4 !py-1.5 text-sm" onClick={() => remove(r)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
