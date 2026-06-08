import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Activity, AlertTriangle, Wrench, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import IssueCard from './IssueCard';
import MajorIncidentCard from './MajorIncidentCard';
import ServiceStatusPanel from './ServiceStatusPanel';
import IssueStatusBadge from './IssueStatusBadge';
import { STATUS_SORT_ORDER, formatRelativeTime, isMajorIncident } from './issueConfig';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function CriticalAlertBanner({ activeIssues, isDark }) {
  const criticals = useMemo(() =>
    activeIssues.filter(i => i.status === 'Complete Outage').sort((a, b) => (STATUS_SORT_ORDER[a.status] ?? 99) - (STATUS_SORT_ORDER[b.status] ?? 99)),
    [activeIssues]
  );

  if (criticals.length === 0) return null;

  const primary = criticals[0];
  const extra = criticals.length - 1;
  const workaround = stripHtml(primary.current_workaround);
  const lastUpdated = primary.updated_date || primary.created_date;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(239,68,68,0.4)', background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(254,242,242,0.95)' }}
    >
      {/* Banner header */}
      <div className="flex items-center gap-2 px-4 py-2" style={{ background: 'rgba(239,68,68,0.15)', borderBottom: '1px solid rgba(239,68,68,0.25)' }}>
        <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#ef4444' }} />
        <span className="text-xs font-bold tracking-wider uppercase" style={{ color: '#ef4444' }}>Critical Incident Active</span>
        {extra > 0 && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
            +{extra} more
          </span>
        )}
      </div>

      {/* Primary incident */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {primary.affected_service && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                  {primary.affected_service}
                </span>
              )}
              {primary.issue_owner && (
                <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Owner: <strong>{primary.issue_owner}</strong></span>
              )}
            </div>
            <h3 className="font-bold text-base" style={{ color: isDark ? '#fff' : '#0f0f2e' }}>{primary.title}</h3>
            <p className="text-xs mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
              Affecting {primary.affected_count || 'unknown number of'} applicants/clients
              {lastUpdated && <> · Updated <span className="font-medium">{formatRelativeTime(lastUpdated)}</span></>}
            </p>
          </div>
          <IssueStatusBadge status={primary.status} />
        </div>

        {workaround && (
          <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Wrench className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
            <div>
              <span className="text-xs font-bold block mb-0.5" style={{ color: '#f59e0b' }}>Workaround</span>
              <p className="text-xs leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)' }}>{workaround}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function LiveIssuesTab({
  issues, isLoading, isDark, onSelectIssue,
  showResolved, setShowResolved, resolvedIssues, onLogNew
}) {
  const activeIssues = useMemo(() =>
    issues
      .filter(i => !i.is_archived && i.status !== 'Resolved')
      .sort((a, b) => (STATUS_SORT_ORDER[a.status] ?? 99) - (STATUS_SORT_ORDER[b.status] ?? 99)),
    [issues]
  );

  const majorIssues = useMemo(() => activeIssues.filter(isMajorIncident), [activeIssues]);
  const normalIssues = useMemo(() => activeIssues.filter(i => !isMajorIncident(i)), [activeIssues]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Critical Alert Banner */}
      <CriticalAlertBanner activeIssues={activeIssues} isDark={isDark} />

      {/* Service Status */}
      <ServiceStatusPanel activeIssues={activeIssues} isDark={isDark} />

      {/* All clear */}
      {activeIssues.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <Activity className="w-7 h-7" style={{ color: '#22c55e' }} />
          </div>
          <p className="text-lg font-semibold mb-1" style={{ color: isDark ? '#fff' : '#0f0f2e' }}>All Systems Operational</p>
          <p className="text-sm mb-6" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>No active issues have been logged.</p>
          <Button onClick={onLogNew} style={{ background: 'linear-gradient(135deg, #ec2ca3, #7c3aed)' }}>
            <Plus className="w-4 h-4 mr-2" /> Log New Issue
          </Button>
        </motion.div>
      )}

      {/* Major Incidents */}
      {majorIssues.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1" style={{ background: 'rgba(239,68,68,0.3)' }} />
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
              ⚠ Major Incidents ({majorIssues.length})
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(239,68,68,0.3)' }} />
          </div>
          <div className="space-y-3">
            {majorIssues.map((issue, i) => (
              <MajorIncidentCard key={issue.id} issue={issue} onClick={onSelectIssue} isDark={isDark} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Active Issues */}
      {normalIssues.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {majorIssues.length > 0 && (
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                Active Issues ({normalIssues.length})
              </span>
              <div className="h-px flex-1" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {normalIssues.map((issue, i) => (
              <IssueCard key={issue.id} issue={issue} onClick={onSelectIssue} isDark={isDark} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Resolved Toggle */}
      {resolvedIssues.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowResolved(v => !v)}
            className="flex items-center gap-2 text-xs font-semibold mb-3 hover:opacity-70 transition-opacity"
            style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}
          >
            {showResolved ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showResolved ? 'Hide' : 'Show'} Resolved Issues ({resolvedIssues.length})
          </button>

          <AnimatePresence>
            {showResolved && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resolvedIssues.map((issue, i) => (
                    <IssueCard key={issue.id} issue={issue} onClick={onSelectIssue} isDark={isDark} index={i} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}