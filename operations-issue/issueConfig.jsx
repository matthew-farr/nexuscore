export const STATUS_OPTIONS = [
  'Complete Outage',
  'Degraded / Partly Not Working',
  'Unknown',
  'Resolved'
];

export const AFFECTED_OPTIONS = ['1', '2-5', '6-10', '11-25', '26-50', '50+', 'Unknown'];

export const STATUS_SORT_ORDER = {
  'Complete Outage': 0,
  'Degraded / Partly Not Working': 1,
  'Unknown': 2,
  'Resolved': 3
};

export const STATUS_COLORS = {
  'Complete Outage': {
    bg: 'rgba(239,68,68,0.15)',
    border: 'rgba(239,68,68,0.4)',
    text: '#ef4444',
    dot: '#ef4444'
  },
  'Degraded / Partly Not Working': {
    bg: 'rgba(245,158,11,0.15)',
    border: 'rgba(245,158,11,0.4)',
    text: '#f59e0b',
    dot: '#f59e0b'
  },
  'Unknown': {
    bg: 'rgba(107,114,128,0.15)',
    border: 'rgba(107,114,128,0.4)',
    text: '#9ca3af',
    dot: '#9ca3af'
  },
  'Resolved': {
    bg: 'rgba(34,197,94,0.15)',
    border: 'rgba(34,197,94,0.4)',
    text: '#22c55e',
    dot: '#22c55e'
  }
};

export function formatUKDateTime(dateStr) {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('en-GB', {
      timeZone: 'Europe/London',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  } catch {
    return '-';
  }
}

export function generateIssueRef(sequence) {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(4, '0');
  return `OPS-ISSUE-${year}-${padded}`;
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '-';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function isMajorIncident(issue) {
  return issue.status === 'Complete Outage' && (issue.affected_count === '50+' || issue.affected_count === '26-50');
}