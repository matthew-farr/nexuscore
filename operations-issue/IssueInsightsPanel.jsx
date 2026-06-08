import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import IssueTrendSection from './IssueTrendSection';

function ServiceBreakdown({ breakdown, isDark }) {
  if (!breakdown || breakdown.length === 0) return null;
  const max = breakdown[0]?.[1] || 1;
  return (
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)' }}>
        Issues by Service — This Month
      </p>
      <div className="space-y-2">
        {breakdown.map(([svc, count]) => (
          <div key={svc} className="flex items-center gap-3">
            <span className="text-xs w-40 flex-shrink-0 truncate" style={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)' }} title={svc}>{svc}</span>
            <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(count / max) * 100}%`, background: 'linear-gradient(90deg, #ec2ca3, #7c3aed)' }}
              />
            </div>
            <span className="text-xs font-bold w-5 text-right flex-shrink-0" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniChart({ chartData, isDark }) {
  if (!chartData || chartData.every(d => d.count === 0)) return null;
  const maxVal = Math.max(...chartData.map(d => d.count), 1);
  // Only show every 5th label to avoid clutter
  const tickFormatter = (val, index) => index % 5 === 0 ? val : '';

  return (
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)' }}>
        Issues Logged — Last 30 Days
      </p>
      <ResponsiveContainer width="100%" height={80}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barSize={6}>
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} tickFormatter={tickFormatter} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: isDark ? '#1a1a2e' : '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px', padding: '4px 8px' }}
            labelStyle={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
            itemStyle={{ color: '#ec2ca3' }}
            formatter={(v) => [v, 'Issues']}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.count > 0 ? '#ec2ca3' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')} fillOpacity={entry.count > 0 ? 0.85 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function IssueInsightsPanel({ trends, breakdown, chartData, isDark }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-5 rounded-xl overflow-hidden"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.75)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)'
      }}
    >
      {/* Collapsed toggle bar */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4" style={{ color: '#ec2ca3' }} />
          <span className="text-sm font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }}>
            Insights &amp; Trends
          </span>
          {trends.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>
              {trends.length} recurring
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} />}
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-4 pb-4 pt-1" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
          <MiniChart chartData={chartData} isDark={isDark} />
          <ServiceBreakdown breakdown={breakdown} isDark={isDark} />
          <IssueTrendSection trends={trends} isDark={isDark} />
        </div>
      )}
    </motion.div>
  );
}