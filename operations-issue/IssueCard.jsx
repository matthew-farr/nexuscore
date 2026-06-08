import { motion } from 'framer-motion';
import { Ticket, Users, Clock, ImageIcon } from 'lucide-react';
import IssueStatusBadge from './IssueStatusBadge';
import { formatUKDateTime } from './issueConfig';

function hasImages(html) {
  return html && html.includes('<img');
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export default function IssueCard({ issue, onClick, isDark, index }) {
  const preview = stripHtml(issue.description);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      onClick={() => onClick(issue)}
      className="rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)',
        boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)'
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
              {issue.issue_reference}
            </span>
            {issue.ticket_raised && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
                <Ticket className="w-3 h-3" />
                Ticket Raised
              </span>
            )}
            {hasImages(issue.description) && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', color: '#22d3ee' }}>
                <ImageIcon className="w-3 h-3" />
                Screenshot
              </span>
            )}
          </div>
          <h3 className="font-semibold text-sm leading-snug" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
            {issue.title}
          </h3>
        </div>
        <IssueStatusBadge status={issue.status} />
      </div>

      {/* Description preview */}
      {preview && (
        <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
          {preview}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 flex-wrap" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)', paddingTop: '10px' }}>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
          <Users className="w-3.5 h-3.5" />
          {issue.affected_count || 'Unknown'} affected
        </span>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
          <Clock className="w-3.5 h-3.5" />
          {formatUKDateTime(issue.created_date)}
        </span>
        <span className="text-xs ml-auto" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>
          {issue.raised_by}
        </span>
        {issue.ticket_reference && (
          <span className="text-xs font-mono" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>
            {issue.ticket_reference}
          </span>
        )}
      </div>
    </motion.div>
  );
}