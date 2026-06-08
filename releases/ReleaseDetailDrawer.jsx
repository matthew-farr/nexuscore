import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pencil, Trash2, Calendar, Tag, Star, User, BookOpen, Zap, Lightbulb, ArrowRight, Info, ExternalLink, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useTheme } from '../ThemeProvider';

const CATEGORY_CONFIG = {
  'New Feature':     { dot: '#a855f7', badge: { dark: 'bg-purple-500/20 text-purple-300 border-purple-500/30', light: 'bg-purple-100 text-purple-700 border-purple-200' }, label: '✨ New Feature' },
  'Improvement':     { dot: '#22d3ee', badge: { dark: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',       light: 'bg-cyan-100 text-cyan-700 border-cyan-200' }, label: '⚡ Improvement' },
  'Bug Fix':         { dot: '#f87171', badge: { dark: 'bg-red-500/20 text-red-300 border-red-500/30',           light: 'bg-red-100 text-red-700 border-red-200' }, label: '🐛 Bug Fix' },
  'Security Update': { dot: '#fb923c', badge: { dark: 'bg-orange-500/20 text-orange-300 border-orange-500/30', light: 'bg-orange-100 text-orange-700 border-orange-200' }, label: '🔒 Security Update' },
  'Internal Update': { dot: '#94a3b8', badge: { dark: 'bg-slate-500/20 text-slate-300 border-slate-500/30',   light: 'bg-slate-100 text-slate-600 border-slate-200' }, label: '🔧 Internal Update' },
};

function Section({ icon, colorDark, colorLight, bgDark, bgLight, label, isDark, children }) {
  return (
    <div>
      <div className={`flex items-center gap-2 mb-2 ${isDark ? colorDark : colorLight}`}>
        {icon}
        <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
      </div>
      <div className={`rounded-xl p-4 border ${isDark ? bgDark : bgLight}`}>
        {children}
      </div>
    </div>
  );
}

export default function ReleaseDetailDrawer({ release, guide, isOpen, onClose, isAdmin, onEdit, onDelete, onOpenGuide, onEditGuide, viewCount, onViewersClick }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!release) return null;
  const config = CATEGORY_CONFIG[release.category] || CATEGORY_CONFIG['Internal Update'];

  const notes = release.release_notes || release.description || '';

  // Parse structured sections from release_notes if guide is not available
  // Try to render structured content from the guide or fall back to raw notes
  const hasGuide = !!guide;
  const guidePublished = guide?.status === 'Published';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className={`fixed right-0 top-0 h-full w-full max-w-lg z-50 flex flex-col shadow-2xl ${isDark ? 'bg-[#0d1026] border-l border-white/10' : 'bg-white border-l border-slate-200'}`}
          >
            {/* Header */}
            <div className={`flex items-start justify-between gap-4 px-6 py-5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isDark ? config.badge.dark : config.badge.light}`}>
                    {config.label}
                  </span>
                  {(release.is_major_release || release.is_highlighted) && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${isDark ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                      <Star className="w-3 h-3" /> Major Launch
                    </span>
                  )}
                  {release.status === 'draft' && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isDark ? 'bg-white/10 text-white/50 border-white/10' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      Draft
                    </span>
                  )}
                </div>
                <h2 className={`text-lg font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{release.title}</h2>
              </div>
              <button onClick={onClose} className={`p-2 rounded-xl transition-colors flex-shrink-0 ${isDark ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Meta */}
            <div className={`px-6 py-3 border-b flex items-center gap-5 flex-wrap ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              {release.release_date && (
                <div className="flex items-center gap-2">
                  <Calendar className={`w-3.5 h-3.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
                  <span className={`text-sm ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                    {format(new Date(release.release_date), 'd MMMM yyyy')}
                  </span>
                </div>
              )}
              {release.app_version_number && (
                <div className="flex items-center gap-2">
                  <Tag className={`w-3.5 h-3.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
                  <span className={`text-sm font-mono font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>{release.app_version_number}</span>
                </div>
              )}
              {release.author_name && (
                <div className="flex items-center gap-2">
                  <User className={`w-3.5 h-3.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
                  <span className={`text-sm ${isDark ? 'text-white/60' : 'text-slate-600'}`}>{release.author_name}</span>
                </div>
              )}
              {(viewCount > 0 || release.view_count > 0) && (
                <button
                  onClick={() => isAdmin && onViewersClick && onViewersClick()}
                  className={`flex items-center gap-2 ${isAdmin ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  title={isAdmin ? 'View who saw this release' : ''}
                >
                  <Eye className={`w-3.5 h-3.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
                  <span className={`text-sm ${isDark ? 'text-white/60' : 'text-slate-600'}`}>{viewCount || release.view_count} view{(viewCount || release.view_count) !== 1 ? 's' : ''}</span>
                </button>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Mini Guide CTA for staff (if guide published) */}
              {guidePublished && !isAdmin && (
                <button
                  onClick={() => onOpenGuide(guide)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border transition-all hover:opacity-90"
                  style={{
                    background: isDark ? 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.08))' : 'linear-gradient(135deg, rgba(139,92,246,0.07), rgba(99,102,241,0.04))',
                    borderColor: isDark ? 'rgba(139,92,246,0.35)' : 'rgba(139,92,246,0.25)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className={`text-xs font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Open Mini Guide</p>
                      <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Step-by-step guide for staff</p>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </button>
              )}

              {/* Admin guide status indicator */}
              {isAdmin && (
                <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${isDark ? 'border-white/8 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <BookOpen className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
                    <span className={`text-xs font-semibold ${isDark ? 'text-white/50' : 'text-slate-600'}`}>
                      Mini Guide: {hasGuide ? <span className={guide.status === 'Published' ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-amber-400' : 'text-amber-600')}>{guide.status}</span> : <span className={isDark ? 'text-white/30' : 'text-slate-400'}>None</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasGuide && (
                      <button
                        onClick={() => onOpenGuide(guide)}
                        className={`px-3 h-7 rounded-lg text-xs font-semibold transition-colors ${isDark ? 'bg-white/8 text-white/60 hover:bg-white/12 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        Preview
                      </button>
                    )}
                    <button
                      onClick={() => onEditGuide(release, guide || null)}
                      className="px-3 h-7 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
                    >
                      {hasGuide ? 'Edit Guide' : '+ Add Guide'}
                    </button>
                  </div>
                </div>
              )}

              {/* Structured guide sections (from guide if available, else raw notes) */}
              {hasGuide ? (
                <>
                  {guide.summary && (
                    <div className={`rounded-xl p-4 border ${isDark ? 'bg-white/[0.03] border-white/8' : 'bg-slate-50 border-slate-200'}`}>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-white/80' : 'text-slate-700'}`}>{guide.summary}</p>
                    </div>
                  )}
                  {guide.what_changed && (
                    <Section icon={<Zap className="w-3.5 h-3.5" />} colorDark="text-cyan-400" colorLight="text-cyan-600" bgDark="bg-cyan-500/10 border-cyan-500/20" bgLight="bg-cyan-50 border-cyan-200" label="What Changed" isDark={isDark}>
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-white/75' : 'text-slate-700'}`}>{guide.what_changed}</p>
                    </Section>
                  )}
                  {guide.why_it_matters && (
                    <Section icon={<Lightbulb className="w-3.5 h-3.5" />} colorDark="text-yellow-400" colorLight="text-yellow-600" bgDark="bg-yellow-500/10 border-yellow-500/20" bgLight="bg-yellow-50 border-yellow-200" label="Why It Matters" isDark={isDark}>
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-white/75' : 'text-slate-700'}`}>{guide.why_it_matters}</p>
                    </Section>
                  )}
                  {guide.how_to_use_steps?.length > 0 && (
                    <Section icon={<ArrowRight className="w-3.5 h-3.5" />} colorDark="text-purple-400" colorLight="text-purple-600" bgDark="bg-purple-500/10 border-purple-500/20" bgLight="bg-purple-50 border-purple-200" label="How To Use It" isDark={isDark}>
                      <ol className="space-y-2">
                        {guide.how_to_use_steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff' }}>{i + 1}</span>
                            <span className={`text-sm ${isDark ? 'text-white/75' : 'text-slate-700'}`}>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </Section>
                  )}
                  {guide.what_to_expect && (
                    <Section icon={<Info className="w-3.5 h-3.5" />} colorDark="text-green-400" colorLight="text-green-600" bgDark="bg-green-500/10 border-green-500/20" bgLight="bg-green-50 border-green-200" label="What To Expect" isDark={isDark}>
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-white/75' : 'text-slate-700'}`}>{guide.what_to_expect}</p>
                    </Section>
                  )}
                  {guide.related_page_url && (
                    <a
                      href={guide.related_page_url}
                      target={guide.related_page_url.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-semibold border transition-all hover:opacity-90 w-full justify-center ${isDark ? 'border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20' : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Related Page
                    </a>
                  )}
                </>
              ) : notes ? (
                <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                  {notes}
                </div>
              ) : (
                <p className={`text-sm italic ${isDark ? 'text-white/30' : 'text-slate-400'}`}>No release notes provided.</p>
              )}
            </div>

            {/* Admin actions */}
            {isAdmin && (
              <div className={`px-6 py-4 border-t flex items-center gap-3 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <button
                  onClick={() => { onEdit(release); onClose(); }}
                  className={`flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-semibold transition-colors ${isDark ? 'bg-white/8 text-white hover:bg-white/12' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Release
                </button>
                <button
                  onClick={() => { onDelete(release); onClose(); }}
                  className={`flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-semibold transition-colors ${isDark ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}