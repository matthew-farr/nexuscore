import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const KPI_METRICS = [
  { label: 'Waiting On Client', field: 'waitingOnClient', icon: '⏳' },
  { label: 'Chase Client (10+ days)', field: 'chaseClient', icon: '🔔', highlight: true },
  { label: 'Responded To DBS', field: 'respondedToDBS', icon: '📤' },
  { label: 'Further Clarification', field: 'clarification', icon: '❓' },
  { label: 'Queries This Month', field: 'thisMonth', icon: '📅' },
];

export default function DBSKPICards({ data = {}, isDark, onFilterClick }) {
  const handleClick = (field) => {
    if (onFilterClick) {
      onFilterClick(field);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
      {KPI_METRICS.map((metric, idx) => (
        <motion.div
          key={metric.field}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          onClick={() => handleClick(metric.field)}
          className="p-4 rounded-lg backdrop-blur-sm cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
          style={{
            background: metric.highlight
              ? (isDark ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.08))' : 'linear-gradient(135deg, rgba(245,158,11,0.10), rgba(239,68,68,0.04))')
              : (isDark ? 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(236,44,163,0.04))' : 'linear-gradient(135deg, rgba(6,182,212,0.06), rgba(236,44,163,0.02))'),
            border: metric.highlight
              ? (isDark ? '1px solid rgba(245,158,11,0.30)' : '1px solid rgba(245,158,11,0.20)')
              : (isDark ? '1px solid rgba(6,182,212,0.15)' : '1px solid rgba(6,182,212,0.10)'),
            boxShadow: isDark ? '0 4px 12px rgba(6,182,212,0.10)' : '0 2px 8px rgba(6,182,212,0.05)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{metric.icon}</span>
            <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} className="text-xs font-semibold">
              {metric.label}
            </p>
          </div>
          <p style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-2xl font-bold">
            {data[metric.field] || 0}
          </p>
        </motion.div>
      ))}
    </div>
  );
}