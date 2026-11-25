import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';
import { getViewer } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await getViewer();
  if (!user) redirect('/login?next=/admin');
  if (!role) {
    return (
      <main className="mx-auto max-w-lg px-6 py-32 text-center">
        <h1 className="display text-4xl">Admins only</h1>
        <p className="mt-4 text-silver">{user.email} does not have admin access. Ask the super-admin to add this email.</p>
        <Link href="/" className="btn-ghost mt-8">Back to the site</Link>
      </main>
    );
  }
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-8 lg:self-start">
        <p className="micro mb-4 px-4">Command center · {role === 'super_admin' ? 'Super-admin' : 'Admin'}</p>
        <AdminNav superAdmin={role === 'super_admin'} />
      </aside>
      <section className="min-w-0 pb-24">{children}</section>
    </div>
  );
}
