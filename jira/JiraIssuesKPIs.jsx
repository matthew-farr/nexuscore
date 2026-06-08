import { motion } from 'framer-motion';
import { AlertCircle, LifeBuoy, CheckCircle2, Zap, Calendar } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { isToday, isThisWeek, isWithinInterval, subDays, startOfWeek, endOfWeek } from 'date-fns';

const KPI_CONFIG_OPEN = [
  { key: 'epics', label: 'Epics', icon: Zap, darkColor: 'text-purple-400', lightColor: 'text-purple-600', bg: 'rgba(168,85,247,0.15)', lightBg: 'rgb(243,232,255)' },
  { key: 'bugs', label: 'Bugs', icon: AlertCircle, darkColor: 'text-red-400', lightColor: 'text-red-600', bg: 'rgba(239,68,68,0.15)', lightBg: 'rgb(254,226,226)' },
  { key: 'support', label: 'Support', icon: LifeBuoy, darkColor: 'text-amber-400', lightColor: 'text-amber-600', bg: 'rgba(245,158,11,0.15)', lightBg: 'rgb(254,243,199)' },
  { key: 'bau', label: 'BAU Projects', icon: CheckCircle2, darkColor: 'text-green-400', lightColor: 'text-green-600', bg: 'rgba(16,185,129,0.15)', lightBg: 'rgb(209,250,229)' },
  { key: 'triage', label: 'Triage', icon: AlertCircle, darkColor: 'text-rose-400', lightColor: 'text-rose-600', bg: 'rgba(244,63,94,0.15)', lightBg: 'rgb(255,228,230)' },
  { key: 'total', label: 'Open Issues', icon: AlertCircle, darkColor: 'text-blue-400', lightColor: 'text-blue-600', bg: 'rgba(59,130,246,0.15)', lightBg: 'rgb(219,234,254)' },
  { key: 'createdToday', label: 'Created Today', icon: Calendar, darkColor: 'text-cyan-400', lightColor: 'text-cyan-600', bg: 'rgba(34,211,238,0.15)', lightBg: 'rgb(206,240,252)' },
  { key: 'createdThisWeek', label: 'Created This Week', icon: Calendar, darkColor: 'text-indigo-400', lightColor: 'text-indigo-600', bg: 'rgba(99,102,241,0.15)', lightBg: 'rgb(224,231,255)' },
  { key: 'createdLast30Days', label: 'Created Last 30 Days', icon: Calendar, darkColor: 'text-orange-400', lightColor: 'text-orange-600', bg: 'rgba(249,115,22,0.15)', lightBg: 'rgb(254,237,220)' },
];

const KPI_CONFIG_COMPLETED = [
  { key: 'epics', label: 'Epics', icon: Zap, darkColor: 'text-purple-400', lightColor: 'text-purple-600', bg: 'rgba(168,85,247,0.15)', lightBg: 'rgb(243,232,255)' },
  { key: 'bugs', label: 'Bugs', icon: AlertCircle, darkColor: 'text-red-400', lightColor: 'text-red-600', bg: 'rgba(239,68,68,0.15)', lightBg: 'rgb(254,226,226)' },
  { key: 'support', label: 'Support', icon: LifeBuoy, darkColor: 'text-amber-400', lightColor: 'text-amber-600', bg: 'rgba(245,158,11,0.15)', lightBg: 'rgb(254,243,199)' },
  { key: 'bau', label: 'BAU Projects', icon: CheckCircle2, darkColor: 'text-green-400', lightColor: 'text-green-600', bg: 'rgba(16,185,129,0.15)', lightBg: 'rgb(209,250,229)' },
  { key: 'total', label: 'Closed Issues', icon: AlertCircle, darkColor: 'text-blue-400', lightColor: 'text-blue-600', bg: 'rgba(59,130,246,0.15)', lightBg: 'rgb(219,234,254)' },
  { key: 'closedToday', label: 'Closed Today', icon: Calendar, darkColor: 'text-cyan-400', lightColor: 'text-cyan-600', bg: 'rgba(34,211,238,0.15)', lightBg: 'rgb(206,240,252)' },
  { key: 'closedThisWeek', label: 'Closed This Week', icon: Calendar, darkColor: 'text-indigo-400', lightColor: 'text-indigo-600', bg: 'rgba(99,102,241,0.15)', lightBg: 'rgb(224,231,255)' },
  { key: 'closedLast30Days', label: 'Closed Last 30 Days', icon: Calendar, darkColor: 'text-orange-400', lightColor: 'text-orange-600', bg: 'rgba(249,115,22,0.15)', lightBg: 'rgb(254,237,220)' },
];

export default function JiraIssuesKPIs({ issues = [], selectedKPI = null, onKPIClick = () => {}, activeTab = 'open' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Simple local date comparison (no timezone complexity)
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-GB'); // e.g., "03/06/2026"
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const thirtyDaysAgo = subDays(now, 30);
  
  const isCompleted = activeTab === 'completed';
  const KPI_CONFIG = isCompleted ? KPI_CONFIG_COMPLETED : KPI_CONFIG_OPEN;
  
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  const stats = {
    total: issues.length,
    bugs: issues.filter(i => i.issue_type === 'Bug').length,
    support: issues.filter(i => i.issue_type === 'Support').length,
    bau: issues.filter(i => i.issue_type === 'BAU Project').length,
    epics: issues.filter(i => i.issue_type === 'Epic').length,
    triage: issues.filter(i => String(i.issue_type || '').trim().toLowerCase() === 'triage').length,
    createdToday: issues.filter(i => {
      const date = parseDate(i.created_at);
      return date && date.toLocaleDateString('en-GB') === todayStr;
    }).length,
    createdThisWeek: issues.filter(i => {
      const date = parseDate(i.created_at);
      return date && isWithinInterval(date, { start: weekStart, end: weekEnd });
    }).length,
    createdLast30Days: issues.filter(i => {
      const date = parseDate(i.created_at);
      return date && isWithinInterval(date, { start: thirtyDaysAgo, end: now });
    }).length,
    closedToday: issues.filter(i => {
      const date = parseDate(i.resolved_at);
      return date && date.toLocaleDateString('en-GB') === todayStr;
    }).length,
    closedThisWeek: issues.filter(i => {
      const date = parseDate(i.resolved_at);
      return date && isWithinInterval(date, { start: weekStart, end: weekEnd });
    }).length,
    closedLast30Days: issues.filter(i => {
      const date = parseDate(i.resolved_at);
      return date && isWithinInterval(date, { start: thirtyDaysAgo, end: now });
    }).length,
  };

  const row1Size = isCompleted ? 4 : 5;
  const row1 = KPI_CONFIG.slice(0, row1Size);
  const row2 = KPI_CONFIG.slice(row1Size);

  const renderCard = (kpi, i) => (
    <motion.div
      key={kpi.key}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      onClick={() => onKPIClick(selectedKPI === kpi.key ? null : kpi.key)}
      className={`rounded-2xl p-4 border cursor-pointer transition-all hover:scale-105 ${
        selectedKPI === kpi.key
          ? isDark ? 'border-white/50 ring-2 ring-white/40 shadow-lg shadow-white/10' : 'border-slate-600 ring-2 ring-slate-400 shadow-lg shadow-slate-300'
          : isDark ? 'border-white/10 hover:border-white/20' : 'border-slate-200 hover:border-slate-300'
      }`}
      style={{ background: isDark ? kpi.bg : kpi.lightBg }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-slate-600'}`}>
            {kpi.label}
          </p>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats[kpi.key]}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? kpi.darkColor : kpi.lightColor}`} style={{ background: isDark ? kpi.bg : kpi.lightBg, border: `1px solid currentColor` }}>
          <kpi.icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className={`grid grid-cols-2 gap-4 ${isCompleted ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3 lg:grid-cols-5'}`}>
        {row1.map((kpi, i) => renderCard(kpi, i))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {row2.map((kpi, i) => renderCard(kpi, i + row1.length))}
      </div>
    </div>
  );
}