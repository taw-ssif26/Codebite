'use client';
import { useEffect, useRef, useState } from 'react';

const FRAME = 280;
const OUT = 512;

/** Square crop with drag + zoom. Emits a 512×512 JPEG blob whenever the framing changes. */
export function PhotoCropper({ onChange, initialUrl }: { onChange: (blob: Blob | null) => void; initialUrl?: string | null }) {
  const [src, setSrc] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [error, setError] = useState('');
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const base = img ? Math.max(FRAME / img.naturalWidth, FRAME / img.naturalHeight) : 1;
  const scale = base * zoom;
  const dw = img ? img.naturalWidth * scale : 0;
  const dh = img ? img.naturalHeight * scale : 0;
  const clamp = (o: { x: number; y: number }) => ({
    x: Math.max(-(dw - FRAME) / 2, Math.min((dw - FRAME) / 2, o.x)),
    y: Math.max(-(dh - FRAME) / 2, Math.min((dh - FRAME) / 2, o.y)),
  });

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('Choose an image file (JPG, PNG or WebP).'); return; }
    if (f.size > 10 * 1024 * 1024) { setError('That image is over 10 MB. Choose a smaller one.'); return; }
    setError('');
    const url = URL.createObjectURL(f);
    const el = new Image();
    el.onload = () => { setImg(el); setSrc(url); setZoom(1); setOff({ x: 0, y: 0 }); };
    el.src = url;
  }

  // Render the crop to a blob (debounced).
  useEffect(() => {
    if (!img) return;
    const t = setTimeout(() => {
      const o = clamp(off);
      const sx = (dw / 2 - FRAME / 2 - o.x) / scale;
      const sy = (dh / 2 - FRAME / 2 - o.y) / scale;
      const c = document.createElement('canvas');
      c.width = OUT; c.height = OUT;
      c.getContext('2d')!.drawImage(img, sx, sy, FRAME / scale, FRAME / scale, 0, 0, OUT, OUT);
      c.toBlob((b) => onChange(b), 'image/jpeg', 0.9);
    }, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, zoom, off]);

  const shown = clamp(off);
  return (
    <div className="space-y-4">
      <div
        className="relative mx-auto touch-none overflow-hidden rounded-3xl border border-white/15 bg-cryo"
        style={{ width: FRAME, height: FRAME, cursor: img ? 'grab' : 'default' }}
        onPointerDown={(e) => { if (!img) return; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, ox: off.x, oy: off.y }; }}
        onPointerMove={(e) => { if (drag.current) setOff(clamp({ x: drag.current.ox + e.clientX - drag.current.x, y: drag.current.oy + e.clientY - drag.current.y })); }}
        onPointerUp={() => { drag.current = null; }}
      >
        {src && img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="Crop preview" draggable={false} className="pointer-events-none absolute max-w-none select-none"
            style={{ width: dw, height: dh, left: FRAME / 2 - dw / 2 + shown.x, top: FRAME / 2 - dh / 2 + shown.y }} />
        ) : initialUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={initialUrl} alt="Current photo" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center text-silver">Your face photo appears here</div>
        )}
        {img && <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/30" />}
      </div>
      {img && (
        <label className="mx-auto flex max-w-[280px] items-center gap-3 text-sm text-silver">
          Zoom
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-[rgb(var(--accent-cyan))]" />
        </label>
      )}
      <div className="text-center">
        <label className="btn-ghost cursor-pointer">
          {img || initialUrl ? 'Choose a different photo' : 'Choose a photo'}
          <input type="file" accept="image/*" className="sr-only" onChange={pick} />
        </label>
        <p className="mt-2 text-xs text-silver">A clear, front-facing photo. Drag to reposition. It is used for your pass only.</p>
        {error && <p role="alert" className="mt-2 text-sm text-sunlight">{error}</p>}
      </div>
    </div>
  );
}
