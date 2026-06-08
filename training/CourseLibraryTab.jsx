import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import TrainingCourseCard from './TrainingCourseCard';
import { CATEGORY_COLOURS } from './trainingConfig';

const CATEGORIES = ['All', 'DBS & Compliance', 'Operations', 'Sales', 'Customer Service', 'Systems Training', 'Management', 'Onboarding'];

export default function CourseLibraryTab({ courses, assignments, onOpen, initialSearch = '', user = null }) {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState(initialSearch);

  const filtered = useMemo(() =>
    courses.filter(c => {
      if (c.status !== 'published') return false;
      if (category !== 'All' && c.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
      }
      return true;
    }),
    [courses, category, search]);

  return (
    <div>
      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 flex-nowrap">
        {CATEGORIES.map(cat => {
          const c = CATEGORY_COLOURS[cat];
          return (
            <button key={cat} onClick={() => setCategory(cat)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
              style={category === cat
                ? { background: c?.bg || 'rgba(139,92,246,0.20)', borderColor: c?.border || 'rgba(139,92,246,0.40)', color: c?.text || '#c4b5fd' }
                : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.50)' }}>
              {cat}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.30)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search the course library…"
            className="w-full pl-9 pr-3 h-9 rounded-xl text-xs text-white placeholder:text-white/30 outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} />
        </div>
        <p className="text-xs self-center" style={{ color: 'rgba(255,255,255,0.35)' }}>{filtered.length} course{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16"><p className="text-white/40 text-sm">No courses found.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((course, i) => {
            const assignment = assignments.find(a => a.course_id === course.id);
            return <TrainingCourseCard key={course.id} course={course} assignment={assignment} onOpen={onOpen} index={i} user={user} />;
          })}
        </div>
      )}
    </div>
  );
}