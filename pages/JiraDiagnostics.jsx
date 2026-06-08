import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Play, AlertTriangle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function JiraDiagnostics() {
  const [running, setRunning] = useState(false);
  const queryClient = useQueryClient();

  const { data: results, isLoading, error, refetch } = useQuery({
    queryKey: ['jiraDiagnostics'],
    queryFn: () => base44.functions.invoke('jiraDiagnosticTests', {}),
    enabled: false
  });

  const handleRunTests = async () => {
    setRunning(true);
    await refetch();
    setRunning(false);
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-400';
    if (status === 200) return 'text-green-400';
    return 'text-red-400';
  };

  const getStatusIcon = (status) => {
    if (!status) return <AlertCircle className="w-4 h-4" />;
    if (status === 200) return <CheckCircle2 className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const testData = results?.data?.results ? [
    { key: 'test1', title: 'User Authentication (CRITICAL)' },
    { key: 'test2', title: 'Project Access' },
    { key: 'test3', title: 'All Issues Count' },
    { key: 'test4', title: 'Open Issues Count' },
    { key: 'test5', title: 'Non-Rollbar Issues Count' }
  ] : [];

  const diagnosticsInfo = results?.data?.results?.diagnostics;

  return (
    <div className="min-h-screen" style={{ background: '#080b18' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Jira Diagnostics</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
            Run diagnostic tests to troubleshoot Jira integration issues
          </p>

          <button
            onClick={handleRunTests}
            disabled={running}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? 'Running Tests…' : 'Run Diagnostic Tests'}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl mb-6" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-300 font-semibold">Error running tests</p>
                <p className="text-xs text-red-300/80 mt-1">{error.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Diagnostics Info */}
        {diagnosticsInfo && (
          <div className="mb-6 space-y-3">
            {/* Secrets Configuration */}
            <div className="rounded-xl p-4 border" style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.25)' }}>
              <h3 className="text-sm font-semibold text-white mb-3">Secrets Configuration</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="text-xs">
                  <p className="text-white/50 mb-1">JIRA_BASE_URL Exists</p>
                  <p className="font-mono text-blue-400">{diagnosticsInfo.secretsConfigured.jiraBaseUrlExists ? '✓ Yes' : '✗ No'}</p>
                </div>
                <div className="text-xs">
                  <p className="text-white/50 mb-1">JIRA_EMAIL Exists</p>
                  <p className="font-mono text-blue-400">{diagnosticsInfo.secretsConfigured.jiraEmailExists ? '✓ Yes' : '✗ No'}</p>
                </div>
                <div className="text-xs">
                  <p className="text-white/50 mb-1">JIRA_API_TOKEN Exists</p>
                  <p className="font-mono text-blue-400">{diagnosticsInfo.secretsConfigured.jiraApiTokenExists ? '✓ Yes' : '✗ No'}</p>
                </div>
                <div className="text-xs">
                  <p className="text-white/50 mb-1">JIRA_EMAIL Length</p>
                  <p className="font-mono text-white">{diagnosticsInfo.secretsConfigured.jiraEmailLength} chars</p>
                </div>
                <div className="text-xs">
                  <p className="text-white/50 mb-1">JIRA_API_TOKEN Length</p>
                  <p className="font-mono text-white">{diagnosticsInfo.secretsConfigured.jiraApiTokenLength} chars</p>
                </div>
                <div className="text-xs">
                  <p className="text-white/50 mb-1">Auth Method</p>
                  <p className="font-mono text-white">{diagnosticsInfo.secretsConfigured.authMethod}</p>
                </div>
              </div>
            </div>

            {/* Auth Header Details */}
            {diagnosticsInfo.authHeaderInfo && (
              <div className="rounded-xl p-4 border" style={{ background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.25)' }}>
                <h3 className="text-sm font-semibold text-white mb-3">Authorization Details</h3>
                <div className="space-y-2 text-xs">
                  <p className="text-white/70">
                    <span className="text-white/50">JIRA_EMAIL:</span> <span className="font-mono text-blue-400">{diagnosticsInfo.authHeaderInfo.jiraEmail}</span>
                  </p>
                  <p className="text-white/70">
                    <span className="text-white/50">JIRA_API_TOKEN (first 20):</span> <span className="font-mono text-blue-400">{diagnosticsInfo.authHeaderInfo.jiraTokenFirst20}...</span>
                  </p>
                  <p className="text-white/70">
                    <span className="text-white/50">JIRA_API_TOKEN (last 20):</span> <span className="font-mono text-blue-400">...{diagnosticsInfo.authHeaderInfo.jiraTokenLast20}</span>
                  </p>
                  <p className="text-white/70">
                    <span className="text-white/50">Encoded Auth Length:</span> <span className="font-mono">{diagnosticsInfo.authHeaderInfo.encodedAuthLength} chars</span>
                  </p>
                  <p className="text-amber-300 text-xs mt-3">
                    ⚠️ If authentication fails above, verify:<br/>
                    • JIRA_API_TOKEN is still active (not revoked)<br/>
                    • JIRA_EMAIL matches the account that created the token<br/>
                    • JIRA_BASE_URL is correct
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Grid */}
        {results?.data?.results && (
          <div className="space-y-4">
            {testData.map((test, idx) => {
              const result = results.data.results[test.key];
              const isSuccess = result.status === 200;

              return (
                <motion.div
                  key={test.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl p-4 border"
                  style={{
                    background: isSuccess ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    borderColor: isSuccess ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'
                  }}>
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={`flex-shrink-0 mt-1 ${getStatusColor(result.status)}`}>
                      {getStatusIcon(result.status)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-semibold text-white">{test.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-mono font-semibold ${getStatusColor(result.status)}`}>
                          HTTP {result.status || '—'}
                        </span>
                      </div>

                      {/* Test-specific details */}
                      <div className="space-y-2">
                        {test.key === 'test1' && (
                          <>
                            <p className="text-xs text-white/70">
                              <span className="text-white/50">Account ID:</span> <span className="font-mono">{result.accountId || '—'}</span>
                            </p>
                            <p className="text-xs text-white/70">
                              <span className="text-white/50">Display Name:</span> <span>{result.displayName || '—'}</span>
                            </p>
                          </>
                        )}

                        {test.key === 'test2' && (
                          <>
                            <p className="text-xs text-white/70">
                              <span className="text-white/50">Total Projects:</span> <span className="font-bold text-blue-400">{result.total ?? '—'}</span>
                            </p>
                            {result.names.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-white/50 mb-1">Visible Projects:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {result.names.map((name, i) => (
                                    <p key={i} className="text-xs text-white/70">{name}</p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {['test3', 'test4', 'test5'].includes(test.key) && (
                          <>
                            {results?.data?.results?.test1?.status === 200 ? (
                              <>
                                <p className="text-xs text-white/50 font-mono mb-1">JQL: {result.jql}</p>
                                <p className="text-xs text-white/70">
                                  <span className="text-white/50">Total Issues Found:</span> <span className="font-bold text-blue-400">{result.total ?? '—'}</span>
                                </p>
                              </>
                            ) : (
                              <p className="text-xs text-amber-300">Skipped — Authentication failed first</p>
                            )}
                          </>
                        )}

                        {result.error && (
                          <p className="text-xs text-red-300 mt-2">Error: {result.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!results && !isLoading && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(139,92,246,0.25)' }} />
            <p className="text-white/40 text-sm">Click "Run Diagnostic Tests" to start troubleshooting</p>
          </div>
        )}
      </div>
    </div>
  );
}