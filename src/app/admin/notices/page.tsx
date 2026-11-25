'use client';
import { AdminCrud } from '@/components/admin/AdminCrud';

export default function Page() {
  return (
    <AdminCrud table="notices" title="Notices" orderBy={{ col: 'created_at', asc: false }} defaults={{ priority: 'GENERAL', featured_on_home: false }}
      listTitle={(r) => r.title} listSub={(r) => `${r.priority}${r.featured_on_home ? ' · pinned to front page' : ''}`}
      fields={[
        { key: 'title', label: 'Title', type: 'text', required: true }, { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'priority', label: 'Priority', type: 'select', options: ['URGENT', 'SCHEDULE', 'GENERAL'].map((v) => ({ value: v, label: v })) },
        { key: 'featured_on_home', label: 'Pin to front page', type: 'boolean' },
      ]} />
  );
}
