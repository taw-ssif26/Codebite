import { fieldLabel, gradeLabel } from './constants';
import type { Student } from './types';

export const TEMPLATE_VARS = ['name', 'grade', 'institution', 'student_id', 'preferred_field', 'profile_url'] as const;

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function studentVars(s: Pick<Student, 'full_name' | 'grade' | 'institution' | 'student_code' | 'preferred_field'>) {
  return {
    name: s.full_name,
    grade: gradeLabel(s.grade),
    institution: s.institution,
    student_id: s.student_code,
    preferred_field: fieldLabel(s.preferred_field) || 'Undecided',
    profile_url: `${siteUrl()}/pass/${s.student_code}`,
  } as Record<string, string>;
}

/** Plain-text substitution (subject lines). */
export function renderText(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/{{\s*(\w+)\s*}}/g, (_, k) => vars[k] ?? '');
}

/** Body: admin text is HTML-escaped first, so templates can never inject markup. */
export function renderBodyHtml(tpl: string, vars: Record<string, string>) {
  const escaped = escapeHtml(tpl).replace(/{{\s*(\w+)\s*}}/g, (_, k) => escapeHtml(vars[k] ?? ''));
  return escaped
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

export function wrapEmail(inner: string) {
  return `<!doctype html><html><body style="margin:0;background:#070B10;padding:32px 12px;font-family:Helvetica,Arial,sans-serif;color:#F4F7FA">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#0D131C;border:1px solid #1d2733;border-radius:16px">
<tr><td style="padding:28px 32px 8px;font-size:11px;letter-spacing:.15em;color:#8E9BAE">CODEZY CHRISTMAS CODEBITE 1.0</td></tr>
<tr><td style="padding:8px 32px 32px;font-size:15px;color:#F4F7FA">${inner}</td></tr>
</table></td></tr></table></body></html>`;
}

export function welcomeHtml(s: Student) {
  const url = siteUrl();
  return wrapEmail(`
<h1 style="margin:0 0 12px;font-size:24px">You're in, ${escapeHtml(s.full_name.split(' ')[0])}.</h1>
<p style="margin:0 0 20px;line-height:1.6">Your email is verified and your Expedition Pass is ready. Show the QR code below at check-in.</p>
<p style="margin:0 0 6px;font-size:11px;letter-spacing:.15em;color:#8E9BAE">STUDENT ID</p>
<p style="margin:0 0 20px;font-family:Menlo,monospace;font-size:22px;color:#6EE7F5">${s.student_code}</p>
<img src="${url}/api/qr/${s.student_code}" width="200" height="200" alt="Pass QR code" style="display:block;border-radius:12px;background:#fff;margin:0 0 24px"/>
<a href="${url}/profile" style="display:inline-block;background:#ff8903;color:#070B10;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px">View your Expedition Pass</a>`);
}
