'use client';
import { AdminCrud } from '@/components/admin/AdminCrud';

export default function Page() {
  return (
    <AdminCrud table="segments" title="Event segments" orderBy={{ col: 'sort_order' }} defaults={{ sort_order: 0, prerequisites: 'None — Zero to One', tags: '', tools: '' }}
      listTitle={(r) => r.title} listSub={(r) => r.starts_at ? new Date(r.starts_at).toLocaleString() : 'No time set'}
      fields={[
        { key: 'title', label: 'Title', type: 'text', required: true }, { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'starts_at', label: 'Starts at', type: 'datetime' }, { key: 'duration', label: 'Duration (e.g. 60 min)', type: 'text' },
        { key: 'tags', label: 'Tags', type: 'tags' }, { key: 'prerequisites', label: 'Prerequisites', type: 'text' },
        { key: 'tools', label: 'Tools covered', type: 'tags' }, { key: 'outcomes', label: 'Outcome', type: 'text' },
        { key: 'sort_order', label: 'Order (low = first)', type: 'number' },
      ]} />
  );
}
