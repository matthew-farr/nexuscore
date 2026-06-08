import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Inbox, Eye, CheckCheck, Archive, ArrowRight, Clock, Tag, Zap, Rocket, Bug, Shield, Wrench } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const CAT_ICONS = {
  'New Feature':     Zap,
  'Improvement':     Rocket,
  'Bug Fix':         Bug,
  'Security Update': Shield,
  'Internal Update': Wrench,
};

const SOURCE_LABELS = { manual: 'Manual', auto: 'Auto', jira: 'Jira', system: 'System' };

const SOURCE_STYLE = {
  manual: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  auto:   'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  jira:   'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
  system: 'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-white/40',
};

export default function ReleaseDraftsWidget({ onReviewDraft, onEditDraft }) {
  const queryClient = useQueryClient();
  const [publishing, setPublishing] = useState(null);
  const [archiving, setArchiving] = useState(null);

  const { data: allDrafts = [], isLoading } = useQuery({
    queryKey: ['featureReleases', 'drafts-widget'],
    queryFn: () => base44.entities.FeatureRelease.filter({ status: 'draft' }, '-created_date', 50),
  });

  const latest5 = allDrafts.slice(0, 5);

  const handlePublish = async (draft) => {
    setPublishing(draft.id);
    const today = new Date().toISOString().split('T')[0];
    await base44.entities.FeatureRelease.update(draft.id, {
      status: 'published',
      release_date: today,
      published_date: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ['featureReleases'] });
    setPublishing(null);
  };

  const handleArchive = async (draft) => {
    if (!confirm(`Archive "${draft.title}"?`)) return;
    setArchiving(draft.id);
    await base44.entities.FeatureRelease.update(draft.id, { status: 'archived' });
    queryClient.invalidateQueries({ queryKey: ['featureReleases'] });
    setArchiving(null);
  };

  return (
    <div className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-amber-200 dark:border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-200 dark:bg-amber-500/20">
            <Inbox className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Release Drafts Waiting Review</p>
            <p className="text-xs text-amber-600 dark:text-amber-400/70">
              {isLoading ? 'Loading…' : `${allDrafts.length} draft${allDrafts.length !== 1 ? 's' : ''} awaiting review`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300">
            {allDrafts.length}
          </span>
          <Link
            to="/feature-releases"
            className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-semibold border transition-all hover:opacity-90 text-white"
            style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}
          >
            Review All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Draft list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : allDrafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <CheckCheck className="w-8 h-8 text-amber-400/40" />
          <p className="text-sm text-amber-600 dark:text-amber-400/60 font-medium">All caught up — no drafts waiting!</p>
        </div>
      ) : (
        <div>
          {latest5.map((draft, i) => {
            const Icon = CAT_ICONS[draft.category] || Zap;
            return (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-start gap-3 px-5 py-3.5 ${i > 0 ? 'border-t border-amber-100 dark:border-amber-500/10' : ''}`}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-amber-100 dark:bg-amber-500/10">
                  <Icon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug truncate">{draft.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {draft.source && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${SOURCE_STYLE[draft.source] || SOURCE_STYLE.system}`}>
                        {SOURCE_LABELS[draft.source] || draft.source}
                      </span>
                    )}
                    {draft.related_area && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-white/35">
                        <Tag className="w-2.5 h-2.5" />{draft.related_area}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-white/25">
                      <Clock className="w-2.5 h-2.5" />
                      {draft.created_date
                        ? formatDistanceToNow(new Date(draft.created_date), { addSuffix: true })
                        : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onReviewDraft(draft)}
                    title="Review"
                    className="p-1.5 rounded-lg text-slate-400 dark:text-white/35 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleArchive(draft)}
                    disabled={archiving === draft.id}
                    title="Archive"
                    className="p-1.5 rounded-lg text-slate-400 dark:text-white/35 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handlePublish(draft)}
                    disabled={publishing === draft.id}
                    title="Publish"
                    className="flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                    style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}
                  >
                    <CheckCheck className="w-3 h-3" />
                    {publishing === draft.id ? '…' : 'Publish'}
                  </button>
                </div>
              </motion.div>
            );
          })}

          {allDrafts.length > 5 && (
            <div className="px-5 py-3 border-t border-amber-100 dark:border-amber-500/10">
              <Link
                to="/feature-releases"
                className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
              >
                + {allDrafts.length - 5} more draft{allDrafts.length - 5 !== 1 ? 's' : ''} — view all on Changelog →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}