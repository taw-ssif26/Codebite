'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_SETTINGS } from '@/lib/defaults';
import { hexToChannels, THEME_TOKENS } from '@/lib/theme';

export type SettingField = { key: string; label: string; type: 'text' | 'textarea' | 'datetime' | 'color'; help?: string };
const toLocal = (iso: string) => {
  const d = new Date(iso); if (isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export function SettingsForm({ title, fields, live }: { title: string; fields: SettingField[]; live?: boolean }) {
  const sb = createClient();
  const [vals, setVals] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    sb.from('site_settings').select('key,value').then(({ data }) => {
      const m: Record<string, string> = {};
      fields.forEach((f) => { m[f.key] = DEFAULT_SETTINGS[f.key] ?? ''; });
      (data ?? []).forEach((r: { key: string; value: unknown }) => { if (m[r.key] !== undefined && typeof r.value === 'string' && r.value) m[r.key] = r.value; });
      setVals(m);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(f: SettingField, v: string) {
    setVals((p) => ({ ...p, [f.key]: v }));
    if (live) {
      const t = THEME_TOKENS.find((x) => x.key === f.key); const ch = hexToChannels(v);
      if (t && ch) document.documentElement.style.setProperty(t.css, ch); // live preview
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('');
    const rows = fields.map((f) => ({
      key: f.key, updated_at: new Date().toISOString(),
      value: f.type === 'datetime' ? new Date(vals[f.key]).toISOString() : vals[f.key],
    }));
    const { error } = await sb.from('site_settings').upsert(rows);
    setBusy(false); setMsg(error ? error.message : 'Saved. The public site now uses these values.');
  }

  function reset() { fields.forEach((f) => set(f, DEFAULT_SETTINGS[f.key] ?? '')); }

  if (!Object.keys(vals).length) return <p className="text-silver">Loading…</p>;
  return (
    <form onSubmit={save} className="space-y-6">
      <h1 className="display text-4xl">{title}</h1>
      {fields.map((f) => (
        <div key={f.key}>
          <label className="micro mb-2 block">{f.label}</label>
          {f.type === 'text' && <input className="input" value={vals[f.key]} onChange={(e) => set(f, e.target.value)} />}
          {f.type === 'textarea' && <textarea className="input min-h-32" value={vals[f.key]} onChange={(e) => set(f, e.target.value)} />}
          {f.type === 'datetime' && <input type="datetime-local" className="input" value={toLocal(vals[f.key])} onChange={(e) => set(f, e.target.value)} />}
          {f.type === 'color' && (
            <div className="flex items-center gap-3">
              <input type="color" value={hexToChannels(vals[f.key]) ? vals[f.key] : '#000000'} onChange={(e) => set(f, e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-white/15 bg-transparent" />
              <input className="input tnum max-w-[9rem]" value={vals[f.key]} onChange={(e) => set(f, e.target.value)} />
            </div>
          )}
          {f.help && <p className="mt-1 text-xs text-silver">{f.help}</p>}
        </div>
      ))}
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
        {live && <button type="button" className="btn-ghost" onClick={reset}>Reset to defaults</button>}
      </div>
      {msg && <p role="status" className="text-sm text-glacial">{msg}</p>}
    </form>
  );
}
