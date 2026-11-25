export type Instructor = {
  id: string; name: string; role: string; bio: string; photo_url: string | null;
  stack: string[]; teaches: string; sort_order: number;
};
export type Segment = {
  id: string; title: string; description: string; starts_at: string | null; duration: string;
  tags: string[]; prerequisites: string; tools: string[]; outcomes: string; sort_order: number;
};
export type Notice = {
  id: string; title: string; body: string; priority: 'URGENT' | 'SCHEDULE' | 'GENERAL';
  featured_on_home: boolean; created_at: string;
};
export type Resource = {
  id: string; title: string; description: string; session: string;
  kind: 'pdf' | 'jpg' | 'drive' | 'url' | 'video'; url: string | null; file_path: string | null;
  sort_order: number; created_at: string;
};
export type Student = {
  id: string; user_id: string; student_code: string; full_name: string; phone: string; email: string;
  grade: string; institution: string; address: string; experience: string; preferred_field: string | null;
  photo_path: string | null; consent: boolean; verified_at: string; created_at: string;
};
export type AdminRole = 'admin' | 'super_admin' | null;
