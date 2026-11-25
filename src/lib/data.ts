import { createClient } from './supabase/server';
import { DEFAULT_SETTINGS, FALLBACK_INSTRUCTORS, FALLBACK_SEGMENTS } from './defaults';
import type { Instructor, Notice, Segment } from './types';

export async function getSettings(): Promise<Record<string, string>> {
  const sb = createClient();
  if (!sb) return DEFAULT_SETTINGS;
  try {
    const { data } = await sb.from('site_settings').select('key,value');
    const out = { ...DEFAULT_SETTINGS };
    (data ?? []).forEach((r: { key: string; value: unknown }) => {
      if (typeof r.value === 'string' && r.value.trim() !== '') out[r.key] = r.value;
    });
    return out;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getInstructors(): Promise<Instructor[]> {
  const sb = createClient();
  if (!sb) return FALLBACK_INSTRUCTORS;
  const { data, error } = await sb.from('instructors').select('*').order('sort_order').order('created_at');
  return error || !data?.length ? FALLBACK_INSTRUCTORS : (data as Instructor[]);
}

export async function getSegments(): Promise<Segment[]> {
  const sb = createClient();
  if (!sb) return FALLBACK_SEGMENTS;
  const { data, error } = await sb.from('segments').select('*').order('sort_order').order('starts_at');
  return error || !data?.length ? FALLBACK_SEGMENTS : (data as Segment[]);
}

export async function getNotices(): Promise<Notice[]> {
  const sb = createClient();
  if (!sb) return [];
  const { data } = await sb.from('notices').select('*').order('created_at', { ascending: false });
  return (data as Notice[]) ?? [];
}

export async function getFeaturedNotices(): Promise<Notice[]> {
  const sb = createClient();
  if (!sb) return [];
  const { data } = await sb
    .from('notices').select('*').eq('featured_on_home', true)
    .order('created_at', { ascending: false }).limit(3);
  return (data as Notice[]) ?? [];
}
