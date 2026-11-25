'use client';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EXPERIENCE, GRADES, experienceLabel, fieldLabel, gradeLabel } from '@/lib/constants';
import type { Student } from '@/lib/types';

const download = (blob: Blob, name: string) => {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href);
};

export function StudentsTable() {
  const sb = createClient();
  const [rows, setRows] = useState<Student[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [q, setQ] = useState(''); const [grade, setGrade] = useState(''); const [exp, setExp] = useState('');
  const [loading, setLoading] = useState(true); const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      const all: Student[] = [];
      for (let from = 0; ; from += 1000) { // PostgREST caps responses at 1000 rows
        const { data, error } = await sb.from('students').select('*').order('created_at', { ascending: false }).range(from, from + 999);
        if (error) { setErr(error.message); break; }
        all.push(...((data as Student[]) ?? []));
        if (!data || data.length < 1000) break;
      }
      setRows(all); setLoading(false);
      const paths = all.map((s) => s.photo_path).filter((p): p is string => Boolean(p)).slice(0, 500);
      if (paths.length) {
        const { data } = await sb.storage.from('student-photos').createSignedUrls(paths, 3600);
        const m: Record<string, string> = {};
        data?.forEach((d) => { if (d.path && d.signedUrl) m[d.path] = d.signedUrl; });
        setThumbs(m);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = useMemo(() => rows.filter((s) =>
    (!grade || s.grade === grade) && (!exp || s.experience === exp) &&
    (!q || `${s.full_name} ${s.email} ${s.institution} ${s.student_code} ${s.phone}`.toLowerCase().includes(q.toLowerCase()))), [rows, q, grade, exp]);

  const flat = () => shown.map((s) => ({
    'Student ID': s.student_code, Name: s.full_name, Phone: s.phone, Email: s.email, Level: gradeLabel(s.grade),
    Institution: s.institution, Address: s.address, Experience: experienceLabel(s.experience),
    'Preferred field': fieldLabel(s.preferred_field), Verified: s.verified_at ? 'Yes' : 'No', 'Registered at': s.created_at,
  }));

  async function exportXlsx() {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(flat());
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'codebite-students.xlsx');
  }
  function exportCsv() {
    const data = flat(); if (!data.length) return;
    const cols = Object.keys(data[0]);
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [cols.map(esc).join(','), ...data.map((r) => cols.map((c) => esc((r as Record<string, unknown>)[c])).join(','))].join('\r\n');
    download(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }), 'codebite-students.csv'); // BOM keeps UTF-8 intact in Excel/Sheets
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="display text-4xl">Students</h1><p className="micro tnum mt-2">{shown.length} of {rows.length} shown</p></div>
        <div className="flex gap-3">
          <button className="btn-primary !py-2.5" onClick={exportXlsx} disabled={!shown.length}>Export to Excel (.xlsx)</button>
          <button className="btn-ghost" onClick={exportCsv} disabled={!shown.length}>Export CSV (Sheets-ready)</button>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="Search name, email, ID, school…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search students" />
        <select className="input max-w-[14rem]" value={grade} onChange={(e) => setGrade(e.target.value)} aria-label="Level"><option value="">All levels</option>{GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select>
        <select className="input max-w-[12rem]" value={exp} onChange={(e) => setExp(e.target.value)} aria-label="Experience"><option value="">All experience</option>{EXPERIENCE.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select>
      </div>
      {err && <p role="alert" className="mb-4 text-sunlight">{err}</p>}
      {loading ? <p className="text-silver">Loading…</p> : (
        <div className="glass overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead><tr className="micro border-b border-white/10">{['', 'ID', 'Name', 'Contact', 'Level', 'Institution', 'Experience', 'Status'].map((h) => <th key={h} className="px-4 py-3 font-normal">{h}</th>)}</tr></thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s.id} className="border-b border-white/5 align-top">
                  <td className="px-4 py-3">{s.photo_path && thumbs[s.photo_path] /* eslint-disable-next-line @next/next/no-img-element */ ? <img src={thumbs[s.photo_path]} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-white/10" />}</td>
                  <td className="tnum px-4 py-3 text-glacial">{s.student_code}</td>
                  <td className="px-4 py-3 font-medium">{s.full_name}</td>
                  <td className="px-4 py-3 text-silver">{s.email}<br />{s.phone}</td>
                  <td className="px-4 py-3">{gradeLabel(s.grade)}</td>
                  <td className="px-4 py-3">{s.institution}</td>
                  <td className="px-4 py-3">{experienceLabel(s.experience)}{s.preferred_field ? <><br /><span className="text-silver">{fieldLabel(s.preferred_field)}</span></> : null}</td>
                  <td className="px-4 py-3"><span className="micro inline-flex items-center gap-2 !text-verdant"><span className="h-1.5 w-1.5 rounded-full bg-verdant" />{s.verified_at ? 'Verified' : 'Pending'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && <p className="p-6 text-silver">No students match.</p>}
        </div>
      )}
    </div>
  );
}
