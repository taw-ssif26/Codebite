'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { EXPERIENCE, FIELDS, GRADES, tierOf, type Tier } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { sendWelcomeEmail } from '@/app/actions/email';
import { OtpVerify } from '@/components/auth/OtpVerify';
import { PhotoCropper } from './PhotoCropper';

type Form = {
  full_name: string; phone: string; email: string; grade: string; institution: string; address: string;
  experience: string; preferred_field: string; consent: boolean;
};
const EMPTY: Form = { full_name: '', phone: '', email: '', grade: '', institution: '', address: '', experience: '', preferred_field: '', consent: false };
const STEPS = ['identity', 'academic', 'address', 'coding', 'photo', 'verify'] as const;
type Step = (typeof STEPS)[number];

// Microcopy shifts with the student's level; layout and chrome shift via data-tier styles below.
const COPY: Record<Tier | 'default', Record<Step, [string, string]>> = {
  default: {
    identity: ['Who are you?', 'Start with the basics.'], academic: ['Where do you study?', 'Pick your level and name your institution.'],
    address: ['Where are you based?', 'Your full address.'], coding: ['Your coding starting point', 'There is no wrong answer here.'],
    photo: ['Your pass photo', 'This goes on your Expedition Pass.'], verify: ['Verify your email', 'One last step.'],
  },
  junior: {
    identity: ['Hi! What should we call you?', 'Tell us who you are, and we will get your pass started.'], academic: ['Which class are you in?', 'Pick your class and tell us your school.'],
    address: ['Where do you live?', 'So we know where our explorers come from.'], coding: ['Ever tried coding?', 'Totally fine if not. Most explorers are just starting.'],
    photo: ['Smile for your pass!', 'Pick a clear photo of your face.'], verify: ['Almost there!', 'We will email you a secret code to prove it is really you.'],
  },
  college: {
    identity: ['Identify yourself.', 'Name, phone and email.'], academic: ['Academic profile', 'Level and institution.'],
    address: ['Location', 'Full address.'], coding: ['Current skill level', 'Where are you starting from, and where do you want to go?'],
    photo: ['Pass photo', 'Crop it and lock it in.'], verify: ['Verify email', 'Confirm the code we send you.'],
  },
  uni: {
    identity: ['init --user', 'name, phone, email'], academic: ['set --level --institution', 'academic context'],
    address: ['set --address', 'full postal address'], coding: ['set --experience --track', 'experience level; optional preferred track'],
    photo: ['upload --photo', '512x512 jpeg, cropped client-side'], verify: ['auth --verify-email', 'enter the one-time code'],
  },
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^\+?[0-9\s-]{7,16}$/;

function validate(step: Step, f: Form, hasPhoto: boolean): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === 'identity') {
    if (f.full_name.trim().length < 2) e.full_name = 'Enter your full name.';
    if (!phoneRe.test(f.phone.trim())) e.phone = 'Enter a valid phone number (7–15 digits).';
    if (!emailRe.test(f.email.trim())) e.email = 'Enter a valid email address.';
  }
  if (step === 'academic') {
    if (!f.grade) e.grade = 'Choose your level.';
    if (f.institution.trim().length < 2) e.institution = 'Enter your institution name.';
  }
  if (step === 'address' && f.address.trim().length < 5) e.address = 'Enter your full address.';
  if (step === 'coding' && !f.experience) e.experience = 'Choose where you are starting from.';
  if (step === 'photo' && !hasPhoto) e.photo = 'Add and crop a photo to continue.';
  return e;
}

function Burst({ n }: { n: number }) {
  const [bursts, setBursts] = useState<number[]>([]);
  useEffect(() => {
    if (n === 0) return;
    setBursts((b) => [...b, n]);
    const t = setTimeout(() => setBursts((b) => b.filter((x) => x !== n)), 1000);
    return () => clearTimeout(t);
  }, [n]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bursts.map((b) => Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <motion.span key={`${b}-${i}`} className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-white"
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: Math.cos(a) * (90 + (i % 3) * 30), y: Math.sin(a) * (90 + (i % 3) * 30), opacity: 0, scale: 0.3 }} transition={{ duration: 0.9, ease: 'easeOut' }} />;
      }))}
    </div>
  );
}

function FloatingBadges() {
  const items = [
    { c: 'bg-glacial/25', s: 'h-14 w-14 rounded-full', x: '8%', y: '12%' }, { c: 'bg-sunlight/25', s: 'h-10 w-10 rotate-12 rounded-lg', x: '88%', y: '20%' },
    { c: 'bg-white/10', s: 'h-12 w-12 rounded-full', x: '92%', y: '70%' }, { c: 'bg-glacial/20', s: 'h-8 w-8 rotate-45 rounded-md', x: '4%', y: '78%' },
  ];
  return <>{items.map((b, i) => (
    <motion.div key={i} className={`pointer-events-none absolute ${b.c} ${b.s}`} style={{ left: b.x, top: b.y }}
      animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }} aria-hidden />
  ))}</>;
}

export function RegisterFlow() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [f, setF] = useState<Form>(EMPTY);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [burst, setBurst] = useState(0);
  const [stage, setStage] = useState<'consent' | 'otp' | 'saving'>('consent');
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [fatal, setFatal] = useState('');

  const step = STEPS[i];
  const tier = tierOf(f.grade);
  const copy = COPY[tier ?? 'default'][step];
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (step !== 'verify') return;
    createClient().auth.getUser().then(({ data }) => setSessionEmail(data.user?.email ?? null));
  }, [step]);

  function next() {
    const e = validate(step, f, Boolean(photo));
    setErrors(e);
    if (Object.keys(e).length) return;
    setBurst((b) => b + 1);
    setI((x) => Math.min(STEPS.length - 1, x + 1));
  }

  async function finalize() {
    setStage('saving'); setFatal('');
    const sb = createClient();
    const { data } = await sb.auth.getUser();
    const user = data.user;
    if (!user || !user.email) { setFatal('Your session expired. Please verify your email again.'); setStage('consent'); return; }
    const path = `${user.id}/photo.jpg`;
    const up = await sb.storage.from('student-photos').upload(path, photo!, { upsert: true, contentType: 'image/jpeg' });
    if (up.error) { setFatal(`Photo upload failed: ${up.error.message}`); setStage('otp'); return; }
    const { error } = await sb.from('students').insert({
      user_id: user.id, email: user.email, full_name: f.full_name.trim(), phone: f.phone.trim(), grade: f.grade,
      institution: f.institution.trim(), address: f.address.trim(), experience: f.experience,
      preferred_field: f.preferred_field || null, photo_path: path, consent: true,
    });
    if (error) {
      setFatal(error.code === '23505' ? 'This email is already registered. Log in to see your pass.' : `Could not save your registration: ${error.message}`);
      setStage('otp'); return;
    }
    await sendWelcomeEmail(); // best effort; the pass is already created
    router.push('/profile'); router.refresh();
  }

  const progress = ((i + 1) / STEPS.length) * 100;
  const err = (k: string) => errors[k] && <p role="alert" className="mt-1 text-sm text-sunlight">{errors[k]}</p>;
  const label = (t: string) => <label className={`micro mb-2 block ${tier === 'uni' ? '!normal-case !tracking-normal' : ''}`}>{tier === 'uni' ? `$ ${t.toLowerCase().replace(/ /g, '_')}=` : t}</label>;

  const shell = tier === 'uni'
    ? 'relative rounded-lg border border-white/20 bg-obsidian/90 p-6 font-mono sm:p-10'
    : tier === 'junior' ? 'glass relative rounded-[2rem] p-6 sm:p-10' : 'glass relative p-6 sm:p-10';

  const preview = useMemo(() => JSON.stringify({ name: f.full_name || '…', level: f.grade || '…', institution: f.institution || '…', experience: f.experience || '…', track: f.preferred_field || 'undecided' }, null, 2), [f]);

  return (
    <div data-tier={tier ?? 'default'} className={`mx-auto grid max-w-5xl gap-6 ${tier === 'college' ? 'lg:grid-cols-[1fr_280px]' : ''}`}>
      <div className={shell}>
        {tier === 'junior' && <FloatingBadges />}
        {tier === 'uni' && <div className="mb-6 flex gap-1.5" aria-hidden><i className="h-2.5 w-2.5 rounded-full bg-white/20" /><i className="h-2.5 w-2.5 rounded-full bg-white/20" /><i className="h-2.5 w-2.5 rounded-full bg-white/20" /></div>}
        <Burst n={tier === 'junior' ? burst : 0} />

        <div className="relative mb-8">
          <div className="h-px w-full bg-white/10"><motion.div className="h-px bg-ember" animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} /></div>
          <p className="micro tnum mt-3">Step {i + 1} / {STEPS.length}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28 }} className="relative space-y-6">
            <div>
              <h2 className={`display text-3xl sm:text-4xl ${tier === 'uni' ? '!font-mono !tracking-normal' : ''}`}>{copy[0]}</h2>
              <p className="mt-2 text-silver">{copy[1]}</p>
            </div>

            {step === 'identity' && (<>
              <div>{label('Full name')}<input className="input" value={f.full_name} onChange={(e) => set('full_name', e.target.value)} autoComplete="name" />{err('full_name')}</div>
              <div>{label('Phone number')}<input className="input" inputMode="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" placeholder="+880 1XXX-XXXXXX" />{err('phone')}</div>
              <div>{label('Email address')}<input className="input" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />{err('email')}</div>
            </>)}

            {step === 'academic' && (<>
              <div>{label('Academic grade / level')}
                <div className="grid gap-3 sm:grid-cols-2">
                  {GRADES.map((g) => (
                    <button key={g.value} type="button" onClick={() => set('grade', g.value)} aria-pressed={f.grade === g.value}
                      className={`rounded-xl border p-4 text-left transition ${f.grade === g.value ? 'border-glacial bg-glacial/10' : 'border-white/10 hover:bg-white/5'}`}>{g.label}</button>
                  ))}
                </div>{err('grade')}</div>
              <div>{label('Institution name')}<input className="input" value={f.institution} onChange={(e) => set('institution', e.target.value)} placeholder="School, college or university" />{err('institution')}</div>
            </>)}

            {step === 'address' && <div>{label('Full address')}<textarea className="input min-h-28" value={f.address} onChange={(e) => set('address', e.target.value)} autoComplete="street-address" />{err('address')}</div>}

            {step === 'coding' && (<>
              <div>{label('Previous coding experience')}
                <div className="grid gap-3 sm:grid-cols-3">
                  {EXPERIENCE.map((x) => (
                    <button key={x.value} type="button" onClick={() => set('experience', x.value)} aria-pressed={f.experience === x.value}
                      className={`rounded-xl border p-4 text-left transition ${f.experience === x.value ? 'border-glacial bg-glacial/10' : 'border-white/10 hover:bg-white/5'}`}>
                      <p className="font-semibold">{x.label}</p><p className="mt-1 text-sm text-silver">{x.hint}</p>
                    </button>
                  ))}
                </div>{err('experience')}</div>
              <div>{label('Preferred field in coding (optional)')}
                <div className="flex flex-wrap gap-2">
                  {FIELDS.map((x) => (
                    <button key={x.value} type="button" onClick={() => set('preferred_field', f.preferred_field === x.value ? '' : x.value)} aria-pressed={f.preferred_field === x.value}
                      className={`rounded-full border px-4 py-2 text-sm transition ${f.preferred_field === x.value ? 'border-glacial bg-glacial/10 text-glacial' : 'border-white/15 hover:bg-white/5'}`}>{x.label}</button>
                  ))}
                </div></div>
            </>)}

            {step === 'photo' && <div><PhotoCropper onChange={setPhoto} />{err('photo')}</div>}

            {step === 'verify' && (
              <div className="space-y-5">
                {fatal && <p role="alert" className="text-sunlight">{fatal} {fatal.includes('already registered') && <Link href="/login" className="underline">Log in</Link>}</p>}
                {stage === 'consent' && (<>
                  <label className="flex items-start gap-3 text-sm text-silver">
                    <input type="checkbox" className="mt-1 h-4 w-4 accent-[rgb(var(--accent-cyan))]" checked={f.consent} onChange={(e) => set('consent', e.target.checked)} />
                    <span>I confirm the details are correct and agree to Codezy Academy storing them, including my photo, to run CodeBite and issue my pass. If I am under 18, my parent or guardian has agreed.</span>
                  </label>
                  {sessionEmail ? (
                    <button className="btn-primary" disabled={!f.consent} onClick={finalize}>Create my pass ({sessionEmail})</button>
                  ) : (
                    <button className="btn-primary" disabled={!f.consent} onClick={() => setStage('otp')}>Send verification code</button>
                  )}
                </>)}
                {stage === 'otp' && <OtpVerify email={f.email.trim()} onVerified={finalize} />}
                {stage === 'saving' && <p className="micro flex items-center gap-2"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />Creating your pass…</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step !== 'verify' && (
          <div className="relative mt-10 flex items-center justify-between">
            <button className="btn-ghost" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0} style={{ visibility: i === 0 ? 'hidden' : 'visible' }}>Back</button>
            <button className="btn-primary" onClick={next}>Continue</button>
          </div>
        )}
        {step === 'verify' && stage !== 'saving' && <button className="btn-ghost relative mt-8" onClick={() => { setStage('consent'); setI(i - 1); }}>Back</button>}
      </div>

      {tier === 'college' && (
        <aside className="glass hidden self-start p-5 lg:block" aria-label="Live preview">
          <p className="micro mb-3">Live preview</p>
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-glacial">{`const student = ${preview};`}</pre>
        </aside>
      )}
    </div>
  );
}
