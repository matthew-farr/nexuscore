import { motion } from 'framer-motion';
import { useTheme } from '../ThemeProvider';
import { CATEGORIES } from './kbConfig';
import { format } from 'date-fns';

export default function KBCategoryGrid({ documents, onSelectCategory, selectedCategory }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getCategoryData = (label) => {
    const catDocs = documents.filter(d => d.category === label && d.status === 'Published');
    const count = catDocs.length;
    const lastUpdated = catDocs.reduce((latest, d) => {
      const t = d.updated_date ? new Date(d.updated_date) : null;
      return t && (!latest || t > latest) ? t : latest;
    }, null);
    return { count, lastUpdated };
  };

  return (
    <div className="mb-8">
      <h2 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Browse by Category</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {CATEGORIES.map((cat, i) => {
          const { count, lastUpdated } = getCategoryData(cat.label);
          const isSelected = selectedCategory === cat.label;
          return (
            <motion.button
              key={cat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelectCategory(isSelected ? null : cat.label)}
              className="text-left rounded-xl p-4 transition-all hover:scale-[1.02] hover:shadow-md"
              style={{
                background: isSelected
                  ? `${cat.color}20`
                  : isDark ? 'rgba(255,255,255,0.04)' : 'white',
                border: `1px solid ${isSelected ? cat.color + '55' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                boxShadow: isSelected ? `0 0 16px ${cat.color}20` : 'none',
              }}
            >
              {/* Icon + count row */}
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${cat.color}18` }}>
                  {cat.emoji}
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{ background: `${cat.color}18`, color: cat.color }}>
                  {count} {count === 1 ? 'doc' : 'docs'}
                </span>
              </div>

              {/* Name */}
              <div className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {cat.label}
              </div>

              {/* Description */}
              <div className={`text-xs leading-relaxed mb-2 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                {cat.description}
              </div>

              {/* Last updated */}
              {lastUpdated && (
                <div className="text-[10px]" style={{ color: cat.color + 'cc' }}>
                  Updated {format(lastUpdated, 'dd MMM yyyy')}
                </div>
              )}
              {!lastUpdated && count === 0 && (
                <div className={`text-[10px] ${isDark ? 'text-white/25' : 'text-slate-300'}`}>No documents yet</div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}