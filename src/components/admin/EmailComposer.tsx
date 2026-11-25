'use client';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { sendBroadcast } from '@/app/actions/email';
import { EXPERIENCE, GRADES } from '@/lib/constants';
import { renderBodyHtml, renderText, TEMPLATE_VARS } from '@/lib/email';

type Tpl = { id: string; name: string; subject: string; body: string };
const SAMPLE = { name: 'Aisha Rahman', grade: 'College: HSC / A-Levels', institution: 'Sample College', student_id: 'CB1-A7K2', preferred_field: 'Web Development', profile_url: 'https://example.com/pass/CB1-A7K2' };

export function EmailComposer() {
  const sb = createClient();
  const [tpls, setTpls] = useState<Tpl[]>([]);
  const [id, setId] = useState<string>('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [grade, setGrade] = useState('');
  const [exp, setExp] = useState('');
  const [count, setCount] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const loadTpls = async () => { const { data } = await sb.from('email_templates').select('*').order('created_at'); setTpls((data as Tpl[]) ?? []); };
  useEffect(() => { loadTpls(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  useEffect(() => {
    let q = sb.from('students').select('id', { count: 'exact', head: true }).not('verified_at', 'is', null);
    if (grade) q = q.eq('grade', grade);
    if (exp) q = q.eq('experience', exp);
    q.then(({ count }) => setCount(count ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grade, exp]);

  function pick(tid: string) {
    setId(tid);
    const t = tpls.find((x) => x.id === tid);
    if (t) { setName(t.name); setSubject(t.subject); setBody(t.body); } else { setName(''); setSubject(''); setBody(''); }
  }
  function insertVar(v: string) {
    const el = bodyRef.current; const token = `{{${v}}}`;
    if (!el) { setBody((b) => b + token); return; }
    const s = el.selectionStart, e = el.selectionEnd;
    setBody(body.slice(0, s) + token + body.slice(e));
    requestAnimationFrame(() => { el.focus(); el.selectionStart = el.selectionEnd = s + token.length; });
  }
  async function saveTpl() {
    if (!name.trim() || !subject.trim() || !body.trim()) { setMsg('Give the template a name, subject and body.'); return; }
    const payload = { name: name.trim(), subject, body };
    const res = id ? await sb.from('email_templates').update(payload).eq('id', id) : await sb.from('email_templates').insert(payload).select().single();
    if (res.error) { setMsg(res.error.message); return; }
    setMsg('Template saved.'); await loadTpls();
    if (!id && res.data) setId((res.data as Tpl).id);
  }
  async function delTpl() {
    if (!id || !confirm('Delete this template?')) return;
    await sb.from('email_templates').delete().eq('id', id); setId(''); setName(''); setSubject(''); setBody(''); loadTpls();
  }
  async function send() {
    if (!subject.trim() || !body.trim()) { setMsg('Subject and body are required.'); return; }
    if (!count) { setMsg('No students match that filter.'); return; }
    if (!confirm(`Send this email to ${count} student${count === 1 ? '' : 's'}? This cannot be undone.`)) return;
    setBusy(true); setMsg('Sending…');
    const r = await sendBroadcast({ subject, body, grade: grade || undefined, experience: exp || undefined });
    setBusy(false);
    setMsg(r.ok ? `Sent to ${r.sent} students.` : `${r.sent ?? 0} sent, ${r.failed ?? 0} failed. ${r.error ?? ''}`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-5">
        <h1 className="display text-4xl">Email broadcast</h1>
        <div>
          <label className="micro mb-2 block">Template</label>
          <select className="input" value={id} onChange={(e) => pick(e.target.value)}>
            <option value="">New template</option>{tpls.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div><label className="micro mb-2 block">Template name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="micro mb-2 block">Subject</label><input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
        <div>
          <label className="micro mb-2 block">Body (plain text; blank line = new paragraph)</label>
          <textarea ref={bodyRef} className="input min-h-56" value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="mt-2 flex flex-wrap gap-2">
            {TEMPLATE_VARS.map((v) => <button key={v} type="button" onClick={() => insertVar(v)} className="tnum rounded-full border border-white/15 px-3 py-1 text-xs hover:bg-white/5">{`{{${v}}}`}</button>)}
          </div>
        </div>
        <div className="flex gap-3"><button type="button" className="btn-ghost" onClick={saveTpl}>Save template</button>{id && <button type="button" className="btn-ghost" onClick={delTpl}>Delete template</button>}</div>

        <div className="glass space-y-4 p-5">
          <p className="micro">Recipients (verified students only)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="input" value={grade} onChange={(e) => setGrade(e.target.value)} aria-label="Level"><option value="">All levels</option>{GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select>
            <select className="input" value={exp} onChange={(e) => setExp(e.target.value)} aria-label="Experience"><option value="">All experience</option>{EXPERIENCE.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select>
          </div>
          <p className="tnum text-glacial">{count === null ? '…' : count} recipients</p>
          <button className="btn-primary" onClick={send} disabled={busy}>{busy ? 'Sending…' : 'Send to recipients'}</button>
        </div>
        {msg && <p role="status" className="text-sm text-glacial">{msg}</p>}
      </div>

      <div>
        <p className="micro mb-3">Preview (sample student)</p>
        <div className="rounded-2xl bg-obsidian p-6">
          <p className="mb-4 text-sm text-silver">Subject: <span className="text-snow">{renderText(subject, SAMPLE) || '—'}</span></p>
          <div className="text-sm text-snow" dangerouslySetInnerHTML={{ __html: renderBodyHtml(body || 'Your message appears here.', SAMPLE) }} />
        </div>
      </div>
    </div>
  );
}
