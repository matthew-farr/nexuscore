import { useState, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, X, Image as ImageIcon } from 'lucide-react';
import { STATUS_OPTIONS, AFFECTED_OPTIONS, generateIssueRef } from './issueConfig';

// Simple rich text editor using contentEditable with image upload support
function RichTextEditor({ value, onChange, isDark, placeholder }) {
  const editorRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Handle paste events - intercept images and upload them
  const handlePaste = useCallback(async (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    
    if (imageItem) {
      e.preventDefault();
      setUploading(true);
      try {
        const file = imageItem.getAsFile();
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        // Insert image at cursor position
        const img = document.createElement('img');
        img.src = file_url;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '6px';
        img.style.margin = '4px 0';
        
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(img);
          range.setStartAfter(img);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          editorRef.current.appendChild(img);
        }
        onChange(editorRef.current.innerHTML);
      } catch (err) {
        console.error('Image upload failed:', err);
      } finally {
        setUploading(false);
      }
    }
    // Let normal text paste through
  }, [onChange]);

  const handleInput = useCallback(() => {
    onChange(editorRef.current?.innerHTML || '');
  }, [onChange]);

  const handleImageButtonClick = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const img = document.createElement('img');
        img.src = file_url;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '6px';
        img.style.margin = '4px 0';
        editorRef.current.appendChild(img);
        onChange(editorRef.current.innerHTML);
      } catch (err) {
        console.error('Image upload failed:', err);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }, [onChange]);

  const execCmd = (cmd, val) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    onChange(editorRef.current?.innerHTML || '');
  };

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 flex-wrap" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
        {[
          { cmd: 'bold', label: 'B', style: 'font-bold' },
          { cmd: 'italic', label: 'I', style: 'italic' },
          { cmd: 'underline', label: 'U', style: 'underline' },
        ].map(btn => (
          <button
            key={btn.cmd}
            type="button"
            onMouseDown={e => { e.preventDefault(); execCmd(btn.cmd); }}
            className={`px-2 py-0.5 rounded text-xs ${btn.style} transition-opacity hover:opacity-70`}
            style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
          >
            {btn.label}
          </button>
        ))}
        <div style={{ width: 1, height: 16, background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', margin: '0 4px' }} />
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); execCmd('insertUnorderedList'); }}
          className="px-2 py-0.5 rounded text-xs transition-opacity hover:opacity-70"
          style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
        >• List</button>
        <div style={{ width: 1, height: 16, background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', margin: '0 4px' }} />
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); handleImageButtonClick(); }}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-opacity hover:opacity-70"
          style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
        >
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
          {uploading ? 'Uploading...' : 'Image'}
        </button>
      </div>
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className="min-h-[120px] p-3 text-sm outline-none leading-relaxed"
        style={{
          color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
          background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
        }}
      />
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: rgba(150,150,150,0.6);
          pointer-events: none;
        }
        [contenteditable] img { max-width: 100%; border-radius: 6px; margin: 4px 0; }
      `}</style>
    </div>
  );
}

export default function IssueLogForm({ onClose, onSuccess, isDark, user }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    ticket_raised: false,
    ticket_reference: '',
    status: 'Unknown',
    affected_count: 'Unknown'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    const stripped = form.description.replace(/<[^>]*>/g, '').trim();
    if (!stripped && !form.description.includes('<img')) { setError('Description is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const all = await base44.entities.OperationsIssue.list('-created_date', 500);
      const nextSeq = (all?.length ?? 0) + 1;
      const issue_reference = generateIssueRef(nextSeq);

      // Upload description as HTML file if it contains images (to avoid field size limit)
      let finalDescription = form.description;
      if (finalDescription.length > 50000) {
        const blob = new Blob([finalDescription], { type: 'text/html' });
        const file = new File([blob], 'description.html', { type: 'text/html' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        finalDescription = `<p>${stripped.substring(0, 500)}...</p><p><a href="${file_url}" target="_blank">View full description with images</a></p>`;
      }

      await base44.entities.OperationsIssue.create({
        issue_reference,
        raised_by: user?.full_name || user?.email || 'Unknown',
        title: form.title.trim(),
        description: finalDescription,
        ticket_raised: form.ticket_raised,
        ticket_reference: form.ticket_raised ? form.ticket_reference.trim() : '',
        status: form.status,
        affected_count: form.affected_count,
        updated_by: user?.email || ''
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('Failed to log issue. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
    color: isDark ? '#fff' : '#0f0f2e'
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: 600,
    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
    display: 'block'
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
        <div>
          <h2 className="text-lg font-bold" style={{ color: isDark ? '#fff' : '#0f0f2e' }}>Log New Issue</h2>
          <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            Fill in the details below to log an operational issue.
          </p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Raised By */}
        <div>
          <label style={labelStyle}>Raised By</label>
          <Input value={user?.full_name || user?.email || 'Unknown'} readOnly style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} />
        </div>

        {/* Title */}
        <div>
          <label style={labelStyle}>Title <span style={{ color: '#ec2ca3' }}>*</span></label>
          <Input
            placeholder="e.g. DBS applications not submitting"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            style={inputStyle}
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description <span style={{ color: '#ec2ca3' }}>*</span></label>
          <RichTextEditor
            value={form.description}
            onChange={val => set('description', val)}
            isDark={isDark}
            placeholder="Describe the issue... You can paste screenshots directly (Ctrl+V)"
          />
          <p className="text-xs mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' }}>
            Paste screenshots directly with Ctrl+V or use the Image button
          </p>
        </div>

        {/* Status & Affected */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Status</label>
            <Select value={form.status} onValueChange={val => set('status', val)}>
              <SelectTrigger style={inputStyle}><SelectValue /></SelectTrigger>
              <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label style={labelStyle}>Affected Count</label>
            <Select value={form.affected_count} onValueChange={val => set('affected_count', val)}>
              <SelectTrigger style={inputStyle}><SelectValue /></SelectTrigger>
              <SelectContent>{AFFECTED_OPTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        {/* Ticket */}
        <div>
          <label style={labelStyle}>Has a Ticket Been Raised?</label>
          <div className="flex gap-3">
            {[{ label: 'No', val: false }, { label: 'Yes', val: true }].map(opt => (
              <button
                key={opt.label}
                type="button"
                onClick={() => set('ticket_raised', opt.val)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: form.ticket_raised === opt.val
                    ? (opt.val ? 'rgba(34,197,94,0.2)' : 'rgba(107,114,128,0.2)')
                    : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                  border: form.ticket_raised === opt.val
                    ? (opt.val ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(107,114,128,0.4)')
                    : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'),
                  color: form.ticket_raised === opt.val
                    ? (opt.val ? '#22c55e' : '#9ca3af')
                    : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)')
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {form.ticket_raised && (
          <div>
            <label style={labelStyle}>Ticket Reference <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>(optional)</span></label>
            <Input
              placeholder="e.g. DBS Supplier Ticket #1234"
              value={form.ticket_reference}
              onChange={e => set('ticket_reference', e.target.value)}
              style={inputStyle}
            />
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full h-11 font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #ec2ca3, #7c3aed)' }}
        >
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging Issue...</> : 'Log Issue'}
        </Button>
      </div>
    </div>
  );
}