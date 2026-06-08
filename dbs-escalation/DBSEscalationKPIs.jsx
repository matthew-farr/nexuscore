import { motion } from 'framer-motion';
import { Shield, AlertCircle, CheckCircle2, XCircle, TrendingUp, CalendarDays } from 'lucide-react';

export default function DBSEscalationKPIs({ data, isDark, onFilter, activeFilter }) {
  const kpis = [
    { label: 'Total Records', value: data.total, icon: Shield, color: 'cyan', filterValue: null },
    { label: 'Due To Be Escalated', value: data.dueToBeEscalated, icon: AlertCircle, color: 'pink', filterValue: 'DUE TO BE ESCALATED' },
    { label: 'Escalated', value: data.escalated, icon: CheckCircle2, color: 'green', filterValue: 'ESCALATED' },
    { label: 'Withdrawn', value: data.withdrawn, icon: XCircle, color: 'amber', filterValue: 'WITHDRAWN' },
    { label: 'Escalated This Week', value: data.escalatedThisWeek, icon: TrendingUp, color: 'purple', filterValue: null },
    { label: 'Escalated This Month', value: data.escalatedThisMonth, icon: CalendarDays, color: 'blue', filterValue: null },
  ];

  const colorMap = {
    cyan: isDark ? 'rgba(34, 211, 238, 0.15)' : 'rgba(34, 211, 238, 0.08)',
    pink: isDark ? 'rgba(236, 44, 163, 0.15)' : 'rgba(236, 44, 163, 0.08)',
    green: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.08)',
    amber: isDark ? 'rgba(217, 119, 6, 0.15)' : 'rgba(217, 119, 6, 0.08)',
    purple: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.08)',
    blue: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
  };

  const borderMap = {
    cyan: isDark ? 'rgba(34, 211, 238, 0.3)' : 'rgba(34, 211, 238, 0.2)',
    pink: isDark ? 'rgba(236, 44, 163, 0.3)' : 'rgba(236, 44, 163, 0.2)',
    green: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)',
    amber: isDark ? 'rgba(217, 119, 6, 0.3)' : 'rgba(217, 119, 6, 0.2)',
    purple: isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.2)',
    blue: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onFilter && onFilter(kpi.filterValue)}
            style={{
              background: colorMap[kpi.color],
              border: `2px solid ${activeFilter === kpi.filterValue ? borderMap[kpi.color].replace('0.2', '0.8').replace('0.3', '0.8') : borderMap[kpi.color]}`,
              backdropFilter: 'blur(20px)',
              cursor: 'pointer',
              transform: activeFilter === kpi.filterValue ? 'scale(1.03)' : 'scale(1)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: activeFilter === kpi.filterValue ? `0 0 16px ${borderMap[kpi.color]}` : 'none'
            }}
            className="rounded-xl p-4 hover:opacity-90"
          >
            <div className="flex items-start justify-between">
              <div>
                <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} className="text-xs font-medium mb-1">
                  {kpi.label}
                </p>
                <p style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-2xl font-bold">
                  {kpi.value}
                </p>
              </div>
              <Icon className="w-5 h-5 opacity-50" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}