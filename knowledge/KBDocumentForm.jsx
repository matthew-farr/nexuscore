import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Upload, AlertCircle } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const DOC_TYPES = [
  'Policy', 'Process', 'User Guide', 'FAQ', 'Video', 'External Link',
  'Template', 'Form', 'Process Map', 'Training Resource',
];
const CATEGORIES = [
  'Products', 'Compliance', 'Operations', 'Systems & Software',
  'Sales & Account Management', 'Finance & Commercial', 'Marketing & Communications', 'Company Information',
];
const STATUSES = ['Draft', 'Published', 'Under Review', 'Archived'];

const AUDIENCES = [
  { key: 'internal',        label: 'Internal Staff' },
  { key: 'client',          label: 'Client' },
  { key: 'applicant',       label: 'Applicant' },
  { key: 'links_resources', label: 'Links & Resources' },
  { key: 'templates_forms', label: 'Templates & Forms' },
];

// Doc types that use file/content rather than external URL
const FILE_CONTENT_TYPES = ['Policy', 'Process', 'User Guide', 'FAQ', 'Template', 'Form', 'Process Map', 'Training Resource'];

const EMPTY_FORM = {
  title: '', description: '', doc_type: 'Policy', category: 'Products',
  audience: ['internal'], status: 'Draft', visibility: 'All Staff',
  owner: '', version: '1.0', external_url: '', file_url: '', pdf_url: '', content: '', tags: '',
  is_featured: false, is_pinned: false, is_compliance_critical: false,
  is_internal_only: true, is_client_shareable: false, is_applicant_shareable: false,
};

export async function saveDocument(form, existingDocId) {
  const payload = {
    ...form,
    tags: typeof form.tags === 'string'
      ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
      : (form.tags || []),
    published_date: form.status === 'Published' && !form.published_date
      ? new Date().toISOString()
      : form.published_date,
  };
  if (existingDocId) {
    await base44.entities.KnowledgeDocument.update(existingDocId, payload);
    return 'updated';
  } else {
    await base44.entities.KnowledgeDocument.create(payload);
    return 'created';
  }
}

export default function KBDocumentForm({ doc, isOpen, onClose, onSaved }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    if (doc) {
      setForm({
        ...EMPTY_FORM,
        ...doc,
        tags: Array.isArray(doc.tags) ? doc.tags.join(', ') : (doc.tags || ''),
        audience: doc.audience?.length ? doc.audience : ['internal'],
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [doc, isOpen]);

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const toggleAudience = (key) => {
    setForm(prev => {
      const current = prev.audience || [];
      const next = current.includes(key) ? current.filter(a => a !== key) : [...current, key];
      return { ...prev, audience: next };
    });
    if (errors.audience) setErrors(prev => ({ ...prev, audience: null }));
  };

  const isExternalLink = form.doc_type === 'External Link';
  const isVideo = form.doc_type === 'Video';
  const allowsFile = FILE_CONTENT_TYPES.includes(form.doc_type);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.doc_type) e.doc_type = 'Document type is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.audience?.length) e.audience = 'At least one audience is required';
    if (!form.status) e.status = 'Status is required';
    if ((isExternalLink || isVideo) && !form.external_url.trim()) {
      e.external_url = 'URL is required for this document type';
    }
    return e;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('file_url', file_url);
    setUploading(false);
    toast.success('File uploaded');
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('pdf_url', file_url);
    setUploadingPdf(false);
    toast.success('PDF uploaded');
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      toast.error('Please fix the highlighted fields');
      return;
    }
    setSaving(true);
    const result = await saveDocument(form, doc?.id).catch(err => {
      toast.error(err?.message || 'Save failed — please try again');
      return null;
    });
    setSaving(false);
    if (!result) return;
    toast.success(result === 'updated' ? 'Document updated' : 'Document created');
    onSaved();
    onClose();
  };

  // Styles
  const inputBase = `w-full px-3 py-2 rounded-lg text-sm outline-none transition-all`;
  const inputTheme = (hasError) => isDark
    ? `border ${hasError ? 'border-red-500/60' : 'border-white/10'} focus:border-purple-500/60`
    : `bg-white border ${hasError ? 'border-red-400' : 'border-slate-200'} text-slate-900 placeholder:text-slate-400 focus:border-purple-400`;
  const inputClass = (field) => `${inputBase} ${inputTheme(!!errors[field])}`;
  const inputStyle = isDark ? { background: 'rgba(255,255,255,0.08)', color: '#ffffff' } : {};
  const labelClass = `block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/70' : 'text-slate-600'}`;
  const errorMsg = (field) => errors[field]
    ? <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[field]}</p>
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl z-[60] flex flex-col"
            style={{
              background: isDark ? 'hsl(230 50% 8%)' : 'white',
              borderLeft: `1px solid ${isDark ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.15)'}`,
              boxShadow: '-8px 0 40px rgba(0,0,0,0.35)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
              style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {doc ? 'Edit Document' : 'Add Document'}
              </h2>
              <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/8 text-white/60 hover:text-white' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable form body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Title */}
              <div>
                <label className={labelClass}>Title <span className="text-red-400">*</span></label>
                <input value={form.title} onChange={e => set('title', e.target.value)}
                 placeholder="Document title…" className={inputClass('title')} style={inputStyle} />
                {errorMsg('title')}
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>Description <span className="text-red-400">*</span></label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={2} placeholder="Brief summary visible in search results…"
                  className={`${inputClass('description')} resize-none`} style={inputStyle} />
                {errorMsg('description')}
              </div>

              {/* Type + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Document Type <span className="text-red-400">*</span></label>
                  <select value={form.doc_type} onChange={e => set('doc_type', e.target.value)}
                    className={inputClass('doc_type')} style={{ ...inputStyle, colorScheme: isDark ? 'dark' : 'light' }}>
                    {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errorMsg('doc_type')}
                </div>
                <div>
                  <label className={labelClass}>Category <span className="text-red-400">*</span></label>
                  <select value={form.category} onChange={e => set('category', e.target.value)}
                    className={inputClass('category')} style={{ ...inputStyle, colorScheme: isDark ? 'dark' : 'light' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errorMsg('category')}
                </div>
              </div>

              {/* Status + Version */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Status <span className="text-red-400">*</span></label>
                  <select value={form.status} onChange={e => set('status', e.target.value)}
                    className={inputClass('status')} style={{ ...inputStyle, colorScheme: isDark ? 'dark' : 'light' }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errorMsg('status')}
                </div>
                <div>
                  <label className={labelClass}>Version</label>
                  <input value={form.version} onChange={e => set('version', e.target.value)}
                    placeholder="1.0" className={inputClass('version')} style={inputStyle} />
                </div>
              </div>

              {/* Owner */}
              <div>
                <label className={labelClass}>Owner</label>
                <input value={form.owner} onChange={e => set('owner', e.target.value)}
                  placeholder="e.g. HR Team, Operations…" className={inputClass('owner')} style={inputStyle} />
              </div>

              {/* Audience */}
              <div>
                <label className={labelClass}>Audience <span className="text-red-400">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {AUDIENCES.map(a => {
                    const active = form.audience?.includes(a.key);
                    return (
                      <button key={a.key} type="button" onClick={() => toggleAudience(a.key)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={active ? {
                          background: 'linear-gradient(135deg, #7c3aed, #ec2ca3)', color: 'white',
                        } : {
                          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                          color: isDark ? 'rgba(255,255,255,0.6)' : '#475569',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
                        }}>
                        {a.label}
                      </button>
                    );
                  })}
                </div>
                {errorMsg('audience')}
              </div>

              {/* External URL — required for External Link / Video */}
              {(isExternalLink || isVideo) && (
                <div>
                  <label className={labelClass}>
                    External URL <span className="text-red-400">*</span>
                  </label>
                  <input value={form.external_url} onChange={e => set('external_url', e.target.value)}
                    placeholder="https://…" className={inputClass('external_url')} style={inputStyle} />
                  {errorMsg('external_url')}
                </div>
              )}

              {/* Optional URL for other types */}
              {!isExternalLink && !isVideo && (
                <div>
                  <label className={labelClass}>
                    External URL
                    <span className={`font-normal ml-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>(optional)</span>
                  </label>
                  <input value={form.external_url} onChange={e => set('external_url', e.target.value)}
                    placeholder="https://…" className={inputClass('external_url')} style={inputStyle} />
                </div>
              )}

              {/* File upload — only for file/content types */}
              {allowsFile && (
                <div>
                  <label className={labelClass}>
                    Attach File
                    <span className={`font-normal ml-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>(PDF, Word, etc.)</span>
                  </label>
                  {form.file_url && (
                    <div className="flex items-center gap-2 mb-2">
                      <p className={`text-xs truncate flex-1 ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                        ✓ {decodeURIComponent(form.file_url.split('/').pop())}
                      </p>
                      <button type="button" onClick={() => set('file_url', '')}
                        className={`text-xs ${isDark ? 'text-white/40 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}>
                        Remove
                      </button>
                    </div>
                  )}
                  <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-xs font-medium transition-all ${
                    isDark ? 'border-white/10 text-white/60 hover:bg-white/6' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>
                    {uploading
                      ? <div className="w-3.5 h-3.5 border border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                      : <Upload className="w-3.5 h-3.5" />}
                    {uploading ? 'Uploading…' : 'Choose file'}
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                </div>
              )}

              {/* PDF upload */}
              {allowsFile && (
                <div>
                  <label className={labelClass}>
                    PDF Version
                    <span className={`font-normal ml-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>(optional — upload alongside HTML guide)</span>
                  </label>
                  {form.pdf_url && (
                    <div className="flex items-center gap-2 mb-2">
                      <p className={`text-xs truncate flex-1 ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                        ✓ {decodeURIComponent(form.pdf_url.split('/').pop())}
                      </p>
                      <button type="button" onClick={() => set('pdf_url', '')}
                        className={`text-xs ${isDark ? 'text-white/40 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}>
                        Remove
                      </button>
                    </div>
                  )}
                  <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-xs font-medium transition-all ${
                    isDark ? 'border-white/10 text-white/60 hover:bg-white/6' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>
                    {uploadingPdf
                      ? <div className="w-3.5 h-3.5 border border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                      : <Upload className="w-3.5 h-3.5" />}
                    {uploadingPdf ? 'Uploading…' : 'Choose PDF'}
                    <input type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} disabled={uploadingPdf} />
                  </label>
                </div>
              )}

              {/* Manual content / body */}
              {allowsFile && (
                <div>
                  <label className={labelClass}>
                    Manual Content / Body
                    <span className={`font-normal ml-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>(HTML or plain text, optional)</span>
                  </label>
                  <textarea value={form.content} onChange={e => set('content', e.target.value)}
                    rows={4} placeholder="Paste or type document body here…"
                    className={`${inputClass('content')} resize-y`} style={inputStyle} />
                </div>
              )}

              {/* Tags */}
              <div>
                <label className={labelClass}>
                  Tags
                  <span className={`font-normal ml-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>(comma-separated)</span>
                </label>
                <input value={form.tags} onChange={e => set('tags', e.target.value)}
                  placeholder="DBS, Policy, Compliance…" className={inputClass('tags')} style={inputStyle} />
              </div>

              {/* Flags */}
              <div>
                <label className={labelClass}>Flags</label>
                <div className="space-y-2.5">
                  {[
                    { field: 'is_featured',            label: 'Featured — shows in hero section' },
                    { field: 'is_pinned',               label: 'Pinned — always visible at top' },
                    { field: 'is_compliance_critical',  label: 'Compliance Critical' },
                    { field: 'is_internal_only',        label: 'Internal Only' },
                    { field: 'is_client_shareable',     label: 'Client Shareable' },
                    { field: 'is_applicant_shareable',  label: 'Applicant Shareable' },
                  ].map(({ field, label }) => (
                    <label key={field} className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={!!form[field]} onChange={e => set(field, e.target.checked)}
                        className="w-4 h-4 rounded accent-purple-600" />
                      <span className={`text-xs ${isDark ? 'text-white/70' : 'text-slate-700'}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0"
              style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
              <button type="button" onClick={onClose}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'text-white/60 hover:bg-white/6' : 'text-slate-600 hover:bg-slate-100'}`}>
                Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #ec2ca3)' }}>
                {saving
                  ? <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                  : <Save className="w-3.5 h-3.5" />}
                {saving ? 'Saving…' : 'Save Document'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}