'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/common/Logo';

/** Skippable 1.8s "Lab Chamber Calibration" boot sequence, once per browser session. */
export function Preloader() {
  const [show, setShow] = useState(true);
  const path = usePathname();

  useEffect(() => {
    if (path.startsWith('/admin') || sessionStorage.getItem('cb1-boot')) { setShow(false); return; }
    const done = () => { sessionStorage.setItem('cb1-boot', '1'); setShow(false); };
    const t = setTimeout(done, 1800);
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter') done(); };
    window.addEventListener('keydown', key);
    return () => { clearTimeout(t); window.removeEventListener('keydown', key); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = () => { sessionStorage.setItem('cb1-boot', '1'); setShow(false); };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="boot" className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-obsidian"
          exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
        >
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.15, duration: 0.7 }} className="mb-6"><Logo className="h-12 w-auto" /></motion.div>
          <svg width="220" height="220" viewBox="0 0 220 220" fill="none" aria-hidden>
            <motion.circle cx="110" cy="110" r="84" stroke="rgb(var(--accent-cyan))" strokeWidth="1" pathLength={1} strokeDasharray={1} initial={{ strokeDashoffset: 1 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 1.3, ease: 'easeInOut' }} />
            <motion.circle cx="110" cy="110" r="52" stroke="rgba(255,255,255,.35)" strokeWidth="1" strokeDasharray="3 6" initial={{ rotate: 0 }} animate={{ rotate: 120 }} style={{ originX: '110px', originY: '110px' }} transition={{ duration: 1.8, ease: 'linear' }} />
            {[[110, 14, 110, 60], [110, 160, 110, 206], [14, 110, 60, 110], [160, 110, 206, 110]].map(([x1, y1, x2, y2], i) => (
              <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgb(var(--accent-cyan))" strokeWidth="1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }} />
            ))}
            <motion.circle cx="110" cy="110" r="4" fill="rgb(var(--accent-brand-1))" initial={{ scale: 0 }} animate={{ scale: [0, 1.6, 1] }} transition={{ delay: 1.2, duration: 0.5 }} />
          </svg>
          <p className="micro tnum mt-6 text-center">23.8103° N, 90.4125° E — CODEZY CRYO-LAB</p>
          <div className="mt-4 h-px w-48 overflow-hidden bg-white/10">
            <motion.div className="h-full bg-ember" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.7, ease: 'linear' }} />
          </div>
          <p className="micro mt-3">Calibrating chamber</p>
          <button onClick={skip} className="micro absolute bottom-8 right-8 rounded-full border border-white/15 px-4 py-2 hover:bg-white/5">Skip</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
