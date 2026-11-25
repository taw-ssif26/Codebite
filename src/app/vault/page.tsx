import Link from 'next/link';
import { PageShell, EmptyState } from '@/components/common/PageShell';
import { VaultClient, type VaultItem } from '@/components/home/VaultClient';
import { getViewer } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Resource } from '@/lib/types';

export default async function Vault() {
  const viewer = await getViewer();
  const allowed = Boolean(viewer.student) || Boolean(viewer.role);

  if (!allowed) {
    return (
      <PageShell coord="05 // VAULT" title="Resources Vault">
        <div className="glass mx-auto max-w-xl p-10 text-center">
          <svg className="mx-auto mb-6 h-10 w-10 text-silver" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></svg>
          <p className="micro mb-3">Access restricted</p>
          <h2 className="display text-3xl">Verified student pass required</h2>
          <p className="mt-4 text-silver">Slides, worksheets and recordings are for registered students. Register to unlock them, or log in if you already have a pass.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-primary">Register</Link>
            <Link href="/login?next=/vault" className="btn-ghost">Log in</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const sb = createClient()!;
  const { data } = await sb.from('resources').select('*').order('sort_order').order('created_at', { ascending: false });
  const rows = (data as Resource[]) ?? [];
  const paths = rows.map((r) => r.file_path).filter((p): p is string => Boolean(p));
  const signedMap = new Map<string, string>();
  if (paths.length) {
    const { data: signed } = await sb.storage.from('resources').createSignedUrls(paths, 3600);
    signed?.forEach((s) => { if (s.path && s.signedUrl) signedMap.set(s.path, s.signedUrl); });
  }
  const items: VaultItem[] = rows.map((r) => ({ ...r, signed: r.file_path ? signedMap.get(r.file_path) ?? null : null }));

  return (
    <PageShell coord="05 // VAULT" title="Resources Vault" intro="Everything shared by the mentors, grouped by session.">
      {items.length === 0 ? <EmptyState title="The vault is empty" body="Resources will appear here after each session." /> : <VaultClient items={items} />}
    </PageShell>
  );
}
