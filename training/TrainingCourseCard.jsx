import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, CheckCircle2, AlertTriangle, ExternalLink, FileText, Code2, FileCheck2, Link2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { CATEGORY_COLOURS, CONTENT_TYPE_CONFIG, STATUS_STYLES, DIFFICULTY_STYLES, formatDuration, getEffectiveStatus } from './trainingConfig';

const CONTENT_ICONS = { html: Code2, pdf: FileText, word: FileText, checklist: FileCheck2, link: Link2 };

export default function TrainingCourseCard({ course, assignment, onOpen, index = 0, user = null }) {
  const [opening, setOpening] = useState(false);
  const cat = CATEGORY_COLOURS[course.category] || CATEGORY_COLOURS['Operations'];
  const ct = CONTENT_TYPE_CONFIG[course.content_type] || CONTENT_TYPE_CONFIG.html;
  const diff = DIFFICULTY_STYLES[course.difficulty] || DIFFICULTY_STYLES.Beginner;
  const status = getEffectiveStatus(assignment);
  const statusStyle = STATUS_STYLES[status];
  const progress = assignment?.progress_percentage || 0;
  const ContentIcon = CONTENT_ICONS[course.content_type] || FileText;

  const handleOpen = async (e) => {
    if (e) e.stopPropagation();
    setOpening(true);
    try {
      let currentAssignment = assignment;
      // If no assignment exists and user is logged in, create one (self-started course)
      if (!currentAssignment && user?.id) {
        const created = await base44.entities.TrainingAssignment.create({
          course_id: course.id,
          user_id: user.id,
          status: 'in_progress',
          progress_percentage: 0,
          assigned_date: new Date().toISOString().split('T')[0],
          started_at: new Date().toISOString(),
        });
        currentAssignment = created;
      }
      onOpen(course, currentAssignment);
    } finally {
      setOpening(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.24) }}
      className="rounded-2xl flex flex-col overflow-hidden group transition-all duration-200 hover:scale-[1.012] cursor-pointer"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
      onClick={handleOpen}
    >
      {/* Colour top strip */}
      <div className="h-1 w-full flex-shrink-0" style={{ background: `linear-gradient(90deg, ${cat.text}, ${ct.colour})` }} />

      <div className="p-4 flex-1 flex flex-col">
        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
            style={{ color: cat.text, background: cat.bg, borderColor: cat.border }}>
            {course.category}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1"
            style={{ color: ct.colour, background: ct.bg, borderColor: ct.border }}>
            <ContentIcon className="w-2.5 h-2.5" />{ct.label}
          </span>
          {course.is_mandatory && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border text-red-400 bg-red-500/10 border-red-500/30">
              Mandatory
            </span>
          )}
          {assignment && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ml-auto ${statusStyle.cls}`}>
              {statusStyle.label}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-white leading-snug mb-1.5">{course.title}</h3>

        {course.description && (
          <p className="text-xs leading-relaxed mb-3 line-clamp-2 flex-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {course.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(course.estimated_duration_minutes)}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${diff.cls}`}>{course.difficulty}</span>
        </div>

        {/* Due date */}
        {assignment?.due_date && status !== 'completed' && (
          <div className="flex items-center gap-1.5 text-xs mb-3">
            {status === 'overdue'
              ? <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
              : <Clock className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }} />}
            <span style={{ color: status === 'overdue' ? '#f87171' : 'rgba(255,255,255,0.45)' }}>
              Due {new Date(assignment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        )}

        {/* Progress bar */}
        {assignment && progress > 0 && (
          <div className="mb-3">
            <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: progress === 100 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#8b5cf6,#22d3ee)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Footer button */}
      <div className="px-4 pb-4">
        <button
          className="w-full flex items-center justify-center gap-1.5 h-8 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
          style={{ background: status === 'completed' ? 'rgba(16,185,129,0.20)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: status === 'completed' ? '1px solid rgba(16,185,129,0.30)' : 'none' }}
          onClick={handleOpen}
          disabled={opening}>
          {status === 'completed' ? <><CheckCircle2 className="w-3 h-3" /> View</> : <>{status === 'in_progress' ? 'Continue' : 'Open'} <ChevronRight className="w-3 h-3" /></>}
        </button>
      </div>
    </motion.div>
  );
}