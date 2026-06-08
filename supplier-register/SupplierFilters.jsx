import { Search, Star, X } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const TYPES = ['DBS Supplier', 'Software Platform', 'Payment Provider', 'HR System', 'Communication Tool', 'Analytics & BI', 'Identity & Verification', 'Government / Regulatory', 'Cloud & Infrastructure', 'Other'];
const STATUSES = ['Active', 'Under Review', 'Inactive'];
const DEPARTMENTS = ['Operations', 'Compliance', 'Sales', 'Finance', 'IT', 'HR', 'Management'];

export default function SupplierFilters({ search, setSearch, type, setType, status, setStatus, department, setDepartment, featuredOnly, setFeaturedOnly, onClear }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const inputCls = `h-9 rounded-xl border px-3 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-pink-500/50 ${
    isDark
      ? 'bg-white/[0.06] border-white/[0.12] text-white placeholder:text-white/35'
      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
  }`;

  const selectCls = `h-9 rounded-xl border px-3 text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-pink-500/50 ${
    isDark
      ? 'bg-white/[0.06] border-white/[0.12] text-white'
      : 'bg-white border-gray-200 text-gray-900'
  }`;

  const hasFilters = search || (type && type !== 'all') || (status && status !== 'all') || (department && department !== 'all') || featuredOnly;

  return (
    <div className={`rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-white border border-gray-200 shadow-sm'}`}>
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }} />
        <input
          className={`${inputCls} pl-9 w-full`}
          placeholder="Search suppliers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Type */}
      <select className={selectCls} value={type} onChange={e => setType(e.target.value)}>
        <option value="all">All Types</option>
        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      {/* Status */}
      <select className={selectCls} value={status} onChange={e => setStatus(e.target.value)}>
        <option value="all">All Statuses</option>
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      {/* Department */}
      <select className={selectCls} value={department} onChange={e => setDepartment(e.target.value)}>
        <option value="all">All Departments</option>
        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      {/* Featured Toggle */}
      <button
        onClick={() => setFeaturedOnly(!featuredOnly)}
        className={`h-9 px-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
          featuredOnly
            ? 'bg-pink-500/20 border-pink-500/40 text-pink-400'
            : isDark
              ? 'bg-white/[0.06] border-white/[0.12] text-white/60 hover:text-white'
              : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700'
        }`}
      >
        <Star className="w-3.5 h-3.5" />
        Featured
      </button>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={onClear}
          className={`h-9 px-3 rounded-xl border text-sm font-medium flex items-center gap-1.5 transition-all ${
            isDark ? 'bg-white/[0.06] border-white/[0.12] text-white/60 hover:text-white' : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700'
          }`}
        >
          <X className="w-3.5 h-3.5" /> Clear
        </button>
      )}
    </div>
  );
}