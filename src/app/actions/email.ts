'use server';
import { createClient } from '@/lib/supabase/server';
import { renderBodyHtml, renderText, studentVars, welcomeHtml, wrapEmail } from '@/lib/email';
import type { Student } from '@/lib/types';

type Result = { ok: boolean; error?: string };

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

/** EMAIL_FROM accepts "Name <address@domain>" or a bare address. The address must be a verified sender in Brevo. */
function mailer() {
  const key = process.env.BREVO_API_KEY;
  const raw = process.env.EMAIL_FROM?.trim();
  if (!key || !raw) return null;
  const m = raw.match(/^(.*)<([^>]+)>$/);
  const sender = m ? { name: m[1].trim().replace(/^"|"$/g, '') || 'Codezy CodeBite', email: m[2].trim() } : { name: 'Codezy CodeBite', email: raw };
  return { key, sender };
}

async function brevo(key: string, body: unknown): Promise<string | null> {
  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.ok) return null;
  let detail = '';
  try { detail = ((await res.json()) as { message?: string }).message ?? ''; } catch { /* ignore */ }
  return `Brevo ${res.status}${detail ? `: ${detail}` : ''}`;
}

/** Sends the welcome email (with QR pass) to the signed-in student. */
export async function sendWelcomeEmail(): Promise<Result> {
  const sb = createClient();
  const m = mailer();
  if (!sb) return { ok: false, error: 'Supabase is not configured.' };
  if (!m) return { ok: false, error: 'Email is not configured (BREVO_API_KEY / EMAIL_FROM).' };
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { ok: false, error: 'Not signed in.' };
  const { data: student } = await sb.from('students').select('*').eq('user_id', auth.user.id).maybeSingle();
  if (!student) return { ok: false, error: 'No student record found.' };
  const s = student as Student;
  const err = await brevo(m.key, {
    sender: m.sender,
    to: [{ email: s.email, name: s.full_name }],
    subject: `Your CodeBite Expedition Pass — ${s.student_code}`,
    htmlContent: welcomeHtml(s),
  });
  return err ? { ok: false, error: err } : { ok: true };
}

export type BroadcastInput = { subject: string; body: string; grade?: string; experience?: string };

/** Admin-only: personalised bulk email to a filtered set of verified students. */
export async function sendBroadcast(input: BroadcastInput): Promise<Result & { sent?: number; failed?: number }> {
  const sb = createClient();
  const m = mailer();
  if (!sb) return { ok: false, error: 'Supabase is not configured.' };
  if (!m) return { ok: false, error: 'Email is not configured (BREVO_API_KEY / EMAIL_FROM).' };
  const { data: role } = await sb.rpc('admin_role');
  if (!role) return { ok: false, error: 'Admins only.' };
  if (!input.subject.trim() || !input.body.trim()) return { ok: false, error: 'Subject and body are required.' };

  // Paginate: PostgREST returns at most 1000 rows per request.
  const students: Student[] = [];
  for (let from = 0; ; from += 1000) {
    let q = sb.from('students').select('*').not('verified_at', 'is', null).order('created_at').range(from, from + 999);
    if (input.grade) q = q.eq('grade', input.grade);
    if (input.experience) q = q.eq('experience', input.experience);
    const { data, error } = await q;
    if (error) return { ok: false, error: error.message };
    students.push(...((data as Student[]) ?? []));
    if (!data || data.length < 1000) break;
  }
  if (students.length === 0) return { ok: false, error: 'No students match that filter.' };

  const versions = students.map((s) => {
    const vars = studentVars(s);
    return {
      to: [{ email: s.email, name: s.full_name }],
      subject: renderText(input.subject, vars),
      htmlContent: wrapEmail(renderBodyHtml(input.body, vars)),
    };
  });

  // One API call per chunk using Brevo "messageVersions": each recipient gets its own personalised
  // subject/body and cannot see the others. Top-level subject/htmlContent are required fallbacks.
  const CHUNK = 50;
  let sent = 0, failed = 0, lastError = '';
  for (let i = 0; i < versions.length; i += CHUNK) {
    const chunk = versions.slice(i, i + CHUNK);
    const err = await brevo(m.key, { sender: m.sender, subject: chunk[0].subject, htmlContent: chunk[0].htmlContent, messageVersions: chunk });
    if (err) { failed += chunk.length; lastError = err; } else sent += chunk.length;
  }
  return { ok: failed === 0, sent, failed, error: failed ? lastError : undefined };
}
