import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Save } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SECTORS } from './dbsEligibilityConfig';

const CHECK_LEVELS = [
  'Basic DBS', 'Standard DBS', 'Enhanced DBS',
  "Enhanced DBS with Children's Barred List",
  "Enhanced DBS with Adults' Barred List",
  "Enhanced DBS with Children's and Adults' Barred Lists",
  'Not enough information', 'Escalate to Compliance'
];
const WORKFORCE_OPTIONS = ['Child Workforce', 'Adult Workforce', 'Child and Adult Workforce', 'Other Workforce', 'No Workforce', 'Not Sure'];
const BARRED_LIST_OPTIONS = ['Likely Required', 'May Be Required', 'Not Usually Required', 'Not Enough Information', 'Escalate to Compliance'];
const STATUS_OPTIONS = ['Active', 'Draft', 'Archived', 'Needs Compliance Review'];

const EMPTY_FORM = {
  role_title: '', sector: '', summary: '', likely_check_level: '',
  workforce: '', children_barred_list: '', adults_barred_list: '',
  frequency_test_required: false, frequency_test_text: '',
  adult_barred_list_criteria: '', key_questions: '', guidance_notes: '',
  escalation_required: false, status: 'Active'
};

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</label>
      {children}
    </div>
  );
}

export default function ScenarioAdminDrawer({ scenario, isDark, user, onClose, onSaved }) {
  const [form, setForm] = useState(scenario ? { ...EMPTY_FORM, ...scenario } : { ...EMPTY_FORM });
  const isEdit = !!scenario;

  const sel = (field) => (val) => setForm(p => ({ ...p, [field]: val }));
  const inp = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', width: '100%' };
  const taStyle = { ...inputStyle, minHeight: '80px', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' };

  const saveMutation = useMutation({
    mutationFn: (data) => isEdit
      ? base44.entities.DBSEligibilityScenario.update(scenario.id, data)
      : base44.entities.DBSEligibilityScenario.create(data),
    onSuccess: onSaved,
  });

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-full md:w-[560px] z-50 flex flex-col shadow-2xl overflow-hidden"
      style={{ background: 'rgba(8,10,28,0.98)', borderLeft: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(40px)' }}
    >
      <div className="flex items-center justify-between p-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 className="text-base font-bold text-white">{isEdit ? 'Edit Scenario' : 'Add Scenario'}</h2>
        <button onClick={onClose} className="p-2 rounded-lg hover:opacity-70 transition-opacity text-white/50"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <Field label="Role Title *">
          <Input value={form.role_title} onChange={inp('role_title')} style={inputStyle} placeholder="e.g. Teacher" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Sector">
            <Select value={form.sector} onValueChange={sel('sector')}>
              <SelectTrigger style={inputStyle}><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{SECTORS.map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={sel('status')}>
              <SelectTrigger style={inputStyle}><SelectValue /></SelectTrigger>
              <SelectContent>{STATUS_OPTIONS.map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Summary">
          <textarea value={form.summary} onChange={inp('summary')} style={taStyle} placeholder="Brief summary..." />
        </Field>
        <Field label="Likely Check Level">
          <Select value={form.likely_check_level} onValueChange={sel('likely_check_level')}>
            <SelectTrigger style={inputStyle}><SelectValue placeholder="Select check level..." /></SelectTrigger>
            <SelectContent>{CHECK_LEVELS.map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Workforce">
          <Select value={form.workforce} onValueChange={sel('workforce')}>
            <SelectTrigger style={inputStyle}><SelectValue placeholder="Select workforce..." /></SelectTrigger>
            <SelectContent>{WORKFORCE_OPTIONS.map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Children's Barred List">
            <Select value={form.children_barred_list} onValueChange={sel('children_barred_list')}>
              <SelectTrigger style={inputStyle}><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{BARRED_LIST_OPTIONS.map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Adults' Barred List">
            <Select value={form.adults_barred_list} onValueChange={sel('adults_barred_list')}>
              <SelectTrigger style={inputStyle}><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{BARRED_LIST_OPTIONS.map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.frequency_test_required} onChange={e => setForm(p => ({ ...p, frequency_test_required: e.target.checked }))} />
            <span className="text-sm text-white/70">Frequency Test Required</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.escalation_required} onChange={e => setForm(p => ({ ...p, escalation_required: e.target.checked }))} />
            <span className="text-sm text-white/70">Escalation Required</span>
          </label>
        </div>
        <Field label="Frequency Test Text (leave blank to use default)">
          <textarea value={form.frequency_test_text} onChange={inp('frequency_test_text')} style={taStyle} placeholder="Custom frequency test guidance..." />
        </Field>
        <Field label="Adult Barred List Criteria (leave blank to use default)">
          <textarea value={form.adult_barred_list_criteria} onChange={inp('adult_barred_list_criteria')} style={taStyle} placeholder="Custom adult barred list criteria..." />
        </Field>
        <Field label="Key Questions (one per line)">
          <textarea value={form.key_questions} onChange={inp('key_questions')} style={{ ...taStyle, minHeight: '120px' }} placeholder="What duties will the person carry out?&#10;Will they work with children or adults?" />
        </Field>
        <Field label="Guidance Notes">
          <textarea value={form.guidance_notes} onChange={inp('guidance_notes')} style={taStyle} placeholder="Additional guidance notes..." />
        </Field>
      </div>

      <div className="p-5 flex gap-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Button onClick={() => saveMutation.mutate({ ...form, updated_by: user?.email || '' })} disabled={!form.role_title || saveMutation.isPending} style={{ background: 'linear-gradient(135deg, #ec2ca3, #7c3aed)' }} className="flex-1 gap-2">
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Save Changes' : 'Add Scenario'}
        </Button>
        <Button onClick={onClose} variant="outline">Cancel</Button>
      </div>
    </motion.div>
  );
}