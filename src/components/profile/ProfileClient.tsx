'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { createClient } from '@/lib/supabase/client';
import { EXPERIENCE, FIELDS, GRADES } from '@/lib/constants';
import type { Student } from '@/lib/types';
import { PhotoCropper } from '@/components/register/PhotoCropper';
import { TicketFace, TiltTicket, type TicketData } from './Ticket';

async function toDataUrl(url: string): Promise<string> {
  const blob = await (await fetch(url)).blob();
  return new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(blob); });
}

export function ProfileClient({ student, photoUrl }: { student: Student; photoUrl: string | null }) {
  const router = useRouter();
  const [s, setS] = useState(student);
  const [photo, setPhoto] = useState<string | null>(null);
  const [qr, setQr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [newPhoto, setNewPhoto] = useState<Blob | null>(null);
  const [editing, setEditing] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (photoUrl) toDataUrl(photoUrl).then(setPhoto).catch(() => setPhoto(photoUrl)); }, [photoUrl]);
  useEffect(() => {
    QRCode.toDataURL(`${location.origin}/pass/${s.student_code}`, { margin: 1, width: 320, color: { dark: '#070B10', light: '#FFFFFF' } }).then(setQr);
  }, [s.student_code]);

  const d: TicketData = { name: s.full_name, institution: s.institution, grade: s.grade, code: s.student_code, photo, qr };

  async function exportPng() {
    const { toPng } = await import('html-to-image');
    return toPng(exportRef.current!, { pixelRatio: 3, cacheBust: true });
  }
  async function downloadPng() {
    const url = await exportPng();
    const a = document.createElement('a'); a.href = url; a.download = `${s.student_code}-pass.png`; a.click();
  }
  async function downloadPdf() {
    const url = await exportPng();
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [360, 560] });
    pdf.addImage(url, 'PNG', 0, 0, 360, 560);
    pdf.save(`${s.student_code}-pass.pdf`);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg('');
    const sb = createClient();
    if (newPhoto) {
      const up = await sb.storage.from('student-photos').upload(`${s.user_id}/photo.jpg`, newPhoto, { upsert: true, contentType: 'image/jpeg' });
      if (up.error) { setBusy(false); setMsg(`Photo upload failed: ${up.error.message}`); return; }
      setPhoto(URL.createObjectURL(newPhoto));
    }
    const { error } = await sb.from('students').update({
      full_name: s.full_name.trim(), phone: s.phone.trim(), institution: s.institution.trim(), address: s.address.trim(),
      grade: s.grade, experience: s.experience, preferred_field: s.preferred_field || null,
    }).eq('user_id', s.user_id);
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    setMsg('Saved.'); setNewPhoto(null); setEditing(false);
    if (newPhoto) { const url = URL.createObjectURL(newPhoto); toDataUrl(url).then(setPhoto); }
  }

  async function signOut() { await createClient().auth.signOut(); router.push('/'); router.refresh(); }
  const up = (k: keyof Student, v: string) => setS((p) => ({ ...p, [k]: v }));

  return (
    <div className="grid gap-12 lg:grid-cols-[360px_1fr]">
      <div className="space-y-5">
        <TiltTicket d={d} />
        <div className="flex flex-wrap justify-center gap-3">
          <button className="btn-primary !py-2.5" onClick={downloadPng} disabled={!qr}>Download PNG</button>
          <button className="btn-ghost" onClick={downloadPdf} disabled={!qr}>Download PDF</button>
        </div>
        {/* Off-screen flat copy used for pixel-perfect exports (3D transforms don't rasterise reliably). */}
        <div style={{ position: 'fixed', left: -10000, top: 0 }} aria-hidden><TicketFace ref={exportRef} d={d} /></div>
      </div>

      <div className="glass p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="display text-3xl">Your details</h2>
          {!editing && <button className="btn-ghost !py-2" onClick={() => setEditing(true)}>Edit</button>}
        </div>
        <form onSubmit={save} className="space-y-5">
          <fieldset disabled={!editing} className="space-y-5 disabled:opacity-80">
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label className="micro mb-2 block">Full name</label><input className="input" value={s.full_name} onChange={(e) => up('full_name', e.target.value)} required /></div>
              <div><label className="micro mb-2 block">Phone</label><input className="input" value={s.phone} onChange={(e) => up('phone', e.target.value)} required /></div>
              <div><label className="micro mb-2 block">Email (cannot be changed)</label><input className="input" value={s.email} readOnly /></div>
              <div><label className="micro mb-2 block">Institution</label><input className="input" value={s.institution} onChange={(e) => up('institution', e.target.value)} required /></div>
              <div><label className="micro mb-2 block">Level</label>
                <select className="input" value={s.grade} onChange={(e) => up('grade', e.target.value)}>{GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select></div>
              <div><label className="micro mb-2 block">Coding experience</label>
                <select className="input" value={s.experience} onChange={(e) => up('experience', e.target.value)}>{EXPERIENCE.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select></div>
              <div className="sm:col-span-2"><label className="micro mb-2 block">Preferred field</label>
                <select className="input" value={s.preferred_field ?? ''} onChange={(e) => up('preferred_field', e.target.value)}><option value="">No preference</option>{FIELDS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select></div>
              <div className="sm:col-span-2"><label className="micro mb-2 block">Address</label><textarea className="input min-h-24" value={s.address} onChange={(e) => up('address', e.target.value)} required /></div>
            </div>
            {editing && <div><p className="micro mb-3">Update photo (optional)</p><PhotoCropper onChange={setNewPhoto} initialUrl={photo} /></div>}
          </fieldset>
          {editing && (
            <div className="flex gap-3">
              <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
              <button type="button" className="btn-ghost" onClick={() => { setS(student); setEditing(false); setNewPhoto(null); }}>Cancel</button>
            </div>
          )}
          {msg && <p role="status" className="text-sm text-glacial">{msg}</p>}
        </form>
        <hr className="my-8 border-white/10" />
        <button className="btn-ghost" onClick={signOut}>Log out</button>
      </div>
    </div>
  );
}
