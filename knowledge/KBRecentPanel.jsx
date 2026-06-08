import { Clock } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { DOC_TYPE_CONFIG } from './kbConfig';
import { formatDistanceToNow } from 'date-fns';

export default function KBRecentPanel({ documents, onOpen }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const recent = [...documents]
    .filter(d => d.status === 'Published')
    .sort((a, b) => new Date(b.updated_date || 0) - new Date(a.updated_date || 0))
    .slice(0, 10);

  if (recent.length === 0) return null;

  return (
    <div className="rounded-xl overflow-hidden flex-shrink-0"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'white',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#cbd5e1'}`,
        boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.07)',
      }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }}>
        <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#22d3ee' }} />
        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
          Recent Updates
        </span>
      </div>
      <div className="py-1">
        {recent.map(doc => {
          const typeConf = DOC_TYPE_CONFIG[doc.doc_type] || DOC_TYPE_CONFIG['Policy'];
          const Icon = typeConf.icon;
          return (
            <button key={doc.id} onClick={() => onOpen(doc)}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 transition-all ${isDark ? 'hover:bg-white/05' : 'hover:bg-slate-50'}`}>
              <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: isDark ? typeConf.bg : typeConf.bg }}>
                <Icon className="w-3 h-3" style={{ color: typeConf.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate leading-snug ${isDark ? 'text-white/80' : 'text-slate-800'}`}>{doc.title}</p>
                <p className={`text-[10px] mt-0.5 ${isDark ? 'text-white/30' : 'text-slate-500'}`}>
                  {doc.updated_date ? formatDistanceToNow(new Date(doc.updated_date), { addSuffix: true }) : '—'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}