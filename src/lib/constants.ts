export type Tier = 'junior' | 'college' | 'uni';

export const GRADES = [
  { value: 'school_6_8', label: 'School: Class 6–8', tier: 'junior' as Tier },
  { value: 'school_9_10', label: 'School: Class 9–10', tier: 'junior' as Tier },
  { value: 'college_hsc', label: 'College: HSC / A-Levels', tier: 'college' as Tier },
  { value: 'university', label: 'University: Undergrad+', tier: 'uni' as Tier },
];

export const EXPERIENCE = [
  { value: 'zero', label: 'Zero', hint: 'Never written a line' },
  { value: 'basic', label: 'Tried the basics', hint: 'HTML or Scratch' },
  { value: 'built', label: 'Built things', hint: 'Small scripts or projects' },
];

export const FIELDS = [
  { value: 'web', label: 'Web Development' },
  { value: 'ai', label: 'AI & Data Science' },
  { value: 'cp', label: 'Competitive Programming' },
  { value: 'game', label: 'Game Dev' },
  { value: 'cyber', label: 'Cybersecurity' },
  { value: 'undecided', label: 'Undecided — show me everything' },
];

export const NAV = [
  { n: '01', label: 'EXPEDITION', href: '/' },
  { n: '02', label: 'MENTORS', href: '/mentors' },
  { n: '03', label: 'CODEZY LAB', href: '/academy' },
  { n: '04', label: 'SEGMENTS', href: '/segments' },
  { n: '05', label: 'VAULT', href: '/vault' },
  { n: '06', label: 'DISPATCHES', href: '/dispatches' },
];

export const gradeLabel = (v?: string | null) => GRADES.find((g) => g.value === v)?.label ?? v ?? '';
export const tierOf = (v?: string | null): Tier | null => GRADES.find((g) => g.value === v)?.tier ?? null;
export const experienceLabel = (v?: string | null) => EXPERIENCE.find((e) => e.value === v)?.label ?? v ?? '';
export const fieldLabel = (v?: string | null) => FIELDS.find((f) => f.value === v)?.label ?? '';
