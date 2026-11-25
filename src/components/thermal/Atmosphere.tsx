'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useThermal } from './ThermalProvider';

type P = { x: number; y: number; r: number; vy: number; ph: number; sway: number; a: number; rot: number; vr: number };
const MAX = 260;

// Near-layer flakes are drawn as small rotating six-arm crystals; the rest are soft dots.
function drawCrystal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.moveTo(0, 0); ctx.lineTo(0, -size);
    ctx.moveTo(0, -size * 0.5); ctx.lineTo(-size * 0.28, -size * 0.74);
    ctx.moveTo(0, -size * 0.5); ctx.lineTo(size * 0.28, -size * 0.74);
  }
  ctx.stroke();
  ctx.restore();
}

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
        r: layer < 0.55 ? 0.6 + Math.random() * 1.1 : layer < 0.86 ? 1.6 + Math.random() * 1.4 : 3 + Math.random() * 2.4,
        vy: layer < 0.55 ? 18 + Math.random() * 14 : layer < 0.86 ? 36 + Math.random() * 20 : 56 + Math.random() * 26,
        ph: Math.random() * Math.PI * 2, sway: 8 + Math.random() * 22,
        a: layer < 0.55 ? 0.75 : layer < 0.86 ? 0.55 : 0.7,
        rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 1.6,
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
      ctx.strokeStyle = '#e6f6ff';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const p = ps[i];
        p.y += p.vy * sp * dt;
        p.ph += dt * 0.8;
        p.rot += p.vr * dt * (reduced ? 0.2 : 1);
        const x = p.x + Math.sin(p.ph) * p.sway;
        if (p.y > h + 12) { p.y = -12; p.x = Math.random() * w; }
        ctx.globalAlpha = p.a;
        if (p.r > 2.8) drawCrystal(ctx, x, p.y, p.r * 2.3, p.rot);
        else { ctx.beginPath(); ctx.arc(x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [state]);

  return <canvas ref={ref} className="absolute inset-0" aria-hidden />;
}

// Large, slowly rotating crystals in three depth layers (far / mid / near-blurred).
const CRYSTALS = [
  { x: 4, y: 10, s: 54, spin: 60, dir: 1, float: 20, delay: 0, layer: 1, o: 0.3, blur: 0 },
  { x: 24, y: 62, s: 44, spin: 75, dir: -1, float: 26, delay: 6, layer: 1, o: 0.24, blur: 0 },
  { x: 47, y: 18, s: 38, spin: 55, dir: 1, float: 22, delay: 3, layer: 1, o: 0.22, blur: 0 },
  { x: 71, y: 74, s: 58, spin: 80, dir: -1, float: 28, delay: 9, layer: 1, o: 0.26, blur: 0 },
  { x: 90, y: 40, s: 46, spin: 65, dir: 1, float: 24, delay: 2, layer: 1, o: 0.26, blur: 0 },
  { x: 12, y: 36, s: 110, spin: 90, dir: 1, float: 30, delay: 4, layer: 2, o: 0.2, blur: 0.5 },
  { x: 38, y: 78, s: 96, spin: 110, dir: -1, float: 34, delay: 8, layer: 2, o: 0.18, blur: 0.5 },
  { x: 62, y: 8, s: 124, spin: 100, dir: 1, float: 32, delay: 1, layer: 2, o: 0.2, blur: 0.5 },
  { x: 84, y: 60, s: 104, spin: 120, dir: -1, float: 36, delay: 11, layer: 2, o: 0.18, blur: 0.5 },
  { x: -3, y: 70, s: 230, spin: 160, dir: 1, float: 40, delay: 5, layer: 3, o: 0.11, blur: 3 },
  { x: 52, y: 40, s: 280, spin: 200, dir: -1, float: 46, delay: 12, layer: 3, o: 0.08, blur: 4 },
  { x: 88, y: -4, s: 240, spin: 170, dir: 1, float: 42, delay: 7, layer: 3, o: 0.1, blur: 3 },
];
const PARALLAX = { 1: 8, 2: 18, 3: 34 } as const;

function Crystals() {
  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <g id="cb-flake" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5">
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <g key={a} transform={`rotate(${a})`}>
                <path d="M0 0V-44M0 -16L-8 -25M0 -16L8 -25M0 -29L-11 -39M0 -29L11 -39" />
                <circle cx="0" cy="-46" r="2" fill="currentColor" stroke="none" />
              </g>
            ))}
            <path d="M0 -7L6 -3.5V3.5L0 7L-6 3.5V-3.5Z" />
          </g>
        </defs>
      </svg>
      {([1, 2, 3] as const).map((layer) => (
        <div key={layer} className="crystal-layer" style={{ '--par': PARALLAX[layer] } as React.CSSProperties}>
          {CRYSTALS.filter((c) => c.layer === layer).map((c, i) => (
            <span key={i} className="crystal-float"
              style={{ left: `${c.x}%`, top: `${c.y}%`, width: c.s, height: c.s, opacity: c.o, filter: c.blur ? `blur(${c.blur}px)` : undefined, animationDuration: `${c.float}s`, animationDelay: `-${c.delay}s` }}>
              <svg className="crystal-spin" viewBox="-50 -50 100 100" style={{ animationDuration: `${c.spin}s`, animationDirection: c.dir > 0 ? 'normal' : 'reverse' }}>
                <use href="#cb-flake" />
              </svg>
            </span>
          ))}
        </div>
      ))}
    </>
  );
}

// Deterministic pseudo-random so server and client render identical markup.
const SPARKLES = (() => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 26 }, () => ({ x: rnd() * 100, y: rnd() * 100, s: 2 + rnd() * 3, d: 2.5 + rnd() * 4, t: rnd() * 6 }));
})();

export function Atmosphere() {
  const path = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const admin = path.startsWith('/admin');

  // Gentle mouse parallax: only sets two CSS variables; the layers translate with CSS.
  useEffect(() => {
    if (admin || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        root.current?.style.setProperty('--px', String((e.clientX / window.innerWidth - 0.5) * -2));
        root.current?.style.setProperty('--py', String((e.clientY / window.innerHeight - 0.5) * -2));
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, [admin]);

  if (admin) return null;
  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="atm-base" />
      <div className="atm-cold" />
      <div className="atm-warm" />
      <div className="atm-aurora" />
      <Crystals />
      <div className="sparkle-layer">
        {SPARKLES.map((p, i) => (
          <i key={i} className="sparkle" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, animationDuration: `${p.d}s`, animationDelay: `-${p.t}s` }} />
        ))}
      </div>
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
