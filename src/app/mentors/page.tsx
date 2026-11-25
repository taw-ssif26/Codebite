import { PageShell } from '@/components/common/PageShell';
import { MentorCard } from '@/components/home/MentorCard';
import { getInstructors } from '@/lib/data';

// Deliberately uneven: spans and offsets cycle so the grid never reads as equal-height columns.
const LAYOUT = [
  'md:col-span-5 md:col-start-1',
  'md:col-span-4 md:col-start-7 md:mt-24',
  'md:col-span-3 md:col-start-2 md:-mt-8',
  'md:col-span-5 md:col-start-6 md:mt-12',
  'md:col-span-4 md:col-start-1 md:mt-4',
  'md:col-span-4 md:col-start-7 md:mt-20',
];

export default async function Mentors() {
  const list = await getInstructors();
  return (
    <PageShell coord="02 // MENTORS" title="The Lab Fellows" intro="The people who will sit beside you while you write your first programs. Hover or tap a portrait to open their dossier." wide>
      <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-12">
        {list.map((m, i) => <MentorCard key={m.id} m={m} className={LAYOUT[i % LAYOUT.length]} />)}
      </div>
    </PageShell>
  );
}
