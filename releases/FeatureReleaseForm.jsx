import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Rocket, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '../ThemeProvider';
import { useQuery } from '@tanstack/react-query';

const CATEGORIES = [
  { value: 'New Feature',     label: '✨ New Feature',     dot: 'bg-purple-500' },
  { value: 'Improvement',     label: '⚡ Improvement',     dot: 'bg-cyan-500' },
  { value: 'Bug Fix',         label: '🐛 Bug Fix',         dot: 'bg-red-500' },
  { value: 'Security Update', label: '🔒 Security Update', dot: 'bg-orange-500' },
  { value: 'Internal Update', label: '🔧 Internal Update', dot: 'bg-slate-400' },
];

export default function FeatureReleaseForm({ release, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isEditing = !!release;

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [form, setForm] = useState({
    title: '',
    summary: '',
    category: 'New Feature',
    release_notes: '',
    related_area: '',
    related_ticket: '',
    is_major_release: false,
    visibility: 'all_staff',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (release) {
      setForm({
        title: release.title || '',
        summary: release.summary || '',
        category: release.category || 'New Feature',
        release_notes: release.release_notes || release.description || '',
        related_area: release.related_area || '',
        related_ticket: release.related_ticket || '',
        is_major_release: release.is_major_release || release.is_highlighted || false,
        visibility: release.visibility || 'all_staff',
      });
    }
  }, [release]);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    const isPublishing = !isEditing || release.status === 'draft';

    const payload = {
      ...form,
      description: form.release_notes, // keep legacy in sync
      is_highlighted: form.is_major_release,
      author_name: user?.full_name || release?.author_name || '',
      created_by: release?.created_by || user?.full_name || '',
      // Only set release/published date when creating new or publishing
      ...(isPublishing && {
        status: 'published',
        release_date: today,
        published_date: new Date().toISOString(),
      }),
    };

    if (isEditing) {
      await base44.entities.FeatureRelease.update(release.id, payload);
    } else {
      await base44.entities.FeatureRelease.create(payload);
    }
    setSaving(false);
    onClose();
  };

  const inputBase = `w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-colors ${
    isDark
      ? 'bg-white/8 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/60 focus:bg-white/10'
      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-400'
  }`;

  const labelClass = `block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/50' : 'text-slate-500'}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${isDark ? 'bg-[#0d1026] border-white/10' : 'bg-white border-slate-200'}`}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.10))' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
              {isEditing ? <Zap className="w-4 h-4 text-white" /> : <Rocket className="w-4 h-4 text-white" />}
            </div>
            <h2 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isEditing ? 'Edit Release' : 'Publish Release'}
            </h2>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-black/5 text-slate-400 hover:text-slate-700'}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className={labelClass}>Title <span className="text-red-400">*</span></label>
            <input
              autoFocus
              className={inputBase}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Dark Mode redesign now live"
            />
          </div>

          {/* Summary */}
          <div>
            <label className={labelClass}>Short Summary</label>
            <input
              className={inputBase}
              value={form.summary}
              onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
              placeholder="One-line summary for the draft queue"
            />
          </div>

          {/* Type */}
          <div>
            <label className={labelClass}>Type <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-1 gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left transition-all border ${
                    form.category === cat.value
                      ? isDark ? 'border-purple-500/60 bg-purple-500/15 text-white' : 'border-purple-400 bg-purple-50 text-slate-900'
                      : isDark ? 'border-white/8 bg-white/4 text-white/60 hover:bg-white/8 hover:text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cat.dot}`} />
                  <span className="font-medium">{cat.label}</span>
                  {form.category === cat.value && <span className="ml-auto text-purple-400 text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Release Notes */}
          <div>
            <label className={labelClass}>Release Notes</label>
            <textarea
              rows={4}
              className={`${inputBase} resize-none`}
              value={form.release_notes}
              onChange={e => setForm(f => ({ ...f, release_notes: e.target.value }))}
              placeholder="What changed? What's new? Any important info for staff…"
            />
          </div>

          {/* Related Ticket */}
          <div>
            <label className={labelClass}>Related Ticket</label>
            <input
              className={inputBase}
              value={form.related_ticket}
              onChange={e => setForm(f => ({ ...f, related_ticket: e.target.value }))}
              placeholder="PROJ-123"
            />
          </div>

          {/* Related Area + Visibility */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Related Area</label>
              <input
                className={inputBase}
                value={form.related_area}
                onChange={e => setForm(f => ({ ...f, related_area: e.target.value }))}
                placeholder="e.g. Knowledge Base"
              />
            </div>
            <div>
              <label className={labelClass}>Visibility</label>
              <select
                className={`${inputBase} cursor-pointer`}
                value={form.visibility}
                onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}
                style={{ colorScheme: isDark ? 'dark' : 'light' }}
              >
                <option value="all_staff">All Staff</option>
                <option value="admin_only">Admin Only</option>
              </select>
            </div>
          </div>

          {/* Major Launch toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm(f => ({ ...f, is_major_release: !f.is_major_release }))}
              className={`w-10 h-5 rounded-full transition-all flex-shrink-0 relative cursor-pointer ${form.is_major_release ? 'bg-yellow-500' : isDark ? 'bg-white/15' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_major_release ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
              ⭐ Major Launch — pin at top of changelog
            </span>
          </label>

          <p className={`text-xs ${isDark ? 'text-white/25' : 'text-slate-400'}`}>
            App version number is assigned automatically when published.
          </p>
        </div>

        {/* Footer */}
        <div className={`flex justify-end gap-3 px-6 py-4 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
          <button
            onClick={onClose}
            className={`px-4 h-9 rounded-xl text-sm font-medium transition-colors ${isDark ? 'text-white/50 hover:bg-white/8 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
            className="px-5 h-9 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
          >
            {saving ? 'Publishing…' : isEditing ? 'Save Changes' : 'Publish Now'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}