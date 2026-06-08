// Shared config/utils for Training Hub

export const CATEGORY_COLOURS = {
  "DBS & Compliance": { bg: "rgba(16,185,129,0.15)",  border: "rgba(16,185,129,0.30)",  text: "#10b981" },
  "Operations":       { bg: "rgba(14,165,233,0.15)",  border: "rgba(14,165,233,0.30)",  text: "#0ea5e9" },
  "Sales":            { bg: "rgba(236,44,163,0.15)",  border: "rgba(236,44,163,0.30)",  text: "#ec2ca3" },
  "Customer Service": { bg: "rgba(139,92,246,0.15)",  border: "rgba(139,92,246,0.30)",  text: "#8b5cf6" },
  "Systems Training": { bg: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.30)",  text: "#6366f1" },
  "Management":       { bg: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.30)",  text: "#f59e0b" },
  "Onboarding":       { bg: "rgba(34,211,238,0.15)",  border: "rgba(34,211,238,0.30)",  text: "#22d3ee" },
};

export const CONTENT_TYPE_CONFIG = {
  html:      { label: "HTML Lesson",  colour: "#8b5cf6", bg: "rgba(139,92,246,0.15)",  border: "rgba(139,92,246,0.30)" },
  pdf:       { label: "PDF",          colour: "#ef4444", bg: "rgba(239,68,68,0.15)",   border: "rgba(239,68,68,0.30)" },
  word:      { label: "Word",         colour: "#3b82f6", bg: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.30)" },
  checklist: { label: "Checklist",    colour: "#10b981", bg: "rgba(16,185,129,0.15)",  border: "rgba(16,185,129,0.30)" },
  link:      { label: "Link",         colour: "#f59e0b", bg: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.30)" },
};

export const STATUS_STYLES = {
  not_started: { label: "Not Started", cls: "text-slate-400 bg-slate-500/10 border-slate-500/30" },
  in_progress:  { label: "In Progress", cls: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  completed:    { label: "Completed",   cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  overdue:      { label: "Overdue",     cls: "text-red-400 bg-red-500/10 border-red-500/30" },
};

export const DIFFICULTY_STYLES = {
  Beginner:     { cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  Intermediate: { cls: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  Advanced:     { cls: "text-red-400 bg-red-500/10 border-red-500/30" },
};

export function formatDuration(minutes) {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function isOverdue(dueDate, status) {
  if (!dueDate || status === 'completed') return false;
  return new Date(dueDate) < new Date();
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

export function getEffectiveStatus(assignment) {
  if (!assignment) return 'not_started';
  if (assignment.status === 'completed') return 'completed';
  if (isOverdue(assignment.due_date, assignment.status)) return 'overdue';
  return assignment.status || 'not_started';
}

export const SEED_COURSES = [
  {
    title: "DBS Check Levels Overview",
    description: "An interactive overview of DBS check levels, from Basic to Enhanced with Barred Lists.",
    category: "DBS & Compliance",
    content_type: "html",
    file_url: null,
    external_url: null,
    estimated_duration_minutes: 20,
    difficulty: "Beginner",
    status: "published",
    is_mandatory: true,
    certificate_enabled: true,
  },
  {
    title: "Right to Work Checks",
    description: "How to conduct compliant Right to Work checks for UK employees and overseas nationals.",
    category: "Operations",
    content_type: "pdf",
    file_url: null,
    external_url: null,
    estimated_duration_minutes: 15,
    difficulty: "Beginner",
    status: "published",
    is_mandatory: true,
    certificate_enabled: false,
  },
  {
    title: "HubSpot Basics",
    description: "Getting started with HubSpot CRM — contacts, deals and pipelines.",
    category: "Sales",
    content_type: "link",
    file_url: null,
    external_url: "https://academy.hubspot.com/",
    estimated_duration_minutes: 60,
    difficulty: "Beginner",
    status: "published",
    is_mandatory: false,
    certificate_enabled: false,
  },
  {
    title: "New Starter Checklist",
    description: "Complete all onboarding tasks as a new Checks Direct team member.",
    category: "Onboarding",
    content_type: "checklist",
    file_url: null,
    external_url: null,
    estimated_duration_minutes: 30,
    difficulty: "Beginner",
    status: "published",
    is_mandatory: true,
    certificate_enabled: true,
  },
  {
    title: "GDPR Refresher",
    description: "Annual GDPR refresher covering data subject rights, breach reporting and best practice.",
    category: "DBS & Compliance",
    content_type: "pdf",
    file_url: null,
    external_url: null,
    estimated_duration_minutes: 20,
    difficulty: "Beginner",
    status: "published",
    is_mandatory: true,
    certificate_enabled: true,
  },
  {
    title: "Customer Service Standards",
    description: "Checks Direct customer service standards, communication styles and handling difficult situations.",
    category: "Customer Service",
    content_type: "word",
    file_url: null,
    external_url: null,
    estimated_duration_minutes: 25,
    difficulty: "Beginner",
    status: "published",
    is_mandatory: false,
    certificate_enabled: false,
  },
  {
    title: "Adult Barred List Criteria",
    description: "Understanding the Adult Barred List, when it applies and how to identify regulated activity.",
    category: "DBS & Compliance",
    content_type: "html",
    file_url: null,
    external_url: null,
    estimated_duration_minutes: 25,
    difficulty: "Intermediate",
    status: "published",
    is_mandatory: false,
    certificate_enabled: false,
  },
];

export const SEED_CHECKLIST_ITEMS = [
  { title: "Read the Employee Handbook", description: "Review the full Checks Direct employee handbook.", item_order: 1, is_required: true },
  { title: "Complete IT setup", description: "Set up your laptop, email and system access.", item_order: 2, is_required: true },
  { title: "Meet your line manager", description: "Have your first 1:1 introduction meeting.", item_order: 3, is_required: true },
  { title: "Review data protection policy", description: "Read and acknowledge the data protection policy.", item_order: 4, is_required: true },
  { title: "Complete health & safety induction", description: "Complete the online health and safety module.", item_order: 5, is_required: false },
];