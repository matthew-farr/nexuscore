import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import TrainingCourseCard from './TrainingCourseCard';
import { getEffectiveStatus } from './trainingConfig';

const FILTERS = [
  { key: 'all',         label: 'All' },
  { key: 'not_started', label: 'Not Started' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed',   label: 'Completed' },
  { key: 'overdue',     label: 'Overdue' },
];

export default function MyTrainingTab({ courses, assignments, onOpen, initialFilter = 'all' }) {
  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState('');

  // Update filter when initialFilter changes (from KPI click)
  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const rows = useMemo(() => {
    // Include all assignments (both formally assigned and self-started)
    const allRows = assignments
      .map(a => ({ assignment: a, course: courses.find(c => c.id === a.course_id) }))
      .filter(({ course }) => !!course);

    return allRows
      .filter(({ assignment, course }) => {
        const status = getEffectiveStatus(assignment);
        if (filter !== 'all' && status !== filter) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!course.title.toLowerCase().includes(q) && !course.category.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const order = { overdue: 0, in_progress: 1, not_started: 2, completed: 3 };
        return (order[getEffectiveStatus(a.assignment)] ?? 2) - (order[getEffectiveStatus(b.assignment)] ?? 2);
      });
  }, [courses, assignments, filter, search]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 p-1 rounded-xl flex-wrap" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={filter === f.key
                ? { background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff' }
                : { color: 'rgba(255,255,255,0.50)' }}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.30)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            className="pl-9 pr-3 h-9 rounded-xl text-xs text-white placeholder:text-white/30 outline-none w-44"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/40 text-sm">No training found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rows.map(({ course, assignment }, i) => (
            <TrainingCourseCard key={course.id} course={course} assignment={assignment} onOpen={onOpen} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}