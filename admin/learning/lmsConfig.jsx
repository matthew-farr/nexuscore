export const CATEGORIES = [
  'DBS & Compliance', 'Operations', 'Sales', 'Customer Service',
  'Leadership', 'Systems Training', 'HubSpot', 'Health & Safety',
  'Management', 'Onboarding',
];

export const CONTENT_TYPES = ['html', 'pdf', 'word', 'checklist', 'link'];

export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export const STATUSES = ['published', 'draft', 'archived'];

export const ASSIGNMENT_STATUSES = ['not_started', 'in_progress', 'completed', 'overdue'];

export const PRIORITIES = ['low', 'medium', 'high', 'mandatory'];

export const STATUS_COLOUR = {
  published: '#10b981',
  draft: '#f59e0b',
  archived: '#6b7280',
  active: '#10b981',
  expiring_soon: '#f59e0b',
  expired: '#ef4444',
};

export const ASSIGNMENT_STATUS_COLOUR = {
  not_started: '#6b7280',
  in_progress: '#3b82f6',
  completed: '#10b981',
  overdue: '#ef4444',
};

export const CONTENT_TYPE_LABELS = {
  html: 'HTML Lesson',
  pdf: 'PDF',
  word: 'Word Document',
  checklist: 'Checklist',
  link: 'External Link',
};

export const CONTENT_TYPE_COLOUR = {
  html: '#8b5cf6',
  pdf: '#ef4444',
  word: '#3b82f6',
  checklist: '#10b981',
  link: '#f59e0b',
};

export const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
};

export const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
};