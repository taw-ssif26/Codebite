import { SettingsForm } from '@/components/admin/SettingsForm';
import { THEME_TOKENS } from '@/lib/theme';

export default function Page() {
  return <SettingsForm title="Theme & colors" live fields={THEME_TOKENS.map((t) => ({ key: t.key, label: t.label, type: 'color' as const }))} />;
}
