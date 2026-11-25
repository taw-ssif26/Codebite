import type { User } from '@supabase/supabase-js';
import { createClient } from './supabase/server';
import type { AdminRole, Student } from './types';

export type Viewer = { user: User | null; role: AdminRole; student: Student | null };

export async function getViewer(): Promise<Viewer> {
  const sb = createClient();
  if (!sb) return { user: null, role: null, student: null };
  try {
    const { data } = await sb.auth.getUser();
    const user = data.user;
    if (!user) return { user: null, role: null, student: null };
    const [roleRes, studentRes] = await Promise.all([
      sb.rpc('admin_role'),
      sb.from('students').select('*').eq('user_id', user.id).maybeSingle(),
    ]);
    return {
      user,
      role: (roleRes.data as AdminRole) ?? null,
      student: (studentRes.data as Student | null) ?? null,
    };
  } catch {
    return { user: null, role: null, student: null };
  }
}
