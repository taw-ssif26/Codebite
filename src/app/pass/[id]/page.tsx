import { notFound } from 'next/navigation';
import { PageShell } from '@/components/common/PageShell';
import { createClient } from '@/lib/supabase/server';
import { gradeLabel } from '@/lib/constants';

// Public QR landing page. Privacy by design: abbreviated name + grade + verified flag only.
export default async function PublicPass({ params }: { params: { id: string } }) {
  const sb = createClient();
  if (!sb || !/^CB1-[A-Za-z0-9]{4}$/.test(params.id)) notFound();
  const { data } = await sb!.rpc('get_public_pass', { sid: params.id });
  const row = (data as { student_code: string; display_name: string; grade: string; verified_at: string }[] | null)?.[0];
  if (!row) notFound();
  return (
    <PageShell coord={`PASS // ${row.student_code}`} title="Pass verified">
      <div className="glass mx-auto max-w-md p-8">
        <p className="micro mb-4 flex items-center gap-2 !text-verdant"><span className="h-2 w-2 rounded-full bg-verdant" />Verified student</p>
        <p className="display text-4xl">{row.display_name}</p>
        <p className="mt-2 text-silver">{gradeLabel(row.grade)}</p>
        <p className="tnum mt-6 text-2xl text-glacial">{row.student_code}</p>
        <p className="micro mt-6">Codezy Christmas CodeBite 1.0</p>
      </div>
    </PageShell>
  );
}
