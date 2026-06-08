import { STATUS_COLORS } from './issueConfig';

export default function IssueStatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS['Unknown'];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colors.dot }} />
      {status || 'Unknown'}
    </span>
  );
}