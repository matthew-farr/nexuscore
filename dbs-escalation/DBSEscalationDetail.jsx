import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { POLICE_FORCE_OPTIONS } from '@/lib/dbsEscalationImportUtils';
import { useAuth } from '@/lib/AuthContext';

const STATUS_OPTIONS = [
  'LPF DETAILS',
  'WITHDRAWN',
  'ESCALATED',
  'DUE TO BE ESCALATED',
  'UNABLE TO ESCALATE ONLINE',
  'CJSM',
  'INTERNAL QUERY - INCONFLICT'
];

const TABS = ['Details', 'Notes', 'Audit Trail'];

export default function DBSEscalationDetail({ record, isDark, onClose, onSave, isNew = false }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Details');
  const [form, setForm] = useState(record || {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Notes state
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Audit trail state
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    if (!isNew && record?.id) {
      loadNotes();
      loadAuditLogs();
    }
  }, [record?.id]);

  const loadNotes = async () => {
    try {
      const result = await base44.entities.DBSEscalationNote.filter({ escalation_id: record.id }, '-created_date');
      setNotes(result || []);
    } catch (e) {
      // ignore
    }
  };

  const loadAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const result = await base44.entities.DBSEscalationAudit.filter({ escalation_id: record.id }, '-created_date');
      setAuditLogs(result || []);
    } catch (e) {
      // ignore
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleSave = async () => {
    if (!form.eref?.trim()) {
      setError('ERef is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (isNew) {
        const existing = await base44.entities.DBSEscalation.filter({ eref: form.eref });
        if (existing.length > 0) {
          setError('This ERef already exists');
          setSaving(false);
          return;
        }
        await base44.entities.DBSEscalation.create(form);
      } else {
        // Build audit entries for changed fields
        const changedFields = Object.keys(form).filter(k => form[k] !== record[k]);
        await base44.entities.DBSEscalation.update(record.id, form);

        // Log each changed field sequentially
        await Promise.all(changedFields.map(field =>
          base44.entities.DBSEscalationAudit.create({
            escalation_id: record.id,
            field_changed: field,
            old_value: String(record[field] ?? ''),
            new_value: String(form[field] ?? ''),
            changed_by: user?.email || user?.full_name || 'Unknown'
          })
        ));
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save');
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await base44.entities.DBSEscalationNote.create({
        escalation_id: record.id,
        note_text: newNote.trim(),
        added_by: user?.email || user?.full_name || 'Unknown'
      });
      setNewNote('');
      await loadNotes();
    } catch (e) {
      // ignore
    } finally {
      setAddingNote(false);
    }
  };

  const formatDateTime = (val) => {
    if (!val) return '-';
    const d = new Date(val);
    return d.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const fieldLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const textMuted = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
  const textMain = isDark ? '#ffffff' : '#0f0f2e';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0"
        style={{ zIndex: 1000 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: 500 }}
          animate={{ x: 0 }}
          exit={{ x: 500 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute right-0 top-0 h-full w-full max-w-lg flex flex-col"
          style={{
            background: isDark ? '#1a1a2e' : '#ffffff',
            borderLeft: `1px solid ${border}`
          }}
        >
          {/* Header */}
          <div className="p-6 border-b flex-shrink-0" style={{ borderColor: border }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 style={{ color: textMain }} className="text-lg font-semibold">
                  {isNew ? 'New Escalation' : `Edit: ${record?.eref}`}
                </h2>
                {!isNew && <p className="text-xs mt-0.5" style={{ color: textMuted }}>{record?.company}</p>}
              </div>
              <button onClick={onClose} className="p-1 hover:bg-accent rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            {!isNew && (
              <div className="flex gap-1 p-1 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      if (tab === 'Audit Trail') loadAuditLogs();
                      if (tab === 'Notes') loadNotes();
                    }}
                    className="flex-1 py-1.5 text-sm font-medium rounded-md transition-all"
                    style={{
                      background: activeTab === tab ? (isDark ? 'rgba(255,255,255,0.12)' : '#ffffff') : 'transparent',
                      color: activeTab === tab ? textMain : textMuted,
                      boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    {tab}
                    {tab === 'Notes' && notes.length > 0 && (
                      <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#ec2ca320', color: '#ec2ca3' }}>
                        {notes.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/20 text-destructive text-sm">{error}</div>
            )}

            {/* DETAILS TAB */}
            {(activeTab === 'Details' || isNew) && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">ERef *</label>
                  <Input value={form.eref || ''} onChange={(e) => setForm({ ...form, eref: e.target.value })} disabled={!isNew} placeholder="Enter ERef" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">DBS Submitted Date</label>
                  <Input type="date" value={form.dbs_submitted_date || ''} onChange={(e) => setForm({ ...form, dbs_submitted_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Company</label>
                  <Input value={form.company || ''} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Application Ref</label>
                  <Input value={form.application_ref || ''} onChange={(e) => setForm({ ...form, application_ref: e.target.value })} placeholder="Application reference" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Escalated Date</label>
                  <Input type="date" value={form.escalated_date || ''} onChange={(e) => setForm({ ...form, escalated_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={form.status || ''} onValueChange={(value) => setForm({ ...form, status: value })}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Local Police Force</label>
                  <Select value={form.police_details || '__blank__'} onValueChange={(value) => setForm({ ...form, police_details: value === '__blank__' ? '' : value })}>
                    <SelectTrigger><SelectValue placeholder="Select police force" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__blank__">— None —</SelectItem>
                      {POLICE_FORCE_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Account Manager</label>
                  <Input value={form.account_manager || ''} onChange={(e) => setForm({ ...form, account_manager: e.target.value })} placeholder="Account manager name or email" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Escalated Agent</label>
                  <Input value={form.escalated_agent || ''} onChange={(e) => setForm({ ...form, escalated_agent: e.target.value })} placeholder="Escalated agent name or email" />
                </div>
              </div>
            )}

            {/* NOTES TAB */}
            {activeTab === 'Notes' && !isNew && (
              <div className="space-y-4">
                {/* Add note */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[80px] text-sm resize-none"
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={addingNote || !newNote.trim()}
                    size="sm"
                    className="flex items-center gap-1.5"
                    style={{ background: 'linear-gradient(135deg, #ec2ca3, #ec2ca388)' }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {addingNote ? 'Adding...' : 'Add Note'}
                  </Button>
                </div>

                <div className="border-t pt-4" style={{ borderColor: border }}>
                  {notes.length === 0 ? (
                    <p className="text-sm text-center py-6" style={{ color: textMuted }}>No notes yet</p>
                  ) : (
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div key={note.id} className="p-3 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1px solid ${border}` }}>
                          <p className="text-sm mb-2" style={{ color: textMain }}>{note.note_text}</p>
                          <div className="flex items-center gap-2 text-xs" style={{ color: textMuted }}>
                            <span>{note.added_by || 'Unknown'}</span>
                            <span>·</span>
                            <span>{formatDateTime(note.created_date)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AUDIT TRAIL TAB */}
            {activeTab === 'Audit Trail' && !isNew && (
              <div>
                {loadingAudit ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : auditLogs.length === 0 ? (
                  <p className="text-sm text-center py-6" style={{ color: textMuted }}>No changes recorded yet</p>
                ) : (
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-3 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', border: `1px solid ${border}` }}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold" style={{ color: textMain }}>{fieldLabel(log.field_changed)}</span>
                          <div className="flex items-center gap-1 text-xs" style={{ color: textMuted }}>
                            <Clock className="w-3 h-3" />
                            <span>{formatDateTime(log.created_date)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className="px-2 py-0.5 rounded line-through" style={{ background: '#ef444420', color: '#ef4444' }}>{log.old_value || '(empty)'}</span>
                          <span style={{ color: textMuted }}>→</span>
                          <span className="px-2 py-0.5 rounded" style={{ background: '#22c55e20', color: '#22c55e' }}>{log.new_value || '(empty)'}</span>
                        </div>
                        <p className="text-xs mt-1.5" style={{ color: textMuted }}>by {log.changed_by}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {(activeTab === 'Details' || isNew) && (
            <div className="p-6 border-t space-y-3 flex-shrink-0" style={{ borderColor: border }}>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #ec2ca3, #ec2ca388)' }}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={onClose} variant="outline" className="w-full">Cancel</Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}