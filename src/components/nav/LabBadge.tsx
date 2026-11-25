'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common/Logo';

export function LabBadge() {
  const path = usePathname();
  if (path.startsWith('/admin')) return null;
  return (
    <motion.div className="fixed left-3 top-3 z-40 sm:left-5 sm:top-5" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
      <Link href="/" className="badge-pill glass flex items-center gap-3 !rounded-full py-2.5 pl-4 pr-5 sm:gap-4 sm:py-3 sm:pl-5 sm:pr-6" aria-label="Codezy CodeBite home">
        <Logo className="h-8 w-auto sm:h-10" />
        <span className="hidden h-7 w-px bg-white/15 sm:block" />
        <span className="hidden flex-col sm:flex">
          <span className="micro !text-snow">Cryo-Lab</span>
          <span className="micro tnum flex items-center gap-2"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-verdant" />23.81°N · 90.41°E</span>
        </span>
      </Link>
    </motion.div>
  );
}
