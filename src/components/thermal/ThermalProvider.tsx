'use client';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react';

export const MIN_TEMP = -20;
export const MAX_TEMP = 25;
export const DEFAULT_TEMP = -8;

export type Thermal = { density: number; speed: number; fog: number; frost: number; sun: number; warmth: number };

// [temperature, value] keypoints, linearly interpolated.
const CURVES: Record<keyof Thermal, [number, number][]> = {
  density: [[-20, 1], [0, 0.85], [1, 0.3], [14, 0.08], [15, 0], [25, 0]],
  speed: [[-20, 1], [0, 0.9], [1, 0.45], [14, 0.2], [15, 0], [25, 0]],
  fog: [[-20, 1], [0, 0.8], [1, 0.2], [14, 0], [25, 0]],
  frost: [[-20, 1], [0, 0.9], [1, 0.25], [14, 0], [25, 0]],
  sun: [[-20, 0], [14, 0], [15, 0.35], [25, 1]],
  warmth: [[-20, 0], [0, 0], [10, 0.15], [15, 0.5], [25, 1]],
};

function interp(points: [number, number][], t: number) {
  if (t <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x0, y0] = points[i - 1];
    if (t <= x1) return y0 + ((y1 - y0) * (t - x0)) / (x1 - x0);
  }
  return points[points.length - 1][1];
}

export function thermalFor(t: number): Thermal {
  return Object.fromEntries(
    (Object.keys(CURVES) as (keyof Thermal)[]).map((k) => [k, interp(CURVES[k], t)]),
  ) as Thermal;
}

type Ctx = { temp: number; setTemp: (t: number) => void; state: MutableRefObject<Thermal> };
const ThermalCtx = createContext<Ctx | null>(null);
export const useThermal = () => {
  const c = useContext(ThermalCtx);
  if (!c) throw new Error('useThermal outside ThermalProvider');
  return c;
};

export function ThermalProvider({ children }: { children: ReactNode }) {
  const [temp, setTempState] = useState(DEFAULT_TEMP);
  const state = useRef<Thermal>(thermalFor(DEFAULT_TEMP));

  useEffect(() => {
    const raw = localStorage.getItem('cb1-temp');
    const saved = Number(raw);
    if (raw !== null && Number.isFinite(saved)) {
      setTempState(Math.min(MAX_TEMP, Math.max(MIN_TEMP, saved)));
    }
  }, []);

  // Interpolation only touches CSS custom properties per frame (cheap, GPU-composited layers).
  useEffect(() => {
    const target = thermalFor(temp);
    const root = document.documentElement;
    let raf = 0;
    const write = () => {
      const s = state.current;
      root.style.setProperty('--frost', s.frost.toFixed(3));
      root.style.setProperty('--fog', s.fog.toFixed(3));
      root.style.setProperty('--sun', s.sun.toFixed(3));
      root.style.setProperty('--warmth', s.warmth.toFixed(3));
    };
    const step = () => {
      let done = true;
      (Object.keys(target) as (keyof Thermal)[]).forEach((k) => {
        const d = target[k] - state.current[k];
        if (Math.abs(d) > 0.001) { state.current[k] += d * 0.08; done = false; }
        else state.current[k] = target[k];
      });
      write();
      if (!done) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [temp]);

  const value = useMemo<Ctx>(
    () => ({
      temp,
      state,
      setTemp: (t) => {
        setTempState(t);
        try { localStorage.setItem('cb1-temp', String(t)); } catch { /* ignore */ }
      },
    }),
    [temp],
  );
  return <ThermalCtx.Provider value={value}>{children}</ThermalCtx.Provider>;
}

export const formatTemp = (t: number) => `${t > 0 ? '+' : ''}${t}°C`;
