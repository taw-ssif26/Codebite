'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function LabBadge() {
  const path = usePathname();
  if (path.startsWith('/admin')) return null;
  return (
    <Link href="/" className="glass fixed left-3 top-3 z-40 flex items-center gap-3 rounded-full py-2 pl-3 pr-4 sm:left-5 sm:top-5" aria-label="Codezy CodeBite home">
      {/* Replace /public/codezy-logo.svg with the official Codezy logo file. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/codezy-logo.svg" alt="Codezy" className="h-6 w-auto" />
      <span className="micro hidden border-l border-white/10 pl-3 sm:inline">Cryo-Lab · 23.81°N 90.41°E</span>
    </Link>
  );
}
