import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/ThemeProvider';

const TYPES = ['DBS Supplier', 'Software Platform', 'Payment Provider', 'HR System', 'Communication Tool', 'Analytics & BI', 'Identity & Verification', 'Government / Regulatory', 'Cloud & Infrastructure', 'Other'];
const STATUSES = ['Active', 'Under Review', 'Inactive'];
const DEPARTMENTS = ['Operations', 'Compliance', 'Sales', 'Finance', 'IT', 'HR', 'Management'];

const STEPS = ['Basic Info', 'Contacts', 'Details', 'Notes & Tags', 'Review'];

const EMPTY = {
  supplier_name: '', supplier_type: '', status: 'Active', description: '', used_for: '', featured: false,
  website: '', portal_url: '', contract_owner: '', renewal_date: '', next_review_date: '',
  primary_contact_name: '', primary_contact_role: '', primary_contact_email: '', primary_contact_phone: '',
  support_email: '', support_phone: '',
  escalation_contact_name: '', escalation_contact_email: '', escalation_contact_phone: '',
  internal_notes: '', tags: [], departments: [], sort_order: 0,
};

function Field({ label, children, required }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
        {label}{required && <span className="text-pink-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function useInputStyle() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return {
    input: {
      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
      border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
      color: isDark ? '#fff' : '#0f0f2e',
      borderRadius: '10px', padding: '8px 12px', fontSize: '14px', outline: 'none', width: '100%',
    },
    ta: {
      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
      border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
      color: isDark ? '#fff' : '#0f0f2e',
      borderRadius: '10px', padding: '8px 12px', fontSize: '14px', outline: 'none', width: '100%', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit',
    },
  };
}

export default function SupplierFormDrawer({ supplier, onClose, onSaved, user }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(supplier ? { ...EMPTY, ...supplier } : { ...EMPTY });
  const styles = useInputStyle();

  const isEdit = !!supplier;
  const inp = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const sel = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const chk = f => e => setForm(p => ({ ...p, [f]: e.target.checked }));
  const tagsStr = Array.isArray(form.tags) ? form.tags.join(', ') : (form.tags || '');

  const saveMutation = useMutation({
    mutationFn: (data) => isEdit
      ? base44.entities.SupplierRegister.update(supplier.id, data)
      : base44.entities.SupplierRegister.create(data),
    onSuccess: onSaved,
  });

  const handleSave = () => {
    const data = {
      ...form,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags,
    };
    saveMutation.mutate(data);
  };

  const sectionBg = { background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', padding: '16px' };
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 280, damping: 30 }}
      className="fixed top-0 right-0 h-full z-[60] flex flex-col shadow-2xl overflow-hidden"
      style={{ width: 'min(640px, 100vw)', background: isDark ? 'rgba(6,8,24,0.98)' : '#fff', borderLeft: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)', backdropFilter: 'blur(40px)' }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-5" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold" style={{ color: isDark ? '#fff' : '#0f0f2e' }}>{isEdit ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:opacity-70 transition-opacity" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}><X className="w-5 h-5" /></button>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all"
                style={{
                  background: i < step ? 'linear-gradient(135deg, #ec2ca3, #7c3aed)' : i === step ? 'rgba(236,44,163,0.25)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                  color: i <= step ? (i < step ? '#fff' : '#ec2ca3') : (isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.30)'),
                  border: i === step ? '1.5px solid #ec2ca3' : 'none',
                }}>
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-6 h-0.5 rounded-full" style={{ background: i < step ? '#ec2ca3' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)') }} />
              )}
            </div>
          ))}
          <span className="ml-2 text-xs font-semibold" style={{ color: '#ec2ca3' }}>{STEPS[step]}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {step === 0 && (
          <>
            <Field label="Supplier Name" required><input style={styles.input} value={form.supplier_name} onChange={inp('supplier_name')} placeholder="e.g. DBS" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Supplier Type">
                <select style={styles.input} value={form.supplier_type} onChange={sel('supplier_type')}>
                  <option value="">Select type...</option>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select style={styles.input} value={form.status} onChange={sel('status')}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Short Description"><textarea style={styles.ta} value={form.description} onChange={inp('description')} placeholder="2-line overview of the supplier..." /></Field>
            <Field label="Used For (Operational Detail)"><textarea style={{ ...styles.ta, minHeight: '100px' }} value={form.used_for} onChange={inp('used_for')} placeholder="e.g. Used for Standard DBS, Enhanced DBS and Barred List checks..." /></Field>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={chk('featured')} />
              <span className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>Mark as Featured Supplier</span>
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <div style={sectionBg}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: textMuted }}>Primary Contact</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name"><input style={styles.input} value={form.primary_contact_name} onChange={inp('primary_contact_name')} /></Field>
                  <Field label="Role"><input style={styles.input} value={form.primary_contact_role} onChange={inp('primary_contact_role')} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Email"><input style={styles.input} type="email" value={form.primary_contact_email} onChange={inp('primary_contact_email')} /></Field>
                  <Field label="Phone"><input style={styles.input} value={form.primary_contact_phone} onChange={inp('primary_contact_phone')} /></Field>
                </div>
              </div>
            </div>
            <div style={sectionBg}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: textMuted }}>Support Contact</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Support Email"><input style={styles.input} type="email" value={form.support_email} onChange={inp('support_email')} /></Field>
                <Field label="Support Phone"><input style={styles.input} value={form.support_phone} onChange={inp('support_phone')} /></Field>
              </div>
            </div>
            <div style={sectionBg}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: textMuted }}>Escalation Contact (Optional)</p>
              <div className="space-y-3">
                <Field label="Name"><input style={styles.input} value={form.escalation_contact_name} onChange={inp('escalation_contact_name')} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Email"><input style={styles.input} type="email" value={form.escalation_contact_email} onChange={inp('escalation_contact_email')} /></Field>
                  <Field label="Phone"><input style={styles.input} value={form.escalation_contact_phone} onChange={inp('escalation_contact_phone')} /></Field>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Website"><input style={styles.input} placeholder="https://" value={form.website} onChange={inp('website')} /></Field>
              <Field label="Portal URL"><input style={styles.input} placeholder="https://" value={form.portal_url} onChange={inp('portal_url')} /></Field>
            </div>
            <Field label="Contract Owner"><input style={styles.input} value={form.contract_owner} onChange={inp('contract_owner')} placeholder="e.g. Matthew Farr" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Renewal Date"><input style={styles.input} type="date" value={form.renewal_date} onChange={inp('renewal_date')} /></Field>
              <Field label="Next Review Date"><input style={styles.input} type="date" value={form.next_review_date} onChange={inp('next_review_date')} /></Field>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Field label="Internal Notes"><textarea style={{ ...styles.ta, minHeight: '120px' }} value={form.internal_notes} onChange={inp('internal_notes')} placeholder="Internal notes visible to staff..." /></Field>
            <Field label="Tags (comma separated)">
              <input style={styles.input} value={tagsStr}
                onChange={e => setForm(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                placeholder="e.g. DBS, Compliance, Screening" />
            </Field>
            <Field label="Departments">
              <div className="flex flex-wrap gap-2 mt-1">
                {DEPARTMENTS.map(dep => {
                  const selected = (form.departments || []).includes(dep);
                  return (
                    <button key={dep} type="button"
                      onClick={() => setForm(p => ({ ...p, departments: selected ? p.departments.filter(d => d !== dep) : [...(p.departments || []), dep] }))}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: selected ? 'rgba(236,44,163,0.20)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                        border: selected ? '1px solid rgba(236,44,163,0.40)' : (isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)'),
                        color: selected ? '#ec2ca3' : (isDark ? 'rgba(255,255,255,0.60)' : 'rgba(0,0,0,0.55)'),
                      }}>
                      {dep}
                    </button>
                  );
                })}
              </div>
            </Field>
          </>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm font-semibold" style={{ color: isDark ? '#fff' : '#0f0f2e' }}>Review & Save</p>
            {[
              ['Supplier Name', form.supplier_name],
              ['Type', form.supplier_type],
              ['Status', form.status],
              ['Featured', form.featured ? 'Yes' : 'No'],
              ['Website', form.website],
              ['Portal URL', form.portal_url],
              ['Contract Owner', form.contract_owner],
              ['Renewal Date', form.renewal_date],
              ['Next Review', form.next_review_date],
              ['Tags', Array.isArray(form.tags) ? form.tags.join(', ') : form.tags],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="flex justify-between py-2"
                style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                <span className="text-xs" style={{ color: textMuted }}>{label}</span>
                <span className="text-xs font-medium" style={{ color: isDark ? '#fff' : '#0f0f2e' }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-6 py-4 flex gap-3" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(0,0,0,0.65)', border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)' }}>
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        <div className="flex-1" />
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!form.supplier_name}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #ec2ca3, #7c3aed)' }}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSave} disabled={!form.supplier_name || saveMutation.isPending}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #ec2ca3, #7c3aed)' }}>
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isEdit ? 'Save Changes' : 'Add Supplier'}
          </button>
        )}
      </div>
    </motion.div>
  );
}