import { formatDateTime } from '@/lib/dbsQueryUtils';

export default function DBSActivityTimeline({ auditLog = [], isDark }) {
  if (auditLog.length === 0) {
    return (
      <p style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} className="text-xs text-center py-4">
        No activity yet
      </p>
    );
  }

  // Filter to show readable activity entries
  const activityEntries = auditLog
    .filter(log => ['Note Added', 'Client Response Updated', 'Response Sent to DBS Updated', 'Action Summary Updated', 'Stage Changed', 'field_edited'].includes(log.action_type))
    .reverse();

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {activityEntries.map((log, idx) => (
        <div
          key={idx}
          className="p-3 rounded-lg border-l-2"
          style={{
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderColor: '#06b6d4'
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-xs" style={{ color: '#06b6d4' }}>
                {formatActionLabel(log.action_type, log.field_changed)}
              </p>
              <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-xs mt-1">
                {log.changed_by} • {formatDateTime(log.created_date)}
              </p>
            </div>
          </div>
          
          {/* Summary text */}
          {log.new_value && (
            <p className="text-xs mt-2" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
              {truncateText(log.new_value, 200)}
            </p>
          )}

          {/* Show old -> new for field changes */}
          {log.old_value && log.action_type === 'field_edited' && (
            <p className="text-xs mt-2" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
              <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>From: </span>
              {truncateText(log.old_value, 150)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function formatActionLabel(actionType, fieldChanged) {
  switch (actionType) {
    case 'Note Added':
      return 'Note Added';
    case 'Client Response Updated':
      return 'Client Response Updated';
    case 'Response Sent to DBS Updated':
      return 'Response Sent to DBS Updated';
    case 'Action Summary Updated':
      return 'Action Summary Updated';
    case 'Stage Changed':
      return 'Stage Changed';
    case 'field_edited':
      return `Updated: ${formatFieldName(fieldChanged)}`;
    default:
      return actionType;
  }
}

function formatFieldName(field) {
  const names = {
    'stage': 'Stage',
    'date_sent_to_client': 'Date Sent to Client',
    'date_client_replied': 'Date Client Replied',
    'date_replied_to_dbs': 'Date Replied to DBS',
    'date_resent_chased': 'Date Resent/Chased',
    'further_clarification_required': 'Further Clarification',
    'agent_assigned': 'Agent Assigned',
    'query_type': 'Query Type',
    'source': 'Source'
  };
  return names[field] || field;
}

function truncateText(text, maxLen) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '...';
}