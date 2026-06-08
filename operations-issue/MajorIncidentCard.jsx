import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import IssueStatusBadge from './IssueStatusBadge';
import { formatRelativeTime } from './issueConfig';

export default function MajorIncidentCard({ issue, onClick, isDark, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      onClick={() => onClick(issue)}
      className="cursor-pointer rounded-xl p-4 flex items-start gap-4"
      style={{
        background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)',
        border: '1px solid rgba(239,68,68,0.35)',
        backdropFilter: 'blur(20px)'
      }}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
        <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {issue.issue_reference && (
            <span className="text-xs font-mono" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>{issue.issue_reference}</span>
          )}
          <IssueStatusBadge status={issue.status} />
          {issue.affected_service && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {issue.affected_service}
            </span>
          )}
        </div>
        <p className="font-bold text-sm" style={{ color: isDark ? '#fff' : '#0f0f2e' }}>{issue.title}</p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
          {issue.affected_count && <span>{issue.affected_count} affected</span>}
          {issue.raised_by && <span>Raised by {issue.raised_by}</span>}
          <span>{formatRelativeTime(issue.created_date)}</span>
        </div>
      </div>
    </motion.div>
  );
}