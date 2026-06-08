import { motion } from 'framer-motion';
import { ClipboardList, PlayCircle, CheckCircle2, AlertTriangle, Award } from 'lucide-react';

const KPIS = [
  { key: 'assigned',    label: 'Assigned',     icon: ClipboardList,  colour: '#8b5cf6' },
  { key: 'inProgress',  label: 'In Progress',  icon: PlayCircle,     colour: '#22d3ee' },
  { key: 'completed',   label: 'Completed',    icon: CheckCircle2,   colour: '#10b981' },
  { key: 'overdue',     label: 'Overdue',      icon: AlertTriangle,  colour: '#ef4444' },
  { key: 'certs',       label: 'Certificates', icon: Award,          colour: '#f59e0b' },
];

export default function TrainingKPIs({ stats, onKpiClick }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {KPIS.map((k, i) => {
        const Icon = k.icon;
        return (
          <motion.div key={k.key}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => onKpiClick?.(k.key)}
            className="rounded-2xl p-4 cursor-pointer transition-all hover:scale-105"
            style={{ 
              background: `${k.colour}15`, 
              border: `1.5px solid ${k.colour}30`,
              backdropFilter: 'blur(20px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${k.colour}60`;
              e.currentTarget.style.boxShadow = `0 0 20px ${k.colour}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${k.colour}30`;
              e.currentTarget.style.boxShadow = 'none';
            }}
            aria-label={`${k.label}: ${stats?.[k.key] ?? 0}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onKpiClick?.(k.key);
              }
            }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5" style={{ background: `${k.colour}22` }}>
              <Icon className="w-3.5 h-3.5" style={{ color: k.colour }} />
            </div>
            <p className="text-2xl font-extrabold text-white">{stats?.[k.key] ?? 0}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{k.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}