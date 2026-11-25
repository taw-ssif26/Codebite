import type { ReactNode } from 'react';

export function PageShell({ coord, title, intro, children, wide }: { coord: string; title: string; intro?: string; children: ReactNode; wide?: boolean }) {
  return (
    <main className={`mx-auto px-5 pb-40 pt-28 sm:px-8 sm:pt-32 ${wide ? 'max-w-7xl' : 'max-w-6xl'}`}>
      <header className="mb-12 max-w-3xl">
        <p className="micro tnum mb-4">{coord}</p>
        <h1 className="display text-5xl sm:text-7xl">{title}</h1>
        {intro && <p className="mt-6 max-w-xl text-lg leading-relaxed text-silver">{intro}</p>}
      </header>
      {children}
    </main>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass p-10 text-center">
      <p className="display text-2xl">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-silver">{body}</p>
    </div>
  );
}
