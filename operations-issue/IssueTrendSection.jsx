import { motion } from 'framer-motion';
import { Repeat, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { formatUKDateTime, formatRelativeTime } from './issueConfig';

function TrendCard({ trend, isDark, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="rounded-xl p-4"
      style={{
        background: isDark ? 'rgba(167,139,250,0.07)' : 'rgba(167,139,250,0.05)',
        border: '1px solid rgba(167,139,250,0.2)',
        backdropFilter: 'blur(20px)'
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa' }}>
              RECURRING
            </span>
            {trend.service && trend.service !== 'Multiple' && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#22d3ee' }}>
                {trend.service}
              </span>
            )}
          </div>
          <p className="font-semibold text-sm leading-snug" style={{ color: isDark ? '#fff' : '#0f0f2e' }}>{trend.name}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold leading-none" style={{ color: '#a78bfa' }}>{trend.count}×</p>
          <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>in 30 days</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs mb-2 flex-wrap">
        <span className="flex items-center gap-1" style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
          <Clock className="w-3 h-3" />
          Last: <span title={formatUKDateTime(trend.lastDate)} className="font-medium">{formatRelativeTime(trend.lastDate)}</span>
        </span>
        <span className="flex items-center gap-1" style={{ color: trend.active > 0 ? '#f59e0b' : '#22c55e' }}>
          {trend.active > 0 ? (
            <><TrendingUp className="w-3 h-3" />{trend.active} currently active</>
          ) : (
            <><CheckCircle className="w-3 h-3" />None currently active</>
          )}
        </span>
      </div>

      <div className="px-3 py-2 rounded-lg mt-2" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
        <p className="text-xs leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
          <strong style={{ color: '#a78bfa' }}>Suggested Action:</strong> {trend.suggestion}
        </p>
      </div>
    </motion.div>
  );
}

export default function IssueTrendSection({ trends, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <Repeat className="w-4 h-4" style={{ color: '#a78bfa' }} />
        <h3 className="text-sm font-bold" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }}>Recurring Issue Trends</h3>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>
          Last 30 days
        </span>
      </div>

      {trends.length === 0 ? (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: isDark ? 'rgba(34,197,94,0.06)' : 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#22c55e' }} />
          <p className="text-xs font-medium" style={{ color: '#22c55e' }}>No recurring issue trends detected in the last 30 days.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {trends.map((trend, i) => (
            <TrendCard key={`${trend.name}-${i}`} trend={trend} isDark={isDark} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}