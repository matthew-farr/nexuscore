import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '../ThemeProvider';
import JiraIssueDetailDrawer from './JiraIssueDetailDrawer';

const PRIORITY_CONFIG = {
  'Highest': { darkBg: 'rgba(239,68,68,0.15)', darkText: '#fca5a5', darkBorder: 'rgba(239,68,68,0.30)', lightBg: 'rgb(254,226,226)', lightText: '#991b1b' },
  'High': { darkBg: 'rgba(245,158,11,0.15)', darkText: '#fcd34d', darkBorder: 'rgba(245,158,11,0.30)', lightBg: 'rgb(254,243,199)', lightText: '#92400e' },
  'Medium': { darkBg: 'rgba(59,130,246,0.15)', darkText: '#93c5fd', darkBorder: 'rgba(59,130,246,0.30)', lightBg: 'rgb(219,234,254)', lightText: '#1e40af' },
  'Low': { darkBg: 'rgba(16,185,129,0.15)', darkText: '#86efac', darkBorder: 'rgba(16,185,129,0.30)', lightBg: 'rgb(209,250,229)', lightText: '#065f46' },
  'Lowest': { darkBg: 'rgba(148,163,184,0.15)', darkText: '#cbd5e1', darkBorder: 'rgba(148,163,184,0.30)', lightBg: 'rgb(241,245,249)', lightText: '#334155' },
};

const STATUS_CONFIG = {
  'To Do': { darkBg: 'rgba(148,163,184,0.15)', darkText: '#cbd5e1', darkBorder: 'rgba(148,163,184,0.30)', lightBg: 'rgb(241,245,249)', lightText: '#334155' },
  'In Progress': { darkBg: 'rgba(59,130,246,0.15)', darkText: '#93c5fd', darkBorder: 'rgba(59,130,246,0.30)', lightBg: 'rgb(219,234,254)', lightText: '#1e40af' },
  'In Review': { darkBg: 'rgba(168,85,247,0.15)', darkText: '#d8b4fe', darkBorder: 'rgba(168,85,247,0.30)', lightBg: 'rgb(243,232,255)', lightText: '#6b21a8' },
  'Ready for Testing': { darkBg: 'rgba(245,158,11,0.15)', darkText: '#fcd34d', darkBorder: 'rgba(245,158,11,0.30)', lightBg: 'rgb(254,243,199)', lightText: '#92400e' },
};

const TYPE_CONFIG = {
  'Bug': { darkBg: 'rgba(239,68,68,0.15)', darkText: '#fca5a5', lightBg: 'rgb(254,226,226)', lightText: '#991b1b' },
  'Support': { darkBg: 'rgba(245,158,11,0.15)', darkText: '#fcd34d', lightBg: 'rgb(254,243,199)', lightText: '#92400e' },
  'BAU Project': { darkBg: 'rgba(59,130,246,0.15)', darkText: '#93c5fd', lightBg: 'rgb(219,234,254)', lightText: '#1e40af' },
  'Epic': { darkBg: 'rgba(168,85,247,0.15)', darkText: '#d8b4fe', lightBg: 'rgb(243,232,255)', lightText: '#6b21a8' },
};

export default function JiraIssueRow({ issue, index, isCompleted }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [detailsOpen, setDetailsOpen] = useState(false);
  const priorityConfig = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG['Medium'];
  const statusConfig = STATUS_CONFIG[issue.status] || STATUS_CONFIG['To Do'];
  const typeConfig = TYPE_CONFIG[issue.issue_type] || { darkBg: 'rgba(148,163,184,0.15)', darkText: '#cbd5e1', lightBg: 'rgb(241,245,249)', lightText: '#334155' };

  return (
    <>
      <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/[0.03]' : 'border-slate-200 hover:bg-slate-50'}`}>
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => setDetailsOpen(true)}
          className={`inline-flex items-center justify-center w-8 h-8 rounded transition-colors ${isDark ? 'hover:bg-white/10 text-blue-400 hover:text-blue-300' : 'hover:bg-slate-100 text-blue-600 hover:text-blue-700'}`}
          title="View details"
        >
          <Eye className="w-4 h-4" />
        </button>
      </td>
      <td className="px-4 py-3 text-xs font-mono font-bold">
        <button
          onClick={() => setDetailsOpen(true)}
          className={`hover:underline transition-colors cursor-pointer ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
        >
          {issue.issue_key}
        </button>
      </td>
      <td className={`px-4 py-3 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{issue.summary}</td>
      <td className="px-4 py-3 text-xs">
        <span className="px-2 py-1 rounded-full font-semibold" style={{ background: isDark ? typeConfig.darkBg : typeConfig.lightBg, color: isDark ? typeConfig.darkText : typeConfig.lightText }}>
          {issue.issue_type}
        </span>
      </td>
      <td className="px-4 py-3 text-xs">
        <span className="px-2 py-1 rounded-full font-semibold" style={{ background: isDark ? statusConfig.darkBg : statusConfig.lightBg, color: isDark ? statusConfig.darkText : statusConfig.lightText, border: `1px solid ${isDark ? statusConfig.darkBorder : 'transparent'}` }}>
          {issue.status}
        </span>
      </td>
      <td className="px-4 py-3 text-xs">
        <span className="px-2 py-1 rounded-full font-semibold" style={{ background: isDark ? priorityConfig.darkBg : priorityConfig.lightBg, color: isDark ? priorityConfig.darkText : priorityConfig.lightText, border: `1px solid ${isDark ? priorityConfig.darkBorder : 'transparent'}` }}>
          {issue.priority}
        </span>
      </td>
      <td className={`px-4 py-3 text-xs ${isDark ? 'text-white/50' : 'text-slate-600'}`}>{issue.staff_email?.split('@')[0] || '—'}</td>
      <td className={`px-4 py-3 text-xs ${isDark ? 'text-white/50' : 'text-slate-600'}`}>
        {isCompleted && issue.resolved_at
          ? new Date(issue.resolved_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          : isCompleted ? new Date(issue.updated_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          : formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
      </td>
      <td className={`px-4 py-3 text-xs ${isDark ? 'text-white/50' : 'text-slate-600'}`}>
        {formatDistanceToNow(new Date(issue.updated_at), { addSuffix: true })}
      </td>
      </motion.tr>
      <JiraIssueDetailDrawer issue={issue} isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} />
    </>
  );
}