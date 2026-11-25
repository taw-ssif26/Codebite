import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageShell } from '@/components/common/PageShell';
import { RegisterFlow } from '@/components/register/RegisterFlow';
import { getViewer } from '@/lib/auth';

export default async function Register() {
  const { student } = await getViewer();
  if (student) redirect('/profile');
  return (
    <PageShell coord="07 // REGISTRATION" title="Initiate registration" intro="Free for every student. Takes about three minutes, and you finish with a verified Expedition Pass." wide>
      <RegisterFlow />
      <p className="mt-8 text-center text-silver">Already registered? <Link href="/login" className="text-glacial underline underline-offset-4">Log in</Link></p>
    </PageShell>
  );
}
