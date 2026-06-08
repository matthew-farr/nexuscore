import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, Plus, Minus, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const HUBS = ['Sales', 'Operations', 'Learning', 'Knowledge', 'Innovation', 'Management', 'Marketing', 'Admin', 'Platform'];
const CATEGORIES = ['New Feature', 'Improvement', 'Bug Fix', 'Internal Update', 'Security Update'];

const INPUT_CLASS = "w-full px-3 h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white text-sm outline-none focus:border-purple-400 placeholder:text-slate-400 dark:placeholder:text-white/25";
const TEXTAREA_CLASS = "w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white text-sm outline-none resize-none focus:border-purple-400 placeholder:text-slate-400 dark:placeholder:text-white/25";
const SELECT_CLASS = "w-full px-3 h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white text-sm outline-none";
const LABEL_CLASS = "block text-xs font-semibold text-slate-600 dark:text-white/50 mb-1.5";

export default function LogReleaseModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'New Feature',
    hub: 'Platform',
    page_url: '',
    what_changed: '',
    why_it_matters: '',
    steps: [''],
    what_to_expect: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const addStep = () => update('steps', [...form.steps, '']);
  const removeStep = i => update('steps', form.steps.filter((_, idx) => idx !== i));
  const updateStep = (i, val) => update('steps', form.steps.map((s, idx) => idx === i ? val : s));

  const handleClose = () => {
    setForm({ title: '', description: '', category: 'New Feature', hub: 'Platform', page_url: '', what_changed: '', why_it_matters: '', steps: [''], what_to_expect: '' });
    setSaved(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await base44.functions.invoke('autoCreateReleaseDraft', {
      mode: 'manual',
      title: form.title,
      description: form.description,
      category: form.category,
      hub: form.hub,
      page_url: form.page_url,
      what_changed: form.what_changed,
      why_it_matters: form.why_it_matters,
      steps: form.steps.filter(s => s.trim()),
      what_to_expect: form.what_to_expect,
    });
    queryClient.invalidateQueries({ queryKey: ['featureReleases'] });
    queryClient.invalidateQueries({ queryKey: ['featureGuides'] });
    setSaving(false);
    setSaved(true);
    setTimeout(handleClose, 1800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-xl bg-white dark:bg-[#0d1026] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 pointer-events-auto max-h-[90vh] flex flex-col">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
                    <Rocket className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white text-sm leading-none">Log a Release</h2>
                    <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">Creates a draft — review &amp; publish from the Changelog</p>
                  </div>
                </div>
                <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/8 text-slate-400 dark:text-white/40">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {saved ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)' }}>
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">Draft Created!</p>
                    <p className="text-sm text-slate-500 dark:text-white/40 text-center">Review it in the Draft Queue on the Changelog page.</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className={LABEL_CLASS}>What did you build or improve? *</label>
                      <input
                        value={form.title}
                        onChange={e => update('title', e.target.value)}
                        placeholder="e.g. New Pricing Calculator for Sales Hub"
                        className={INPUT_CLASS}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LABEL_CLASS}>Type</label>
                        <select value={form.category} onChange={e => update('category', e.target.value)} className={SELECT_CLASS}>
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Hub / Area</label>
                        <select value={form.hub} onChange={e => update('hub', e.target.value)} className={SELECT_CLASS}>
                          {HUBS.map(h => <option key={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={LABEL_CLASS}>Short description</label>
                      <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={2} placeholder="Brief summary of what was built or changed..." className={TEXTAREA_CLASS} />
                    </div>

                    <div>
                      <label className={LABEL_CLASS}>What changed?</label>
                      <textarea value={form.what_changed} onChange={e => update('what_changed', e.target.value)} rows={2} placeholder="In plain English, what is new or different?" className={TEXTAREA_CLASS} />
                    </div>

                    <div>
                      <label className={LABEL_CLASS}>Why does it matter?</label>
                      <textarea value={form.why_it_matters} onChange={e => update('why_it_matters', e.target.value)} rows={2} placeholder="Why is this useful for staff?" className={TEXTAREA_CLASS} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={LABEL_CLASS.replace('mb-1.5', '')}>How to use it (steps)</label>
                        <button onClick={addStep} className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:opacity-80 font-semibold">
                          <Plus className="w-3 h-3" /> Add step
                        </button>
                      </div>
                      <div className="space-y-2">
                        {form.steps.map((s, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 text-white" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>{i + 1}</span>
                            <input value={s} onChange={e => updateStep(i, e.target.value)} placeholder={`Step ${i + 1}…`} className={INPUT_CLASS.replace('w-full', 'flex-1')} />
                            {form.steps.length > 1 && (
                              <button onClick={() => removeStep(i)} className="text-slate-400 dark:text-white/30 hover:text-red-500 flex-shrink-0">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={LABEL_CLASS}>What to expect</label>
                      <input value={form.what_to_expect} onChange={e => update('what_to_expect', e.target.value)} placeholder="What will staff see after this change?" className={INPUT_CLASS} />
                    </div>

                    <div>
                      <label className={LABEL_CLASS}>Related page URL (optional)</label>
                      <input value={form.page_url} onChange={e => update('page_url', e.target.value)} placeholder="/sales or https://…" className={INPUT_CLASS} />
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {!saved && (
                <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3 flex-shrink-0">
                  <button onClick={handleClose} className="px-4 h-9 rounded-xl text-sm font-semibold text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!form.title.trim() || saving}
                    className="px-5 h-9 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}
                  >
                    {saving ? 'Creating draft…' : 'Create Draft'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}