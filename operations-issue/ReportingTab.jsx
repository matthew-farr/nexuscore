import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, AlertTriangle, Calendar, BarChart2, Repeat, Star, Zap, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { computeKPIs, computeServiceBreakdown, computeTrends, computeDailyChart } from './issueAnalytics';
import { formatRelativeTime, formatUKDateTime } from './issueConfig';

const KPI_DEFS = [
  { key: 'todayCount',          label: 'Logged Today',          helper: 'UK time',                icon: Calendar,      color: '#06b6d4' },
  { key: 'weekCount',           label: 'This Week',             helper: 'Mon–Sun (UK)',            icon: TrendingUp,    color: '#8b5cf6' },
  { key: 'monthCount',          label: 'This Month',            helper: 'All issues',             icon: BarChart2,     color: '#ec2ca3' },
  { key: 'activeCount',         label: 'Active Issues',         helper: 'Not resolved',           icon: Activity,      color: '#f59e0b' },
  { key: 'outagesMonth',        label: 'Outages This Month',    helper: 'Complete outage',        icon: AlertTriangle, color: '#ef4444' },
  { key: 'degradedMonth',       label: 'Degraded This Month',   helper: 'Partly not working',     icon: Zap,           color: '#f97316' },
  { key: 'mostAffectedService', label: 'Top Affected Service',  helper: 'Most issues this month', icon: Star,          color: '#22d3ee', wide: true },
  { key: 'repeatAlerts',        label: 'Repeat Alerts',         helper: 'Recurring trends (30d)', icon: Repeat,        color: '#a78bfa' },
];

function KPICard({ def, value, isDark, i }) {
  const Icon = def.icon;
  const isEmpty = value === 0 || value === 'None';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: i * 0.03 }}
      className={`rounded-xl p-3.5 ${def.wide ? 'col-span-2 sm:col-span-2' : ''}`}
      style={{
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)'
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${def.color}18` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: def.color }} />
        </div>
        <span className={`font-bold leading-none ${def.wide ? 'text-sm font-semibold' : 'text-xl'}`}
          style={{ color: isEmpty ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)') : (isDark ? '#fff' : '#0f0f2e') }}>
          {value}
        </span>
      </div>
      <p className="text-xs font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)' }}>{def.label}</p>
      <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' }}>{def.helper}</p>
    </motion.div>
  );
}

function TrendCard({ trend, isDark, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="rounded-xl p-4"
      style={{
        background: isDark ? 'rgba(167,139,250,0.06)' : 'rgba(167,139,250,0.04)',
        border: '1px solid rgba(167,139,250,0.2)'
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa' }}>RECURRING</span>
            {trend.service && trend.service !== 'Multiple' && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#22d3ee' }}>{trend.service}</span>
            )}
          </div>
          <p className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#0f0f2e' }}>{trend.name}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold" style={{ color: '#a78bfa' }}>{trend.count}×</p>
          <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>in 30 days</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs mb-2 flex-wrap">
        <span className="flex items-center gap-1" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
          <Clock className="w-3 h-3" />
          Last: <span className="font-medium ml-0.5" title={formatUKDateTime(trend.lastDate)}>{formatRelativeTime(trend.lastDate)}</span>
        </span>
        <span className="flex items-center gap-1" style={{ color: trend.active > 0 ? '#f59e0b' : '#22c55e' }}>
          {trend.active > 0
            ? <><TrendingUp className="w-3 h-3" />{trend.active} currently active</>
            : <><CheckCircle className="w-3 h-3" />None active</>}
        </span>
      </div>
      <div className="px-3 py-2 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
        <p className="text-xs leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
          <strong style={{ color: '#a78bfa' }}>Action:</strong> {trend.suggestion}
        </p>
      </div>
    </motion.div>
  );
}

export default function ReportingTab({ issues, isDark }) {
  const kpis = useMemo(() => computeKPIs(issues), [issues]);
  const breakdown = useMemo(() => computeServiceBreakdown(issues), [issues]);
  const { trends } = useMemo(() => computeTrends(issues), [issues]);
  const chartData = useMemo(() => computeDailyChart(issues), [issues]);

  const maxBreakdown = breakdown[0]?.[1] || 1;
  const hasChartData = chartData.some(d => d.count > 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)' }}>Key Metrics</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {KPI_DEFS.map((def, i) => (
            <KPICard key={def.key} def={def} value={kpis[def.key]} isDark={isDark} i={i} />
          ))}
        </div>
      </section>

      {/* Chart + Breakdown side by side on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Daily chart */}
        {hasChartData && (
          <section className="rounded-xl p-4"
            style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)' }}>
              Issues Logged — Last 30 Days
            </p>
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barSize={6}>
                <XAxis dataKey="label"
                  tick={{ fontSize: 9, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
                  tickFormatter={(_, i) => i % 5 === 0 ? chartData[i]?.label : ''}
                  axisLine={false} tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: isDark ? '#1a1a2e' : '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px', padding: '4px 8px' }}
                  labelStyle={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
                  formatter={(v) => [v, 'Issues']}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.count > 0 ? '#ec2ca3' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')} fillOpacity={entry.count > 0 ? 0.85 : 1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Service breakdown */}
        {breakdown.length > 0 && (
          <section className="rounded-xl p-4"
            style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)' }}>
              Issues by Service — This Month
            </p>
            <div className="space-y-2">
              {breakdown.map(([svc, count]) => (
                <div key={svc} className="flex items-center gap-3">
                  <span className="text-xs w-36 flex-shrink-0 truncate" style={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)' }} title={svc}>{svc}</span>
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxBreakdown) * 100}%`, background: 'linear-gradient(90deg, #ec2ca3, #7c3aed)' }} />
                  </div>
                  <span className="text-xs font-bold w-5 text-right flex-shrink-0" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>{count}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Recurring Trends */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Repeat className="w-4 h-4" style={{ color: '#a78bfa' }} />
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)' }}>
            Recurring Issue Trends
          </p>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>Last 30 days</span>
        </div>

        {trends.length === 0 ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: isDark ? 'rgba(34,197,94,0.06)' : 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#22c55e' }} />
            <p className="text-xs font-medium" style={{ color: '#22c55e' }}>No recurring issue trends detected in the last 30 days.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {trends.map((trend, i) => <TrendCard key={i} trend={trend} isDark={isDark} index={i} />)}
          </div>
        )}
      </section>

      {/* Future KPI placeholders */}
      <section className="rounded-xl p-4" style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>Coming Soon</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Avg. Resolution Time', 'Longest Open Issue', 'Open &gt;7 Days', 'Open &gt;30 Days'].map(label => (
            <div key={label} className="rounded-lg p-3 text-center" style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px dashed rgba(255,255,255,0.08)' : '1px dashed rgba(0,0,0,0.1)' }}>
              <p className="text-lg font-bold" style={{ color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }}>—</p>
              <p className="text-xs mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)' }} dangerouslySetInnerHTML={{ __html: label }} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}