import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Ticket, Users, Send, Trash2, Archive, ArchiveRestore, Loader2, Edit2, Check, Image as ImageIcon } from 'lucide-react';
import IssueStatusBadge from './IssueStatusBadge';
import { STATUS_OPTIONS, AFFECTED_OPTIONS, formatUKDateTime } from './issueConfig';

function SimpleEditor({ value, onChange, isDark }) {
  const editorRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, []);

  const handlePaste = useCallback(async (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    if (imageItem) {
      e.preventDefault();
      setUploading(true);
      try {
        const file = imageItem.getAsFile();
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const img = document.createElement('img');
        img.src = file_url;
        img.style.maxWidth = '100%';
        const sel = window.getSelection();
        if (sel?.rangeCount) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode(img);
          range.setStartAfter(img);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          editorRef.current.appendChild(img);
        }
        onChange(editorRef.current.innerHTML);
      } finally {
        setUploading(false);
      }
    }
  }, [onChange]);

  const execCmd = (cmd) => { editorRef.current?.focus(); document.execCommand(cmd, false, null); onChange(editorRef.current?.innerHTML || ''); };

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)' }}>
      <div className="flex items-center gap-1 px-2 py-1.5" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
        {[{ cmd: 'bold', label: 'B', style: 'font-bold' }, { cmd: 'italic', label: 'I', style: 'italic' }].map(b => (
          <button key={b.cmd} type="button" onMouseDown={e => { e.preventDefault(); execCmd(b.cmd); }} className={`px-2 py-0.5 rounded text-xs ${b.style} hover:opacity-70`} style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>{b.label}</button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || '')}
        onPaste={handlePaste}
        className="min-h-[100px] p-3 text-sm outline-none leading-relaxed"
        style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)', background: isDark ? 'rgba(255,255,255,0.03)' : '#fff' }}
      />
      <style>{`[contenteditable] img { max-width: 100%; border-radius: 6px; }`}</style>
    </div>
  );
}

export default function IssueDetailDrawer({ issue, isDark, onClose, onUpdated, isAdmin, user }) {
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (issue) {
      loadUpdates();
      setEditForm({
        title: issue.title,
        status: issue.status,
        affected_count: issue.affected_count,
        ticket_raised: issue.ticket_raised,
        ticket_reference: issue.ticket_reference || '',
        description: issue.description
      });
    }
  }, [issue?.id]);

  const loadUpdates = async () => {
    const all = await base44.entities.OperationsIssueUpdate.filter({ issue_id: issue.id }, '-created_date', 50);
    setUpdates(all || []);
  };

  const handlePostUpdate = async () => {
    if (!newUpdate.trim()) return;
    setPostingUpdate(true);
    try {
      await base44.entities.OperationsIssueUpdate.create({
        issue_id: issue.id,
        update_text: newUpdate.trim(),
        created_by: user?.full_name || user?.email || 'Unknown'
      });
      setNewUpdate('');
      loadUpdates();
    } finally {
      setPostingUpdate(false);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const updates = {
        ...editForm,
        updated_by: user?.email || ''
      };
      if (editForm.status === 'Resolved' && issue.status !== 'Resolved') {
        updates.resolved_date = new Date().toISOString();
      }
      await base44.entities.OperationsIssue.update(issue.id, updates);
      onUpdated();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    await base44.entities.OperationsIssue.update(issue.id, { is_archived: !issue.is_archived });
    onUpdated();
    onClose();
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this issue permanently?')) return;
    setDeleting(true);
    await base44.entities.OperationsIssue.delete(issue.id);
    onUpdated();
    onClose();
  };

  const inputStyle = {
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
    color: isDark ? '#fff' : '#0f0f2e'
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: 600,
    color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '4px',
    display: 'block'
  };

  if (!issue) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-full md:w-[560px] z-50 flex flex-col shadow-2xl overflow-hidden"
      style={{
        background: isDark ? 'rgba(10,12,30,0.97)' : 'rgba(248,248,252,0.98)',
        borderLeft: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
        backdropFilter: 'blur(40px)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-5 gap-3" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
              {issue.issue_reference}
            </span>
          </div>
          <h2 className="text-base font-bold leading-snug" style={{ color: isDark ? '#fff' : '#0f0f2e' }}>
            {issue.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && !editing && (
            <button onClick={() => setEditing(true)} className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Status row */}
        <div className="flex items-center gap-3 flex-wrap">
          {editing ? (
            <Select value={editForm.status} onValueChange={v => setEditForm(p => ({ ...p, status: v }))}>
              <SelectTrigger className="w-52 h-8 text-xs" style={inputStyle}><SelectValue /></SelectTrigger>
              <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          ) : (
            <IssueStatusBadge status={issue.status} />
          )}
          <span className="flex items-center gap-1.5 text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
            <Users className="w-3.5 h-3.5" />
            {editing ? (
              <Select value={editForm.affected_count} onValueChange={v => setEditForm(p => ({ ...p, affected_count: v }))}>
                <SelectTrigger className="w-28 h-7 text-xs" style={inputStyle}><SelectValue /></SelectTrigger>
                <SelectContent>{AFFECTED_OPTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            ) : (
              `${issue.affected_count || 'Unknown'} affected`
            )}
          </span>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
          <div>
            <label style={labelStyle}>Raised By</label>
            <p className="text-sm" style={{ color: isDark ? '#fff' : '#0f0f2e' }}>{issue.raised_by}</p>
          </div>
          <div>
            <label style={labelStyle}>Created</label>
            <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>{formatUKDateTime(issue.created_date)}</p>
          </div>
          <div>
            <label style={labelStyle}>Last Updated</label>
            <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>{formatUKDateTime(issue.updated_date) || '-'}</p>
          </div>
          {issue.resolved_date && (
            <div>
              <label style={labelStyle}>Resolved</label>
              <p className="text-xs" style={{ color: '#22c55e' }}>{formatUKDateTime(issue.resolved_date)}</p>
            </div>
          )}
          <div>
            <label style={labelStyle}>Ticket Raised</label>
            <p className="text-sm" style={{ color: isDark ? '#fff' : '#0f0f2e' }}>
              {editing ? (
                <div className="flex gap-2">
                  {[{ l: 'No', v: false }, { l: 'Yes', v: true }].map(o => (
                    <button key={o.l} onClick={() => setEditForm(p => ({ ...p, ticket_raised: o.v }))}
                      className="px-3 py-1 rounded text-xs font-semibold"
                      style={{
                        background: editForm.ticket_raised === o.v ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                        border: editForm.ticket_raised === o.v ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.1)',
                        color: editForm.ticket_raised === o.v ? '#a78bfa' : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
                      }}
                    >{o.l}</button>
                  ))}
                </div>
              ) : (
                issue.ticket_raised ? (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
                    <Ticket className="w-3 h-3" /> Yes
                  </span>
                ) : 'No'
              )}
            </p>
          </div>
          {(issue.ticket_reference || (editing && editForm.ticket_raised)) && (
            <div>
              <label style={labelStyle}>Ticket Reference</label>
              {editing ? (
                <Input value={editForm.ticket_reference} onChange={e => setEditForm(p => ({ ...p, ticket_reference: e.target.value }))} style={{ ...inputStyle, height: '28px', fontSize: '12px' }} />
              ) : (
                <p className="text-xs font-mono" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>{issue.ticket_reference || '-'}</p>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label style={{ ...labelStyle, marginBottom: '8px' }}>Description</label>
          {editing ? (
            <SimpleEditor
              value={editForm.description}
              onChange={v => setEditForm(p => ({ ...p, description: v }))}
              isDark={isDark}
            />
          ) : (
            <div
              className="prose prose-sm max-w-none rounded-xl p-4"
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
                fontSize: '13px',
                lineHeight: '1.6'
              }}
              dangerouslySetInnerHTML={{ __html: issue.description }}
            />
          )}
        </div>

        {/* Edit save/cancel */}
        {editing && (
          <div className="flex gap-3">
            <Button onClick={handleSaveEdit} disabled={saving} size="sm" style={{ background: 'linear-gradient(135deg, #ec2ca3, #7c3aed)' }}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
              Save Changes
            </Button>
            <Button onClick={() => setEditing(false)} size="sm" variant="outline">Cancel</Button>
          </div>
        )}

        {/* Updates */}
        <div>
          <label style={{ ...labelStyle, marginBottom: '10px' }}>Updates ({updates.length})</label>
          <div className="space-y-3 mb-4">
            {updates.length === 0 && (
              <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>No updates yet.</p>
            )}
            {updates.map(u => (
              <div key={u.id} className="p-3 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>{u.created_by}</span>
                  <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>{formatUKDateTime(u.created_date)}</span>
                </div>
                <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>{u.update_text}</p>
              </div>
            ))}
          </div>

          {/* Add update */}
          <div className="flex gap-2">
            <Input
              placeholder="Add an update..."
              value={newUpdate}
              onChange={e => setNewUpdate(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostUpdate(); } }}
              style={inputStyle}
            />
            <Button onClick={handlePostUpdate} disabled={postingUpdate || !newUpdate.trim()} size="icon" style={{ background: 'linear-gradient(135deg, #ec2ca3, #7c3aed)', flexShrink: 0 }}>
              {postingUpdate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div className="flex gap-3 pt-2" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
            <Button onClick={handleArchive} size="sm" variant="outline" className="flex items-center gap-1.5">
              {issue.is_archived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
              {issue.is_archived ? 'Restore' : 'Archive'}
            </Button>
            <Button onClick={handleDelete} disabled={deleting} size="sm" variant="outline" className="flex items-center gap-1.5 ml-auto" style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' }}>
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}