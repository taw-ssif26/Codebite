'use client';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Resource } from '@/lib/types';

export type VaultItem = Resource & { signed: string | null };

const KIND_LABEL: Record<string, string> = { pdf: 'PDF', jpg: 'Image', drive: 'Drive', url: 'Link', video: 'Video' };

function youtubeEmbed(u: string) {
  const m = u.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}
const driveEmbed = (u: string) => u.replace(/\/(view|edit)(\?.*)?$/, '/preview');

export function VaultClient({ items }: { items: VaultItem[] }) {
  const [session, setSession] = useState('All');
  const [kind, setKind] = useState('all');
  const [q, setQ] = useState('');
  const [preview, setPreview] = useState<VaultItem | null>(null);

  const sessions = useMemo(() => ['All', ...Array.from(new Set(items.map((i) => i.session)))], [items]);
  const shown = items.filter((i) =>
    (session === 'All' || i.session === session) && (kind === 'all' || i.kind === kind) &&
    (q === '' || `${i.title} ${i.description}`.toLowerCase().includes(q.toLowerCase())));

  const href = (i: VaultItem) => i.signed ?? i.url ?? '#';
  const canEmbed = (i: VaultItem) => i.kind === 'pdf' || i.kind === 'jpg' || i.kind === 'video' || i.kind === 'drive';

  function Body({ i }: { i: VaultItem }) {
    const h = href(i);
    if (i.kind === 'jpg') /* eslint-disable-next-line @next/next/no-img-element */ return <img src={h} alt={i.title} className="max-h-[75vh] w-full object-contain" />;
    if (i.kind === 'pdf') return <iframe src={h} title={i.title} className="h-[75vh] w-full rounded-lg bg-white" />;
    if (i.kind === 'drive') return <iframe src={driveEmbed(h)} title={i.title} className="h-[75vh] w-full rounded-lg" allow="autoplay" />;
    if (i.kind === 'video') {
      const yt = youtubeEmbed(h);
      return yt ? <iframe src={yt} title={i.title} className="aspect-video w-full rounded-lg" allowFullScreen /> : <video src={h} controls className="max-h-[75vh] w-full rounded-lg" />;
    }
    return null;
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input className="input sm:max-w-xs" placeholder="Search the vault" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search resources" />
        <select className="input sm:max-w-[10rem]" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Filter by type">
          <option value="all">All types</option>
          {Object.entries(KIND_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>
      <div className="mb-8 flex flex-wrap gap-2">
        {sessions.map((s) => (
          <button key={s} onClick={() => setSession(s)} className={`micro rounded-full border px-4 py-2 transition ${session === s ? 'border-glacial text-glacial' : 'border-white/15 hover:bg-white/5'}`}>{s}</button>
        ))}
      </div>

      {shown.length === 0 ? <p className="text-silver">Nothing matches those filters.</p> : (
        <ul className="grid gap-4 md:grid-cols-2">
          {shown.map((i) => (
            <li key={i.id} className="glass flex flex-col justify-between gap-6 p-6">
              <div>
                <p className="micro mb-2">{i.session} · {KIND_LABEL[i.kind]}</p>
                <h2 className="display text-2xl">{i.title}</h2>
                {i.description && <p className="mt-2 text-silver">{i.description}</p>}
              </div>
              <div className="flex gap-3">
                {canEmbed(i) && <button className="btn-ghost !py-2" onClick={() => setPreview(i)}>Preview</button>}
                <a className="btn-ghost !py-2" href={href(i)} target="_blank" rel="noopener noreferrer" {...(i.signed ? { download: true } : {})}>
                  {i.signed ? 'Download' : 'Open'}
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-center justify-center bg-obsidian/90 p-4 backdrop-blur-md" onClick={() => setPreview(null)} role="dialog" aria-modal="true" aria-label={preview.title}>
            <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between"><p className="micro">{preview.title}</p><button className="btn-ghost !py-1" onClick={() => setPreview(null)}>Close</button></div>
              <Body i={preview} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
