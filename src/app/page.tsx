import Link from 'next/link';
import { Hero } from '@/components/home/Hero';
import { getFeaturedNotices, getSettings } from '@/lib/data';

export default async function Home() {
  const [s, notices] = await Promise.all([getSettings(), getFeaturedNotices()]);
  return (
    <>
      <Hero eyebrow={s['hero.eyebrow']} title={s['hero.title']} subtitle={s['hero.subtitle']} eventDate={s['event.date']} notices={notices} />
      <section className="mx-auto max-w-7xl px-5 pb-40 sm:px-8">
        <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-[1.4fr_1fr_1fr]">
          {[
            ['Zero prerequisites', 'If you have never written a line of code, you are exactly who this is for.'],
            ['Hands-on from minute one', 'You build things in every session, with mentors beside you.'],
            ['Open to every student', 'School, college and university students are all welcome.'],
          ].map(([t, b]) => (
            <div key={t} className="bg-obsidian/80 p-8 backdrop-blur-xl">
              <p className="display text-2xl">{t}</p>
              <p className="mt-3 text-silver">{b}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/mentors" className="btn-ghost">Meet the mentors</Link>
          <Link href="/academy" className="btn-ghost">About Codezy Academy</Link>
        </div>
      </section>
    </>
  );
}
