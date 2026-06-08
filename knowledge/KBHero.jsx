import { motion } from 'framer-motion';
import { Sparkles, Search, X, Plus } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

const POPULAR_CHIPS = ['DBS', 'ID Checks', 'Password Reset', 'Right to Work', 'Digital ID', 'Applicant Support'];

export default function KBHero({ onAskAI, searchQuery, onSearchChange, isAdmin, onAdd }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="relative overflow-hidden rounded-2xl mb-5"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(124,58,237,0.40) 0%, rgba(236,44,163,0.28) 50%, rgba(34,211,238,0.18) 100%)'
          : 'linear-gradient(135deg, #ede9fe 0%, #fce7f3 50%, #dbeafe 100%)',
        border: `1px solid ${isDark ? 'rgba(124,58,237,0.45)' : '#c4b5fd'}`,
        boxShadow: isDark ? '0 0 40px rgba(124,58,237,0.15)' : '0 4px 24px rgba(124,58,237,0.18)',
      }}
    >
      {/* Ambient blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(236,44,163,0.35) 0%, transparent 70%)', filter: 'blur(40px)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.28) 0%, transparent 70%)', filter: 'blur(30px)', transform: 'translate(-20%, 20%)' }} />

      <div className="relative z-10 px-6 md:px-10 py-7">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-2"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.30)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className={`text-xs font-semibold tracking-wider uppercase ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Knowledge Base</span>
            </div>
            <h1 className={`text-2xl md:text-3xl font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Knowledge Base
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
              Policies, processes, user guides, templates and operational documentation.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="flex items-center gap-2 flex-shrink-0 pt-1">
            {isAdmin && (
              <button onClick={onAdd}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isDark ? 'bg-white/10 text-white/80 hover:bg-white/15 border border-white/10' : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300 shadow-sm'
                }`}>
                <Plus className="w-3.5 h-3.5" />
                Add Document
              </button>
            )}
            <button onClick={onAskAI}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-semibold whitespace-nowrap transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #ec2ca3)', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}>
              <Sparkles className="w-3.5 h-3.5" />
              Ask AI
            </button>
          </motion.div>
        </div>

        {/* Search bar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="relative max-w-2xl">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search documents, guides, policies, tags…"
            className="w-full pl-11 pr-10 h-11 rounded-xl text-sm outline-none transition-all"
            style={{
              background: isDark ? 'rgba(255,255,255,0.10)' : 'white',
              border: `1.5px solid ${searchQuery ? 'rgba(124,58,237,0.60)' : isDark ? 'rgba(255,255,255,0.18)' : '#c4b5fd'}`,
              color: isDark ? '#ffffff' : '#0f172a',
              boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.08)',
            }}
          />
          {searchQuery && (
            <button onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-opacity">
              <X className={`w-3.5 h-3.5 ${isDark ? 'text-white/50' : 'text-slate-400'}`} />
            </button>
          )}
        </motion.div>

        {/* Popular chips */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mt-3 flex-wrap">
          <span className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Popular:</span>
          {POPULAR_CHIPS.map(chip => (
            <button key={chip} onClick={() => onSearchChange(chip)}
              className="text-xs px-2.5 py-1 rounded-lg transition-all hover:opacity-90"
              style={isDark
                ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.12)' }
                : { background: 'white', color: '#4b5563', border: '1px solid #d1d5db', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', fontWeight: '500' }}>
              {chip}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}