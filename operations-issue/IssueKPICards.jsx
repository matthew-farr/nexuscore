import { motion } from 'framer-motion';
import { Activity, AlertTriangle, TrendingUp, Calendar, BarChart2, Repeat, Star, Zap } from 'lucide-react';

const CARDS = [
  { key: 'todayCount',         label: 'Logged Today',         icon: Calendar,      helper: 'UK time',                color: '#06b6d4' },
  { key: 'weekCount',          label: 'This Week',            icon: TrendingUp,    helper: 'Mon–Sun (UK)',            color: '#8b5cf6' },
  { key: 'monthCount',         label: 'This Month',           icon: BarChart2,     helper: 'All issues this month',  color: '#ec2ca3' },
  { key: 'activeCount',        label: 'Active Issues',        icon: Activity,      helper: 'Not yet resolved',        color: '#f59e0b' },
  { key: 'outagesMonth',       label: 'Outages This Month',   icon: AlertTriangle, helper: 'Complete outage',         color: '#ef4444' },
  { key: 'degradedMonth',      label: 'Degraded This Month',  icon: Zap,           helper: 'Partly not working',      color: '#f97316' },
  { key: 'mostAffectedService',label: 'Top Affected Service', icon: Star,          helper: 'Most issues this month',  color: '#22d3ee', wide: true },
  { key: 'repeatAlerts',       label: 'Repeat Alerts',        icon: Repeat,        helper: 'Recurring trends (30d)',  color: '#a78bfa' },
];

export default function IssueKPICards({ kpis, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5"
    >
      {CARDS.map((card, i) => {
        const Icon = card.icon;
        const val = kpis[card.key];
        const isEmpty = val === 0 || val === 'None';
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            className={`rounded-xl p-3.5 ${card.wide ? 'col-span-2 sm:col-span-2' : ''}`}
            style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              backdropFilter: 'blur(20px)',
              boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.25)' : '0 1px 8px rgba(0,0,0,0.05)'
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${card.color}18` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: card.color }} />
              </div>
              <span
                className={`text-xl font-bold leading-none ${card.wide ? 'text-sm font-semibold' : ''}`}
                style={{ color: isEmpty ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') : (isDark ? '#fff' : '#0f0f2e') }}
              >
                {val}
              </span>
            </div>
            <p className="text-xs font-semibold leading-tight" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)' }}>{card.label}</p>
            <p className="text-xs mt-0.5 leading-tight" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' }}>{card.helper}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}