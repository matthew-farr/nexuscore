import { useState, useMemo, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeProvider';
import { DOC_TYPE_CONFIG } from './kbConfig';
import KBDocumentCard from './KBDocumentCard';

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: 'updated_desc', label: 'Recently Updated' },
  { value: 'updated_asc',  label: 'Oldest First' },
  { value: 'title_asc',    label: 'Title A–Z' },
  { value: 'views_desc',   label: 'Most Viewed' },
];

const STATUSES = ['Draft', 'Published', 'Under Review', 'Archived'];

export default function KBDocumentList({ documents, bookmarkedIds, onOpen, onToggleBookmark, categoryFilter, onClearCategory, externalSearch = '' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('updated_desc');
  const [page, setPage] = useState(1);

  // Reset local filters when tab changes
  const prevDocsRef = useRef(documents);
  if (prevDocsRef.current !== documents) {
    prevDocsRef.current = documents;
    if (typeFilter !== 'all') setTypeFilter('all');
    if (statusFilter !== 'all') setStatusFilter('all');
    if (sort !== 'updated_desc') setSort('updated_desc');
    setPage(1);
  }

  const docTypes = Object.keys(DOC_TYPE_CONFIG);

  const filtered = useMemo(() => {
    let result = [...documents];

    if (categoryFilter) result = result.filter(d => d.category === categoryFilter);

    if (externalSearch) {
      const q = externalSearch.toLowerCase();
      result = result.filter(d =>
        d.title?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q) ||
        d.doc_type?.toLowerCase().includes(q) ||
        d.owner?.toLowerCase().includes(q) ||
        d.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== 'all') result = result.filter(d => d.doc_type === typeFilter);
    if (statusFilter !== 'all') result = result.filter(d => d.status === statusFilter);

    if (sort === 'updated_desc') result.sort((a, b) => new Date(b.updated_date || 0) - new Date(a.updated_date || 0));
    else if (sort === 'updated_asc') result.sort((a, b) => new Date(a.updated_date || 0) - new Date(b.updated_date || 0));
    else if (sort === 'title_asc') result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    else if (sort === 'views_desc') result.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));

    return result;
  }, [documents, externalSearch, typeFilter, statusFilter, sort, categoryFilter]);

  // Reset to page 1 when filters change
  const prevFilterKey = useRef('');
  const filterKey = `${externalSearch}|${typeFilter}|${statusFilter}|${sort}|${categoryFilter}`;
  if (prevFilterKey.current !== filterKey) {
    prevFilterKey.current = filterKey;
    if (page !== 1) setPage(1);
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasActiveFilters = externalSearch || typeFilter !== 'all' || statusFilter !== 'all';

  const selectStyle = {
    background: isDark ? 'rgba(255,255,255,0.07)' : 'white',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#94a3b8'}`,
    color: isDark ? '#fff' : '#1e293b',
    fontWeight: isDark ? 'normal' : '500',
    boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
    colorScheme: isDark ? 'dark' : 'light',
    padding: '0 12px',
    height: '36px',
    borderRadius: '10px',
    fontSize: '12px',
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <div>
      {/* Toolbar — type, status, sort only (search is in hero) */}
      <div className="flex flex-wrap gap-2 mb-3">
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Types</option>
          {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={sort} onChange={e => setSort(e.target.value)} style={selectStyle}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Active category filter pill */}
      {categoryFilter && (
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-medium ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Category:</span>
          <button onClick={onClearCategory}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all"
            style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.30)' }}>
            {categoryFilter} <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Count + clear */}
      <div className={`flex items-center gap-3 text-xs mb-3 ${isDark ? 'text-white/50' : 'text-slate-400'}`}>
        <span>{filtered.length} document{filtered.length !== 1 ? 's' : ''}</span>
        {totalPages > 1 && <span>· page {page} of {totalPages}</span>}
        {hasActiveFilters && (
          <button
            onClick={() => { setTypeFilter('all'); setStatusFilter('all'); }}
            className={`underline underline-offset-2 ${isDark ? 'text-white/40 hover:text-white/70' : 'text-slate-400 hover:text-slate-700'}`}>
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📂</div>
          <p className={`text-sm ${isDark ? 'text-white/50' : 'text-slate-500'}`}>No documents found.</p>
          {hasActiveFilters && (
            <button
              onClick={() => { setTypeFilter('all'); setStatusFilter('all'); }}
              className="mt-3 text-xs text-purple-400 underline underline-offset-2"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paginated.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.25) }}
              >
                <KBDocumentCard
                  doc={doc}
                  onOpen={onOpen}
                  onToggleBookmark={onToggleBookmark}
                  isBookmarked={bookmarkedIds.has(doc.id)}
                />
              </motion.div>
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg transition-all disabled:opacity-30"
                style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'white', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1'}` }}>
                <ChevronLeft className={`w-4 h-4 ${isDark ? 'text-white/70' : 'text-slate-600'}`} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
                  style={p === page ? {
                    background: 'linear-gradient(135deg, #7c3aed, #ec2ca3)', color: 'white',
                  } : {
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'white',
                    color: isDark ? 'rgba(255,255,255,0.6)' : '#374151',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : '#cbd5e1'}`,
                  }}>
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg transition-all disabled:opacity-30"
                style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'white', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#cbd5e1'}` }}>
                <ChevronRight className={`w-4 h-4 ${isDark ? 'text-white/70' : 'text-slate-600'}`} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}