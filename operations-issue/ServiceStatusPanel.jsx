import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Zap, HelpCircle } from 'lucide-react';

const ALL_SERVICES = [
  'DBS Submissions', 'DVLA / Driving Licence', 'Right to Work', 'ID Verification',
  'Candidate Portal', 'Customer Portal', 'Payments / Stripe', 'Overseas Checks',
  'Supplier Checks', 'HubSpot', 'Power BI / Reporting'
];

function getServiceStatus(service, activeIssues) {
  const matching = activeIssues.filter(i => i.affected_service === service);
  if (matching.length === 0) return 'ok';
  if (matching.some(i => i.status === 'Complete Outage')) return 'outage';
  if (matching.some(i => i.status === 'Degraded / Partly Not Working')) return 'degraded';
  return 'unknown';
}

const STATUS_CONFIG = {
  ok:       { color: '#22c55e', Icon: CheckCircle,   bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)' },
  outage:   { color: '#ef4444', Icon: AlertTriangle, bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.3)' },
  degraded: { color: '#f59e0b', Icon: Zap,           bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  unknown:  { color: '#9ca3af', Icon: HelpCircle,    bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)' },
};

export default function ServiceStatusPanel({ activeIssues, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-5 rounded-xl p-4"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.75)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)'
      }}
    >
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)' }}>
        Service Status
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {ALL_SERVICES.map(svc => {
          const status = getServiceStatus(svc, activeIssues);
          const { color, Icon, bg, border } = STATUS_CONFIG[status];
          return (
            <div key={svc} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg" style={{ background: bg, border: `1px solid ${border}` }}>
              <Icon className="w-3 h-3 flex-shrink-0" style={{ color }} />
              <span className="text-xs leading-tight truncate" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)' }} title={svc}>{svc}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}