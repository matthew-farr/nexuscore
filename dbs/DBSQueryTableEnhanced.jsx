import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, MessageSquare, X, Check } from 'lucide-react';
import { calculateQueryAge, formatQueryAge, getAgeColor, formatDate, formatDateTime } from '@/lib/dbsQueryUtils';

const STAGE_COLORS = {
  'New CJSM': '#06b6d4',
  'Sent to Client': '#f59e0b',
  'Waiting on Client': '#ef4444',
  'Client Chased': '#f97316',
  'Client Responded': '#10b981',
  'Responded to DBS': '#8b5cf6',
  'Further Clarification Required': '#ec2ca3',
  'Withdrawn': '#14b8a6',
  'Duplicated': '#64748b',
  'Cancelled': '#6b7280'
};

const STAGES = [
  'New CJSM', 'Sent to Client', 'Waiting on Client', 'Client Chased', 'Client Responded',
  'Responded to DBS', 'Further Clarification Required', 'Withdrawn', 'Duplicated', 'Cancelled'
];

export default function DBSQueryTableEnhanced({
  records,
  onView,
  onEdit,
  onDelete,
  isDark,
  notes = {},
  onRecordUpdated
}) {
  const [editingCell, setEditingCell] = useState(null); // { recordId, field }
  const [editValue, setEditValue] = useState('');
  const [hoveredNotes, setHoveredNotes] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!records.length) {
    return (
      <div className="text-center py-12">
        <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-sm">
          No DBS queries found. Import data or create a new query to get started.
        </p>
      </div>
    );
  }

  const handleInlineEdit = (record, field, currentValue) => {
    setEditingCell({ recordId: record.id, field });
    setEditValue(currentValue || '');
  };

  const handleSaveInlineEdit = async (record, field) => {
    if (!editValue && editValue !== 0) {
      setEditingCell(null);
      return;
    }

    setSaving(true);
    try {
      const user = await base44.auth.me();
      const today = new Date().toISOString().split('T')[0];
      const updateData = {
        [field]: editValue,
        updated_date: new Date().toISOString(),
        updated_by: user.email
      };
      // Auto-populate chase date when changing stage to Client Chased
      if (field === 'stage' && editValue === 'Client Chased' && !record.date_resent_chased) {
        updateData.date_resent_chased = today;
      }

      // Update record
      await base44.entities.DBSQueryTracker.update(record.id, updateData);

      // Create audit log
      await base44.entities.DBSQueryAuditLog.create({
        query_id: record.id,
        action_type: 'Inline Edit',
        field_changed: field,
        old_value: String(record[field] || ''),
        new_value: String(editValue),
        changed_by: user.email,
        changed_date: new Date().toISOString()
      });

      // Notify parent
      onRecordUpdated?.();
      setEditingCell(null);
    } catch (error) {
      console.error('Failed to save inline edit:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e, record, field) => {
    if (e.key === 'Enter') {
      handleSaveInlineEdit(record, field);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const renderEditableCell = (record, field, currentValue, type = 'text') => {
    const isEditing = editingCell?.recordId === record.id && editingCell?.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {type === 'select' ? (
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="h-7 text-xs w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <Input
              autoFocus
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, record, field)}
              onBlur={() => handleSaveInlineEdit(record, field)}
              className="h-7 text-xs px-2"
              disabled={saving}
            />
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); handleSaveInlineEdit(record, field); }}
            className="h-6 px-1"
            disabled={saving}
          >
            <Check className="w-3 h-3 text-green-500" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); setEditingCell(null); }}
            className="h-6 px-1"
          >
            <X className="w-3 h-3 text-red-500" />
          </Button>
        </div>
      );
    }

    return (
      <div
        className="cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1"
        onClick={(e) => { e.stopPropagation(); handleInlineEdit(record, field, currentValue); }}
      >
        <span className="text-xs">{currentValue || '-'}</span>
        <Edit className="w-3 h-3 opacity-0 hover:opacity-100" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} />
      </div>
    );
  };

  const getNotesTooltip = (record) => {
    const recordNotes = notes[record.id] || [];
    const lines = [];

    if (record.action_taken_summary) {
      lines.push(`Action: ${record.action_taken_summary}`);
    }

    if (recordNotes.length > 0) {
      const latestNote = recordNotes[0];
      lines.push(`Latest: ${latestNote.note_type} - ${latestNote.note_text}`);
    }

    if (record.client_response) {
      lines.push(`Client: ${record.client_response}`);
    }

    if (record.response_sent_to_dbs) {
      lines.push(`Response: ${record.response_sent_to_dbs}`);
    }

    return lines.length > 0 ? lines.join('\n\n') : 'No notes';
  };

  return (
    <div className="overflow-x-auto rounded-lg" style={{
      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
      background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'
    }}>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
           <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-3 py-2 font-semibold whitespace-nowrap sticky left-0 z-10" style={{ background: isDark ? 'rgba(5,8,22,0.8)' : 'rgba(255,255,255,0.8)' }}>Date</th>
           <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-3 py-2 font-semibold whitespace-nowrap sticky left-20 z-10" style={{ background: isDark ? 'rgba(5,8,22,0.8)' : 'rgba(255,255,255,0.8)' }}>EREF</th>
           <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-3 py-2 font-semibold">Company</th>
           <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-3 py-2 font-semibold">Query Type</th>
           <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-3 py-2 font-semibold">Agent</th>
           <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-3 py-2 font-semibold">Stage</th>
           <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-3 py-2 font-semibold">Age</th>
           <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-3 py-2 font-semibold">Status Dates</th>
           <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-3 py-2 font-semibold">Last Updated</th>
           <th style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-left px-3 py-2 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => (
            <motion.tr
              key={record.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => onView(record)}
              className="cursor-pointer hover:opacity-75 transition-opacity"
              style={{
                borderBottom: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)',
                background: isDark ? 'rgba(255,255,255,0.005)' : 'rgba(0,0,0,0.005)'
              }}
            >
              <td className="px-3 py-2 sticky left-0 z-10" style={{ background: isDark ? 'rgba(5,8,22,0.8)' : 'rgba(255,255,255,0.8)' }}>
                {formatDate(record.date_received)}
              </td>
              <td className="px-3 py-2 font-semibold sticky left-20 z-10" style={{ background: isDark ? 'rgba(5,8,22,0.8)' : 'rgba(255,255,255,0.8)' }}>
                {record.eref}
              </td>
              <td className="px-3 py-2" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
                {record.company_name}
              </td>
              <td className="px-3 py-2" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                {record.query_type || '-'}
              </td>
              <td className="px-3 py-2">
                {renderEditableCell(record, 'agent_assigned', record.agent_assigned)}
              </td>
              <td className="px-3 py-2">
                {editingCell?.recordId === record.id && editingCell?.field === 'stage' ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Select value={editValue} onValueChange={setEditValue}>
                      <SelectTrigger className="h-7 text-xs w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="ghost" onClick={() => handleSaveInlineEdit(record, 'stage')} className="h-6 px-1" disabled={saving}>
                      <Check className="w-3 h-3 text-green-500" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingCell(null)} className="h-6 px-1">
                      <X className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <div className="cursor-pointer hover:opacity-70 flex items-center gap-1" onClick={(e) => { e.stopPropagation(); handleInlineEdit(record, 'stage', record.stage); }}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: STAGE_COLORS[record.stage] || '#06b6d4' }} />
                      <span className="text-xs font-semibold">{record.stage}</span>
                    </div>
                    <Edit className="w-3 h-3 opacity-0 hover:opacity-100" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} />
                  </div>
                )}
              </td>
              <td className="px-3 py-2">
                <span className="text-xs font-semibold" style={{ color: getAgeColor(calculateQueryAge(record.date_received)) }}>
                  {formatQueryAge(calculateQueryAge(record.date_received))}
                </span>
              </td>
              <td className="px-3 py-2 text-xs">
                <div className="flex flex-col gap-1">
                  {record.date_sent_to_client && <span><span className="font-semibold">Sent to Client:</span> {formatDate(record.date_sent_to_client)}</span>}
                  {record.date_resent_chased && <span style={{ color: '#f97316' }}><span className="font-semibold">Client Chased:</span> {formatDate(record.date_resent_chased)}</span>}
                  {record.date_client_replied && <span><span className="font-semibold">Client Replied:</span> {formatDate(record.date_client_replied)}</span>}
                  {record.date_replied_to_dbs && <span><span className="font-semibold">Sent to DBS:</span> {formatDate(record.date_replied_to_dbs)}</span>}
                  {!record.date_sent_to_client && !record.date_resent_chased && !record.date_client_replied && !record.date_replied_to_dbs && <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>—</span>}
                </div>
              </td>
              <td className="px-3 py-2 text-xs">
                {formatDateTime(record.updated_date)}
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); onEdit(record); }}
                    className="h-7 px-2"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); if(window.confirm('Delete this query?')) onDelete(record.id); }}
                    className="h-7 px-2"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}