import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, CheckCheck, Pencil, Archive, Eye, ChevronDown, ChevronUp, Ticket, Tag, User, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { computeNextAppVersion } from '@/lib/appPublishVersioning';

const SOURCE_LABELS = {
  manual: 'Manual',
  auto: 'Auto',
  jira: 'Jira',
  system: 'System',
};

const CAT_DOT = {
  'New Feature':     'bg-purple-500',
  'Improvement':     'bg-cyan-500',
  'Bug Fix':         'bg-red-500',
  'Security Update': 'bg-orange-500',
  'Internal Update': 'bg-slate-500',
};

export default function DraftReleasesQueue({ drafts = [], isDark, onEdit, onView }) {
  const queryClient = useQueryClient();
  const [publishing, setPublishing] = useState(null);
  const [archiving, setArchiving] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const handlePublish = async (release) => {
    setPublishing(release.id);
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Get all published AppPublish records to compute next version
    const allPublishedApps = await base44.entities.AppPublish.list('-created_date', 500);
    const { version_number, version_year, version_week, version_build, publish_time } = computeNextAppVersion(allPublishedApps, now);

    // Create AppPublish record with correct version format
    const appPublish = await base44.entities.AppPublish.create({
      version_number,
      version_year,
      version_week,
      version_build,
      publish_time,
      published_by: release.author_name || 'Admin',
      published_date: now.toISOString(),
      summary: `Published: ${release.title}`,
      linked_feature_release_ids: [release.id],
      status: 'published',
    });

    // Update FeatureRelease with app publish reference
    await base44.entities.FeatureRelease.update(release.id, {
      status: 'published',
      release_date: today,
      published_date: now.toISOString(),
      is_highlighted: release.is_major_release || release.is_highlighted,
      app_publish_id: appPublish.id,
      app_version_number: version_number,
    });

    queryClient.invalidateQueries({ queryKey: ['featureReleases'] });
    queryClient.invalidateQueries({ queryKey: ['appPublishes'] });
    setPublishing(null);
  };

  const handleArchive = async (release) => {
    if (!confirm(`Archive "${release.title}"? It will be hidden from the queue.`)) return;
    setArchiving(release.id);
    await base44.entities.FeatureRelease.update(release.id, { status: 'archived' });
    queryClient.invalidateQueries({ queryKey: ['featureReleases'] });
    setArchiving(null);
  };

  if (!drafts.length) return null;

  return (
    <div className={`rounded-2xl border mb-8 overflow-hidden ${isDark ? 'border-amber-500/30 bg-amber-500/5' : 'border-amber-300 bg-amber-50'}`}>
      {/* Queue header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className={`w-full flex items-center justify-between px-5 py-4 ${isDark ? 'hover:bg-white/4' : 'hover:bg-amber-100/50'} transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-500/20' : 'bg-amber-200'}`}>
            <Inbox className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
          </div>
          <div className="text-left">
            <p className={`text-sm font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
              Draft Queue
            </p>
            <p className={`text-xs ${isDark ? 'text-amber-400/70' : 'text-amber-600'}`}>
              {drafts.length} release{drafts.length !== 1 ? 's' : ''} awaiting review
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-200 text-amber-800'}`}>
            {drafts.length}
          </span>
          {collapsed
            ? <ChevronDown className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            : <ChevronUp className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          }
        </div>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className={`border-t ${isDark ? 'border-amber-500/20' : 'border-amber-200'}`}>
              {drafts.map((draft, i) => (
                <motion.div
                  key={draft.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-start gap-4 px-5 py-4 ${i > 0 ? (isDark ? 'border-t border-white/5' : 'border-t border-amber-100') : ''}`}
                >
                  {/* Dot */}
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${CAT_DOT[draft.category] || 'bg-slate-400'}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{draft.title}</h4>
                    {(draft.summary || draft.description) && (
                      <p className={`text-xs mt-0.5 line-clamp-1 ${isDark ? 'text-white/45' : 'text-slate-500'}`}>
                        {draft.summary || draft.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className={`text-xs ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                        {draft.category}
                      </span>
                      {draft.related_area && (
                        <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                          <Tag className="w-3 h-3" />{draft.related_area}
                        </span>
                      )}
                      {draft.related_ticket && (
                        <span className={`flex items-center gap-1 text-xs font-mono ${isDark ? 'text-cyan-400/60' : 'text-cyan-700'}`}>
                          <Ticket className="w-3 h-3" />{draft.related_ticket}
                        </span>
                      )}
                      {draft.created_by && (
                        <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-white/25' : 'text-slate-400'}`}>
                          <User className="w-3 h-3" />{draft.created_by}
                        </span>
                      )}
                      {draft.source && draft.source !== 'manual' && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${isDark ? 'bg-white/8 text-white/40' : 'bg-slate-100 text-slate-500'}`}>
                          {SOURCE_LABELS[draft.source] || draft.source}
                        </span>
                      )}
                      <span className={`text-xs ${isDark ? 'text-white/20' : 'text-slate-400'}`}>
                        {draft.created_date
                          ? formatDistanceToNow(new Date(draft.created_date), { addSuffix: true })
                          : formatDistanceToNow(new Date(draft.created_at || Date.now()), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => onView(draft)}
                      title="Review"
                      className={`p-1.5 rounded-lg text-xs transition-colors ${isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit(draft)}
                      title="Edit"
                      className={`p-1.5 rounded-lg text-xs transition-colors ${isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleArchive(draft)}
                      disabled={archiving === draft.id}
                      title="Archive"
                      className={`p-1.5 rounded-lg text-xs transition-colors ${isDark ? 'hover:bg-red-500/15 text-white/30 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handlePublish(draft)}
                      disabled={publishing === draft.id}
                      className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
                    >
                      <CheckCheck className="w-3 h-3" />
                      {publishing === draft.id ? 'Publishing…' : 'Publish'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}