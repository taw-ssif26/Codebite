'use client';
import { AdminCrud } from '@/components/admin/AdminCrud';

const isFile = (r: Record<string, unknown>) => r.kind === 'pdf' || r.kind === 'jpg';

export default function Page() {
  return (
    <AdminCrud table="resources" title="Resources vault" orderBy={{ col: 'created_at', asc: false }} defaults={{ kind: 'pdf', session: 'General', sort_order: 0 }}
      listTitle={(r) => r.title} listSub={(r) => `${r.session} · ${r.kind}`}
      fields={[
        { key: 'title', label: 'Title', type: 'text', required: true }, { key: 'description', label: 'Description', type: 'text' },
        { key: 'session', label: 'Session / category', type: 'text', help: 'Students filter the vault by this value.' },
        { key: 'kind', label: 'Type', type: 'select', options: [{ value: 'pdf', label: 'PDF (upload)' }, { value: 'jpg', label: 'JPG / image (upload)' }, { value: 'drive', label: 'Google Drive link' }, { value: 'url', label: 'External URL' }, { value: 'video', label: 'Video (YouTube link or upload)' }] },
        { key: 'file_path', label: 'File', type: 'file', bucket: 'resources', showIf: (r) => isFile(r) || r.kind === 'video' },
        { key: 'url', label: 'Link', type: 'text', showIf: (r) => !isFile(r), help: 'Drive share link, web page, or YouTube URL.' },
        { key: 'sort_order', label: 'Order (low = first)', type: 'number' },
      ]} />
  );
}
