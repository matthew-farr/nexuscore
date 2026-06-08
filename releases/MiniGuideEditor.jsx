import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Plus, Trash2, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '../ThemeProvider';
import { useQueryClient } from '@tanstack/react-query';

export default function MiniGuideEditor({ release, guide, isOpen, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '',
    feature_area: '',
    summary: '',
    what_changed: '',
    why_it_matters: '',
    how_to_use_steps: [''],
    what_to_expect: '',
    related_page_url: '',
    status: 'Draft',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (guide) {
      setForm({
        title: guide.title || '',
        feature_area: guide.feature_area || '',
        summary: guide.summary || '',
        what_changed: guide.what_changed || '',
        why_it_matters: guide.why_it_matters || '',
        how_to_use_steps: guide.how_to_use_steps?.length ? guide.how_to_use_steps : [''],
        what_to_expect: guide.what_to_expect || '',
        related_page_url: guide.related_page_url || '',
        status: guide.status || 'Draft',
      });
    } else if (release) {
      setForm(f => ({
        ...f,
        title: release.title || '',
        feature_area: release.related_area || '',
      }));
    }
  }, [guide, release]);

  const handleSave = async () => {
    if (!form.title.trim() || !release) return;
    setSaving(true);
    const steps = form.how_to_use_steps.filter(s => s.trim());
    const payload = { ...form, how_to_use_steps: steps, release_id: release.id };

    if (guide) {
      await base44.entities.FeatureGuide.update(guide.id, payload);
    } else {
      await base44.entities.FeatureGuide.create(payload);
    }
    queryClient.invalidateQueries({ queryKey: ['featureGuides'] });
    setSaving(false);
    onClose();
  };

  const addStep = () => setForm(f => ({ ...f, how_to_use_steps: [...f.how_to_use_steps, ''] }));
  const updateStep = (i, val) => setForm(f => {
    const steps = [...f.how_to_use_steps];
    steps[i] = val;
    return { ...f, how_to_use_steps: steps };
  });
  const removeStep = (i) => setForm(f => ({
    ...f,
    how_to_use_steps: f.how_to_use_steps.filter((_, idx) => idx !== i),
  }));

  const input = `w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-colors ${
    isDark
      ? 'bg-white/8 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/60'
      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-400'
  }`;
  const label = `block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/50' : 'text-slate-500'}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.65)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className={`fixed right-0 top-0 h-full w-full max-w-lg z-50 flex flex-col shadow-2xl ${
              isDark ? 'bg-[#0a0e1f] border-l border-white/10' : 'bg-white border-l border-slate-200'
            }`}
          >
            {/* Header */}
            <div
              className="px-6 py-5 flex items-center justify-between border-b"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(99,102,241,0.10))'
                  : 'linear-gradient(135deg, rgba(139,92,246,0.07), rgba(99,102,241,0.04))',
                borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgb(226,232,240)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    {guide ? 'Edit Mini Guide' : 'Create Mini Guide'}
                  </p>
                  <p className={`text-xs mt-0.5 truncate max-w-[240px] ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                    {release?.title}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={label}>Guide Title <span className="text-red-400">*</span></label>
                  <input className={input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Help Desk Search Upgrade" />
                </div>
                <div>
                  <label className={label}>Feature Area</label>
                  <input className={input} value={form.feature_area} onChange={e => setForm(f => ({ ...f, feature_area: e.target.value }))} placeholder="e.g. Help Desk" />
                </div>
                <div>
                  <label className={label}>Visibility</label>
                  <select
                    className={`${input} cursor-pointer`}
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    style={{ colorScheme: isDark ? 'dark' : 'light' }}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={label}>Summary (one line for staff)</label>
                <input className={input} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Short plain-English summary" />
              </div>

              <div>
                <label className={label}>What Changed</label>
                <textarea rows={3} className={`${input} resize-none`} value={form.what_changed} onChange={e => setForm(f => ({ ...f, what_changed: e.target.value }))} placeholder="Describe the change in plain English…" />
              </div>

              <div>
                <label className={label}>Why It Matters</label>
                <textarea rows={3} className={`${input} resize-none`} value={form.why_it_matters} onChange={e => setForm(f => ({ ...f, why_it_matters: e.target.value }))} placeholder="Why does this help staff?" />
              </div>

              <div>
                <label className={label}>How To Use It — Steps</label>
                <div className="space-y-2">
                  {form.how_to_use_steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`text-xs font-bold w-5 flex-shrink-0 text-center ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{i + 1}</span>
                      <input
                        className={`${input} flex-1`}
                        value={step}
                        onChange={e => updateStep(i, e.target.value)}
                        placeholder={`Step ${i + 1}`}
                      />
                      {form.how_to_use_steps.length > 1 && (
                        <button onClick={() => removeStep(i)} className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isDark ? 'text-white/30 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addStep}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 h-8 rounded-xl border border-dashed transition-colors ${isDark ? 'border-white/15 text-white/40 hover:text-white/70 hover:border-white/30' : 'border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400'}`}
                  >
                    <Plus className="w-3 h-3" /> Add Step
                  </button>
                </div>
              </div>

              <div>
                <label className={label}>What To Expect</label>
                <textarea rows={3} className={`${input} resize-none`} value={form.what_to_expect} onChange={e => setForm(f => ({ ...f, what_to_expect: e.target.value }))} placeholder="What staff should notice or expect after this change…" />
              </div>

              <div>
                <label className={label}>Related Page URL</label>
                <input className={input} value={form.related_page_url} onChange={e => setForm(f => ({ ...f, related_page_url: e.target.value }))} placeholder="/help-desk or https://…" />
              </div>
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 flex justify-end gap-3 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <button onClick={onClose} className={`px-4 h-9 rounded-xl text-sm font-medium transition-colors ${isDark ? 'text-white/50 hover:bg-white/8 hover:text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="flex items-center gap-2 px-5 h-9 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving…' : guide ? 'Save Guide' : 'Create Guide'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}