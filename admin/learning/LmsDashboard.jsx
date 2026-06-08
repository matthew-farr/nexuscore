import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BookOpen, Users, CheckCircle2, AlertTriangle, Award, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function KpiCard({ icon: IconComponent, label, value, colour, sub }) {
  const Icon = IconComponent;
  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${colour}18`, border: `1px solid ${colour}30` }}>
          <Icon className="w-4 h-4" style={{ color: colour }} />
        </div>
        <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.50)' }}>{label}</p>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{sub}</p>}
    </div>
  );
}

export default function LmsDashboard() {
  const { data: courses = [] } = useQuery({
    queryKey: ['lms-courses'],
    queryFn: () => base44.entities.TrainingCourse.list('-created_date', 200),
  });
  const { data: assignments = [] } = useQuery({
    queryKey: ['lms-assignments-all'],
    queryFn: () => base44.entities.TrainingAssignment.list('-created_date', 500),
  });
  const { data: certificates = [] } = useQuery({
    queryKey: ['lms-certificates-all'],
    queryFn: () => base44.entities.TrainingCertificate.list('-created_date', 500),
  });

  const metrics = useMemo(() => {
    const total = courses.length;
    const active = courses.filter(c => c.status === 'published').length;
    const assigned = assignments.length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const inProgress = assignments.filter(a => a.status === 'in_progress').length;
    const overdue = assignments.filter(a => a.status === 'overdue').length;
    const rate = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
    const activeCerts = certificates.filter(c => c.status === 'active').length;
    const expiring = certificates.filter(c => c.status === 'expiring_soon').length;
    return { total, active, assigned, completed, inProgress, overdue, rate, activeCerts, expiring };
  }, [courses, assignments, certificates]);

  // Completion by category chart data
  const categoryData = useMemo(() => {
    return [...new Set(courses.map(c => c.category))].map(cat => {
      const catCourses = courses.filter(c => c.category === cat);
      const catIds = catCourses.map(c => c.id);
      const catAssignments = assignments.filter(a => catIds.includes(a.course_id));
      const catCompleted = catAssignments.filter(a => a.status === 'completed').length;
      const rate = catAssignments.length > 0 ? Math.round((catCompleted / catAssignments.length) * 100) : 0;
      return { name: cat.split(' ')[0], rate, total: catAssignments.length };
    }).filter(d => d.total > 0);
  }, [courses, assignments]);

  // Top courses by completion
  const topCourses = useMemo(() => {
    return courses.map(c => {
      const ca = assignments.filter(a => a.course_id === c.id);
      const done = ca.filter(a => a.status === 'completed').length;
      return { ...c, completions: done, total: ca.length };
    }).filter(c => c.completions > 0).sort((a, b) => b.completions - a.completions).slice(0, 5);
  }, [courses, assignments]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-white">LMS Dashboard</h2>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>Overview of all training activity</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard icon={BookOpen}    label="Total Courses"      value={metrics.total}      colour="#8b5cf6" />
        <KpiCard icon={CheckCircle2} label="Active Courses"    value={metrics.active}     colour="#10b981" />
        <KpiCard icon={Users}       label="Assigned"           value={metrics.assigned}   colour="#3b82f6" />
        <KpiCard icon={TrendingUp}  label="Completion Rate"    value={`${metrics.rate}%`} colour="#ec4899" />
        <KpiCard icon={Clock}       label="In Progress"        value={metrics.inProgress} colour="#f59e0b" />
        <KpiCard icon={CheckCircle2} label="Completed"         value={metrics.completed}  colour="#10b981" />
        <KpiCard icon={AlertTriangle} label="Overdue"          value={metrics.overdue}    colour="#ef4444" />
        <KpiCard icon={Award}       label="Active Certificates" value={metrics.activeCerts} colour="#06b6d4" sub={metrics.expiring > 0 ? `${metrics.expiring} expiring soon` : ''} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category completion chart */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4" style={{ color: '#8b5cf6' }} />
            <h3 className="text-xs font-bold text-white">Completion Rate by Category</h3>
          </div>
          {categoryData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-white/30">No assignment data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={categoryData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.40)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.40)', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, fontSize: 11, color: '#fff' }}
                  formatter={(v) => [`${v}%`, 'Completion']} />
                <Bar dataKey="rate" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top courses */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4" style={{ color: '#10b981' }} />
            <h3 className="text-xs font-bold text-white">Most Completed Courses</h3>
          </div>
          {topCourses.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-white/30">No completions yet</div>
          ) : (
            <div className="space-y-3">
              {topCourses.map(c => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{c.title}</p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{c.category}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full" style={{ width: `${c.total > 0 ? Math.round((c.completions/c.total)*100) : 0}%`, background: 'linear-gradient(90deg,#8b5cf6,#6366f1)' }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#a78bfa' }}>{c.completions}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}