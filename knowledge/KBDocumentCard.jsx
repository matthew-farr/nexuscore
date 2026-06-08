import { Bookmark, BookmarkCheck, ExternalLink, Eye } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { DOC_TYPE_CONFIG, CATEGORIES } from './kbConfig';

export default function KBDocumentCard({ doc, onOpen, onToggleBookmark, isBookmarked }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const typeConf = DOC_TYPE_CONFIG[doc.doc_type] || DOC_TYPE_CONFIG['Policy'];
  const categoryConf = CATEGORIES.find(c => c.label === doc.category);
  const Icon = typeConf.icon;

  // Light mode badge styles — clean solid tones instead of washed-out rgba
  const badge = isDark
    ? (bg, color) => ({ background: bg, color })
    : (bg, color) => ({ background: '#f1f5f9', color: '#475569' });

  const statusBadge = isDark
    ? (darkCls) => darkCls
    : (darkCls, lightCls) => lightCls;

  return (
    <div
      className={`rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01] group ${!isDark ? 'hover:shadow-md' : ''}`}
      onClick={() => onOpen(doc)}
      style={{
        background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#cbd5e1'}`,
        boxShadow: isDark ? 'none' : '0 2px 6px rgba(0,0,0,0.07)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: isDark ? typeConf.bg : '#f1f5f9' }}>
          <Icon className="w-4 h-4" style={{ color: isDark ? typeConf.color : '#64748b' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-sm font-semibold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{doc.title}</h3>
            <button
              onClick={e => { e.stopPropagation(); onToggleBookmark(doc); }}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isBookmarked
                ? <BookmarkCheck className="w-4 h-4 text-purple-400" />
                : <Bookmark className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-slate-400'}`} />}
            </button>
          </div>
          {doc.description && (
            <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${isDark ? 'text-white/50' : 'text-slate-600'}`}>{doc.description}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            {/* Doc type */}
            <span className="text-xs px-2 py-0.5 rounded-md font-medium"
              style={isDark ? { background: typeConf.bg, color: typeConf.color } : { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
              {doc.doc_type}
            </span>
            {/* Category */}
            {doc.category && (
              <span className="text-xs px-2 py-0.5 rounded-md font-medium"
                style={isDark
                  ? { background: categoryConf ? (categoryConf.color + '26') : 'rgba(194,63,243,0.15)', color: categoryConf ? categoryConf.color : '#c23ff3' }
                  : { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                {categoryConf?.emoji} {doc.category}
              </span>
            )}
            {/* Version */}
            {doc.version && (
              <span className="text-xs px-2 py-0.5 rounded-md font-medium"
                style={isDark ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' } : { background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
                v{doc.version}
              </span>
            )}
            {/* View count */}
            {doc.view_count > 0 && (
              <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                <Eye className="w-3 h-3" />{doc.view_count}
              </span>
            )}
            {/* Status badges */}
            {doc.is_featured && (
              <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${isDark ? 'bg-pink-500/15 text-pink-400' : 'bg-pink-50 text-pink-600 border border-pink-200'}`}>Featured</span>
            )}
            {doc.is_pinned && (
              <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${isDark ? 'bg-cyan-500/15 text-cyan-400' : 'bg-sky-50 text-sky-600 border border-sky-200'}`}>Pinned</span>
            )}
            {doc.is_compliance_critical && (
              <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600 border border-red-200'}`}>Critical</span>
            )}
            {doc.is_internal_only && (
              <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${isDark ? 'bg-red-500/15 text-red-400' : 'bg-orange-50 text-orange-600 border border-orange-200'}`}>Internal Only</span>
            )}
            {doc.is_client_shareable && (
              <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${isDark ? 'bg-cyan-500/15 text-cyan-400' : 'bg-teal-50 text-teal-700 border border-teal-200'}`}>Client Shareable</span>
            )}
            {doc.is_applicant_shareable && (
              <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${isDark ? 'bg-green-500/15 text-green-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>Applicant Shareable</span>
            )}
            {doc.status === 'Archived' && (
              <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>Archived</span>
            )}
            {doc.status === 'Draft' && (
              <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${isDark ? 'bg-slate-500/15 text-slate-400' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>Draft</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}