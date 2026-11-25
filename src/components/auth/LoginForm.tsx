'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OtpVerify } from './OtpVerify';

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  return (
    <div className="glass mx-auto max-w-md p-8">
      {step === 'email' ? (
        <form onSubmit={(e) => { e.preventDefault(); setStep('code'); }} className="space-y-4">
          <label className="micro block" htmlFor="login-email">Email address</label>
          <input id="login-email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <button className="btn-primary w-full">Email me a code</button>
        </form>
      ) : (
        <OtpVerify email={email} onVerified={() => { router.push(next || '/profile'); router.refresh(); }} />
      )}
    </div>
  );
}
