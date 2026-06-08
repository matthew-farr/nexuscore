import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function CalendarPicker({ value, onChange, onClose }) {
  const today = new Date();
  const initDate = value ? new Date(value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({length: daysInMonth}, (_, i) => i + 1));

  const selectedISO = value || '';

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); };

  const selectDay = (d) => {
    const iso = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    onChange(iso);
    onClose();
  };

  return (
    <div className="absolute z-50 mt-1 top-full left-0 rounded-lg shadow-2xl border p-3 w-64"
      style={{ background: '#0f1729', borderColor: 'rgba(255,255,255,0.12)' }}
      onMouseDown={e => e.preventDefault()}
    >
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={prevMonth} className="p-1 hover:opacity-70"><ChevronLeft className="w-4 h-4 text-white" /></button>
        <span className="text-xs font-semibold text-white">{MONTHS[viewMonth]} {viewYear}</span>
        <button type="button" onClick={nextMonth} className="p-1 hover:opacity-70"><ChevronRight className="w-4 h-4 text-white" /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold py-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const iso = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const isSelected = iso === selectedISO;
          const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          return (
            <button
              key={i}
              type="button"
              onClick={() => selectDay(d)}
              className="text-xs rounded py-1 text-center transition-colors"
              style={{
                background: isSelected ? '#06b6d4' : isToday ? 'rgba(6,182,212,0.15)' : 'transparent',
                color: isSelected ? '#fff' : isToday ? '#06b6d4' : 'rgba(255,255,255,0.8)',
                fontWeight: isSelected || isToday ? '600' : '400'
              }}
            >{d}</button>
          );
        })}
      </div>
    </div>
  );
}

function DateInput({ value, onChange, placeholder = 'dd/mm/yyyy' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const toDisplay = (v) => {
    if (!v) return '';
    const [y, m, d] = v.split('-');
    if (!y || !m || !d) return v;
    return `${d}/${m}/${y}`;
  };
  const toISO = (v) => {
    const match = v.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) return `${match[3]}-${match[2].padStart(2,'0')}-${match[1].padStart(2,'0')}`;
    return null;
  };

  const [text, setText] = useState(toDisplay(value));
  useEffect(() => { setText(toDisplay(value)); }, [value]);

  const handleTextChange = (e) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, '');
    let formatted = digits;
    if (digits.length > 2) formatted = digits.slice(0,2) + '/' + digits.slice(2);
    if (digits.length > 4) formatted = digits.slice(0,2) + '/' + digits.slice(2,4) + '/' + digits.slice(4,8);
    setText(formatted);
    const iso = toISO(formatted);
    if (iso) onChange(iso);
    else if (!raw) onChange('');
  };

  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative flex items-center">
        <Input
          value={text}
          onChange={handleTextChange}
          placeholder={placeholder}
          maxLength={10}
          className="pr-9"
        />
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:opacity-80 transition-opacity"
          style={{ color: '#06b6d4' }}
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>
      {open && (
        <CalendarPicker
          value={value}
          onChange={(iso) => { onChange(iso); setText(toDisplay(iso)); }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

const STAGES = ['New CJSM', 'Sent to Client', 'Waiting on Client', 'Client Chased', 'Client Responded', 'Responded to DBS', 'Further Clarification Required', 'Withdrawn', 'Duplicated', 'Cancelled'];
const QUERY_TYPES = ['Previous Name', 'Previous Address', 'Address History', 'Identity Query', 'Legislative Wording', 'Eligibility Query', 'Duplicate Application', 'Overseas Query', 'Barred List Query', 'Other'];
const SOURCES = ['CJSM', 'Email', 'Phone', 'Internal', 'Other'];

export default function DBSQueryForm({ record, onClose, onSuccess, isDark, queryTypes = QUERY_TYPES, stages = STAGES, onRecordFound }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Initialize form with defaults on mount
  useEffect(() => {
    const initForm = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);

      if (record) {
        setForm({
          ...record,
          query_type_other: record.query_type_other || '',
          updated_by: user.email
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        const agentName = user.full_name || user.email;
        
        setForm({
          date_received: today,
          eref: '',
          our_ref: '',
          company_name: '',
          query_type: '',
          query_type_other: '',
          agent_assigned: agentName,
          stage: 'Sent to Client',
          date_sent_to_client: today,
          date_client_replied: '',
          date_replied_to_dbs: '',
          date_resent_chased: '',
          client_response: '',
          response_sent_to_dbs: '',
          action_taken_summary: '',
          further_clarification_required: false,
          source: 'CJSM',
          updated_by: user.email
        });
      }
    };

    initForm();
  }, [record]);

  const updateStage = (updatedForm) => {
    if (updatedForm.date_replied_to_dbs) {
      updatedForm.stage = 'Responded to DBS';
    } else if (updatedForm.client_response) {
      updatedForm.stage = 'Client Responded';
    } else if (updatedForm.date_sent_to_client) {
      updatedForm.stage = 'Waiting on Client';
    }
  };

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value };
    // Auto-populate dates based on stage
    if (field === 'stage') {
      const today = new Date().toISOString().split('T')[0];
      if (value === 'Client Chased' && !updated.date_resent_chased) {
        updated.date_resent_chased = today;
      }
      if (value === 'Responded to DBS' && !updated.date_replied_to_dbs) {
        updated.date_replied_to_dbs = today;
      }
    } else {
      updateStage(updated);
    }
    setForm(updated);
  };

  const checkDuplicates = async () => {
    if (!form.eref?.trim() && !form.our_ref?.trim()) {
      return null; // No duplicates to check
    }

    const allRecords = await base44.entities.DBSQueryTracker.list();

    if (form.eref?.trim()) {
      const erefMatch = allRecords.find(r => 
        r.id !== record?.id && 
        r.eref?.trim().toLowerCase() === form.eref.trim().toLowerCase()
      );
      if (erefMatch) return { record: erefMatch, field: 'EREF' };
    }

    if (form.our_ref?.trim()) {
      const ourRefMatch = allRecords.find(r => 
        r.id !== record?.id && 
        r.our_ref?.trim().toLowerCase() === form.our_ref.trim().toLowerCase()
      );
      if (ourRefMatch) return { record: ourRefMatch, field: 'Our Ref' };
    }

    return null;
  };

  const validateForm = () => {
    if (!form.date_received) {
      alert('Date Received is required');
      return false;
    }
    if (!form.company_name) {
      alert('Company Name is required');
      return false;
    }
    if (!form.query_type) {
      alert('Query Type is required');
      return false;
    }
    if (form.query_type === 'Other' && !form.query_type_other?.trim()) {
      alert('Please specify the custom query type');
      return false;
    }
    if (!form.stage) {
      alert('Stage is required');
      return false;
    }
    if (!form.source) {
      alert('Source is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // Check for missing EREF/Our Ref and get confirmation (only if no duplicate found)
    const missingRefs = [];
    if (!form.eref?.trim()) missingRefs.push('EREF');
    if (!form.our_ref?.trim()) missingRefs.push('Our Ref');

    if (missingRefs.length > 0 && !record) {
      const msg = missingRefs.length === 2 
        ? 'You have not entered an EREF or Our Ref. Are you sure you want to continue?'
        : `You have not entered an ${missingRefs[0]}. Are you sure you want to continue?`;
      
      setPendingConfirmation({
        type: 'missing_refs',
        message: msg,
        onConfirm: () => proceedWithSave()
      });
      return;
    }

    proceedWithSave();
  };

  const proceedWithSave = async () => {
    setSaving(true);
    setPendingConfirmation(null);
    
    try {
      const user = currentUser || await base44.auth.me();
      const formData = { ...form };
      delete formData.updated_by;

      if (record?.id) {
        const changes = {};
        Object.keys(formData).forEach(key => {
          if (formData[key] !== record[key]) {
            changes[key] = { old: record[key], new: formData[key] };
          }
        });

        await base44.entities.DBSQueryTracker.update(record.id, {
          ...formData,
          updated_date: new Date().toISOString(),
          updated_by: user.email
        });

        // Create technical audit entries for all changes
        for (const [field, change] of Object.entries(changes)) {
          await base44.entities.DBSQueryAuditLog.create({
            query_id: record.id,
            action_type: 'field_edited',
            field_changed: field,
            old_value: String(change.old || ''),
            new_value: String(change.new || ''),
            changed_by: user.email
          });

          // Create readable activity entries for key fields
          if (field === 'client_response' && change.new) {
            await base44.entities.DBSQueryAuditLog.create({
              query_id: record.id,
              action_type: 'Client Response Updated',
              field_changed: 'client_response',
              old_value: String(change.old || ''),
              new_value: String(change.new || ''),
              changed_by: user.email
            });
          } else if (field === 'response_sent_to_dbs' && change.new) {
            await base44.entities.DBSQueryAuditLog.create({
              query_id: record.id,
              action_type: 'Response Sent to DBS Updated',
              field_changed: 'response_sent_to_dbs',
              old_value: String(change.old || ''),
              new_value: String(change.new || ''),
              changed_by: user.email
            });
          } else if (field === 'action_taken_summary' && change.new) {
            await base44.entities.DBSQueryAuditLog.create({
              query_id: record.id,
              action_type: 'Action Summary Updated',
              field_changed: 'action_taken_summary',
              old_value: String(change.old || ''),
              new_value: String(change.new || ''),
              changed_by: user.email
            });
          } else if (field === 'stage' && change.new) {
            await base44.entities.DBSQueryAuditLog.create({
              query_id: record.id,
              action_type: 'Stage Changed',
              field_changed: 'stage',
              old_value: String(change.old || ''),
              new_value: String(change.new || ''),
              changed_by: user.email
            });
          }
        }
      } else {
        const created = await base44.entities.DBSQueryTracker.create({
          ...formData,
          updated_date: new Date().toISOString(),
          updated_by: user.email
        });
        
        await base44.entities.DBSQueryAuditLog.create({
          query_id: created.id,
          action_type: 'record_created',
          field_changed: 'initial',
          old_value: '',
          new_value: 'Record created',
          changed_by: user.email
        });
      }

      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  if (!form) return null;

  return (
    <>
      {/* Confirmation Modal */}
      {pendingConfirmation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 120 }}
        >
          <div className="fixed inset-0 bg-black/70" onClick={() => setPendingConfirmation(null)} />
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="relative bg-white dark:bg-slate-900 rounded-lg p-6 max-w-sm mx-4 shadow-2xl"
          >
            <>
              <h3 className="text-lg font-bold mb-4">Missing Reference</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                {pendingConfirmation.message}
              </p>
            </>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setPendingConfirmation(null)}
                className="flex-1"
              >
                Go Back
              </Button>
              <Button
                onClick={pendingConfirmation.onConfirm}
                className="flex-1"
              >
                Continue Anyway
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        style={{ zIndex: 90 }}
      />

      {/* Right-side Drawer */}
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full sm:w-[520px] md:w-[640px] flex flex-col overflow-hidden"
        style={{
          zIndex: 100,
          background: isDark ? '#050816' : '#ffffff',
          borderLeft: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          boxShadow: isDark ? '-4px 0 40px rgba(0,0,0,0.5)' : '-4px 0 20px rgba(0,0,0,0.08)'
        }}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-6 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
              {record ? 'Edit CJSM Query' : 'Add CJSM Query'}
            </h2>
            <button onClick={onClose} className="p-1 hover:opacity-70 transition-opacity">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Core Details Section */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>Core Details</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      Date Received *
                    </label>
                    <DateInput
                      value={form.date_received}
                      onChange={(v) => handleChange('date_received', v)}
                      isDark={isDark}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      EREF
                    </label>
                    <Input
                      value={form.eref}
                      onChange={(e) => handleChange('eref', e.target.value)}
                      placeholder="e.g., 123ABC"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      Our Ref
                    </label>
                    <Input
                      value={form.our_ref}
                      onChange={(e) => handleChange('our_ref', e.target.value)}
                      placeholder="e.g., REF-001"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      Company Name *
                    </label>
                    <Input
                      value={form.company_name}
                      onChange={(e) => handleChange('company_name', e.target.value)}
                      placeholder="e.g., ACME Corp"
                    />
                  </div>

                  <div className={form.query_type === 'Other' ? 'col-span-2' : ''}>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      Query Type *
                    </label>
                    <Select value={form.query_type} onValueChange={(v) => handleChange('query_type', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {QUERY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {form.query_type === 'Other' && (
                    <div className="col-span-2">
                      <label className="text-xs font-semibold mb-1 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                        Other Query Type *
                      </label>
                      <Input
                        value={form.query_type_other}
                        onChange={(e) => handleChange('query_type_other', e.target.value)}
                        placeholder="Please specify..."
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      Agent Assigned
                    </label>
                    <Input
                      value={form.agent_assigned}
                      onChange={(e) => handleChange('agent_assigned', e.target.value)}
                      placeholder="Name or email"
                    />
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3 mt-6" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>Status & Source</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      Stage *
                    </label>
                    <Select value={form.stage} onValueChange={(v) => handleChange('stage', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      Source *
                    </label>
                    <Select value={form.source} onValueChange={(v) => handleChange('source', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={form.further_clarification_required}
                      onChange={(e) => handleChange('further_clarification_required', e.target.checked)}
                    />
                    <span style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>Further Clarification Required</span>
                  </label>
                </div>
              </div>

              {/* Key Dates Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3 mt-6" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>Key Dates</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      Sent to Client
                    </label>
                    <DateInput value={form.date_sent_to_client} onChange={(v) => handleChange('date_sent_to_client', v)} isDark={isDark} />
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      Client Replied
                    </label>
                    <DateInput value={form.date_client_replied} onChange={(v) => handleChange('date_client_replied', v)} isDark={isDark} />
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      Replied to DBS
                    </label>
                    <DateInput value={form.date_replied_to_dbs} onChange={(v) => handleChange('date_replied_to_dbs', v)} isDark={isDark} />
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      Resent / Chased
                    </label>
                    <DateInput value={form.date_resent_chased} onChange={(v) => handleChange('date_resent_chased', v)} isDark={isDark} />
                  </div>
                </div>
              </div>

              {/* Responses Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3 mt-6" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>Responses</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      Client Response
                    </label>
                    <Textarea
                      value={form.client_response}
                      onChange={(e) => handleChange('client_response', e.target.value)}
                      placeholder="Client's response..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      Response Sent to DBS
                    </label>
                    <Textarea
                      value={form.response_sent_to_dbs}
                      onChange={(e) => handleChange('response_sent_to_dbs', e.target.value)}
                      placeholder="Response sent to DBS..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                      Action Taken Summary
                    </label>
                    <Textarea
                      value={form.action_taken_summary}
                      onChange={(e) => handleChange('action_taken_summary', e.target.value)}
                      placeholder="Summary of actions..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 p-6 border-t gap-3 flex" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            style={{ background: 'linear-gradient(135deg, #ec2ca3, #ec2ca388)' }}
            className="flex-1"
          >
            {saving ? 'Saving...' : 'Save Query'}
          </Button>
        </div>
      </motion.div>
    </>
  );
}