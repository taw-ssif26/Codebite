import { redirect } from 'next/navigation';
import { AdminsManager } from '@/components/admin/AdminsManager';
import { getViewer } from '@/lib/auth';

export default async function Page() {
  const { user, role } = await getViewer();
  if (role !== 'super_admin') redirect('/admin');
  return <AdminsManager myEmail={user?.email ?? ''} />;
}
