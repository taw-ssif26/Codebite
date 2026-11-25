import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/syne';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/jetbrains-mono';
import './globals.css';
import { getSettings } from '@/lib/data';
import { getViewer } from '@/lib/auth';
import { themeCss } from '@/lib/theme';
import { ThermalProvider } from '@/components/thermal/ThermalProvider';
import { Atmosphere } from '@/components/thermal/Atmosphere';
import { ThermoBar } from '@/components/thermal/ThermoBar';
import { Preloader } from '@/components/thermal/Preloader';
import { Dock } from '@/components/nav/Dock';
import { LabBadge } from '@/components/nav/LabBadge';

export const metadata: Metadata = {
  title: 'Codezy Christmas CodeBite 1.0',
  description: 'A zero-prerequisite, hands-on introduction to programming for school, college and university students.',
};
export const dynamic = 'force-dynamic'; // every page reads the session and live CMS data
export const viewport: Viewport = { themeColor: '#070B10' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, viewer] = await Promise.all([getSettings(), getViewer()]);
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss(settings) }} />
      </head>
      <body>
        <ThermalProvider>
          <Atmosphere />
          <Preloader />
          <LabBadge />
          <div className="relative z-10">{children}</div>
          <ThermoBar />
          <Dock registered={Boolean(viewer.student)} isAdmin={Boolean(viewer.role)} />
        </ThermalProvider>
      </body>
    </html>
  );
}
