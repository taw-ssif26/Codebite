import { EmptyState, PageShell } from '@/components/common/PageShell';
import { getNotices } from '@/lib/data';

export default async function Dispatches() {
  const notices = await getNotices();
  return (
    <PageShell coord="06 // DISPATCHES" title="Notices & Dispatches" intro="Schedule changes, urgent updates and announcements, newest first.">
      {notices.length === 0 ? (
        <EmptyState title="No dispatches yet" body="Announcements will appear here as soon as the team posts them." />
      ) : (
        <ul className="space-y-4">
          {notices.map((n) => (
            <li key={n.id} className="glass p-6 sm:p-8">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className={`micro rounded-full border px-3 py-1 ${n.priority === 'URGENT' ? 'tag-urgent' : n.priority === 'SCHEDULE' ? 'tag-schedule' : 'tag-general'}`}>{n.priority}</span>
                <time className="micro tnum" dateTime={n.created_at}>{new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
              </div>
              <h2 className="display text-2xl sm:text-3xl">{n.title}</h2>
              {n.body && <p className="mt-3 max-w-2xl whitespace-pre-line leading-relaxed text-silver">{n.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
