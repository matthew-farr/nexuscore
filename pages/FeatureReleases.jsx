import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useTheme } from '../components/ThemeProvider';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Rocket, Star, Zap, Bug, Shield, Wrench, Filter, X, BookOpen, Eye } from 'lucide-react';
import { useReleaseViewTracker } from '../hooks/useReleaseViewTracker';
import { format } from 'date-fns';
import FeatureReleaseForm from '../components/releases/FeatureReleaseForm';
import ReleaseDetailDrawer from '../components/releases/ReleaseDetailDrawer';
import DraftReleasesQueue from '../components/releases/DraftReleasesQueue';
import MiniGuideDrawer from '../components/releases/MiniGuideDrawer';
import MiniGuideEditor from '../components/releases/MiniGuideEditor';
import LogReleaseModal from '../components/releases/LogReleaseModal';
import ReleaseViewersModal from '../components/releases/ReleaseViewersModal';

// ─── Category config ─────────────────────────────────────────────────────────
const CAT = {
  'New Feature':     { icon: Zap,    dot: '#a855f7', badge: { dark: 'bg-purple-500/20 text-purple-300 border-purple-500/30', light: 'bg-purple-100 text-purple-700 border-purple-200' }, timeline: 'bg-purple-500', label: 'New Feature' },
  'Improvement':     { icon: Rocket, dot: '#22d3ee', badge: { dark: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',       light: 'bg-cyan-100 text-cyan-700 border-cyan-200' }, timeline: 'bg-cyan-500', label: 'Improvement' },
  'Bug Fix':         { icon: Bug,    dot: '#f87171', badge: { dark: 'bg-red-500/20 text-red-300 border-red-500/30',           light: 'bg-red-100 text-red-700 border-red-200' }, timeline: 'bg-red-500', label: 'Bug Fix' },
  'Security Update': { icon: Shield, dot: '#fb923c', badge: { dark: 'bg-orange-500/20 text-orange-300 border-orange-500/30', light: 'bg-orange-100 text-orange-700 border-orange-200' }, timeline: 'bg-orange-500', label: 'Security Update' },
  'Internal Update': { icon: Wrench, dot: '#94a3b8', badge: { dark: 'bg-slate-500/20 text-slate-300 border-slate-500/30',   light: 'bg-slate-100 text-slate-600 border-slate-200' }, timeline: 'bg-slate-500', label: 'Internal Update' },
};

const ALL_TYPES = Object.keys(CAT);

// ─── KPI Cards ────────────────────────────────────────────────────────────────
function KPICards({ releases, isDark }) {
  const published = releases.filter(r => r.status === 'published');
  const kpis = [
    { label: 'Total Releases',   value: published.length,                                     color: isDark ? 'from-purple-600/30 to-indigo-600/20' : 'from-purple-50 to-indigo-50', text: isDark ? 'text-purple-300' : 'text-purple-700', border: isDark ? 'border-purple-500/30' : 'border-purple-200' },
    { label: 'New Features',     value: published.filter(r => r.category === 'New Feature').length,     color: isDark ? 'from-cyan-600/30 to-blue-600/20' : 'from-cyan-50 to-blue-50',     text: isDark ? 'text-cyan-300' : 'text-cyan-700', border: isDark ? 'border-cyan-500/30' : 'border-cyan-200' },
    { label: 'Improvements',     value: published.filter(r => r.category === 'Improvement').length,     color: isDark ? 'from-indigo-600/30 to-violet-600/20' : 'from-indigo-50 to-violet-50', text: isDark ? 'text-indigo-300' : 'text-indigo-700', border: isDark ? 'border-indigo-500/30' : 'border-indigo-200' },
    { label: 'Bug Fixes',        value: published.filter(r => r.category === 'Bug Fix').length,        color: isDark ? 'from-red-600/30 to-rose-600/20' : 'from-red-50 to-rose-50',       text: isDark ? 'text-red-300' : 'text-red-700', border: isDark ? 'border-red-500/30' : 'border-red-200' },
    { label: 'Major Launches',   value: published.filter(r => r.is_highlighted).length,                color: isDark ? 'from-yellow-600/30 to-amber-600/20' : 'from-yellow-50 to-amber-50', text: isDark ? 'text-yellow-300' : 'text-yellow-700', border: isDark ? 'border-yellow-500/30' : 'border-yellow-200' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
      {kpis.map((k, i) => (
        <motion.div
          key={k.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`rounded-2xl border p-4 bg-gradient-to-br ${k.color} ${k.border}`}
        >
          <p className={`text-2xl font-bold ${k.text}`}>{k.value}</p>
          <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-white/50' : 'text-slate-600'}`}>{k.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Timeline Item ────────────────────────────────────────────────────────────
function TimelineItem({ release, guide, isDark, isAdmin, onView, onOpenGuide, index, hasViewed, onViewersClick }) {
  const cfg = CAT[release.category] || CAT['Internal Update'];
  const Icon = cfg.icon;
  const hasPublishedGuide = guide?.status === 'Published';
  const viewed = hasViewed(release.id);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex gap-4 group"
    >
      {/* Timeline dot */}
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 z-10 transition-transform group-hover:scale-110 ${isDark ? 'border-white/10' : 'border-white shadow-sm'}`} style={{ background: cfg.dot }}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <div className={`w-px flex-1 mt-2 min-h-[24px] ${isDark ? 'bg-white/8' : 'bg-slate-200'}`} />
      </div>

      {/* Card */}
      <div
        className={`flex-1 mb-4 rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-md ${
          isDark
            ? 'border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-slate-100'
        }`}
        onClick={() => onView(release)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${isDark ? cfg.badge.dark : cfg.badge.light}`}>
                {cfg.label}
              </span>
              {release.app_version_number && (
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${isDark ? 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30' : 'text-cyan-700 bg-cyan-50 border-cyan-200'}`}>
                  {release.app_version_number}
                </span>
              )}
              {hasPublishedGuide && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${isDark ? 'bg-purple-500/15 text-purple-300 border-purple-500/25' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                  <BookOpen className="w-3 h-3" /> Guide
                </span>
              )}
              {isAdmin && guide && guide.status !== 'Published' && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                  Guide Draft
                </span>
              )}
            </div>
            <h3 className={`font-semibold text-sm leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{release.title}</h3>
            {(release.release_notes || release.description) && (
              <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${isDark ? 'text-white/45' : 'text-slate-500'}`}>
                {release.release_notes || release.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className={`text-xs whitespace-nowrap ${isDark ? 'text-white/35' : 'text-slate-400'}`}>
                {release.release_date ? format(new Date(release.release_date), 'd MMM yyyy') : ''}
              </span>
              {release.view_count > 0 && (
                <button
                  onClick={e => { e.stopPropagation(); isAdmin && onViewersClick(release); }}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    isAdmin ? 'cursor-pointer hover:opacity-80' : ''
                  } ${isDark ? 'text-white/25' : 'text-slate-400'}`}
                  title={isAdmin ? 'Click to view who saw this' : ''}
                >
                  <Eye className="w-3 h-3" />{release.view_count}
                </button>
              )}
              {viewed && (
                <span className={`text-xs font-medium ${isDark ? 'text-green-400/60' : 'text-green-600/70'}`}>✓</span>
              )}
            </div>
            {hasPublishedGuide && (
              <button
                onClick={e => { e.stopPropagation(); onOpenGuide(guide); }}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 h-6 rounded-lg border transition-all hover:opacity-90 ${isDark ? 'bg-purple-500/15 text-purple-300 border-purple-500/25 hover:bg-purple-500/25' : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'}`}
              >
                <BookOpen className="w-3 h-3" /> Mini Guide
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Month Group ──────────────────────────────────────────────────────────────
function MonthGroup({ label, releases, guidesByRelease, isDark, isAdmin, onView, onOpenGuide, hasViewed, onViewersClick }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{label}</span>
        <div className={`flex-1 h-px ${isDark ? 'bg-white/8' : 'bg-slate-200'}`} />
        <span className={`text-xs ${isDark ? 'text-white/20' : 'text-slate-400'}`}>{releases.length}</span>
      </div>
      <div>
        {releases.map((r, i) => (
          <TimelineItem
            key={r.id}
            release={r}
            guide={guidesByRelease[r.id]}
            isDark={isDark}
            isAdmin={isAdmin}
            onView={onView}
            onOpenGuide={onOpenGuide}
            hasViewed={hasViewed}
            index={i}
            onViewersClick={onViewersClick}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Major Launches Section ───────────────────────────────────────────────────
function MajorLaunches({ releases, isDark, onView }) {
  if (!releases.length) return null;
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Star className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
        <h2 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-slate-600'}`}>Major Launches</h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {releases.map((r, i) => {
          const cfg = CAT[r.category] || CAT['New Feature'];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => onView(r)}
              className={`relative overflow-hidden rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-lg ${
                isDark
                  ? 'border-purple-500/30 bg-gradient-to-br from-purple-900/25 to-indigo-900/15 hover:border-purple-400/50'
                  : 'border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 hover:border-purple-300'
              }`}
            >
              {/* Glow blob */}
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl" style={{ background: cfg.dot }} />
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${cfg.dot}, ${cfg.dot}99)` }}>
                  <Icon className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Star className={`w-3 h-3 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                    <span className={`text-xs font-semibold ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>Major Launch</span>
                    <span className={`text-xs ${isDark ? 'text-white/30' : 'text-slate-400'}`}>·</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${isDark ? cfg.badge.dark : cfg.badge.light}`}>{cfg.label}</span>
                  </div>
                  <h3 className={`font-bold text-sm leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{r.title}</h3>
                  {r.app_version_number && (
                    <p className={`text-xs mt-1 font-mono ${isDark ? 'text-cyan-400/60' : 'text-cyan-600'}`}>{r.app_version_number}</p>
                  )}
                  {(r.release_notes || r.description) && (
                    <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-white/45' : 'text-slate-500'}`}>{r.release_notes || r.description}</p>
                  )}
                  <p className={`text-xs mt-2 font-medium ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                    {format(new Date(r.release_date), 'd MMMM yyyy')}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FeatureReleases() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const { trackView, hasViewed } = useReleaseViewTracker();

  useActivityTracking({ entity_type: 'hub', entity_id: 'feature-releases', title: 'Feature Releases', route: '/feature-releases', icon: 'Rocket' });

  const [formOpen, setFormOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState(null);
  const [viewingRelease, setViewingRelease] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewingGuide, setViewingGuide] = useState(null);
  const [editingGuide, setEditingGuide] = useState({ release: null, guide: null, open: false });
  const [viewersModalOpen, setViewersModalOpen] = useState(false);
  const [selectedReleaseForViewers, setSelectedReleaseForViewers] = useState(null);

  const { data: allReleases = [], isLoading } = useQuery({
    queryKey: ['featureReleases'],
    queryFn: () => base44.entities.FeatureRelease.list('-created_date', 500),
  });

  const { data: allGuides = [] } = useQuery({
    queryKey: ['featureGuides'],
    queryFn: () => base44.entities.FeatureGuide.list('-created_date', 500),
  });

  // Build a lookup: release_id -> guide
  const guidesByRelease = useMemo(() => {
    const map = {};
    allGuides.forEach(g => { map[g.release_id] = g; });
    return map;
  }, [allGuides]);

  const handleEdit = (release) => { setEditingRelease(release); setFormOpen(true); };
  const handleDelete = async (release) => {
    if (!confirm(`Delete "${release.title}"?`)) return;
    await base44.entities.FeatureRelease.delete(release.id);
    queryClient.invalidateQueries({ queryKey: ['featureReleases'] });
  };
  const handleFormClose = () => {
    setFormOpen(false);
    setEditingRelease(null);
    queryClient.invalidateQueries({ queryKey: ['featureReleases'] });
  };
  const handleViewRelease = (release) => { 
    setViewingRelease(release);
    trackView(release).then(() => {
      // After view is logged, fetch updated release
      const releases = queryClient.getQueryData(['featureReleases']) || [];
      const updated = releases.find(r => r.id === release.id);
      if (updated) setViewingRelease(updated);
    });
  };
  const handleOpenGuide = (guide) => { setViewingGuide(guide); };
  const handleEditGuide = (release, guide) => { setEditingGuide({ release, guide, open: true }); };
  const handleGuideEditorClose = () => { setEditingGuide({ release: null, guide: null, open: false }); };

  // Split drafts vs published
  const drafts = useMemo(() => isAdmin ? allReleases.filter(r => r.status === 'draft') : [], [allReleases, isAdmin]);
  const publishedReleases = useMemo(() => allReleases.filter(r => r.status === 'published'), [allReleases]);

  // Filter published timeline
  const filtered = useMemo(() => {
    return publishedReleases.filter(r => {
      if (typeFilter !== 'all' && r.category !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const notes = r.release_notes || r.description || '';
        if (!r.title?.toLowerCase().includes(q) && !notes.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [publishedReleases, search, typeFilter]);

  const majors = filtered.filter(r => r.is_major_release || r.is_highlighted);
  const timeline = filtered;

  // Group by month
  const grouped = useMemo(() => {
    const map = {};
    timeline.forEach(r => {
      const key = format(new Date(r.release_date), 'MMMM yyyy');
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return Object.entries(map);
  }, [timeline]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-background' : 'bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                <Rocket className="w-4.5 h-4.5 text-white" />
              </div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Changelog</h1>
            </div>
            <p className={`text-sm ml-12 ${isDark ? 'text-white/45' : 'text-slate-500'}`}>
              New features, improvements and fixes across Checks Direct OS
            </p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setLogOpen(true)}
                className={`flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-semibold border transition-all hover:opacity-90 ${isDark ? 'border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20' : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
              >
                <Rocket className="w-3.5 h-3.5" />
                Log Release
              </button>
              <button
                onClick={() => { setEditingRelease(null); setFormOpen(true); }}
                className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
              >
                <Plus className="w-3.5 h-3.5" />
                Publish Release
              </button>
            </div>
          )}
        </div>

        {/* KPIs */}
        <KPICards releases={publishedReleases} isDark={isDark} />

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search releases…"
              className={`w-full pl-9 pr-4 h-9 rounded-xl text-sm outline-none border ${
                isDark
                  ? 'bg-white/6 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-400'
              }`}
            />
            {search && (
              <button onClick={() => setSearch('')} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30 hover:text-white/60' : 'text-slate-400 hover:text-slate-600'}`}>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 h-9 rounded-xl text-xs font-semibold transition-all ${
                typeFilter === 'all'
                  ? 'text-white' : isDark ? 'text-white/50 hover:text-white/80' : 'text-slate-500 hover:text-slate-700'
              }`}
              style={typeFilter === 'all' ? { background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' } : {}}
            >
              All
            </button>
            {ALL_TYPES.map(t => {
              const cfg = CAT[t];
              const active = typeFilter === t;
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(active ? 'all' : t)}
                  className={`flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-semibold transition-all border ${
                    active
                      ? isDark ? `${cfg.badge.dark} border-current` : `${cfg.badge.light} border-current`
                      : isDark ? 'text-white/40 border-white/10 hover:text-white/70 hover:border-white/20' : 'text-slate-500 border-slate-200 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? cfg.dot : undefined, backgroundColor: active ? undefined : (isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1') }} />
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Draft Queue — admin only */}
        {isAdmin && (
          <DraftReleasesQueue
            drafts={drafts}
            isDark={isDark}
            onEdit={handleEdit}
            onView={setViewingRelease}
          />
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className={`w-8 h-8 border-2 rounded-full animate-spin ${isDark ? 'border-purple-500/20 border-t-purple-500' : 'border-purple-200 border-t-purple-600'}`} />
          </div>
        ) : publishedReleases.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl border ${isDark ? 'border-white/8 text-white/30' : 'border-slate-200 text-slate-400'}`}>
            <Rocket className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">No releases published yet</p>
            {isAdmin && <p className="text-xs mt-1">Click "Publish Release" to add the first entry.</p>}
          </div>
        ) : (
          <>
            {/* Major Launches — only show when not searching/filtering */}
            {!search && typeFilter === 'all' && (
              <MajorLaunches releases={majors} isDark={isDark} onView={handleViewRelease} />
            )}

            {/* Timeline */}
            {timeline.length === 0 ? (
              <div className={`text-center py-12 rounded-2xl border ${isDark ? 'border-white/8 text-white/30' : 'border-slate-200 text-slate-400'}`}>
                <p className="text-sm">No releases match your search.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Filter className={`w-3.5 h-3.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
                  <span className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                    Timeline · {timeline.length} {timeline.length === 1 ? 'release' : 'releases'}
                  </span>
                </div>
                {grouped.map(([month, items]) => (
                  <MonthGroup
                    key={month}
                    label={month}
                    releases={items}
                    guidesByRelease={guidesByRelease}
                    isDark={isDark}
                    isAdmin={isAdmin}
                    onView={handleViewRelease}
                    onOpenGuide={handleOpenGuide}
                    hasViewed={hasViewed}
                    onViewersClick={(r) => { setSelectedReleaseForViewers(r); setViewersModalOpen(true); }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {formOpen && <FeatureReleaseForm release={editingRelease} onClose={handleFormClose} />}
      </AnimatePresence>

      <ReleaseDetailDrawer
        release={viewingRelease}
        guide={viewingRelease ? guidesByRelease[viewingRelease.id] : null}
        isOpen={!!viewingRelease}
        onClose={() => setViewingRelease(null)}
        viewCount={viewingRelease?.view_count || 0}
        isAdmin={isAdmin}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onOpenGuide={handleOpenGuide}
        onEditGuide={handleEditGuide}
        onViewersClick={() => { setSelectedReleaseForViewers(viewingRelease); setViewersModalOpen(true); }}
      />

      <MiniGuideDrawer
        guide={viewingGuide}
        isOpen={!!viewingGuide}
        onClose={() => setViewingGuide(null)}
      />

      <MiniGuideEditor
        release={editingGuide.release}
        guide={editingGuide.guide}
        isOpen={editingGuide.open}
        onClose={handleGuideEditorClose}
      />

      <LogReleaseModal isOpen={logOpen} onClose={() => setLogOpen(false)} />

      <ReleaseViewersModal
        releaseId={selectedReleaseForViewers?.id}
        isOpen={viewersModalOpen}
        onClose={() => setViewersModalOpen(false)}
      />
    </div>
  );
}