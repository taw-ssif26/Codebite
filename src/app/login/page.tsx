import Link from 'next/link';
import { PageShell } from '@/components/common/PageShell';
import { LoginForm } from '@/components/auth/LoginForm';

export default function Login({ searchParams }: { searchParams: { next?: string } }) {
  const next = searchParams.next?.startsWith('/') ? searchParams.next : undefined;
  return (
    <PageShell coord="ACCESS // LOGIN" title="Log in" intro="Registered students and admins sign in with a one-time code sent to their email. No password.">
      <LoginForm next={next} />
      <p className="mt-6 text-center text-silver">New here? <Link href="/register" className="text-glacial underline underline-offset-4">Register for CodeBite</Link></p>
    </PageShell>
  );
}
