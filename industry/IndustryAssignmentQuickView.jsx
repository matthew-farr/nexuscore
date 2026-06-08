import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/ThemeProvider';
import { X, Search, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

const OWNERS = ['Sam', 'Claire', 'Sandra'];

const OWNER_COLORS = {
  Sam:    { accent: '#ec2ca3', bg: 'rgba(236,44,163,0.12)', border: 'rgba(236,44,163,0.25)' },
  Claire: { accent: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)' },
  Sandra: { accent: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.25)'  },
};

export default function IndustryAssignmentQuickView({ isOpen, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setSearch('');
    setSelected(null);
    base44.entities.IndustryAssignment
      .filter({ status: 'Active' }, 'industry_name', 500)
      .then(data => setRecords(data || []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter(r => r.industry_name?.toLowerCase().includes(q) || r.owner?.toLowerCase().includes(q));
  }, [records, search]);

  const grouped = useMemo(() => {
    const map = {};
    OWNERS.forEach(o => { map[o] = []; });
    filtered.forEach(r => { if (map[r.owner]) map[r.owner].push(r); });
    return map;
  }, [filtered]);

  const isSearching = search.trim().length > 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(15,15,40,0.98) 0%, rgba(10,10,30,0.98) 100%)'
              : 'rgba(255,255,255,0.98)',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.12)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
            <div>
              <h2 className="text-lg font-bold" style={{ color: isDark ? '#fff' : '#0f0f2e' }}>
                Industry Assignment Manager
              </h2>
              <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
                {records.length} active industries across {OWNERS.length} owners
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }} />
            </button>
          </div>

          {/* Search */}
          <div className="px-6 py-3 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }} />
              <Input
                placeholder="Search industries or owners..."
                value={search}
                onChange={e => { setSearch(e.target.value); setSelected(null); }}
                className="pl-9 h-9"
                autoFocus
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Owner columns */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {OWNERS.map(owner => {
                    const col = OWNER_COLORS[owner];
                    const items = grouped[owner] || [];
                    if (isSearching && items.length === 0) return null;
                    return (
                      <div
                        key={owner}
                        className="rounded-xl p-4"
                        style={{ background: col.bg, border: `1px solid ${col.border}` }}
                      >
                        {/* Owner header */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: col.accent }}>
                            {owner[0]}
                          </div>
                          <span className="font-semibold text-sm" style={{ color: col.accent }}>{owner}</span>
                          <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${col.accent}20`, color: col.accent }}>
                            {items.length}
                          </span>
                        </div>

                        {/* Industries list */}
                        <div className="space-y-1">
                          {items.length === 0 ? (
                            <p className="text-xs py-2" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>No matches</p>
                          ) : items.map(r => (
                            <button
                              key={r.id}
                              onClick={() => setSelected(selected?.id === r.id ? null : r)}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between group transition-all"
                              style={{
                                background: selected?.id === r.id ? `${col.accent}25` : 'transparent',
                                color: isDark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.75)',
                                border: selected?.id === r.id ? `1px solid ${col.accent}40` : '1px solid transparent',
                              }}
                              onMouseEnter={e => { if (selected?.id !== r.id) e.currentTarget.style.background = `${col.accent}15`; }}
                              onMouseLeave={e => { if (selected?.id !== r.id) e.currentTarget.style.background = 'transparent'; }}
                            >
                              <span>{r.industry_name}</span>
                              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Detail panel */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, x: 20, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 260 }}
                  exit={{ opacity: 0, x: 20, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 border-l overflow-hidden"
                  style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
                >
                  <div className="p-5 h-full overflow-y-auto" style={{ width: 260 }}>
                    <div className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>
                        Industry Detail
                      </p>
                      <h3 className="text-sm font-bold leading-snug" style={{ color: isDark ? '#fff' : '#0f0f2e' }}>
                        {selected.industry_name}
                      </h3>
                    </div>

                    {[
                      { label: 'Owner', value: selected.owner, color: OWNER_COLORS[selected.owner]?.accent },
                      { label: 'Status', value: selected.status },
                      { label: 'Notes', value: selected.notes || '—' },
                      { label: 'Last Updated', value: selected.updated_date ? format(new Date(selected.updated_date), 'dd MMM yyyy') : '—' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="mb-3">
                        <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>{label}</p>
                        <p className="text-sm font-medium mt-0.5" style={{ color: color || (isDark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.75)') }}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}