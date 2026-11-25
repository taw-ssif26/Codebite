'use client';
import { usePathname } from 'next/navigation';
import { formatTemp, MAX_TEMP, MIN_TEMP, useThermal } from './ThermalProvider';

/** Precision-lab thermometer docked to the right viewport edge. */
export function ThermoBar() {
  const { temp, setTemp } = useThermal();
  const path = usePathname();
  if (path.startsWith('/admin')) return null;
  return (
    <div className="glass fixed right-2 top-1/2 z-40 flex h-[220px] -translate-y-1/2 flex-col items-center gap-2 rounded-full px-1.5 py-3 sm:right-4 sm:h-[260px] sm:px-2" role="group" aria-label="Atmosphere temperature">
      <span className="micro tnum !text-[.6rem]">+25</span>
      <input
        type="range" className="thermo" min={MIN_TEMP} max={MAX_TEMP} step={1} value={temp}
        onChange={(e) => setTemp(Number(e.target.value))}
        aria-label="Temperature in degrees Celsius" aria-valuetext={formatTemp(temp)}
      />
      <span className="micro tnum !text-[.6rem]">−20</span>
    </div>
  );
}
