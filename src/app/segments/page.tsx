import { PageShell } from '@/components/common/PageShell';
import { SegmentExplorer } from '@/components/home/SegmentExplorer';
import { getSegments } from '@/lib/data';

export default async function Segments() {
  const segments = await getSegments();
  return (
    <PageShell coord="04 // SEGMENTS" title="Expedition Blueprint" intro="Every workshop, live session and challenge, in order. Open a segment to see what you need and what you leave with.">
      <SegmentExplorer segments={segments} />
    </PageShell>
  );
}
