import { redirect } from 'next/navigation';
import { PageShell } from '@/components/common/PageShell';
import { ProfileClient } from '@/components/profile/ProfileClient';
import { getViewer } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function Profile() {
  const { user, role, student } = await getViewer();
  if (!user) redirect('/login?next=/profile');
  if (!student) redirect(role ? '/admin' : '/register');

  let photoUrl: string | null = null;
  if (student.photo_path) {
    const { data } = await createClient()!.storage.from('student-photos').createSignedUrl(student.photo_path, 3600);
    photoUrl = data?.signedUrl ?? null;
  }
  return (
    <PageShell coord={`PASS // ${student.student_code}`} title="Your Expedition Pass" wide>
      <ProfileClient student={student} photoUrl={photoUrl} />
    </PageShell>
  );
}
