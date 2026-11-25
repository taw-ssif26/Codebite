'use client';
import { forwardRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { gradeLabel } from '@/lib/constants';

export type TicketData = { name: string; institution: string; grade: string; code: string; photo: string | null; qr: string };

/** Flat ticket face (also what gets exported to PNG/PDF). Fixed 360×560 so exports are consistent. */
export const TicketFace = forwardRef<HTMLDivElement, { d: TicketData }>(function TicketFace({ d }, ref) {
  return (
    <div ref={ref} style={{ width: 360, height: 560, background: 'linear-gradient(160deg,#0D131C,#070B10 70%)', borderRadius: 24, border: '1px solid rgba(255,255,255,.14)', padding: 24, display: 'flex', flexDirection: 'column', color: '#F4F7FA', fontFamily: "'Plus Jakarta Sans Variable', system-ui, sans-serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/codezy-logo.svg" alt="Codezy" style={{ height: 22 }} />
        <span style={{ fontFamily: "'JetBrains Mono Variable', monospace", fontSize: 9, letterSpacing: '.15em', color: '#8E9BAE' }}>EXPEDITION PASS</span>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 20, alignItems: 'flex-end' }}>
        <div style={{ width: 120, height: 120, borderRadius: 16, overflow: 'hidden', background: '#0D131C', border: '1px solid rgba(255,255,255,.18)', flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {d.photo && <img src={d.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono Variable', monospace", fontSize: 9, letterSpacing: '.15em', color: '#349133' }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: '#349133' }} />VERIFIED
          </div>
          <div style={{ fontFamily: "'JetBrains Mono Variable', monospace", fontSize: 22, color: '#6EE7F5', marginTop: 6 }}>{d.code}</div>
        </div>
      </div>
      <div style={{ marginTop: 22 }}>
        <div style={{ fontFamily: "'Syne Variable', sans-serif", fontSize: 30, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-.02em' }}>{d.name}</div>
        <div style={{ marginTop: 8, color: '#8E9BAE', fontSize: 14 }}>{d.institution}</div>
        <div style={{ marginTop: 2, color: '#8E9BAE', fontSize: 14 }}>{gradeLabel(d.grade)}</div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: "'JetBrains Mono Variable', monospace", fontSize: 9, letterSpacing: '.15em', color: '#8E9BAE', lineHeight: 1.8 }}>CODEZY CHRISTMAS<br />CODEBITE 1.0<br />SCAN TO VERIFY</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={d.qr} alt="QR code" width={112} height={112} style={{ borderRadius: 12, background: '#fff' }} />
      </div>
    </div>
  );
});

/** 3D tilt + holographic sheen that follows the pointer. */
export function TiltTicket({ d }: { d: TicketData }) {
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const sheen = useMotionTemplate`radial-gradient(circle at ${mx}% ${my}%, rgba(255,255,255,.28), rgba(110,231,245,.14) 28%, rgba(255,137,3,.08) 46%, transparent 62%)`;
  const hue = useMotionTemplate`conic-gradient(from ${mx}deg at ${mx}% ${my}%, rgba(110,231,245,.0), rgba(110,231,245,.22), rgba(251,191,36,.18), rgba(52,145,51,.16), rgba(110,231,245,.0))`;

  function move(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 22); rx.set(-(py - 0.5) * 22); mx.set(px * 100); my.set(py * 100);
  }
  function leave() { rx.set(0); ry.set(0); mx.set(50); my.set(50); }

  return (
    <div style={{ perspective: 1000 }} className="mx-auto w-[360px] max-w-full" onPointerMove={move} onPointerLeave={leave}>
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }} className="relative">
        <TicketFace d={d} />
        <motion.div className="pointer-events-none absolute inset-0 rounded-3xl mix-blend-screen" style={{ background: sheen }} />
        <motion.div className="pointer-events-none absolute inset-0 rounded-3xl opacity-60 mix-blend-overlay" style={{ background: hue }} />
      </motion.div>
    </div>
  );
}
