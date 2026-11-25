'use client';
import { AdminCrud } from '@/components/admin/AdminCrud';

export default function Page() {
  return (
    <AdminCrud table="instructors" title="Instructors" orderBy={{ col: 'sort_order' }} defaults={{ sort_order: 0, stack: '' }}
      listTitle={(r) => r.name} listSub={(r) => r.role}
      fields={[
        { key: 'name', label: 'Name', type: 'text', required: true }, { key: 'role', label: 'Role / title', type: 'text' },
        { key: 'photo_url', label: 'Portrait', type: 'image', bucket: 'instructors' },
        { key: 'bio', label: 'Background (shown in the dossier)', type: 'textarea' },
        { key: 'stack', label: 'Tech stack', type: 'tags' }, { key: 'teaches', label: 'What they will teach', type: 'text' },
        { key: 'sort_order', label: 'Order (low = first)', type: 'number' },
      ]} />
  );
}
