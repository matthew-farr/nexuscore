import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ExternalLink, Download, Maximize2, Minimize2, AlertTriangle, Clock, FileText, Code2, FileCheck2, Link2, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { CATEGORY_COLOURS, CONTENT_TYPE_CONFIG, STATUS_STYLES, formatDuration, getEffectiveStatus, daysUntil } from './trainingConfig';
import { toast } from 'sonner';

// Generate certificate HTML
const generateCertificateHtml = (courseTitle, userName, completionDate, certId) => `
<html>
<head>
  <style>
    body { margin: 0; padding: 20px; font-family: 'Georgia', serif; background: #f5f5f5; }
    .certificate { max-width: 900px; margin: 0 auto; background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); border: 3px solid #d4af37; padding: 60px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .header { color: #8b5cf6; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 30px; }
    .title { font-size: 48px; color: #1f2937; margin: 30px 0; font-weight: bold; }
    .subtitle { font-size: 20px; color: #6b7280; margin: 20px 0; }
    .course { font-size: 28px; color: #8b5cf6; margin: 30px 0; font-weight: bold; }
    .details { color: #6b7280; font-size: 14px; margin: 30px 0; line-height: 1.8; }
    .signature { margin-top: 40px; border-top: 2px solid #d4af37; padding-top: 20px; color: #6b7280; }
    .cert-id { font-size: 12px; color: #9ca3af; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">Certificate of Completion</div>
    <div class="title">This is to certify that</div>
    <div class="subtitle">${userName}</div>
    <div class="course">has successfully completed</div>
    <div class="course">${courseTitle}</div>
    <div class="details">
      <p>Completion Date: ${new Date(completionDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p style="margin-top: 20px;">This certificate is awarded in recognition of demonstrated competency and dedication to professional development.</p>
    </div>
    <div class="signature">
      <p style="margin: 0;">Checks Direct Training Program</p>
      <div class="cert-id">Certificate ID: ${certId}</div>
    </div>
  </div>
</body>
</html>
`;

// ── Checklist Viewer ──────────────────────────────────────────────────────────
function ChecklistViewer({ course, assignment, user, onComplete }) {
  const [items, setItems] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!course?.id || !user?.id) return;
    Promise.all([
      base44.entities.TrainingChecklistItem.filter({ course_id: course.id }),
      base44.entities.TrainingChecklistProgress.filter({ course_id: course.id, user_id: user.id }),
    ]).then(([itemsData, progressData]) => {
      const sorted = [...itemsData].sort((a, b) => (a.item_order || 0) - (b.item_order || 0));
      setItems(sorted);
      const pMap = {};
      progressData.forEach(p => { pMap[p.checklist_item_id] = p; });
      setProgress(pMap);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [course?.id, user?.id]);

  const toggleItem = async (item) => {
    const existing = progress[item.id];
    const nowCompleted = !existing?.is_completed;
    let updated = { ...progress };

    if (existing) {
      await base44.entities.TrainingChecklistProgress.update(existing.id, {
        is_completed: nowCompleted,
        completed_at: nowCompleted ? new Date().toISOString() : null,
      });
      updated[item.id] = { ...existing, is_completed: nowCompleted };
    } else {
      const created = await base44.entities.TrainingChecklistProgress.create({
        course_id: course.id,
        checklist_item_id: item.id,
        user_id: user.id,
        is_completed: true,
        completed_at: new Date().toISOString(),
      });
      updated[item.id] = created;
    }
    setProgress(updated);

    // Check if all required items done
    const allRequired = items.filter(i => i.is_required);
    const allDone = allRequired.every(i => updated[i.id]?.is_completed);
    if (allDone) onComplete();
  };

  if (loading) return <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" /></div>;

  const requiredCount = items.filter(i => i.is_required).length;
  const doneCount = items.filter(i => i.is_required && progress[i.id]?.is_completed).length;
  const pct = requiredCount > 0 ? Math.round((doneCount / requiredCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.20)' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Progress</p>
          <span className="text-xs font-bold text-white">{doneCount}/{requiredCount} required items</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#10b981,#34d399)' }} />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map(item => {
          const done = progress[item.id]?.is_completed;
          return (
            <div key={item.id}
              className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all hover:bg-white/5"
              style={{ background: done ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)', border: done ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.08)' }}
              onClick={() => toggleItem(item)}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all ${done ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'}`}>
                {done && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium transition-all ${done ? 'text-emerald-400 line-through' : 'text-white'}`}>{item.title}</p>
                {item.description && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.description}</p>}
                {item.is_required && !done && <span className="text-[10px] text-red-400 font-medium">Required</span>}
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-center py-8 text-white/30 text-sm">No checklist items found.</p>}
      </div>
    </div>
  );
}

// ── PDF Viewer ────────────────────────────────────────────────────────────────
function PdfViewer({ course }) {
  const src = course.file_url;
  if (!src) return (
    <div className="flex flex-col items-center justify-center h-60 text-center p-8">
      <FileText className="w-12 h-12 mb-4" style={{ color: 'rgba(239,68,68,0.40)' }} />
      <p className="text-sm font-medium text-white/60 mb-1">PDF Document</p>
      <p className="text-xs text-white/30">No PDF uploaded yet. An admin can upload the file.</p>
    </div>
  );
  return (
    <div className="flex flex-col h-[65vh] min-h-[400px]">
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ background: 'rgba(0,0,0,0.40)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="text-xs text-white/50">PDF Document</span>
        <a href={src} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-80"
          style={{ background: 'rgba(239,68,68,0.30)', border: '1px solid rgba(239,68,68,0.40)' }}>
          <ExternalLink className="w-3 h-3" /> Open in new tab
        </a>
      </div>
      <iframe src={`${src}#view=FitH`} className="flex-1 w-full border-0" title={course.title} />
    </div>
  );
}

// ── Word Viewer ───────────────────────────────────────────────────────────────
function WordViewer({ course }) {
  const src = course.file_url;
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.30)' }}>
        <FileText className="w-9 h-9 text-blue-400" />
      </div>
      <h3 className="text-base font-bold text-white mb-1">{course.title}</h3>
      <p className="text-sm text-white/45 mb-6 max-w-sm">This training is provided as a Word document. Open or download the file to read it, then mark as complete.</p>
      <div className="flex gap-3">
        {src ? (
          <>
            <a href={src} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 h-9 rounded-xl text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              <ExternalLink className="w-3.5 h-3.5" /> Open Document
            </a>
            <a href={src} download
              className="flex items-center gap-2 px-5 h-9 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.30)', color: '#93c5fd' }}>
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          </>
        ) : (
          <p className="text-xs text-white/30">No file uploaded yet.</p>
        )}
      </div>
    </div>
  );
}

// ── Link Viewer ───────────────────────────────────────────────────────────────
function LinkViewer({ course }) {
  const url = course.external_url;
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.30)' }}>
        <Link2 className="w-9 h-9 text-amber-400" />
      </div>
      <h3 className="text-base font-bold text-white mb-1">{course.title}</h3>
      <p className="text-sm text-white/45 mb-2 max-w-sm">{course.description}</p>
      {url && <p className="text-xs text-amber-400/70 mb-6 truncate max-w-xs">{url}</p>}
      <p className="text-xs text-white/30 mb-6">This training opens in an external website. Click the link below to complete it, then mark as complete.</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 h-10 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          <ExternalLink className="w-4 h-4" /> Open External Link
        </a>
      ) : (
        <p className="text-xs text-white/30">No URL set yet.</p>
      )}
    </div>
  );
}

// ── Full-Screen HTML Player ───────────────────────────────────────────────────
function FullScreenHtmlPlayer({ course, assignment, user, onClose, onCompleted }) {
  const [htmlContent, setHtmlContent] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [justCompleted, setJustCompleted] = useState(false);
  const [fallbackEnabled, setFallbackEnabled] = useState(false);
  const iframeRef = useRef(null);
  const fallbackTimerRef = useRef(null);
  const queryClient = useQueryClient();

  const fileUrl = course.file_url;
  const status = getEffectiveStatus(assignment);
  const canMarkComplete = scrollProgress >= 75 || fallbackEnabled || status === 'completed' || justCompleted;

  // Fetch HTML text from the uploaded file URL
  useEffect(() => {
    if (!fileUrl) return;
    setLoading(true);
    setFetchError(false);
    fetch(fileUrl)
      .then(r => {
        if (!r.ok) throw new Error('fetch failed');
        return r.text();
      })
      .then(text => { setHtmlContent(text); setLoading(false); })
      .catch(() => { setFetchError(true); setLoading(false); });
  }, [fileUrl]);

  // postMessage listener — handle internal completion signals
  useEffect(() => {
    const handler = (e) => {
      if (['lessonComplete', 'LESSON_COMPLETE', 'completeLesson'].includes(e.data?.type || e.data)) {
        setScrollProgress(100);
        setFallbackEnabled(true);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Track iframe scroll progress (75% threshold) + fallback timer + intercept anchor links
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !htmlContent) return;

    const onIframeLoad = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;

        const onScroll = () => {
          try {
            const scrollTop = iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop;
            const scrollHeight = iframeDoc.documentElement.scrollHeight || iframeDoc.body.scrollHeight;
            const clientHeight = iframeDoc.documentElement.clientHeight || iframeDoc.body.clientHeight;
            const scrollableHeight = scrollHeight - clientHeight;
            
            if (scrollableHeight <= 0) {
              setScrollProgress(100);
              return;
            }
            
            const progress = Math.round((scrollTop / scrollableHeight) * 100);
            setScrollProgress(Math.min(progress, 100));
          } catch (_) { }
        };

        // Intercept internal anchor links inside iframe
        try {
          const anchors = iframeDoc.querySelectorAll('a[href^="#"]');
          anchors.forEach(link => {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              const id = link.getAttribute('href').replace('#', '');
              const target = iframeDoc.getElementById(id);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            });
          });
        } catch (_) { }

        iframeDoc.addEventListener('scroll', onScroll);
        return () => iframeDoc.removeEventListener('scroll', onScroll);
      } catch (_) { }
    };

    iframe.addEventListener('load', onIframeLoad);
    
    // Fallback: enable after 60 seconds if scroll tracking fails
    if (!fallbackEnabled) {
      fallbackTimerRef.current = setTimeout(() => {
        setFallbackEnabled(true);
      }, 60000);
    }

    return () => {
      iframe.removeEventListener('load', onIframeLoad);
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, [htmlContent, fallbackEnabled]);

  const markComplete = useCallback(async () => {
    if (marking || status === 'completed' || !canMarkComplete) return;
    setMarking(true);
    try {
      const now = new Date().toISOString();
      
      // Create or update assignment if user started but wasn't formally assigned
      let assignmentId = assignment?.id;
      if (!assignmentId && user?.id) {
        const created = await base44.entities.TrainingAssignment.create({
          course_id: course.id,
          user_id: user.id,
          status: 'completed',
          progress_percentage: 100,
          completed_at: now,
          assigned_date: now.split('T')[0],
        });
        assignmentId = created.id;
      } else if (assignmentId) {
        await base44.entities.TrainingAssignment.update(assignmentId, {
          status: 'completed',
          progress_percentage: 100,
          completed_at: now,
        });
      }

      // Issue certificate if enabled
      if (course?.certificate_enabled && user?.id) {
        const existing = await base44.entities.TrainingCertificate.filter({ course_id: course.id, user_id: user.id });
        if (existing.length > 0 && existing[0].certificate_url) {
          // Certificate already exists with URL, skip
          return;
        }

        const certId = `CERT-${course.id}-${user.id}-${Date.now()}`;
        const completedDate = now.split('T')[0];
        const certificateHtml = generateCertificateHtml(course.title, user.full_name, completedDate, certId);
        const certificateDataUrl = `data:text/html,${encodeURIComponent(certificateHtml)}`;
        
        // Calculate expiry date as 12 months from issued date
        const issued = new Date(completedDate);
        const expiry = new Date(issued.getFullYear() + 1, issued.getMonth(), issued.getDate());
        const expiryDate = expiry.toISOString().split('T')[0];

        if (existing.length > 0) {
          // Update existing certificate with URL and HTML
          await base44.entities.TrainingCertificate.update(existing[0].id, {
            certificate_html: certificateHtml,
            certificate_url: certificateDataUrl,
            file_generation_status: 'generated',
            status: 'active',
            issued_date: completedDate,
            completed_date: completedDate,
            expiry_date: expiryDate,
            learner_name: user.full_name,
            course_title: course.title,
            certificate_id: certId,
          });
        } else {
          // Create new certificate with HTML and URL
          await base44.entities.TrainingCertificate.create({
            user_id: user.id,
            learner_name: user.full_name,
            course_id: course.id,
            course_title: course.title,
            issued_date: completedDate,
            completed_date: completedDate,
            expiry_date: expiryDate,
            certificate_id: certId,
            certificate_name: `${course.title} — Completion Certificate`,
            certificate_html: certificateHtml,
            certificate_url: certificateDataUrl,
            file_generation_status: 'generated',
            status: 'active',
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['trainingAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['trainingCertificates'] });
      setJustCompleted(true);
      
      // Show celebration then close
      setTimeout(() => {
        onClose?.();
        onCompleted?.();
      }, 2500);
    } finally {
      setMarking(false);
    }
  }, [assignment, course, user, marking, status, canMarkComplete, queryClient, onClose, onCompleted]);



  // Loading
  if (loading) {
    return createPortal(
      <div className="fixed inset-0 z-[999999] bg-[#050816] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-sm text-white/40">Loading lesson…</p>
        </div>
      </div>,
      document.body
    );
  }

  // Fetch error
  if (fetchError || !fileUrl) {
    return createPortal(
      <div className="fixed inset-0 z-[999999] bg-[#050816] flex items-center justify-center p-6">
        <div className="flex flex-col items-center text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
          <p className="text-base font-bold text-white mb-2">Could not load lesson</p>
          <p className="text-sm text-white/45 mb-6">The HTML file could not be loaded. Try again or contact support.</p>
          <button onClick={onClose} className="px-6 h-10 rounded-xl font-semibold text-white" style={{ background: 'rgba(139,92,246,0.20)', border: '1px solid rgba(139,92,246,0.30)' }}>
            Close
          </button>
        </div>
      </div>,
      document.body
    );
  }

  // Render as portal to document.body (outside app layout)
  const content = (
    <>
      {/* Full-screen background overlay */}
      <div className="fixed inset-0 z-[999999] bg-[#050816] flex flex-col">
        {/* Top control bar */}
        <div className="h-16 flex items-center justify-between px-6 flex-shrink-0" style={{ background: 'rgba(20, 20, 40, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white truncate">{course.title}</h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-white/50">HTML Lesson</span>
              <span className="text-xs text-white/30">·</span>
              <span className="text-xs text-white/50">{formatDuration(course.estimated_duration_minutes)}</span>
              {scrollProgress > 0 && (
                <>
                  <span className="text-xs text-white/30">·</span>
                  <span className="text-xs" style={{ color: scrollProgress >= 75 ? '#10b981' : 'rgba(255,255,255,0.50)' }}>
                    Lesson viewed: {scrollProgress}%
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            {status !== 'completed' && !justCompleted && (
              <button onClick={markComplete} disabled={marking || !canMarkComplete}
                className="flex items-center gap-1.5 px-4 h-9 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {marking ? 'Saving…' : canMarkComplete ? 'Mark Complete' : `View ${Math.max(0, 75 - scrollProgress)}% more to complete`}
              </button>
            )}
            {(status === 'completed' || justCompleted) && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1.5 px-4 h-9 rounded-lg text-xs font-bold text-emerald-400" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </motion.div>
            )}
            <button onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'rgba(255,255,255,0.80)', background: 'rgba(255,255,255,0.05)' }} title="Close lesson">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HTML iframe */}
        {htmlContent && (
          <iframe
            ref={iframeRef}
            title={course.title || 'HTML Lesson'}
            srcDoc={htmlContent}
            className="flex-1 w-full border-0 bg-white"
            sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin"
          />
        )}
      </div>
    </>
  );

  // Render via portal to avoid stacking context with app layout
  const portal = createPortal(content, document.body);

  // Show completion celebration modal if just completed
  if (justCompleted) {
    return (
      <>
        {portal}
        {createPortal(
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[999998] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8 max-w-sm text-center border border-emerald-200 shadow-2xl">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.6 }} className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
              <p className="text-base font-semibold text-gray-700 mb-1">You've completed</p>
              <p className="text-lg font-bold text-emerald-600 mb-6">{course.title}</p>
              {course.certificate_enabled && (
                <p className="text-sm text-gray-600 mb-6">A certificate has been issued and is ready to download.</p>
              )}
              <p className="text-xs text-gray-500 mb-6">Closing lesson in a moment...</p>
            </motion.div>
          </motion.div>,
          document.body
        )}
      </>
    );
  }

  return portal;
}

// ── Main CourseViewer ─────────────────────────────────────────────────────────
export default function CourseViewer({ course, assignment, user, onClose, onCompleted }) {
  const [marking, setMarking] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const queryClient = useQueryClient();

  const cat = CATEGORY_COLOURS[course?.category] || CATEGORY_COLOURS['Operations'];
  const ct = CONTENT_TYPE_CONFIG[course?.content_type] || CONTENT_TYPE_CONFIG.html;
  const status = getEffectiveStatus(assignment);
  const statusStyle = STATUS_STYLES[status];

  const markComplete = useCallback(async () => {
    if (marking || status === 'completed') return;
    setMarking(true);
    try {
      const now = new Date().toISOString();
      if (assignment?.id) {
        await base44.entities.TrainingAssignment.update(assignment.id, {
          status: 'completed',
          progress_percentage: 100,
          completed_at: now,
        });
      }
      // Issue certificate if enabled
      if (course?.certificate_enabled && user?.id) {
        const existing = await base44.entities.TrainingCertificate.filter({ course_id: course.id, user_id: user.id });
        if (existing.length > 0 && existing[0].certificate_url) {
          // Certificate already exists with URL, skip
          return;
        }

        const certId = `CERT-${course.id}-${user.id}-${Date.now()}`;
        const completedDate = now.split('T')[0];
        const certificateHtml = generateCertificateHtml(course.title, user.full_name, completedDate, certId);
        const certificateDataUrl = `data:text/html,${encodeURIComponent(certificateHtml)}`;
        
        // Calculate expiry date as 12 months from issued date
        const issued = new Date(completedDate);
        const expiry = new Date(issued.getFullYear() + 1, issued.getMonth(), issued.getDate());
        const expiryDate = expiry.toISOString().split('T')[0];

        if (existing.length > 0) {
          // Update existing certificate with URL and HTML
          await base44.entities.TrainingCertificate.update(existing[0].id, {
            certificate_html: certificateHtml,
            certificate_url: certificateDataUrl,
            file_generation_status: 'generated',
            status: 'active',
            issued_date: completedDate,
            completed_date: completedDate,
            expiry_date: expiryDate,
            learner_name: user.full_name,
            course_title: course.title,
            certificate_id: certId,
          });
        } else {
          // Create new certificate with HTML and URL
          await base44.entities.TrainingCertificate.create({
            user_id: user.id,
            learner_name: user.full_name,
            course_id: course.id,
            course_title: course.title,
            issued_date: completedDate,
            completed_date: completedDate,
            expiry_date: expiryDate,
            certificate_id: certId,
            certificate_name: `${course.title} — Completion Certificate`,
            certificate_html: certificateHtml,
            certificate_url: certificateDataUrl,
            file_generation_status: 'generated',
            status: 'active',
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ['trainingAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['trainingCertificates'] });
      setJustCompleted(true);
      onCompleted?.();
    } finally {
      setMarking(false);
    }
  }, [assignment, course, user, marking, status, queryClient, onCompleted]);

  // HTML courses use full-screen player, others use drawer
  if (course?.content_type === 'html') {
    return <FullScreenHtmlPlayer course={course} assignment={assignment} user={user} onClose={onClose} onCompleted={onCompleted} />;
  }

  if (!course) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 280, damping: 30 }}
      className="fixed top-0 right-0 h-full z-[9999] flex flex-col shadow-2xl overflow-hidden"
      style={{ width: 'min(1100px, 100vw)', background: '#080b18', borderLeft: '1px solid rgba(139,92,246,0.20)' }}>

      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 flex items-start justify-between gap-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(139,92,246,0.06)' }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{ color: cat.text, background: cat.bg, borderColor: cat.border }}>
              {course.category}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{ color: ct.colour, background: ct.bg, borderColor: ct.border }}>
              {ct.label}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle.cls}`}>
              {statusStyle.label}
            </span>
            {assignment?.due_date && status !== 'completed' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border"
                style={{ color: status === 'overdue' ? '#f87171' : 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.10)' }}>
                Due {new Date(assignment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-white truncate">{course.title}</h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>
            {formatDuration(course.estimated_duration_minutes)} · {course.difficulty}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mark complete button */}
          {status !== 'completed' && !justCompleted && (
            <button onClick={markComplete} disabled={marking || !scrolledToBottom}
              className="flex items-center gap-1.5 px-4 h-8 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {marking ? 'Saving…' : 'Mark Complete'}
            </button>
          )}
          {(status === 'completed' || justCompleted) && (
            <div className="flex items-center gap-1.5 px-4 h-8 rounded-xl text-xs font-bold text-emerald-400"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </div>
          )}
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors" style={{ color: 'rgba(255,255,255,0.80)', background: 'rgba(255,255,255,0.10)' }} title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Completion banner */}
      <AnimatePresence>
        {justCompleted && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
            style={{ background: 'rgba(16,185,129,0.15)', borderBottom: '1px solid rgba(16,185,129,0.25)' }}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-400">
              Course marked as complete!{course.certificate_enabled ? ' A certificate has been issued.' : ''}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course content */}
      <div className={`flex-1 ${course.content_type === 'html' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
        {course.content_type === 'pdf' && <PdfViewer course={course} />}
        {course.content_type === 'word' && <WordViewer course={course} />}
        {course.content_type === 'checklist' && <ChecklistViewer course={course} assignment={assignment} user={user} onComplete={markComplete} />}
        {course.content_type === 'link' && <LinkViewer course={course} />}
      </div>

      {/* Bottom action bar for non-html types */}
      {course.content_type !== 'html' && course.content_type !== 'checklist' && status !== 'completed' && !justCompleted && (
        <div className="flex-shrink-0 px-5 py-4 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.20)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
            {course.content_type === 'pdf' && 'Read through the document above, then mark complete.'}
            {course.content_type === 'word' && 'Open or download the document, then mark complete.'}
            {course.content_type === 'link' && 'Complete the external training, then mark complete.'}
          </p>
          <button onClick={markComplete} disabled={marking}
            className="flex items-center gap-1.5 px-5 h-9 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {marking ? 'Saving…' : 'Mark Complete'}
          </button>
        </div>
      )}
    </motion.div>
  );
}