'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { NAV } from '@/lib/constants';
import { formatTemp, DEFAULT_TEMP, useThermal } from '@/components/thermal/ThermalProvider';

function DockItem({ n, label, href, active }: { n: string; label: string; href: string; active: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 18 });
  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const reset = () => { x.set(0); y.set(0); };
  return (
    <motion.div layout style={{ x, y }} className="relative" onPointerMove={onMove} onPointerLeave={reset}>
      <Link ref={ref} href={href} aria-label={`${n} ${label}`} aria-current={active ? 'page' : undefined}
        className="relative flex items-center gap-2 rounded-full px-3 py-2">
        {active && <motion.span layoutId="dock-active" className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/15" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
        <span className={`tnum relative text-[.7rem] ${active ? 'text-glacial' : 'text-silver'}`}>{n}</span>
        {active && <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} className="micro relative hidden !text-snow sm:inline">{`// ${label}`}</motion.span>}
      </Link>
    </motion.div>
  );
}

export function Dock({ registered, isAdmin }: { registered: boolean; isAdmin: boolean }) {
  const path = usePathname();
  const { temp, setTemp } = useThermal();
  if (path.startsWith('/admin')) return null;
  const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
  const current = NAV.find((i) => isActive(i.href));

  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-3 z-50 flex flex-col items-center gap-2 px-2 sm:bottom-5">
      {current && <p className="micro tnum sm:hidden">{current.n} // {current.label}</p>}
      <motion.div layout className="glass flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full p-1.5">
        {NAV.map((i) => <DockItem key={i.href} {...i} active={isActive(i.href)} />)}
        <button onClick={() => setTemp(DEFAULT_TEMP)} title="Reset temperature to -8°C"
          className="tnum ml-1 hidden shrink-0 rounded-full border border-white/10 px-3 py-2 text-[.7rem] text-glacial sm:block">
          {formatTemp(temp)}
        </button>
        {isAdmin && <Link href="/admin" className="micro ml-1 shrink-0 rounded-full px-3 py-2 hover:bg-white/5">Admin</Link>}
        <Link href={registered ? '/profile' : '/register'} className="btn-primary ml-1 shrink-0 !px-4 !py-2 text-sm">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-obsidian" aria-hidden />
          {registered ? 'Student Pass' : 'Register'}
        </Link>
      </motion.div>
    </nav>
  );
}
