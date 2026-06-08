import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, Search, ChevronDown, ChevronUp, X, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const AFFECTED_SERVICES = [
  'DBS Submissions', 'DVLA / Driving Licence', 'Right to Work', 'ID Verification',
  'Candidate Portal', 'Customer Portal', 'Payments / Stripe', 'Overseas Checks',
  'Supplier Checks', 'HubSpot', 'Power BI / Reporting', 'Other'
];

const SERVICE_COLORS = {
  'DBS Submissions': '#3b82f6', 'DVLA / Driving Licence': '#f59e0b',
  'Candidate Portal': '#8b5cf6', 'Customer Portal': '#06b6d4',
  'Payments / Stripe': '#22c55e', 'Overseas Checks': '#ec2ca3',
  'Supplier Checks': '#f97316', 'Right to Work': '#a78bfa',
  'HubSpot': '#ef4444', 'Power BI / Reporting': '#6366f1',
  'ID Verification': '#14b8a6', 'Other': '#9ca3af'
};

function KnownIssueForm({ onClose, onSuccess, isDark, editItem }) {
  const [form, setForm] = useState(editItem || {
    title: '', description: '', symptoms: '', workaround: '',
    resolution: '', affected_service: '', occurrence_count: 0
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.affected_service) return;
    setSaving(true);
    try {
      if (editItem?.id) {
        await base44.entities.KnownOperationalIssue.update(editItem.id, form);
      } else {
        await base44.entities.KnownOperationalIssue.create(form);
      }
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = {
    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
    color: isDark ? '#fff' : '#0f0f2e'
  };

  const labelCls = `block text-xs font-semibold mb-1 uppercase tracking-wide`;
  const labelStyle = { color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' };
  const textareaStyle = { ...fieldStyle, borderRadius: '8px', padding: '8px 12px', fontSize: '13px', width: '100%', minHeight: '72px', resize: 'vertical', outline: 'none', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-5 mb-5"
      style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm" style={{ color: isDark ? '#fff' : '#0f0f2e' }}>{editItem ? 'Edit Known Issue' : 'Add Known Issue'}</h3>
        <button onClick={onClose} className="hover:opacity-60 transition-opacity" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}><X className="w-4 h-4" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelCls} style={labelStyle}>Title *</label>
          <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Driving Licence Rejection" style={fieldStyle} required />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Affected Service *</label>
          <Select value={form.affected_service} onValueChange={v => set('affected_service', v)}>
            <SelectTrigger style={fieldStyle}><SelectValue placeholder="Select service..." /></SelectTrigger>
            <SelectContent>{AFFECTED_SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Known Symptoms</label>
          <textarea value={form.symptoms} onChange={e => set('symptoms', e.target.value)} placeholder="Describe what staff typically see or report..." style={textareaStyle} />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Workaround</label>
          <textarea value={form.workaround} onChange={e => set('workaround', e.target.value)} placeholder="Immediate steps to mitigate the issue..." style={textareaStyle} />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Resolution / Fix</label>
          <textarea value={form.resolution} onChange={e => set('resolution', e.target.value)} placeholder="Known fix or waiting on supplier..." style={textareaStyle} />
        </div>
        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={saving || !form.title || !form.affected_service} size="sm" style={{ background: 'linear-gradient(135deg, #ec2ca3, #7c3aed)' }}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
            {editItem ? 'Save Changes' : 'Add Known Issue'}
          </Button>
          <Button type="button" onClick={onClose} size="sm" variant="outline">Cancel</Button>
        </div>
      </form>
    </motion.div>
  );
}

function KnownIssueCard({ item, isDark, isAdmin, onEdit, onDelete, linkedCount }) {
  const [expanded, setExpanded] = useState(false);
  const color = SERVICE_COLORS[item.affected_service] || '#9ca3af';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}
    >
      {/* Colour stripe */}
      <div className="h-1" style={{ background: color }} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {item.affected_service && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${color}18`, border: `1px solid ${color}40`, color }}>
                  {item.affected_service}
                </span>
              )}
              {linkedCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa' }}>
                  {linkedCount} occurrence{linkedCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <h3 className="font-bold text-sm leading-snug" style={{ color: isDark ? '#fff' : '#0f0f2e' }}>{item.title}</h3>
          </div>
          <button onClick={() => setExpanded(v => !v)} className="flex-shrink-0 hover:opacity-60 transition-opacity" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {item.symptoms && !expanded && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{item.symptoms}</p>
        )}

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-3 space-y-3">
                {item.symptoms && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>Known Symptoms</p>
                    <p className="text-xs leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>{item.symptoms}</p>
                  </div>
                )}
                {item.workaround && (
                  <div className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                    <p className="text-xs font-bold mb-1" style={{ color: '#f59e0b' }}>Workaround</p>
                    <p className="text-xs leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>{item.workaround}</p>
                  </div>
                )}
                {item.resolution && (
                  <div className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <p className="text-xs font-bold mb-1" style={{ color: '#22c55e' }}>Resolution / Fix</p>
                    <p className="text-xs leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>{item.resolution}</p>
                  </div>
                )}
                {isAdmin && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => onEdit(item)} className="text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-70 transition-opacity" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>Edit</button>
                    <button onClick={() => onDelete(item.id)} className="text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-70 transition-opacity" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>Delete</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function KnownIssuesTab({ issues, isDark, isAdmin }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState('');
  const [filterService, setFilterService] = useState('all');

  const { data: knownIssues = [] } = useQuery({
    queryKey: ['knownOperationalIssues'],
    queryFn: () => base44.entities.KnownOperationalIssue.list('-created_date', 100),
    staleTime: 60000
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this known issue?')) return;
    await base44.entities.KnownOperationalIssue.delete(id);
    queryClient.invalidateQueries(['knownOperationalIssues']);
  };

  const handleEdit = (item) => { setEditItem(item); setShowForm(true); };
  const handleSuccess = () => {
    queryClient.invalidateQueries(['knownOperationalIssues']);
    setShowForm(false);
    setEditItem(null);
  };

  // Build occurrence counts from real issues
  const occurrenceCounts = useMemo(() => {
    const counts = {};
    for (const ki of knownIssues) {
      const lower = ki.title.toLowerCase();
      const svc = ki.affected_service;
      const count = issues.filter(i =>
        (i.affected_service === svc) ||
        (i.title.toLowerCase().includes(lower.split(' ')[0]))
      ).length;
      counts[ki.id] = count;
    }
    return counts;
  }, [knownIssues, issues]);

  const filtered = useMemo(() =>
    knownIssues.filter(ki => {
      const matchSearch = !search || ki.title.toLowerCase().includes(search.toLowerCase()) ||
        (ki.symptoms || '').toLowerCase().includes(search.toLowerCase()) ||
        (ki.workaround || '').toLowerCase().includes(search.toLowerCase());
      const matchService = filterService === 'all' || ki.affected_service === filterService;
      return matchSearch && matchService;
    }),
    [knownIssues, search, filterService]
  );

  const services = useMemo(() => [...new Set(knownIssues.map(k => k.affected_service).filter(Boolean))], [knownIssues]);

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }}>
            Operational Knowledge Base
          </p>
          <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
            Known recurring issues, workarounds, and fixes.
          </p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => { setEditItem(null); setShowForm(true); }} style={{ background: 'linear-gradient(135deg, #ec2ca3, #7c3aed)' }}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Known Issue
          </Button>
        )}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <KnownIssueForm
            isDark={isDark}
            editItem={editItem}
            onClose={() => { setShowForm(false); setEditItem(null); }}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search known issues..."
            className="w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none"
            style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDark ? '#fff' : '#0f0f2e' }}
          />
        </div>
        {services.length > 1 && (
          <Select value={filterService} onValueChange={setFilterService}>
            <SelectTrigger className="w-44 h-8 text-xs" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: isDark ? '#fff' : '#0f0f2e' }}>
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {services.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>
            <BookOpen className="w-6 h-6" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} />
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            {knownIssues.length === 0 ? 'No known issues documented yet.' : 'No results found.'}
          </p>
          {knownIssues.length === 0 && isAdmin && (
            <p className="text-xs mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>
              Document recurring issues so staff know exactly what to do.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(item => (
            <KnownIssueCard key={item.id} item={item} isDark={isDark} isAdmin={isAdmin}
              onEdit={handleEdit} onDelete={handleDelete}
              linkedCount={occurrenceCounts[item.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}