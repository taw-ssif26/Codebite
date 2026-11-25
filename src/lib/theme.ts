// Theme tokens live in site_settings (keys "theme.*") and are injected as CSS custom properties.
export const THEME_TOKENS = [
  { key: 'theme.bg_primary', css: '--bg-primary', label: 'Primary canvas', def: '#070B10' },
  { key: 'theme.bg_secondary', css: '--bg-secondary', label: 'Secondary surface', def: '#0D131C' },
  { key: 'theme.text_primary', css: '--text-primary', label: 'Primary text', def: '#F4F7FA' },
  { key: 'theme.text_muted', css: '--text-muted', label: 'Muted text', def: '#8E9BAE' },
  { key: 'theme.accent_cyan', css: '--accent-cyan', label: 'Glacial accent (cold)', def: '#6EE7F5' },
  { key: 'theme.accent_amber', css: '--accent-amber', label: 'Sunlight accent (warm)', def: '#FBBF24' },
  { key: 'theme.brand_1', css: '--accent-brand-1', label: 'Codezy Ember (CTAs, pulses)', def: '#ff8903' },
  { key: 'theme.brand_2', css: '--accent-brand-2', label: 'Codezy Emerald (verified)', def: '#349133' },
];

export function hexToChannels(hex: string): string | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export function themeCss(settings: Record<string, string>): string {
  const lines = THEME_TOKENS.map((t) => {
    const ch = hexToChannels(settings[t.key] ?? t.def) ?? hexToChannels(t.def)!;
    return `${t.css}:${ch};`;
  });
  return `:root{${lines.join('')}}`;
}
