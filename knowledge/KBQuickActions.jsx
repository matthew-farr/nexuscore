import { motion } from 'framer-motion';
import { Plus, Grid3X3, Clock, Shield, Bookmark, History } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

const ACTIONS = [
  { key: 'add',        label: 'Add Document',       Icon: Plus,      color: '#ec2ca3', bg: 'rgba(236,44,163,0.15)', adminOnly: true },
  { key: 'categories', label: 'Browse Categories',   Icon: Grid3X3,   color: '#7c3aed', bg: 'rgba(124,58,237,0.15)', adminOnly: false },
  { key: 'userguides', label: 'User Guides',        Icon: Clock,     color: '#06b6d4', bg: 'rgba(6,182,212,0.15)',   adminOnly: false },
  { key: 'recent',     label: 'Recently Updated',   Icon: Clock,     color: '#22d3ee', bg: 'rgba(34,211,238,0.15)', adminOnly: false },
  { key: 'compliance', label: 'Compliance Critical', Icon: Shield,    color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  adminOnly: false },
  { key: 'saved',      label: 'My Saved',           Icon: Bookmark,  color: '#10b981', bg: 'rgba(16,185,129,0.15)', adminOnly: false },
  { key: 'viewed',     label: 'Recently Viewed',    Icon: History,   color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', adminOnly: false },
];

export default function KBQuickActions({ isAdmin, onAction }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const visible = ACTIONS.filter(a => !a.adminOnly || isAdmin);

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {visible.map((action, i) => (
        <motion.button
          key={action.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => onAction(action.key)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 hover:shadow-md"
          style={{
            background: isDark ? action.bg : action.bg,
            border: `1px solid ${action.color}30`,
            color: action.color,
          }}
        >
          <action.Icon className="w-4 h-4 flex-shrink-0" />
          {action.label}
        </motion.button>
      ))}
    </div>
  );
}