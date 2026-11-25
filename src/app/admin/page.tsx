import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { GRADES } from '@/lib/constants';

export default async function AdminHome() {
  const sb = createClient();
  if (!sb) return <p className="text-silver">Supabase is not configured.</p>;
  const total = await sb.from('students').select('id', { count: 'exact', head: true });
  const perGrade = await Promise.all(GRADES.map(async (g) => ({ g, n: (await sb.from('students').select('id', { count: 'exact', head: true }).eq('grade', g.value)).count ?? 0 })));
  return (
    <div>
      <h1 className="display text-4xl">Overview</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="glass p-5 lg:col-span-1"><p className="tnum text-4xl">{total.count ?? 0}</p><p className="micro mt-2">Registered</p></div>
        {perGrade.map(({ g, n }) => <div key={g.value} className="glass p-5"><p className="tnum text-4xl">{n}</p><p className="micro mt-2">{g.label}</p></div>)}
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {[['/admin/notices', 'Post a notice'], ['/admin/resources', 'Upload a resource'], ['/admin/email', 'Send an email'], ['/admin/students', 'Export students']].map(([h, l]) => (
          <Link key={h} href={h} className="glass p-5 transition hover:bg-white/5">{l}</Link>
        ))}
      </div>
    </div>
  );
}
