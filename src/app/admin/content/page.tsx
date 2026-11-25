import { SettingsForm } from '@/components/admin/SettingsForm';

export default function Page() {
  return (
    <SettingsForm title="Hero & Academy" fields={[
      { key: 'hero.eyebrow', label: 'Hero eyebrow', type: 'text' },
      { key: 'hero.title', label: 'Hero title', type: 'text' },
      { key: 'hero.subtitle', label: 'Hero subtitle', type: 'textarea' },
      { key: 'event.date', label: 'Event date & time (your local time)', type: 'datetime', help: 'Drives the live countdown.' },
      { key: 'academy.title', label: 'Academy page title', type: 'text' },
      { key: 'academy.mission', label: 'Mission line', type: 'text' },
      { key: 'academy.story', label: 'Story (blank line = new paragraph)', type: 'textarea' },
      { key: 'academy.why', label: 'Why we host CodeBite', type: 'textarea' },
      { key: 'academy.metrics', label: 'Impact metrics', type: 'textarea', help: 'One per line as value|label, e.g. 1,200+|Learners mentored' },
    ]} />
  );
}
