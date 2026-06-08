import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function AlertBanner({ activeIssues, isDark }) {
  const outageCount = activeIssues.filter(i => i.status === 'Complete Outage').length;
  const degradedCount = activeIssues.filter(i => i.status === 'Degraded / Partly Not Working').length;

  if (outageCount === 0 && degradedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 p-3.5 rounded-xl flex items-center gap-3"
      style={{
        background: outageCount > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
        border: outageCount > 0 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(245,158,11,0.3)'
      }}
    >
      <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: outageCount > 0 ? '#ef4444' : '#f59e0b' }} />
      <div>
        <p className="text-sm font-semibold" style={{ color: outageCount > 0 ? '#ef4444' : '#f59e0b' }}>
          {outageCount > 0
            ? `${outageCount} Active Outage${outageCount > 1 ? 's' : ''}`
            : `${degradedCount} Degraded Service${degradedCount > 1 ? 's' : ''}`}
        </p>
        <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
          {activeIssues.length} active issue{activeIssues.length !== 1 ? 's' : ''} currently logged.
        </p>
      </div>
    </motion.div>
  );
}