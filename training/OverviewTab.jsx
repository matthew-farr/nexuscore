import { useMemo } from 'react';
import { ChevronRight, AlertTriangle, Award, Clock, Star } from 'lucide-react';
import TrainingCourseCard from './TrainingCourseCard';
import { isOverdue, daysUntil, CATEGORY_COLOURS } from './trainingConfig';

function SectionHeader({ title, onViewAll }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-bold text-white">{title}</h2>
      {onViewAll && (
        <button onClick={onViewAll} className="flex items-center gap-1 text-xs font-semibold hover:text-purple-300 transition-colors" style={{ color: '#c4b5fd' }}>
          View all <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export default function OverviewTab({ courses, assignments, certificates, user, onOpen, onTabChange }) {
  const assigned = useMemo(() =>
    assignments.slice(0, 4).map(a => ({ assignment: a, course: courses.find(c => c.id === a.course_id) })).filter(r => r.course),
    [assignments, courses]);

  const recentlyCompleted = useMemo(() =>
    assignments.filter(a => a.status === 'completed')
      .sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0))
      .slice(0, 3)
      .map(a => ({ assignment: a, course: courses.find(c => c.id === a.course_id) })).filter(r => r.course),
    [assignments, courses]);

  const overdue = useMemo(() =>
    assignments.filter(a => a.status !== 'completed' && isOverdue(a.due_date, a.status)),
    [assignments]);

  const recommended = useMemo(() => {
    const assignedIds = new Set(assignments.map(a => a.course_id));
    return courses.filter(c => !assignedIds.has(c.id) && c.status === 'published').slice(0, 3);
  }, [courses, assignments]);

  const expiringSoon = useMemo(() =>
    certificates.filter(c => { const d = daysUntil(c.expiry_date); return d !== null && d >= 0 && d <= 60; }).slice(0, 3),
    [certificates]);

  const requiredThisMonth = useMemo(() =>
    assignments.filter(a => {
      const d = daysUntil(a.due_date);
      return a.status !== 'completed' && d !== null && d >= 0 && d <= 31;
    }).slice(0, 4),
    [assignments]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main column */}
      <div className="lg:col-span-2 space-y-7">
        {/* Overdue alert */}
        {overdue.length > 0 && (
          <div className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-red-400">{overdue.length} Overdue Course{overdue.length > 1 ? 's' : ''}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.50)' }}>
                {overdue.map(a => courses.find(c => c.id === a.course_id)?.title).filter(Boolean).join(', ')}
              </p>
            </div>
            <button onClick={() => onTabChange('my-training')} className="flex-shrink-0 text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1">
              View <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Assigned training */}
        <div>
          <SectionHeader title="Assigned Training" onViewAll={() => onTabChange('my-training')} />
          {assigned.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <p className="text-white/30 text-sm">No training assigned yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assigned.map(({ course, assignment }, i) => (
                <TrainingCourseCard key={course.id} course={course} assignment={assignment} onOpen={onOpen} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Recently completed */}
        {recentlyCompleted.length > 0 && (
          <div>
            <SectionHeader title="Recently Completed" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentlyCompleted.map(({ course, assignment }, i) => (
                <TrainingCourseCard key={course.id} course={course} assignment={assignment} onOpen={onOpen} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Recommended */}
        {recommended.length > 0 && (
          <div>
            <SectionHeader title="Recommended Courses" onViewAll={() => onTabChange('library')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommended.map((course, i) => (
                <TrainingCourseCard key={course.id} course={course} assignment={null} onOpen={onOpen} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        {/* Required this month */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <p className="text-xs font-bold text-white uppercase tracking-wider">Required This Month</p>
          </div>
          {requiredThisMonth.length === 0 ? (
            <p className="text-xs text-white/30">All caught up!</p>
          ) : (
            <div className="space-y-2">
              {requiredThisMonth.map((a, i) => {
                const c = courses.find(x => x.id === a.course_id);
                if (!c) return null;
                const d = daysUntil(a.due_date);
                return (
                  <div key={i} className="flex items-center justify-between text-xs cursor-pointer hover:text-white transition-colors"
                    onClick={() => onOpen(c, a)}>
                    <span className="truncate flex-1 text-white/65">{c.title}</span>
                    <span className="ml-2 flex-shrink-0 font-semibold" style={{ color: d !== null && d < 7 ? '#f87171' : '#fbbf24' }}>{d}d</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Certificates expiring */}
        {expiringSoon.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.20)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Certificates Expiring</p>
            </div>
            <div className="space-y-2">
              {expiringSoon.map((cert, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="truncate flex-1 text-white/65">{cert.certificate_name}</span>
                  <span className="ml-2 flex-shrink-0 font-semibold text-amber-400">{daysUntil(cert.expiry_date)}d</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Helpful links */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Helpful Links</p>
          <div className="space-y-2">
            {[
              { label: 'DBS Eligibility Guide', onClick: () => window.open('/operations/dbs-eligibility-guide', '_self') },
              { label: 'Course Library', onClick: () => onTabChange('library') },
              { label: 'My Certificates', onClick: () => onTabChange('certs') },
            ].map((l, i) => (
              <button key={i} onClick={l.onClick}
                className="flex items-center gap-2 w-full text-left text-xs transition-colors hover:text-purple-300"
                style={{ color: '#c4b5fd' }}>
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}