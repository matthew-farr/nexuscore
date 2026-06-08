import { motion } from 'framer-motion';
import { FileText, Clock, Shield, Bookmark } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

export default function KBKPIRow({ documents, bookmarkedIds, activeKpi, onSelect }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const published = documents.filter(d => d.status === 'Published');
  const recentCount = published.filter(d => {
    if (!d.updated_date) return false;
    return (Date.now() - new Date(d.updated_date).getTime()) < 30 * 24 * 60 * 60 * 1000;
  }).length;
  const complianceCount = published.filter(d => d.is_compliance_critical).length;
  const savedCount = bookmarkedIds.size;

  const cards = [
    { key: 'all',        label: 'All Documents',      count: published.length, icon: FileText, color: '#7c3aed' },
    { key: 'recent',     label: 'Recently Updated',   count: recentCount,      icon: Clock,    color: '#22d3ee' },
    { key: 'compliance', label: 'Compliance Critical', count: complianceCount,  icon: Shield,   color: '#ef4444' },
    { key: 'saved',      label: 'My Saved',           count: savedCount,       icon: Bookmark, color: '#10b981' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const isActive = activeKpi === card.key;
        return (
          <motion.button
            key={card.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onSelect(card.key)}
            className="text-left rounded-xl p-4 transition-all hover:scale-[1.02]"
            style={{
              background: isActive
                ? isDark ? `${card.color}22` : `${card.color}12`
                : isDark ? 'rgba(255,255,255,0.04)' : 'white',
              border: `1px solid ${isActive ? card.color + '55' : isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
              boxShadow: isActive
                ? `0 0 16px ${card.color}25`
                : isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${card.color}20` }}>
                <Icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              {isActive && (
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: card.color }} />
              )}
            </div>
            <div className={`text-xl font-bold mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {card.count}
            </div>
            <div className={`text-xs font-medium ${isDark ? 'text-white/55' : 'text-slate-500'}`}>
              {card.label}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}