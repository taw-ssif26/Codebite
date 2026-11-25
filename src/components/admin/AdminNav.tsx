'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  ['/admin', 'Overview'], ['/admin/content', 'Hero & Academy'], ['/admin/instructors', 'Instructors'], ['/admin/segments', 'Segments'],
  ['/admin/notices', 'Notices'], ['/admin/resources', 'Resources'], ['/admin/theme', 'Theme'], ['/admin/students', 'Students'], ['/admin/email', 'Email'],
];

export function AdminNav({ superAdmin }: { superAdmin: boolean }) {
  const path = usePathname();
  const links = superAdmin ? [...LINKS, ['/admin/admins', 'Admins']] : LINKS;
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">
      {links.map(([href, label]) => {
        const on = href === '/admin' ? path === '/admin' : path.startsWith(href);
        return <Link key={href} href={href} aria-current={on ? 'page' : undefined} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm transition ${on ? 'bg-white/10 text-snow' : 'text-silver hover:bg-white/5'}`}>{label}</Link>;
      })}
      <Link href="/" className="shrink-0 rounded-xl px-4 py-2.5 text-sm text-silver hover:bg-white/5 lg:mt-6">← Public site</Link>
    </nav>
  );
}
