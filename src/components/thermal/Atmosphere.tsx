'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useThermal } from './ThermalProvider';

type P = { x: number; y: number; r: number; vy: number; ph: number; sway: number; a: number };
const MAX = 260;

function SnowCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { state } = useThermal();

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, raf = 0, last = performance.now();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const make = (): P => {
      const layer = Math.random();
      return {
        x: Math.random() * w, y: Math.random() * h,
        r: layer < 0.6 ? 0.6 + Math.random() * 1.1 : layer < 0.9 ? 1.6 + Math.random() * 1.4 : 3 + Math.random() * 2.2,
        vy: layer < 0.6 ? 18 + Math.random() * 14 : layer < 0.9 ? 36 + Math.random() * 20 : 60 + Math.random() * 30,
        ph: Math.random() * Math.PI * 2, sway: 8 + Math.random() * 22,
        a: layer < 0.6 ? 0.75 : layer < 0.9 ? 0.55 : 0.25,
      };
    };
    let ps: P[] = [];
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ps = Array.from({ length: MAX }, make);
    };
    resize();
    window.addEventListener('resize', resize);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) { last = now; return; }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s = state.current;
      ctx.clearRect(0, 0, w, h);
      const n = Math.floor(MAX * s.density * (reduced ? 0.25 : 1));
      if (n <= 0) return;
      const sp = reduced ? s.speed * 0.3 : s.speed;
      ctx.fillStyle = '#fff';
      for (let i = 0; i < n; i++) {
        const p = ps[i];
        p.y += p.vy * sp * dt;
        p.ph += dt * 0.8;
        const x = p.x + Math.sin(p.ph) * p.sway;
        if (p.y > h + 6) { p.y = -6; p.x = Math.random() * w; }
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [state]);

  return <canvas ref={ref} className="absolute inset-0" aria-hidden />;
}

export function Atmosphere() {
  const path = usePathname();
  if (path.startsWith('/admin')) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="atm-base" />
      <div className="atm-cold" />
      <div className="atm-warm" />
      <div className="atm-fog atm-fog-a" />
      <div className="atm-fog atm-fog-b" />
      <div className="atm-sun-glow" />
      <div className="atm-sun-beams" />
      <div className="atm-flare" style={{ left: '62%', top: '22%', width: 90, height: 90 }} />
      <div className="atm-flare" style={{ left: '48%', top: '36%', width: 46, height: 46 }} />
      <div className="atm-flare" style={{ left: '34%', top: '50%', width: 150, height: 150 }} />
      <SnowCanvas />
    </div>
  );
}
