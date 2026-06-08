import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Edit, Trash2, Calendar } from 'lucide-react';
import { formatDateTime } from '@/lib/dbsQueryUtils';
import { toast } from 'sonner';
import DBSActivityTimeline from './DBSActivityTimeline';

const NOTE_TYPES = ['General Note', 'Client Contact', 'Client Response', 'DBS Response', 'Chaser', 'Further Clarification', 'Internal Update', 'Resolution'];
const STAGE_COLORS = {
  'New CJSM': '#06b6d4',
  'Sent to Client': '#f59e0b',
  'Waiting on Client': '#ef4444',
  'Client Chased': '#f97316',
  'Client Responded': '#10b981',
  'Responded to DBS': '#8b5cf6',
  'Further Clarification Required': '#ec2ca3',
  'Resolved / Closed': '#14b8a6',
  'Cancelled': '#6b7280'
};

const getAgeColor = (age) => {
  if (age <= 3) return '#10b981';
  if (age <= 7) return '#f59e0b';
  return '#ef4444';
};

const calculateQueryAge = (dateReceived) => {
  const received = new Date(dateReceived);
  const today = new Date();
  return Math.floor((today - received) / (1000 * 60 * 60 * 24));
};

// Inline editable date field with native date picker
function EditableDateField({ label, fieldKey, value, isDark, recordId, onSaved }) {
  const inputRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const handleChange = async (e) => {
    const newVal = e.target.value; // yyyy-mm-dd or ''
    setSaving(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.DBSQueryTracker.update(recordId, { [fieldKey]: newVal || null });
      await base44.entities.DBSQueryAuditLog.create({
        query_id: recordId,
        action_type: 'Field Updated',
        field_changed: label,
        old_value: value || '',
        new_value: newVal || '',
        changed_by: user.email
      });
      onSaved(fieldKey, newVal || null);
      toast.success(`${label} updated`);
    } catch {
      toast.error('Failed to save date');
    } finally {
      setSaving(false);
    }
  };

  const display = value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      <p className="text-xs mb-1 font-semibold uppercase tracking-wide" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{label}</p>
      <div className="relative flex items-center group">
        <input
          ref={inputRef}
          type="date"
          defaultValue={value || ''}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 2 }}
        />
        <span className="text-sm font-semibold pr-5" style={{ color: isDark ? '#ffffff' : '#0f0f2e', minWidth: '100px' }}>
          {saving ? '…' : display}
        </span>
        <Calendar className="w-3.5 h-3.5 absolute right-0 opacity-40 group-hover:opacity-80 transition-opacity" style={{ color: isDark ? '#06b6d4' : '#06b6d4' }} />
      </div>
    </div>
  );
}

export default function DBSQueryDetail({ record, onClose, isDark, notes = [], auditLog = [], onEdit, onDelete, onRefresh }) {
  const [localRecord, setLocalRecord] = useState(record);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('General Note');
  const [expandNotes, setExpandNotes] = useState(false);
  const [expandActivity, setExpandActivity] = useState(false);
  const [expandAudit, setExpandAudit] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => { setLocalRecord(record); }, [record]);

  const handleDateSaved = (fieldKey, newVal) => {
    setLocalRecord(prev => ({ ...prev, [fieldKey]: newVal }));
    onRefresh?.();
  };

  useEffect(() => {
    // Lock body scroll when detail is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      toast.error('Please enter a note');
      return;
    }

    setAdding(true);
    try {
      const user = await base44.auth.me();
      
      // Create note
      const newNote = await base44.entities.DBSQueryNote.create({
        query_id: record.id,
        note_text: noteText.trim(),
        note_type: noteType
      });

      // Update parent query's last updated timestamp
      await base44.entities.DBSQueryTracker.update(record.id, {
        updated_date: new Date().toISOString(),
        updated_by: user.email
      });

      // Create audit log entry
      await base44.entities.DBSQueryAuditLog.create({
        query_id: record.id,
        action_type: 'Note Added',
        field_changed: 'notes',
        old_value: '',
        new_value: noteText.trim(),
        changed_by: user.email
      });

      // Clear input and refresh
      setNoteText('');
      toast.success('Note added successfully');
      onRefresh?.();
    } catch (error) {
      console.error('Failed to add note:', error);
      toast.error('Could not save note');
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        style={{ zIndex: 100 }}
      />

      {/* Right-side Drawer */}
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-screen w-[600px] md:w-[680px] max-w-[100vw] flex flex-col overflow-hidden border-l shadow-2xl"
        style={{
          zIndex: 111,
          background: isDark ? '#050816' : '#ffffff',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
        }}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-6 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
                {record.company_name}
              </h2>
              <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-xs">
                EREF: {record.eref} • Our Ref: {record.our_ref}
              </p>
            </div>
            <button onClick={onClose} className="p-1 hover:opacity-70 transition-opacity">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ background: STAGE_COLORS[record.stage] || '#06b6d4' }} />
              <span className="font-semibold">{record.stage}</span>
            </div>
            <span className="font-semibold" style={{ color: getAgeColor(calculateQueryAge(localRecord.date_received)) }}>
              {calculateQueryAge(localRecord.date_received)} days old
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Agent & Actions */}
            {record.agent_assigned && (
              <div className="flex items-center justify-between">
                <div className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                  👤 {record.agent_assigned}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={onEdit} className="h-7 text-xs">
                    <Edit className="w-3 h-3 mr-1" />Edit
                  </Button>
                  <Button size="sm" onClick={onDelete} variant="destructive" className="h-7 text-xs">
                    <Trash2 className="w-3 h-3 mr-1" />Delete
                  </Button>
                </div>
              </div>
            )}

            {/* Key Dates — editable */}
            <div className="p-4 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
              <p className="font-semibold text-xs mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                Key Dates <span className="font-normal opacity-50 ml-1">— click any date to edit</span>
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Date Received',    fieldKey: 'date_received' },
                  { label: 'Sent to Client',   fieldKey: 'date_sent_to_client' },
                  { label: 'Client Replied',   fieldKey: 'date_client_replied' },
                  { label: 'Replied to DBS',   fieldKey: 'date_replied_to_dbs' },
                  { label: 'Date Resent/Chased', fieldKey: 'date_resent_chased' },
                ].map(({ label, fieldKey }) => (
                  <EditableDateField
                    key={fieldKey}
                    label={label}
                    fieldKey={fieldKey}
                    value={localRecord[fieldKey]}
                    isDark={isDark}
                    recordId={record.id}
                    onSaved={handleDateSaved}
                  />
                ))}
              </div>
            </div>

            {/* Query Details - Highlighted Section */}
            {(record.query_type || record.client_response || record.response_sent_to_dbs || record.action_taken_summary) && (
              <div className="p-4 rounded-lg border-2" style={{ 
                background: isDark ? 'rgba(6, 182, 212, 0.08)' : 'rgba(6, 182, 212, 0.05)',
                borderColor: 'rgba(6, 182, 212, 0.4)'
              }}>
                <h3 className="font-semibold text-sm mb-3" style={{ color: '#06b6d4' }}>Query Details</h3>
                <div className="space-y-3">
                  {record.query_type && (
                    <div>
                      <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} className="text-xs mb-1 font-semibold uppercase tracking-wide">Query Type</p>
                      <p className="text-sm font-medium" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>{record.query_type}</p>
                    </div>
                  )}

                  {record.client_response && (
                    <div>
                      <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} className="text-xs mb-1 font-semibold uppercase tracking-wide">Client Response</p>
                      <p className="text-sm" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>{record.client_response}</p>
                    </div>
                  )}

                  {record.response_sent_to_dbs && (
                    <div>
                      <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} className="text-xs mb-1 font-semibold uppercase tracking-wide">Response Sent to DBS</p>
                      <p className="text-sm" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>{record.response_sent_to_dbs}</p>
                    </div>
                  )}

                  {record.action_taken_summary && (
                    <div>
                      <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} className="text-xs mb-1 font-semibold uppercase tracking-wide">Action Taken</p>
                      <p className="text-sm" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>{record.action_taken_summary}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity Timeline */}
            <div className="pt-4 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
              <button
                onClick={() => setExpandActivity(!expandActivity)}
                className="flex items-center gap-2 font-semibold text-sm mb-3 w-full"
                style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}
              >
                {expandActivity ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Activity Timeline
              </button>

              {expandActivity && (
                <DBSActivityTimeline auditLog={auditLog} isDark={isDark} />
              )}
            </div>

            {/* Notes Section */}
              <div className="pt-4 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
               <button
                 onClick={() => setExpandNotes(!expandNotes)}
                 className="flex items-center gap-2 font-semibold text-sm mb-3 w-full"
                 style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}
               >
                 {expandNotes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                 Notes ({notes.length})
               </button>

               {expandNotes && (
                 <div className="space-y-3">
                   <div className="p-3 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                     <Select value={noteType} onValueChange={setNoteType}>
                       <SelectTrigger className="mb-2 h-8 text-xs">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         {NOTE_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                       </SelectContent>
                     </Select>
                     <Textarea
                       value={noteText}
                       onChange={(e) => setNoteText(e.target.value)}
                       placeholder="Add a note..."
                       rows={2}
                       className="text-xs mb-2"
                     />
                     <Button
                       onClick={handleAddNote}
                       disabled={adding || !noteText.trim()}
                       size="sm"
                       className="text-xs"
                       style={{ background: '#06b6d4', color: '#ffffff' }}
                     >
                       Add Note
                     </Button>
                   </div>

                   {notes.length === 0 ? (
                     <p style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} className="text-xs text-center py-4">
                       No notes yet
                     </p>
                   ) : (
                     <div className="space-y-2 max-h-64 overflow-y-auto">
                       {notes.map((note, idx) => (
                             <div key={idx} className="p-3 rounded text-xs" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}>
                               <div className="flex items-center gap-2 mb-2">
                                 <span className="font-semibold" style={{ color: '#06b6d4' }}>{note.note_type}</span>
                                 <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                                   {note.created_by} • {formatDateTime(note.created_date)}
                                 </span>
                               </div>
                               <p style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>{note.note_text}</p>
                             </div>
                           ))}
                     </div>
                   )}
                 </div>
               )}
             </div>

            {/* Audit Trail */}
            <div className="pt-4 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
              <button
                onClick={() => setExpandAudit(!expandAudit)}
                className="flex items-center gap-2 font-semibold text-sm mb-3 w-full"
                style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}
              >
                {expandAudit ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Audit Trail ({auditLog.length})
              </button>

              {expandAudit && (
                <>
                  {auditLog.length === 0 ? (
                    <p style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} className="text-xs text-center py-4">
                      No audit history yet
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {auditLog.map((log, idx) => (
                        <div key={idx} className="p-2 rounded text-xs" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }}>
                          <p className="font-semibold mb-1">
                            {log.action_type}
                            {log.field_changed && ` → ${log.field_changed}`}
                          </p>
                          {log.old_value && (
                            <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                              {log.old_value} → {log.new_value}
                            </p>
                          )}
                          <p style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                            {log.changed_by} • {formatDateTime(log.created_date)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}