import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, X, Check, Trash2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSIGNMENT_STATUS_COLOUR, PRIORITIES, inputStyle } from './lmsConfig';
import { format } from 'date-fns';

function AssignForm({ courses, users, onClose, onSaved }) {
  const [form, setForm] = useState({
    course_id: '', user_id: '', due_date: '', priority: 'medium', status: 'not_started', progress_percentage: 0,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.course_id || !form.user_id) return;
    setSaving(true);
    await base44.entities.TrainingAssignment.create({
      ...form,
      assigned_date: new Date().toISOString().split('T')[0],
    });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-2xl p-6"
        style={{ background: '#0f1729', border: '1px solid rgba(139,92,246,0.3)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-white">Assign Training</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(255,255,255,0.40)' }}>Course *</label>
            <select value={form.course_id} onChange={e => set('course_id', e.target.value)}
              className="w-full px-3 h-9 rounded-xl text-xs text-white outline-none" style={inputStyle}>
              <option value="" style={{ background: '#0f172a' }}>Select course…</option>
              {courses.filter(c => c.status === 'published').map(c => (
                <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(255,255,255,0.40)' }}>User *</label>
            <select value={form.user_id} onChange={e => set('user_id', e.target.value)}
              className="w-full px-3 h-9 rounded-xl text-xs text-white outline-none" style={inputStyle}>
              <option value="" style={{ background: '#0f172a' }}>Select user…</option>
              {users.map(u => (
                <option key={u.id} value={u.id} style={{ background: '#0f172a' }}>{u.full_name || u.email}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(255,255,255,0.40)' }}>Due Date</label>
              <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)}
                className="w-full px-3 h-9 rounded-xl text-xs text-white outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'rgba(255,255,255,0.40)' }}>Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}
                className="w-full px-3 h-9 rounded-xl text-xs text-white outline-none" style={inputStyle}>
                {PRIORITIES.map(p => <option key={p} value={p} style={{ background: '#0f172a' }}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={onClose} className="px-4 h-9 rounded-xl text-xs font-semibold text-white/50 hover:text-white">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.course_id || !form.user_id}
            className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-bold disabled:opacity-50 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff' }}>
            <Check className="w-3.5 h-3.5" />
            {saving ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const STATUS_LABEL = { not_started: 'Not Started', in_progress: 'In Progress', completed: 'Completed', overdue: 'Overdue' };

export default function LmsAssignmentsTab() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const { data: assignments = [] } = useQuery({ queryKey: ['lms-assignments-all'], queryFn: () => base44.entities.TrainingAssignment.list('-created_date', 500) });
  const { data: courses = [] } = useQuery({ queryKey: ['lms-courses'], queryFn: () => base44.entities.TrainingCourse.list('-created_date', 200) });
  const { data: users = [] } = useQuery({ queryKey: ['lms-users'], queryFn: () => base44.entities.User.list() });

  const courseMap = useMemo(() => Object.fromEntries(courses.map(c => [c.id, c])), [courses]);
  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users]);

  const filtered = assignments.filter(a => {
    if (statusFilter && a.status !== statusFilter) return false;
    const course = courseMap[a.course_id];
    const user = userMap[a.user_id];
    if (search) {
      const q = search.toLowerCase();
      if (!course?.title.toLowerCase().includes(q) && !user?.full_name?.toLowerCase().includes(q) && !user?.email?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleDelete = async (id) => {
    setDeletingId(id);
    await base44.entities.TrainingAssignment.delete(id);
    qc.invalidateQueries({ queryKey: ['lms-assignments-all'] });
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-white">Assignments</h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>{filtered.length} assignments</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-bold hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff' }}>
          <Plus className="w-3.5 h-3.5" /> Assign Training
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.30)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by course or user…"
            className="w-full pl-8 pr-3 h-9 rounded-xl text-xs text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 h-9 rounded-xl text-xs text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
          <option value="" style={{ background: '#0f172a' }}>All Statuses</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v} style={{ background: '#0f172a' }}>{l}</option>)}
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['User', 'Course', 'Due Date', 'Progress', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider px-4 py-3" style={{ color: 'rgba(255,255,255,0.30)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-xs text-white/30">No assignments found</td></tr>
              )}
              {filtered.map((a, i) => {
                const course = courseMap[a.course_id];
                const user = userMap[a.user_id];
                const colour = ASSIGNMENT_STATUS_COLOUR[a.status] || '#6b7280';
                return (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-white">{user?.full_name || user?.email || a.user_id}</p>
                      {user?.email && user?.full_name && <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{user.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.60)' }}>{course?.title || a.course_id}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {a.due_date ? format(new Date(a.due_date), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${a.progress_percentage || 0}%`, background: colour }} />
                        </div>
                        <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>{a.progress_percentage || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${colour}18`, color: colour }}>
                        {STATUS_LABEL[a.status] || a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(a.id)} disabled={deletingId === a.id}
                        className="p-1.5 rounded-lg transition-colors text-white/30 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <AssignForm
            courses={courses} users={users}
            onClose={() => setShowForm(false)}
            onSaved={() => qc.invalidateQueries({ queryKey: ['lms-assignments-all'] })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}