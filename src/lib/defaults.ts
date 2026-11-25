import type { Instructor, Notice, Segment } from './types';
import { THEME_TOKENS } from './theme';

// Used when Supabase is not configured yet or a table is empty, so the site always renders.
export const DEFAULT_SETTINGS: Record<string, string> = {
  ...Object.fromEntries(THEME_TOKENS.map((t) => [t.key, t.def])),
  'hero.eyebrow': 'CODEZY CRYO-LAB // EXPEDITION 1.0',
  'hero.title': 'Codezy Christmas CodeBite 1.0',
  'hero.subtitle':
    'Your first step into programming. No experience, no prerequisites, no pressure — just a hands-on expedition for school, college and university students who have never written a line of code.',
  'event.date': '2026-12-25T10:00:00+06:00',
  'academy.title': 'Codezy Academy',
  'academy.story':
    'Codezy Academy exists to make programming feel reachable. We teach by building, in small groups, with mentors who remember what it was like to start from nothing.\n\nCodeBite is our open door: one short, hands-on campaign that shows you what code can do and where it can take you.',
  'academy.mission': 'Make the first line of code the easiest one anyone ever writes.',
  'academy.why':
    'Every field now runs on software. We host CodeBite so any student — whatever their school, grade or background — can try programming before deciding anything.',
  'academy.metrics': '—|Learners mentored\n—|Workshops delivered\n—|Partner institutions',
};

export const FALLBACK_INSTRUCTORS: Instructor[] = [
  { id: 'f1', name: 'Lab Fellow 01', role: 'Lead Mentor', bio: 'Placeholder profile. Add real mentors in the admin dashboard.', photo_url: null, stack: ['Python', 'Web'], teaches: 'Your first program', sort_order: 1 },
  { id: 'f2', name: 'Lab Fellow 02', role: 'Web Mentor', bio: 'Placeholder profile. Add real mentors in the admin dashboard.', photo_url: null, stack: ['HTML', 'CSS', 'JavaScript'], teaches: 'Build a web page', sort_order: 2 },
  { id: 'f3', name: 'Lab Fellow 03', role: 'Logic Mentor', bio: 'Placeholder profile. Add real mentors in the admin dashboard.', photo_url: null, stack: ['Problem solving'], teaches: 'Thinking like a programmer', sort_order: 3 },
];

export const FALLBACK_SEGMENTS: Segment[] = [
  { id: 's1', title: 'Boot Sequence', description: 'What code is, how computers follow instructions, and why anyone can learn it.', starts_at: null, duration: '45 min', tags: ['Intro'], prerequisites: 'None — Zero to One', tools: ['Browser'], outcomes: 'You can explain what a program is.', sort_order: 1 },
  { id: 's2', title: 'Hello, World', description: 'Write and run your first program, live, with a mentor beside you.', starts_at: null, duration: '60 min', tags: ['Live coding'], prerequisites: 'None — Zero to One', tools: ['Online editor'], outcomes: 'Your first working program.', sort_order: 2 },
  { id: 's3', title: 'Web Lab', description: 'Turn text into a real web page you can show your friends.', starts_at: null, duration: '75 min', tags: ['Workshop'], prerequisites: 'None — Zero to One', tools: ['HTML', 'CSS'], outcomes: 'A personal page of your own.', sort_order: 3 },
  { id: 's4', title: 'Logic Chamber', description: 'Variables, decisions and loops through short challenges.', starts_at: null, duration: '60 min', tags: ['Challenge'], prerequisites: 'None — Zero to One', tools: ['Python'], outcomes: 'Solve beginner puzzles with code.', sort_order: 4 },
];

export const FALLBACK_NOTICES: Notice[] = [];
