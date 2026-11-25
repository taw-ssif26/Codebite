import { EmailComposer } from '@/components/admin/EmailComposer';

// Large broadcasts can take a while; raise the function limit (capped by your Vercel plan).
export const maxDuration = 60;
export default function Page() { return <EmailComposer />; }
