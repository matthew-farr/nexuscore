import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, ArrowRight, ExternalLink, CheckCircle2, Lightbulb, Zap, Info } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

export default function MiniGuideDrawer({ guide, release, isOpen, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      {isOpen && guide && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className={`fixed right-0 top-0 h-full w-full max-w-lg z-50 flex flex-col shadow-2xl ${
              isDark ? 'bg-[#0a0e1f] border-l border-white/10' : 'bg-white border-l border-slate-200'
            }`}
          >
            {/* Header */}
            <div
              className="px-6 py-5 flex items-start justify-between gap-4 border-b"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.08))'
                  : 'linear-gradient(135deg, rgba(139,92,246,0.07), rgba(99,102,241,0.04))',
                borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgb(226,232,240)',
              }}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    Mini Guide
                  </p>
                  <h2 className={`text-base font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {guide.title}
                  </h2>
                  {guide.feature_area && (
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{guide.feature_area}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors flex-shrink-0 ${isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Summary */}
              {guide.summary && (
                <div className={`rounded-xl p-4 border ${isDark ? 'bg-white/[0.03] border-white/8' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-white/80' : 'text-slate-700'}`}>{guide.summary}</p>
                </div>
              )}

              {/* What Changed */}
              {guide.what_changed && (
                <Section
                  icon={<Zap className="w-4 h-4" />}
                  color="text-cyan-400"
                  lightColor="text-cyan-600"
                  bg={isDark ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-50 border-cyan-200'}
                  label="What Changed"
                  isDark={isDark}
                >
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-white/75' : 'text-slate-700'}`}>
                    {guide.what_changed}
                  </p>
                </Section>
              )}

              {/* Why It Matters */}
              {guide.why_it_matters && (
                <Section
                  icon={<Lightbulb className="w-4 h-4" />}
                  color="text-yellow-400"
                  lightColor="text-yellow-600"
                  bg={isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'}
                  label="Why It Matters"
                  isDark={isDark}
                >
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-white/75' : 'text-slate-700'}`}>
                    {guide.why_it_matters}
                  </p>
                </Section>
              )}

              {/* How To Use */}
              {guide.how_to_use_steps?.length > 0 && (
                <Section
                  icon={<ArrowRight className="w-4 h-4" />}
                  color="text-purple-400"
                  lightColor="text-purple-600"
                  bg={isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'}
                  label="How To Use It"
                  isDark={isDark}
                >
                  <ol className="space-y-2.5 mt-1">
                    {guide.how_to_use_steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
                          style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff' }}
                        >
                          {i + 1}
                        </span>
                        <span className={`text-sm leading-relaxed ${isDark ? 'text-white/75' : 'text-slate-700'}`}>{step}</span>
                      </li>
                    ))}
                  </ol>
                </Section>
              )}

              {/* What To Expect */}
              {guide.what_to_expect && (
                <Section
                  icon={<Info className="w-4 h-4" />}
                  color="text-green-400"
                  lightColor="text-green-600"
                  bg={isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'}
                  label="What To Expect"
                  isDark={isDark}
                >
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-white/75' : 'text-slate-700'}`}>
                    {guide.what_to_expect}
                  </p>
                </Section>
              )}

              {/* Screenshots */}
              {guide.screenshots?.length > 0 && (
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Screenshots</p>
                  <div className="space-y-3">
                    {guide.screenshots.map((url, i) => (
                      <img key={i} src={url} alt={`Screenshot ${i + 1}`} className="w-full rounded-xl border object-cover" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgb(226,232,240)' }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Related Page Link */}
              {guide.related_page_url && (
                <a
                  href={guide.related_page_url}
                  target={guide.related_page_url.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold border transition-all hover:opacity-90 w-full justify-center ${
                    isDark ? 'border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20' : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Related Page
                </a>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ icon, color, lightColor, bg, label, isDark, children }) {
  return (
    <div>
      <div className={`flex items-center gap-2 mb-2.5 ${isDark ? color : lightColor}`}>
        {icon}
        <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
      </div>
      <div className={`rounded-xl p-4 border ${bg}`}>
        {children}
      </div>
    </div>
  );
}