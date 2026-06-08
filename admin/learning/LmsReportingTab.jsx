import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ASSIGNMENT_STATUS_COLOUR } from './lmsConfig';

const STATUS_LABEL = { not_started: 'Not Started', in_progress: 'In Progress', completed: 'Completed', overdue: 'Overdue' };

export default function LmsReportingTab() {
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data: assignments = [] } = useQuery({ queryKey: ['lms-assignments-all'], queryFn: () => base44.entities.TrainingAssignment.list('-created_date', 500) });
  const { data: courses = [] } = useQuery({ queryKey: ['lms-courses'], queryFn: () => base44.entities.TrainingCourse.list('-created_date', 200) });
  const { data: users = [] } = useQuery({ queryKey: ['lms-users'], queryFn: () => base44.entities.User.list() });

  const courseMap = useMemo(() => Object.fromEntries(courses.map(c => [c.id, c])), [courses]);
  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users]);

  const filtered = useMemo(() => assignments.filter(a => {
    if (courseFilter && a.course_id !== courseFilter) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const user = userMap[a.user_id];
      const course = courseMap[a.course_id];
      if (!user?.full_name?.toLowerCase().includes(q) && !user?.email?.toLowerCase().includes(q) && !course?.title?.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [assignments, courseFilter, statusFilter, search, courseMap, userMap]);

  const metrics = useMemo(() => ({
    total: filtered.length,
    completed: filtered.filter(a => a.status === 'completed').length,
    inProgress: filtered.filter(a => a.status === 'in_progress').length,
    overdue: filtered.filter(a => a.status === 'overdue').length,
    notStarted: filtered.filter(a => a.status === 'not_started').length,
    rate: filtered.length > 0 ? Math.round((filtered.filter(a => a.status === 'completed').length / filtered.length) * 100) : 0,
  }), [filtered]);

  const handleExport = () => {
    const rows = [
      ['User', 'Email', 'Course', 'Category', 'Status', 'Progress', 'Due Date', 'Completed'],
      ...filtered.map(a => {
        const user = userMap[a.user_id];
        const course = courseMap[a.course_id];
        return [
          user?.full_name || '',
          user?.email || '',
          course?.title || '',
          course?.category || '',
          a.status,
          `${a.progress_percentage || 0}%`,
          a.due_date || '',
          a.completed_at ? format(new Date(a.completed_at), 'dd/MM/yyyy') : '',
        ];
      }),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'training-report.csv'; a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-white">Reporting</h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>Training activity and completion data</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.70)' }}>
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: metrics.total, colour: '#8b5cf6' },
          { label: 'Completed', value: metrics.completed, colour: '#10b981' },
          { label: 'In Progress', value: metrics.inProgress, colour: '#3b82f6' },
          { label: 'Not Started', value: metrics.notStarted, colour: '#6b7280' },
          { label: 'Overdue', value: metrics.overdue, colour: '#ef4444' },
          { label: 'Rate', value: `${metrics.rate}%`, colour: '#ec4899' },
        ].map(m => (
          <div key={m.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-lg font-bold" style={{ color: m.colour }}>{m.value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user or course…"
          className="flex-1 min-w-40 px-3 h-9 rounded-xl text-xs text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} />
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
          className="px-3 h-9 rounded-xl text-xs text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
          <option value="" style={{ background: '#0f172a' }}>All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>{c.title}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 h-9 rounded-xl text-xs text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
          <option value="" style={{ background: '#0f172a' }}>All Statuses</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v} style={{ background: '#0f172a' }}>{l}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['User', 'Course', 'Category', 'Status', 'Progress', 'Due Date', 'Completed'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider px-4 py-3" style={{ color: 'rgba(255,255,255,0.30)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-white/30">No data matching filters</td></tr>
              )}
              {filtered.map(a => {
                const user = userMap[a.user_id];
                const course = courseMap[a.course_id];
                const colour = ASSIGNMENT_STATUS_COLOUR[a.status] || '#6b7280';
                return (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-white">{user?.full_name || user?.email || a.user_id}</p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.60)' }}>{course?.title || '—'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{course?.category || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${colour}18`, color: colour }}>
                        {STATUS_LABEL[a.status] || a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-full rounded-full" style={{ width: `${a.progress_percentage || 0}%`, background: colour }} />
                        </div>
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.40)' }}>{a.progress_percentage || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {a.due_date ? format(new Date(a.due_date), 'dd MMM yy') : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {a.completed_at ? format(new Date(a.completed_at), 'dd MMM yy') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}