'use client';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type A = { email: string; role: 'admin' | 'super_admin'; created_at: string };

export function AdminsManager({ myEmail }: { myEmail: string }) {
  const sb = createClient();
  const [rows, setRows] = useState<A[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'super_admin'>('admin');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => { const { data } = await sb.from('admins').select('*').order('created_at'); setRows((data as A[]) ?? []); }, [sb]);
  useEffect(() => { load(); }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault(); setMsg('');
    const { error } = await sb.from('admins').upsert({ email: email.trim().toLowerCase(), role, invited_by: myEmail });
    if (error) { setMsg(error.message); return; }
    setEmail(''); setMsg('Added. They sign in at /login with this email and will see the Admin link.'); load();
  }
  async function remove(a: A) {
    if (a.email.toLowerCase() === myEmail.toLowerCase()) { setMsg('You cannot remove yourself.'); return; }
    if (!confirm(`Revoke admin access for ${a.email}?`)) return;
    const { error } = await sb.from('admins').delete().eq('email', a.email);
    setMsg(error ? error.message : 'Access revoked.'); load();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="display mb-6 text-4xl">Admins</h1>
      <form onSubmit={add} className="glass mb-8 flex flex-col gap-3 p-5 sm:flex-row">
        <input type="email" required className="input" placeholder="new-admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <select className="input sm:max-w-[10rem]" value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'super_admin')}><option value="admin">Admin</option><option value="super_admin">Super-admin</option></select>
        <button className="btn-primary shrink-0">Grant access</button>
      </form>
      {msg && <p role="status" className="mb-4 text-sm text-glacial">{msg}</p>}
      <ul className="space-y-3">
        {rows.map((a) => (
          <li key={a.email} className="glass flex items-center justify-between gap-4 p-4">
            <div><p className="font-medium">{a.email}</p><p className="micro">{a.role === 'super_admin' ? 'Super-admin' : 'Admin'}</p></div>
            <button className="btn-ghost !px-4 !py-1.5 text-sm" onClick={() => remove(a)}>Revoke</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
