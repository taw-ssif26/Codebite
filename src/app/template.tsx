'use client';
import { motion } from 'framer-motion';

// Route-level page transition (cross-fade + slight lift). The Dock's active pill uses a
// shared layoutId, so it glides between routes as the shared-element transition.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
