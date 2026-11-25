import { PageShell } from '@/components/common/PageShell';
import { getSettings } from '@/lib/data';

export default async function Academy() {
  const s = await getSettings();
  const metrics = s['academy.metrics'].split('\n').map((l) => l.split('|')).filter((p) => p.length === 2);
  return (
    <PageShell coord="03 // CODEZY LAB" title={s['academy.title']} intro={s['academy.mission']}>
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6 text-lg leading-relaxed text-snow/90">
          {s['academy.story'].split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <aside className="glass p-8">
          <p className="micro mb-4">Why we host CodeBite</p>
          <p className="leading-relaxed text-silver">{s['academy.why']}</p>
        </aside>
      </div>
      {metrics.length > 0 && (
        <dl className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-3">
          {metrics.map(([v, l]) => (
            <div key={l} className="bg-obsidian/80 p-8 backdrop-blur-xl">
              <dd className="tnum text-5xl font-light">{v}</dd>
              <dt className="micro mt-3">{l}</dt>
            </div>
          ))}
        </dl>
      )}
    </PageShell>
  );
}
