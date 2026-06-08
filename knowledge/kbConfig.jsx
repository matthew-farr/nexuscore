import {
  FileText, BookOpen, Link, Video, ClipboardList,
  HelpCircle, FileSpreadsheet, Map, GraduationCap, ScrollText
} from 'lucide-react';

export const DOC_TYPE_CONFIG = {
  'Policy':           { icon: ScrollText,      color: '#ec2ca3', bg: 'rgba(236,44,163,0.15)' },
  'Process':          { icon: ClipboardList,    color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
  'User Guide':       { icon: BookOpen,         color: '#22d3ee', bg: 'rgba(34,211,238,0.15)' },
  'FAQ':              { icon: HelpCircle,        color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  'Video':            { icon: Video,             color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  'External Link':    { icon: Link,              color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  'Template':         { icon: FileSpreadsheet,   color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  'Form':             { icon: FileText,           color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  'Process Map':      { icon: Map,               color: '#84cc16', bg: 'rgba(132,204,22,0.15)' },
  'Training Resource':{ icon: GraduationCap,     color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
};

export const CATEGORIES = [
  { label: 'Products',                    emoji: '📦', color: '#ec2ca3', description: 'Product information, features and specifications.' },
  { label: 'Compliance',                  emoji: '🛡️',  color: '#22d3ee', description: 'Compliance rules, regulatory documents and guidelines.' },
  { label: 'Operations',                  emoji: '⚙️',  color: '#7c3aed', description: 'Day-to-day operational processes, SOPs and workflows.' },
  { label: 'Systems & Software',          emoji: '💻', color: '#6366f1', description: 'User guides and documentation for internal tools and platforms.' },
  { label: 'Sales & Account Management',  emoji: '📈', color: '#f59e0b', description: 'Sales processes, scripts, pricing and client acquisition resources.' },
  { label: 'Finance & Commercial',        emoji: '💰', color: '#10b981', description: 'Finance procedures, expense policies and billing guides.' },
  { label: 'Marketing & Communications',  emoji: '📣', color: '#f97316', description: 'Brand guidelines, campaign materials and marketing resources.' },
  { label: 'Company Information',         emoji: 'ℹ️', color: '#a78bfa', description: 'Company policies, HR information and organizational details.' },
];

export const AUDIENCES = [
  { key: 'internal',   label: 'Internal Knowledge', color: '#7c3aed' },
  { key: 'client',     label: 'Client Resources',   color: '#22d3ee' },
  { key: 'applicant',  label: 'Applicant Resources', color: '#10b981' },
];

export const TABS = [
  { key: 'all',            label: 'All Documents',       audience: null },
  { key: 'internal',       label: 'Internal Knowledge',  audience: 'internal' },
  { key: 'client',         label: 'Client Resources',    audience: 'client' },
  { key: 'applicant',      label: 'Applicant Resources', audience: 'applicant' },
  { key: 'links',          label: 'Links & Resources',   audience: 'links_resources', docType: 'External Link' },
  { key: 'templates',      label: 'Templates & Forms',   audience: 'templates_forms', docTypes: ['Template', 'Form'] },
  { key: 'saved',          label: 'My Saved',            audience: null },
];