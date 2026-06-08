import { motion } from 'framer-motion';
import { Users2, AlertTriangle, CheckCircle2, BookOpen, UserPlus } from 'lucide-react';

const MOCK_TEAM = [
  { name: 'Sarah Johnson',  dept: 'Operations',    assigned: 5, completed: 4, overdue: 0, progress: 82,  last: '2 days ago' },
  { name: 'James Wilson',   dept: 'Sales',          assigned: 4, completed: 2, overdue: 1, progress: 50,  last: '1 week ago' },
  { name: 'Emily Clarke',   dept: 'Customer Svc',  assigned: 3, completed: 3, overdue: 0, progress: 100, last: 'Today' },
  { name: 'Tom Hartley',    dept: 'Operations',    assigned: 6, completed: 1, overdue: 2, progress: 20,  last: '3 weeks ago' },
  { name: 'Priya Patel',    dept: 'DBS & Compliance', assigned: 4, completed: 4, overdue: 0, progress: 100, last: 'Yesterday' },
  { name: 'Daniel Foster',  dept: 'Sales',          assigned: 3, completed: 0, overdue: 3, progress: 0,   last: 'Never' },
];

export default function ManagerTab({ user }) {
  const isManager = ['admin', 'manager', 'super_admin'].includes(user?.role);

  if (!isManager) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.20)' }}>
          <Users2 className="w-6 h-6" style={{ color: 'rgba(139,92,246,0.50)' }} />
        </div>
        <p className="text-white/50 text-sm font-medium">Manager access required</p>
        <p className="text-white/25 text-xs mt-1">This view is only available to managers and admins.</p>
      </div>
    );
  }

  const avg = Math.round(MOCK_TEAM.reduce((s, m) => s + m.progress, 0) / MOCK_TEAM.length);
  const totalOverdue = MOCK_TEAM.reduce((s, m) => s + m.overdue, 0);
  const fullyDone = MOCK_TEAM.filter(m => m.progress === 100).length;

  const kpis = [
    { label: 'Team Completion',    value: `${avg}%`,        colour: '#8b5cf6', Icon: BookOpen },
    { label: 'Overdue Training',   value: totalOverdue,     colour: '#ef4444', Icon: AlertTriangle },
    { label: 'Fully Completed',    value: fullyDone,        colour: '#10b981', Icon: CheckCircle2 },
    { label: 'Team Members',       value: MOCK_TEAM.length, colour: '#22d3ee', Icon: Users2 },
  ];

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl p-4"
            style={{ background: `${k.colour}15`, border: `1.5px solid ${k.colour}30` }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: `${k.colour}22` }}>
              <k.Icon className="w-4 h-4" style={{ color: k.colour }} />
            </div>
            <p className="text-2xl font-extrabold text-white">{k.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {['Assign Training', 'Send Reminder'].map(a => (
          <button key={a} className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(139,92,246,0.20)', border: '1px solid rgba(139,92,246,0.35)', color: '#c4b5fd' }}>
            <UserPlus className="w-3.5 h-3.5" /> {a}
          </button>
        ))}
      </div>

      {/* Team table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-bold text-white">Team Training Progress</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Staff Member', 'Department', 'Assigned', 'Completed', 'Overdue', 'Progress', 'Last Active'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider px-4 py-3" style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_TEAM.map((m, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>{m.name.charAt(0)}</div>
                      <span className="text-sm font-medium text-white whitespace-nowrap">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.50)' }}>{m.dept}</td>
                  <td className="px-4 py-3 text-xs text-white font-medium">{m.assigned}</td>
                  <td className="px-4 py-3 text-xs text-emerald-400 font-medium">{m.completed}</td>
                  <td className="px-4 py-3">
                    {m.overdue > 0
                      ? <span className="text-xs font-semibold text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{m.overdue}</span>
                      : <span className="text-xs text-white/25">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${m.progress}%`, background: m.progress === 100 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#8b5cf6,#22d3ee)' }} />
                      </div>
                      <span className="text-xs text-white font-semibold">{m.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>{m.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}