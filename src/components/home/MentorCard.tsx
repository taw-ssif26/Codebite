'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Instructor } from '@/lib/types';

export function MentorCard({ m, className = '' }: { m: Instructor; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <article className={className}>
      <button
        type="button" className="group relative block w-full overflow-hidden rounded-2xl text-left"
        onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onClick={() => setOpen((o) => !o)}
        aria-expanded={open} aria-label={`${m.name} — toggle dossier`}
      >
        <div className="aspect-[4/5] w-full bg-cryo">
          {m.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.photo_url} alt={m.name} className="h-full w-full object-cover contrast-125 grayscale transition duration-700 group-hover:grayscale-0" />
          ) : (
            <div className="flex h-full items-center justify-center"><span className="display text-7xl text-white/10">{m.name.slice(0, 1)}</span></div>
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-auto bg-obsidian/90 p-5 backdrop-blur-md">
              <p className="micro mb-3">Dossier // {m.name}</p>
              <pre className="whitespace-pre-wrap font-mono text-[.78rem] leading-relaxed text-glacial">
{`> stack    : ${m.stack.join(', ') || '—'}
> teaches  : ${m.teaches || '—'}
> background:
  ${m.bio || '—'}`}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
      <h2 className="display mt-4 text-2xl">{m.name}</h2>
      <p className="micro mt-1">{m.role}</p>
    </article>
  );
}
