import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Copy, Archive, BookOpen, Search, Paperclip, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LmsCourseForm from './LmsCourseForm';
import { CATEGORIES, CONTENT_TYPES, CONTENT_TYPE_LABELS, CONTENT_TYPE_COLOUR, STATUSES, STATUS_COLOUR, DIFFICULTIES, cardStyle } from './lmsConfig';

const EMPTY_FILTERS = { category: '', content_type: '', status: '', difficulty: '' };

export default function LmsCoursesTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [deletingId, setDeletingId] = useState(null);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['lms-courses'],
    queryFn: () => base44.entities.TrainingCourse.list('-created_date', 300),
  });

  const filtered = courses.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.category && c.category !== filters.category) return false;
    if (filters.content_type && c.content_type !== filters.content_type) return false;
    if (filters.status && c.status !== filters.status) return false;
    if (filters.difficulty && c.difficulty !== filters.difficulty) return false;
    return true;
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['lms-courses'] });

  const handleDuplicate = async (c) => {
    const { id, created_date, updated_date, ...rest } = c;
    await base44.entities.TrainingCourse.create({ ...rest, title: `${c.title} (Copy)`, status: 'draft' });
    invalidate();
  };

  const handleArchive = async (c) => {
    await base44.entities.TrainingCourse.update(c.id, { status: 'archived' });
    invalidate();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    setDeletingId(id);
    await base44.entities.TrainingCourse.delete(id);
    setDeletingId(null);
    invalidate();
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const hasFilters = Object.values(filters).some(Boolean) || search;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-white">Courses</h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>
            {filtered.length} of {courses.length} course{courses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-bold hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff' }}>
          <Plus className="w-3.5 h-3.5" /> Create Course
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.30)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…"
            className="w-full pl-8 pr-3 h-9 rounded-xl text-xs text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} />
        </div>
        {[
          { key: 'category', opts: CATEGORIES, label: 'Category' },
          { key: 'content_type', opts: CONTENT_TYPES, label: 'Type', map: CONTENT_TYPE_LABELS },
          { key: 'status', opts: STATUSES, label: 'Status' },
          { key: 'difficulty', opts: DIFFICULTIES, label: 'Level' },
        ].map(({ key, opts, label, map }) => (
          <select key={key} value={filters[key]} onChange={e => setFilter(key, e.target.value)}
            className="px-3 h-9 rounded-xl text-xs text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
            <option value="" style={{ background: '#0f172a' }}>All {label}</option>
            {opts.map(o => <option key={o} value={o} style={{ background: '#0f172a' }}>{map ? map[o] : o}</option>)}
          </select>
        ))}
        {hasFilters && (
          <button onClick={() => { setSearch(''); setFilters(EMPTY_FILTERS); }}
            className="text-xs px-3 h-9 rounded-xl transition-colors hover:text-white"
            style={{ color: 'rgba(255,255,255,0.40)', border: '1px solid rgba(255,255,255,0.10)' }}>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Course', 'Category', 'Type', 'Level', 'Duration', 'Status', 'File', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider px-4 py-3"
                    style={{ color: 'rgba(255,255,255,0.30)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-white/30 text-xs">Loading courses…</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.15)' }} />
                  <p className="text-xs text-white/30">No courses found</p>
                </td></tr>
              )}
              {filtered.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-white/[0.03] transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${CONTENT_TYPE_COLOUR[c.content_type] || '#8b5cf6'}18`, border: `1px solid ${CONTENT_TYPE_COLOUR[c.content_type] || '#8b5cf6'}30` }}>
                        <BookOpen className="w-3.5 h-3.5" style={{ color: CONTENT_TYPE_COLOUR[c.content_type] || '#8b5cf6' }} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white leading-tight">{c.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {c.is_mandatory && <span className="text-[9px] font-bold px-1.5 py-0 rounded" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>MANDATORY</span>}
                          {c.certificate_enabled && <span className="text-[9px] font-bold px-1.5 py-0 rounded" style={{ background: 'rgba(6,182,212,0.15)', color: '#67e8f9' }}>CERT</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{c.category}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${CONTENT_TYPE_COLOUR[c.content_type] || '#8b5cf6'}18`, color: CONTENT_TYPE_COLOUR[c.content_type] || '#8b5cf6' }}>
                      {CONTENT_TYPE_LABELS[c.content_type] || c.content_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{c.difficulty}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{c.estimated_duration_minutes}m</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                      style={{ background: `${STATUS_COLOUR[c.status] || '#6b7280'}18`, color: STATUS_COLOUR[c.status] || '#6b7280' }}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.file_url ? (
                      <a href={c.file_url} target="_blank" rel="noopener noreferrer" title="View file"
                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors">
                        <Paperclip className="w-3.5 h-3.5" />
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ) : c.external_url ? (
                      <a href={c.external_url} target="_blank" rel="noopener noreferrer" title="External link"
                        className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-white/15 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditing(c); setShowForm(true); }} title="Edit"
                        className="p-1.5 rounded-lg transition-colors text-white/30 hover:text-white hover:bg-white/10">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDuplicate(c)} title="Duplicate"
                        className="p-1.5 rounded-lg transition-colors text-white/30 hover:text-blue-400 hover:bg-blue-500/10">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {c.status !== 'archived' && (
                        <button onClick={() => handleArchive(c)} title="Archive"
                          className="p-1.5 rounded-lg transition-colors text-white/30 hover:text-yellow-400 hover:bg-yellow-500/10">
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(c.id)} title="Delete" disabled={deletingId === c.id}
                        className="p-1.5 rounded-lg transition-colors text-white/30 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <LmsCourseForm
            course={editing}
            onClose={() => { setShowForm(false); setEditing(null); }}
            onSaved={invalidate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}