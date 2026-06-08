import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Check, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORIES, CONTENT_TYPES, CONTENT_TYPE_LABELS, DIFFICULTIES, STATUSES, inputStyle } from './lmsConfig';

const EMPTY = {
  title: '', description: '', category: 'DBS & Compliance',
  content_type: 'html', difficulty: 'Beginner', status: 'published',
  estimated_duration_minutes: 15, is_mandatory: false, certificate_enabled: false,
  file_url: '', external_url: '',
};

export default function LmsCourseForm({ course, onClose, onSaved }) {
  const [form, setForm] = useState(course ? { ...course } : { ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, file_url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    if (course?.id) {
      await base44.entities.TrainingCourse.update(course.id, form);
    } else {
      await base44.entities.TrainingCourse.create(form);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-xl rounded-2xl p-6 overflow-y-auto max-h-[92vh]"
        style={{ background: '#0f1729', border: '1px solid rgba(139,92,246,0.3)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-white">{course?.id ? 'Edit Course' : 'Create New Course'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(255,255,255,0.40)' }}>Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Course title"
              className="w-full px-3 h-9 rounded-xl text-sm text-white outline-none"
              style={inputStyle} />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(255,255,255,0.40)' }}>Description</label>
            <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={3}
              placeholder="Short description of what this course covers…"
              className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-none"
              style={inputStyle} />
          </div>

          {/* Row: Category + Content Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(255,255,255,0.40)' }}>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-3 h-9 rounded-xl text-xs text-white outline-none"
                style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0f172a' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(255,255,255,0.40)' }}>Content Type</label>
              <select value={form.content_type} onChange={e => set('content_type', e.target.value)}
                className="w-full px-3 h-9 rounded-xl text-xs text-white outline-none"
                style={inputStyle}>
                {CONTENT_TYPES.map(t => <option key={t} value={t} style={{ background: '#0f172a' }}>{CONTENT_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
          </div>

          {/* Row: Difficulty + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(255,255,255,0.40)' }}>Difficulty</label>
              <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)}
                className="w-full px-3 h-9 rounded-xl text-xs text-white outline-none"
                style={inputStyle}>
                {DIFFICULTIES.map(d => <option key={d} value={d} style={{ background: '#0f172a' }}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(255,255,255,0.40)' }}>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-3 h-9 rounded-xl text-xs text-white outline-none"
                style={inputStyle}>
                {STATUSES.map(s => <option key={s} value={s} style={{ background: '#0f172a' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Duration + toggles */}
          <div className="grid grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(255,255,255,0.40)' }}>Duration (mins)</label>
              <input type="number" min={1} value={form.estimated_duration_minutes} onChange={e => set('estimated_duration_minutes', Number(e.target.value))}
                className="w-full px-3 h-9 rounded-xl text-sm text-white outline-none"
                style={inputStyle} />
            </div>
            <div className="flex items-center gap-2 pb-1">
              <input type="checkbox" id="mandatory" checked={!!form.is_mandatory} onChange={e => set('is_mandatory', e.target.checked)}
                className="w-4 h-4 rounded accent-violet-500" />
              <label htmlFor="mandatory" className="text-xs font-semibold text-white/60 cursor-pointer">Mandatory</label>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <input type="checkbox" id="cert" checked={!!form.certificate_enabled} onChange={e => set('certificate_enabled', e.target.checked)}
                className="w-4 h-4 rounded accent-violet-500" />
              <label htmlFor="cert" className="text-xs font-semibold text-white/60 cursor-pointer">Certificate</label>
            </div>
          </div>

          {/* HTML course: upload the .html file */}
          {form.content_type === 'html' && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(255,255,255,0.40)' }}>
                Upload HTML File
                {form.file_url && <span className="normal-case font-normal text-green-400 ml-1">✓ uploaded</span>}
              </label>
              <div className="flex gap-2">
                <input value={form.file_url || ''} onChange={e => set('file_url', e.target.value)} placeholder="https://… or upload"
                  className="flex-1 px-3 h-9 rounded-xl text-xs text-white outline-none"
                  style={inputStyle} />
                <label className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:opacity-80"
                  style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.30)', color: '#a78bfa' }}>
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? 'Uploading…' : 'Upload'}
                  <input type="file" className="hidden" onChange={handleFileUpload} accept=".html,.htm" />
                </label>
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.30)' }}>
                The HTML file is uploaded and fetched at display time — the full content renders inside the course viewer.
              </p>
            </div>
          )}

          {/* PDF / Word: file upload */}
          {['pdf', 'word'].includes(form.content_type) && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(255,255,255,0.40)' }}>
                File {form.file_url && <span className="normal-case font-normal text-green-400 ml-1">✓ uploaded</span>}
              </label>
              <div className="flex gap-2">
                <input value={form.file_url || ''} onChange={e => set('file_url', e.target.value)} placeholder="https://…"
                  className="flex-1 px-3 h-9 rounded-xl text-xs text-white outline-none"
                  style={inputStyle} />
                <label className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:opacity-80"
                  style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.30)', color: '#a78bfa' }}>
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? 'Uploading…' : 'Upload'}
                  <input type="file" className="hidden" onChange={handleFileUpload}
                    accept={form.content_type === 'pdf' ? '.pdf' : '.docx,.doc'} />
                </label>
              </div>
            </div>
          )}

          {/* External URL for link type */}
          {form.content_type === 'link' && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(255,255,255,0.40)' }}>External URL</label>
              <input value={form.external_url || ''} onChange={e => set('external_url', e.target.value)} placeholder="https://…"
                className="w-full px-3 h-9 rounded-xl text-sm text-white outline-none"
                style={inputStyle} />
            </div>
          )}

          {/* Checklist note */}
          {form.content_type === 'checklist' && (
            <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.20)', color: 'rgba(255,255,255,0.50)' }}>
              Save this course first, then manage checklist items from the course row actions.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={onClose} className="px-4 h-9 rounded-xl text-xs font-semibold text-white/50 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.title.trim()}
            className="flex items-center gap-2 px-5 h-9 rounded-xl text-xs font-bold transition-all disabled:opacity-50 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff' }}>
            <Check className="w-3.5 h-3.5" />
            {saving ? 'Saving…' : course?.id ? 'Save Changes' : 'Create Course'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}