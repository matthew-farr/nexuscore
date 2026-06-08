import { motion } from 'framer-motion';
import { useTheme } from '../ThemeProvider';
import { DOC_TYPE_CONFIG } from './kbConfig';

const PINNED_KEYWORDS = [
  'DBS Selection',
  'ID Verification',
  'Applicant First-Time Login',
  'Applicant Password Reset',
  'Right to Work',
  'Digital ID',
];

function findDoc(documents, keyword) {
  const q = keyword.toLowerCase();
  return documents.find(d =>
    d.title?.toLowerCase().includes(q) ||
    d.tags?.some(t => t.toLowerCase().includes(q))
  );
}

export default function KBFrequentlyUsed({ documents, onOpen }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const published = documents.filter(d => d.status === 'Published');
  const matches = PINNED_KEYWORDS
    .map(kw => ({ kw, doc: findDoc(published, kw) }))
    .filter(x => !!x.doc);

  if (matches.length === 0) return null;

  return (
    <div className="mb-5">
      <p className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
        Frequently Used
      </p>
      <div className="flex gap-2 flex-wrap">
        {matches.map(({ kw, doc }, i) => {
          const typeConf = DOC_TYPE_CONFIG[doc.doc_type] || DOC_TYPE_CONFIG['Policy'];
          const Icon = typeConf.icon;
          return (
            <motion.button
              key={doc.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onOpen(doc)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : '#e2e8f0'}`,
                color: isDark ? 'rgba(255,255,255,0.75)' : '#374151',
                boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: typeConf.color }} />
              {doc.title}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}