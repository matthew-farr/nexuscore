import { motion } from 'framer-motion';
import { Building2, Star, AlertCircle, CalendarClock } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const colorMap = {
  cyan:   { bg: ['rgba(34,211,238,0.15)', 'rgba(34,211,238,0.08)'],   border: ['rgba(34,211,238,0.35)', 'rgba(34,211,238,0.20)'],   text: '#22d3ee' },
  pink:   { bg: ['rgba(236,44,163,0.15)',  'rgba(236,44,163,0.08)'],  border: ['rgba(236,44,163,0.35)',  'rgba(236,44,163,0.20)'],  text: '#ec2ca3' },
  amber:  { bg: ['rgba(245,158,11,0.15)',  'rgba(245,158,11,0.08)'],  border: ['rgba(245,158,11,0.35)',  'rgba(245,158,11,0.20)'],  text: '#f59e0b' },
  purple: { bg: ['rgba(168,85,247,0.15)',  'rgba(168,85,247,0.08)'],  border: ['rgba(168,85,247,0.35)',  'rgba(168,85,247,0.20)'],  text: '#a855f7' },
};

export default function SupplierKPICards({ suppliers }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const d = isDark ? 0 : 1;

  const active = suppliers.filter(s => s.status === 'Active').length;
  const featured = suppliers.filter(s => s.featured).length;
  const underReview = suppliers.filter(s => s.status === 'Under Review').length;
  const upcoming = suppliers.filter(s => {
    if (!s.next_review_date) return false;
    const diff = (new Date(s.next_review_date) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  const kpis = [
    { label: 'Active Suppliers',      value: active,      icon: Building2,    color: 'cyan' },
    { label: 'Featured Suppliers',    value: featured,    icon: Star,         color: 'pink' },
    { label: 'Suppliers Under Review',value: underReview, icon: AlertCircle,  color: 'amber' },
    { label: 'Upcoming Reviews',      value: upcoming,    icon: CalendarClock,color: 'purple' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((k, i) => {
        const Icon = k.icon;
        const c = colorMap[k.color];
        return (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-5"
            style={{
              background: c.bg[d],
              border: `1.5px solid ${c.border[d]}`,
              backdropFilter: 'blur(20px)',
              boxShadow: isDark ? `0 0 24px ${c.border[0]}40` : '0 2px 12px rgba(0,0,0,0.05)',
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${c.text}22`, border: `1px solid ${c.text}40` }}>
                <Icon className="w-4 h-4" style={{ color: c.text }} />
              </div>
            </div>
            <p className="text-3xl font-extrabold mb-1" style={{ color: isDark ? '#ffffff' : '#000000' }}>{k.value}</p>
            <p className="text-xs font-medium" style={{ color: isDark ? '#ffffff' : '#000000' }}>{k.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}