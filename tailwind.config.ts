import type { Config } from 'tailwindcss';

// Colors are bound to CSS variables (space-separated RGB channels) so the Admin
// theme customizer can re-skin the site live. See src/lib/theme.ts.
const token = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: token('--bg-primary'),
        cryo: token('--bg-secondary'),
        snow: token('--text-primary'),
        silver: token('--text-muted'),
        glacial: token('--accent-cyan'),
        sunlight: token('--accent-amber'),
        ember: token('--accent-brand-1'),
        verdant: token('--accent-brand-2'),
      },
      fontFamily: {
        display: ['"Syne Variable"', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
