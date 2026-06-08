import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, CheckCircle2, Loader2, ChevronDown, RefreshCw, AlertCircle } from 'lucide-react';

export default function JiraDebugPanel() {
  const [expanded, setExpanded] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);
  const [authInfo, setAuthInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      const [syncResult, authResult] = await Promise.all([
        base44.functions.invoke('syncJiraIssues', {}),
        base44.functions.invoke('getJiraAuthInfo', {})
      ]);
      setDiagnostics(syncResult.data.diagnostics);
      setAuthInfo(authResult.data);
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all"
        style={{
          background: 'rgba(139,92,246,0.08)',
          border: '1px solid rgba(139,92,246,0.20)',
          color: 'rgba(255,255,255,0.60)'
        }}>
        <span className="text-xs font-semibold">🔍 Sync Diagnostics</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-4 rounded-xl"
            style={{
              background: 'rgba(0,0,0,0.30)',
              border: '1px solid rgba(139,92,246,0.15)'
            }}>
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleSync}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.40)' }}>
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                {loading ? 'Running Sync…' : 'Run Sync Now'}
              </button>
            </div>

            {diagnostics || authInfo ? (
              <div className="space-y-3">
                {/* Auth Info Section */}
                {authInfo && (
                  <>
                    <div className="border-b border-white/10 pb-3">
                      <p className="text-[10px] font-semibold text-white/60 mb-2">JIRA AUTHENTICATION</p>
                      {authInfo.userInfo?.status === 200 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <p className="text-[10px] text-white/40 uppercase">Account ID</p>
                            <p className="text-xs text-white/80 font-mono break-all">{authInfo.userInfo.accountId || '—'}</p>
                          </div>
                          <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <p className="text-[10px] text-white/40 uppercase">Display Name</p>
                            <p className="text-xs text-white/80">{authInfo.userInfo.displayName || '—'}</p>
                          </div>
                          <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <p className="text-[10px] text-white/40 uppercase">Email</p>
                            <p className="text-xs text-white/80 break-all">{authInfo.userInfo.emailAddress || '—'}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-red-400">Failed to fetch user info (status: {authInfo.userInfo?.status})</p>
                      )}
                    </div>

                    <div className="border-b border-white/10 pb-3">
                      <p className="text-[10px] font-semibold text-white/60 mb-2">VISIBLE PROJECTS</p>
                      {authInfo.projects?.status === 200 ? (
                        <>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <p className="text-[10px] text-white/40 uppercase">Total</p>
                              <p className="text-sm font-bold text-blue-400">{authInfo.projects.total}</p>
                            </div>
                            <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <p className="text-[10px] text-white/40 uppercase">Visible</p>
                              <p className="text-sm font-bold text-white">{authInfo.projects.count}</p>
                            </div>
                          </div>
                          {authInfo.projects.names.length > 0 && (
                            <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <p className="text-[10px] text-white/40 uppercase mb-1">Project Names</p>
                              <div className="space-y-1">
                                {authInfo.projects.names.map((name, idx) => (
                                  <p key={idx} className="text-xs text-white/70">{name}</p>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-red-400">Failed to fetch projects (status: {authInfo.projects?.status})</p>
                      )}
                    </div>
                  </>
                )}

                {/* Status */}
                <div className="flex items-center gap-2">
                  {!diagnostics.errorMessage && diagnostics.issuesReturned > 0 && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-semibold">Sync completed successfully</span>
                    </>
                  )}
                  {diagnostics.errorMessage && (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-red-400 font-semibold">Sync encountered an issue</span>
                    </>
                  )}
                  {!diagnostics.errorMessage && diagnostics.issuesReturned === 0 && (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-amber-400 font-semibold">No issues returned</span>
                    </>
                  )}
                </div>

                {/* Main metrics grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] text-white/40 uppercase">Status</p>
                    <p className="text-sm font-bold text-white">{diagnostics.httpStatus || '—'}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] text-white/40 uppercase">Found</p>
                    <p className="text-sm font-bold text-white">{diagnostics.issuesReturned}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] text-white/40 uppercase">Created</p>
                    <p className="text-sm font-bold text-emerald-400">{diagnostics.recordsCreated}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] text-white/40 uppercase">Updated</p>
                    <p className="text-sm font-bold text-blue-400">{diagnostics.recordsUpdated}</p>
                  </div>
                </div>

                {/* Jira API response metrics */}
                {diagnostics.jiraResponseTotal === 0 && (
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)' }}>
                    <p className="text-[10px] font-semibold text-amber-400">⚠ Warning: Jira API returned 0 total results. Check JQL filter or token permissions.</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] text-white/40 uppercase">Total (API)</p>
                    <p className="text-sm font-bold text-blue-400">{diagnostics.jiraResponseTotal ?? '—'}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] text-white/40 uppercase">Max Results</p>
                    <p className="text-sm font-bold text-white">{diagnostics.jiraResponseMaxResults ?? '—'}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] text-white/40 uppercase">Start At</p>
                    <p className="text-sm font-bold text-white">{diagnostics.jiraResponseStartAt ?? '—'}</p>
                  </div>
                </div>

                {/* Additional metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] text-white/40 uppercase">Marked Stale</p>
                    <p className="text-sm font-bold text-orange-400">{diagnostics.recordsMarkedStale}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] text-white/40 uppercase">Duration</p>
                    <p className="text-sm font-bold text-white">{diagnostics.durationMs}ms</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] text-white/40 uppercase">First Issue</p>
                    <p className="text-sm font-bold text-white">{diagnostics.firstIssueKey || '—'}</p>
                  </div>
                </div>

                {/* Request details */}
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-[10px] font-semibold text-white/50 mb-1">Request URL</p>
                  <p className="text-xs text-white/40 font-mono break-all">{diagnostics.requestUrl || '—'}</p>
                </div>

                {/* JQL */}
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-[10px] font-semibold text-white/50 mb-1">JQL Filter</p>
                  <p className="text-xs text-white/40 font-mono break-all">{diagnostics.jqlUsed || '—'}</p>
                </div>

                {/* Jira API Response Preview */}
                {diagnostics.jiraResponsePreview && (
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] font-semibold text-white/50 mb-1">Jira API Response (first 1000 chars)</p>
                    <pre className="text-[10px] text-white/40 font-mono overflow-auto max-h-40 break-words whitespace-pre-wrap">{diagnostics.jiraResponsePreview}</pre>
                  </div>
                )}

                {/* Content Type */}
                {diagnostics.contentType && (
                  <div className="text-[10px] text-white/30">Content-Type: {diagnostics.contentType}</div>
                )}

                {/* Error message */}
                {diagnostics.errorMessage && (
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <p className="text-[10px] font-semibold text-red-400 mb-1">Error</p>
                    <p className="text-xs text-red-300 break-all">{diagnostics.errorMessage}</p>
                    {diagnostics.errorBody && (
                      <>
                        <p className="text-[10px] font-semibold text-red-400 mt-2 mb-1">Response (first 1000 chars)</p>
                        <p className="text-[10px] text-red-300 font-mono break-all max-h-32 overflow-auto">{diagnostics.errorBody}</p>
                      </>
                    )}
                  </div>
                )}

                {/* Last sync time */}
                {diagnostics.lastSyncTime && (
                  <div className="text-[10px] text-white/30">
                    Last sync: {new Date(diagnostics.lastSyncTime).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-white/30">Click "Run Sync Now" to see diagnostics.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}