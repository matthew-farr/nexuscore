import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, GraduationCap, ChevronRight, PlayCircle, Clock, AlertTriangle } from 'lucide-react';
import { formatDuration, CONTENT_TYPE_CONFIG, getEffectiveStatus } from './trainingConfig';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function TrainingHero({ user, continueCourse, continueAssignment, onOpen, onSearch }) {
  const [search, setSearch] = useState('');
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) onSearch(search.trim());
  };

  const status = getEffectiveStatus(continueAssignment);
  const progress = continueAssignment?.progress_percentage || 0;
  const ct = continueCourse ? CONTENT_TYPE_CONFIG[continueCourse.content_type] : null;

  return (
    <div className="relative overflow-hidden rounded-3xl mb-6"
      style={{
        background: 'linear-gradient(135deg, #0d0a1e 0%, #0f172a 50%, #0a0d1e 100%)',
        border: '1px solid rgba(139,92,246,0.25)',
        boxShadow: '0 0 60px rgba(139,92,246,0.12)',
      }}>
      <div className="absolute top-0 left-0 w-80 h-80 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 65%)', filter: 'blur(40px)', transform: 'translate(-35%,-35%)' }} />
      <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 65%)', filter: 'blur(40px)', transform: 'translate(30%,30%)' }} />

      <div className="relative z-10 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                style={{ background: 'rgba(139,92,246,0.20)', border: '1px solid rgba(139,92,246,0.35)', color: '#a78bfa' }}>
                <GraduationCap className="w-3 h-3" /> Learning Hub
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1 leading-tight">
              {getGreeting()},{' '}
              <span style={{ background: 'linear-gradient(90deg,#a78bfa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{firstName}</span>
            </h1>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.50)' }}>
              Complete your training, view courses and track your progress.
            </p>
            <form onSubmit={handleSearch} className="relative max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.30)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search training…"
                className="w-full pl-10 pr-4 h-10 rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-purple-500/40"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
            </form>
          </div>

          {/* Right: Continue Training card */}
          <div className="lg:w-64 flex-shrink-0">
            {continueCourse ? (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl p-4 h-full flex flex-col"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <PlayCircle className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Continue Training</span>
                </div>
                {ct && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-2 w-fit"
                    style={{ color: ct.colour, background: ct.bg, borderColor: ct.border }}>
                    {ct.label}
                  </span>
                )}
                <h3 className="text-sm font-bold text-white leading-snug mb-1">{continueCourse.title}</h3>
                <p className="text-xs mb-3 flex-1" style={{ color: 'rgba(255,255,255,0.40)' }}>{continueCourse.category}</p>
                {continueAssignment?.due_date && (
                  <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: status === 'overdue' ? '#f87171' : 'rgba(255,255,255,0.40)' }}>
                    {status === 'overdue' && <AlertTriangle className="w-3 h-3" />}
                    <span>Due {new Date(continueAssignment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>
                )}
                <div className="mb-1 flex justify-between text-xs">
                  <span style={{ color: 'rgba(255,255,255,0.40)' }}>Progress</span>
                  <span className="font-bold text-white">{progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.10)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#8b5cf6,#22d3ee)' }} />
                </div>
                <button onClick={() => onOpen(continueCourse, continueAssignment)}
                  className="flex items-center justify-center gap-1.5 w-full h-8 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
                  Continue <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ) : (
              <div className="rounded-2xl p-5 flex flex-col items-center justify-center text-center h-full min-h-[130px]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.10)' }}>
                <GraduationCap className="w-8 h-8 mb-2" style={{ color: 'rgba(139,92,246,0.40)' }} />
                <p className="text-xs text-white/40 font-medium">No training in progress</p>
                <p className="text-xs text-white/25 mt-1">Browse the library to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}