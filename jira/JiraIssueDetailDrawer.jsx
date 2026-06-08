import { useState, useEffect } from 'react';
import { X, Eye, User, Mail, Calendar, MessageSquare, History, FileText, Loader, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { base44 } from '@/api/base44Client';

export default function JiraIssueDetailDrawer({ issue, isOpen, onClose }) {
  const [enrichment, setEnrichment] = useState(null);
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    comments: true,
    changelog: true,
    attachments: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    if (isOpen && issue) {
      setEnrichLoading(true);
      base44.functions.invoke('enrichJiraIssueDetails', { issue_key: issue.issue_key })
        .then(res => setEnrichment(res.data))
        .catch(err => console.error('Failed to enrich issue:', err))
        .finally(() => setEnrichLoading(false));
    }
  }, [isOpen, issue?.issue_key]);

  if (!isOpen || !issue) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-[600px] bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{issue.issue_key}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Summary</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">{issue.summary}</p>
          </div>

          {/* Description */}
          {issue.description && (
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Description</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{issue.description}</p>
            </div>
          )}

          {/* Environment */}
          {issue.environment && (
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Environment</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{issue.environment}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Type</p>
              <span className="text-sm text-slate-900 dark:text-white font-medium">{issue.issue_type}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Status</p>
              <span className="text-sm text-slate-900 dark:text-white font-medium">{issue.status}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Priority</p>
              <span className="text-sm text-slate-900 dark:text-white font-medium">{issue.priority}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Resolution</p>
              <span className="text-sm text-slate-900 dark:text-white font-medium">{issue.resolution || '—'}</span>
            </div>
          </div>

          {/* Assignee */}
          {issue.assignee_name && (
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-600 dark:text-slate-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Assignee</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{issue.assignee_name}</p>
                  {issue.assignee_email && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {issue.assignee_email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-3 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className="text-slate-600 dark:text-slate-400">Created:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {new Date(issue.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <History className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className="text-slate-600 dark:text-slate-400">Updated:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatDistanceToNow(new Date(issue.updated_at), { addSuffix: true })}
              </span>
            </div>
            {issue.resolved_at && (
              <div className="flex items-center gap-2 text-sm">
                <History className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-slate-600 dark:text-slate-400">Resolved:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {new Date(issue.resolved_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>

          {/* Project */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Project</p>
            <p className="text-sm text-slate-900 dark:text-white font-medium">{issue.project_name}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{issue.project_key}</p>
          </div>

          {/* Reporter & Creator */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">People</p>
            <div className="space-y-2 text-sm">
              {issue.reporter_name && (
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Reporter:</span>
                  <span className="ml-2 font-medium text-slate-900 dark:text-white">{issue.reporter_name}</span>
                </div>
              )}
              {issue.creator_name && (
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Creator:</span>
                  <span className="ml-2 font-medium text-slate-900 dark:text-white">{issue.creator_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Custom Fields */}
          {(issue.category || issue.department || issue.impact || issue.urgency || issue.requestor || issue.staff_email) && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Custom Fields</p>
              <div className="space-y-2 text-sm">
                {issue.category && (
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Category:</span>
                    <span className="ml-2 font-medium text-slate-900 dark:text-white">{issue.category}</span>
                  </div>
                )}
                {issue.department && (
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Department:</span>
                    <span className="ml-2 font-medium text-slate-900 dark:text-white">{issue.department}</span>
                  </div>
                )}
                {issue.impact && (
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Impact:</span>
                    <span className="ml-2 font-medium text-slate-900 dark:text-white">{issue.impact}</span>
                  </div>
                )}
                {issue.urgency && (
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Urgency:</span>
                    <span className="ml-2 font-medium text-slate-900 dark:text-white">{issue.urgency}</span>
                  </div>
                )}
                {issue.requestor && (
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Requestor:</span>
                    <span className="ml-2 font-medium text-slate-900 dark:text-white">{issue.requestor}</span>
                  </div>
                )}
                {issue.staff_email && (
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Staff Email:</span>
                    <span className="ml-2 font-medium text-slate-900 dark:text-white">{issue.staff_email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comments */}
          {enrichment?.comments && enrichment.comments.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <button
                onClick={() => toggleSection('comments')}
                className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.comments ? '' : '-rotate-90'}`} />
                Comments ({enrichment.comments.length})
              </button>
              {expandedSections.comments && (
                <div className="space-y-3 mt-3">
                  {enrichment.comments.map((comment, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{comment.author}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatDistanceToNow(new Date(comment.created), { addSuffix: true })}</p>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{comment.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Changelog */}
          {enrichment?.changelog && enrichment.changelog.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <button
                onClick={() => toggleSection('changelog')}
                className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.changelog ? '' : '-rotate-90'}`} />
                History ({enrichment.changelog.length})
              </button>
              {expandedSections.changelog && (
                <div className="space-y-3 mt-3">
                  {enrichment.changelog.map((entry, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{entry.author}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatDistanceToNow(new Date(entry.created), { addSuffix: true })}</p>
                      </div>
                      <div className="space-y-1">
                        {entry.changes.map((change, j) => (
                          <p key={j} className="text-xs text-slate-700 dark:text-slate-300">
                            <span className="font-medium">{change.field}</span>: {change.from || '—'} → {change.to || '—'}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Attachments */}
          {enrichment?.attachments && enrichment.attachments.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <button
                onClick={() => toggleSection('attachments')}
                className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.attachments ? '' : '-rotate-90'}`} />
                Attachments ({enrichment.attachments.length})
              </button>
              {expandedSections.attachments && (
                <div className="space-y-2 mt-3">
                  {enrichment.attachments.map((att, i) => (
                    <a
                      key={i}
                      href={att.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate hover:underline">{att.filename}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{(att.size / 1024).toFixed(1)} KB · {att.author}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Open in Jira Link */}
          <div>
            <a
              href={issue.issue_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
            >
              Open in Jira
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}