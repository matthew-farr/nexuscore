import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTheme } from '../ThemeProvider';
import { X, Eye } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReleaseViewersModal({ releaseId, isOpen, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { data: viewers = [], isLoading } = useQuery({
    queryKey: ['releaseViewers', releaseId],
    queryFn: () =>
      releaseId ? base44.entities.FeatureReleaseView.filter({ release_id: releaseId }, '-viewed_at', 200) : [],
    enabled: !!releaseId && isOpen,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={e => e.stopPropagation()}
            className={`rounded-2xl border max-w-md w-full max-h-[80vh] flex flex-col ${
              isDark
                ? 'border-white/10 bg-white/[0.02]'
                : 'border-slate-200 bg-white'
            }`}
          >
            {/* Header */}
            <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Viewed by {viewers.length}
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`p-1 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className={`w-6 h-6 border-2 rounded-full animate-spin ${isDark ? 'border-white/20 border-t-white/50' : 'border-slate-200 border-t-slate-600'}`} />
                </div>
              ) : viewers.length === 0 ? (
                <div className={`p-8 text-center text-sm ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                  No views yet
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}>
                  {viewers.map(viewer => (
                    <div
                      key={viewer.id}
                      className={`p-4 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {viewer.user_name || 'Unknown User'}
                            </p>
                            {viewer.staff_code && (
                              <p className={`text-xs font-mono px-2 py-0.5 rounded ${isDark ? 'bg-white/10 text-white/60' : 'bg-slate-100 text-slate-600'}`}>
                                {viewer.staff_code}
                              </p>
                            )}
                          </div>
                          {viewer.viewed_at && (
                            <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                              {formatInTimeZone(new Date(viewer.viewed_at), 'Europe/London', 'd MMM yyyy, HH:mm')}
                            </p>
                          )}
                        </div>
                        <div className={`text-xs font-mono flex-shrink-0 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                          {formatInTimeZone(new Date(viewer.viewed_at), 'Europe/London', 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}