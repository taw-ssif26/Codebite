'use client';
import { useEffect, useState } from 'react';

const pad = (n: number) => String(n).padStart(2, '0');

export function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const end = new Date(target).getTime();
  const left = now === null ? null : Math.max(0, end - now);
  const parts = left === null
    ? ['--', '--', '--', '--']
    : [Math.floor(left / 864e5), Math.floor((left / 36e5) % 24), Math.floor((left / 6e4) % 60), Math.floor((left / 1e3) % 60)].map((n, i) => (i === 0 ? String(n).padStart(2, '0') : pad(n)));
  const labels = ['Days', 'Hours', 'Min', 'Sec'];

  if (left === 0) return <p className="micro tnum text-glacial">Expedition underway</p>;
  return (
    <div className="flex items-end gap-4 sm:gap-7" role="timer" aria-label="Time until the event starts">
      {parts.map((p, i) => (
        <div key={labels[i]} className="flex flex-col">
          <span className="tnum text-4xl font-light leading-none sm:text-6xl">{p}</span>
          <span className="micro mt-2">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
