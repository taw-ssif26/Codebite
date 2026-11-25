'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Countdown } from './Countdown';
import type { Notice } from '@/lib/types';

export function Hero({ eyebrow, title, subtitle, eventDate, notices }: {
  eyebrow: string; title: string; subtitle: string; eventDate: string; notices: Notice[];
}) {
  const words = title.split(' ');
  return (
    <section className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-5 pb-40 pt-28 sm:px-8">
      {notices.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }}
          className="glass mb-10 flex max-w-2xl flex-col gap-1 px-5 py-3" role="status">
          <p className="micro flex items-center gap-2"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />Priority dispatch</p>
          <p className="font-medium">{notices[0].title}</p>
          {notices[0].body && <p className="line-clamp-2 text-sm text-silver">{notices[0].body}</p>}
        </motion.div>
      )}

      <p className="micro tnum mb-8">{eyebrow}</p>

      <h1 className="display text-[15vw] sm:text-[11vw] lg:text-[9.5rem]" aria-label={title}>
        {words.map((w, i) => (
          <span key={i} className="mr-[.18em] inline-block overflow-hidden align-bottom pb-[.08em]">
            <motion.span className="inline-block" initial={{ y: '110%' }} animate={{ y: 0 }}
              transition={{ delay: 1.7 + i * 0.09, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
              {w}
            </motion.span>
          </span>
        ))}
      </h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4, duration: 0.8 }}
        className="mt-10 max-w-xl text-lg leading-relaxed text-silver">{subtitle}</motion.p>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6, duration: 0.8 }}
        className="mt-12 flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
        <Countdown target={eventDate} />
        <div className="flex flex-wrap gap-3">
          <Link href="/register" className="btn-primary">Initiate registration</Link>
          <Link href="/segments" className="btn-ghost">See the blueprint</Link>
        </div>
      </motion.div>
    </section>
  );
}
