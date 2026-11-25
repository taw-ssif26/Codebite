'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/** Email one-time-code step shared by /login and /register. */
export function OtpVerify({ email, onVerified, autoSend = true }: { email: string; onVerified: () => void; autoSend?: boolean }) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function send() {
    setBusy(true); setError('');
    const { error } = await createClient().auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) { setError(error.message); return; }
    setSent(true); setCooldown(30);
  }

  useEffect(() => { if (autoSend) send(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    const { error } = await createClient().auth.verifyOtp({ email, token: code.trim(), type: 'email' });
    setBusy(false);
    if (error) { setError('That code did not work. Check the digits or request a new code.'); return; }
    onVerified();
  }

  return (
    <form onSubmit={verify} className="space-y-4">
      <p className="text-silver">{sent ? <>We sent a code to <span className="text-snow">{email}</span>. Enter it below.</> : <>Sending a code to <span className="text-snow">{email}</span>…</>}</p>
      <input className="input tnum text-center text-2xl tracking-[.4em]" inputMode="numeric" autoComplete="one-time-code" maxLength={8}
        placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} aria-label="Verification code" />
      {error && <p role="alert" className="text-sm text-sunlight">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary" disabled={busy || code.length < 6}>{busy ? 'Checking…' : 'Verify email'}</button>
        <button type="button" className="btn-ghost" onClick={send} disabled={busy || cooldown > 0}>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Send a new code'}</button>
      </div>
    </form>
  );
}
