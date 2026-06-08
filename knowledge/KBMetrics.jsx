import { motion } from 'framer-motion';
import { FileText, FolderOpen, Eye, RefreshCw } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

export default function KBMetrics({ documents }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const published = documents.filter(d => d.status === 'Published');
  const categories = [...new Set(published.map(d => d.category).filter(Boolean))];
  const totalViews = published.reduce((s, d) => s + (d.view_count || 0), 0);
  const recentlyUpdated = published.filter(d => {
    if (!d.updated_date) return false;
    return (Date.now() - new Date(d.updated_date).getTime()) < 30 * 24 * 60 * 60 * 1000;
  }).length;

  const cards = [
    { icon: FileText, label: 'Total Documents', value: published.length, color: '#ec2ca3', sub: `${documents.length} total` },
    { icon: FolderOpen, label: 'Categories', value: categories.length, color: '#7c3aed', sub: 'Active' },
    { icon: Eye, label: 'Total Views', value: totalViews.toLocaleString(), color: '#22d3ee', sub: 'All time' },
    { icon: RefreshCw, label: 'Recently Updated', value: recentlyUpdated, color: '#10b981', sub: 'Last 30 days' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl p-4"
            style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${card.color}20` }}>
                <Icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
            </div>
            <div className={`text-2xl font-bold mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{card.value}</div>
            <div className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{card.label}</div>
            <div className="text-xs mt-1" style={{ color: card.color }}>{card.sub}</div>
          </motion.div>
        );
      })}
    </div>
  );
}