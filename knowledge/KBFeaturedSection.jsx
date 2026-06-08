import { Star, Clock, Shield, Pin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeProvider';
import { DOC_TYPE_CONFIG } from './kbConfig';

function FeaturedCard({ doc, onOpen, label, labelColor }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const typeConf = DOC_TYPE_CONFIG[doc.doc_type] || DOC_TYPE_CONFIG['Policy'];
  const Icon = typeConf.icon;
  return (
    <div
      className="rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01]"
      onClick={() => onOpen(doc)}
      style={{
        background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: typeConf.bg }}>
          <Icon className="w-4 h-4" style={{ color: typeConf.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${labelColor}20`, color: labelColor }}>{label}</span>
          </div>
          <h4 className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{doc.title}</h4>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{doc.category}</p>
        </div>
      </div>
    </div>
  );
}

export default function KBFeaturedSection({ documents, onOpen }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const published = documents.filter(d => d.status === 'Published');
  const featured = published.filter(d => d.is_featured).slice(0, 4);
  const recent = [...published].sort((a, b) => new Date(b.updated_date || 0) - new Date(a.updated_date || 0)).slice(0, 4);
  const critical = published.filter(d => d.is_compliance_critical).slice(0, 4);
  const pinned = published.filter(d => d.is_pinned).slice(0, 4);

  const sections = [
    { title: 'Featured', icon: Star, color: '#ec2ca3', docs: featured },
    { title: 'Recently Updated', icon: Clock, color: '#7c3aed', docs: recent },
    { title: 'Compliance Critical', icon: Shield, color: '#ef4444', docs: critical },
    { title: 'Pinned', icon: Pin, color: '#22d3ee', docs: pinned },
  ].filter(s => s.docs.length > 0);

  if (sections.length === 0) return null;

  return (
    <div className="mb-8 space-y-6">
      {sections.map((section, si) => {
        const SIcon = section.icon;
        return (
          <motion.div key={section.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.05 }}>
            <div className="flex items-center gap-2 mb-3">
              <SIcon className="w-4 h-4" style={{ color: section.color }} />
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{section.title}</h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {section.docs.map(doc => (
                <FeaturedCard key={doc.id} doc={doc} onOpen={onOpen} label={section.title} labelColor={section.color} />
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}