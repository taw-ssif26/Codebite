'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Segment } from '@/lib/types';

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Time to be announced';

export function SegmentExplorer({ segments }: { segments: Segment[] }) {
  const [open, setOpen] = useState<string | null>(segments[0]?.id ?? null);
  return (
    <ol className="relative ml-3 border-l border-white/15 pl-8 sm:ml-6 sm:pl-12">
      {segments.map((s, i) => {
        const active = open === s.id;
        return (
          <li key={s.id} className="relative pb-8">
            <span className={`absolute -left-[41px] top-6 h-3 w-3 rounded-full border-2 transition-colors sm:-left-[57px] ${active ? 'border-ember bg-ember' : 'border-white/30 bg-obsidian'}`} aria-hidden />
            <div className="glass overflow-hidden">
              <button className="flex w-full items-start justify-between gap-4 p-6 text-left" onClick={() => setOpen(active ? null : s.id)} aria-expanded={active}>
                <div>
                  <p className="micro tnum">Segment {String(i + 1).padStart(2, '0')} · {fmt(s.starts_at)}{s.duration ? ` · ${s.duration}` : ''}</p>
                  <h2 className="display mt-2 text-2xl sm:text-3xl">{s.title}</h2>
                </div>
                <motion.span animate={{ rotate: active ? 45 : 0 }} className="mt-1 text-2xl text-silver" aria-hidden>+</motion.span>
              </button>
              <AnimatePresence initial={false}>
                {active && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }}>
                    <div className="grid gap-6 border-t border-white/10 p-6 sm:grid-cols-2">
                      <p className="leading-relaxed text-snow/90 sm:col-span-2">{s.description}</p>
                      <div><p className="micro mb-1">Prerequisites</p><p>{s.prerequisites}</p></div>
                      <div><p className="micro mb-1">Tools covered</p><p>{s.tools.join(', ') || '—'}</p></div>
                      <div className="sm:col-span-2"><p className="micro mb-1">Outcome</p><p>{s.outcomes || '—'}</p></div>
                      {s.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 sm:col-span-2">
                          {s.tags.map((t) => <span key={t} className="micro rounded-full border border-white/15 px-3 py-1">{t}</span>)}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
