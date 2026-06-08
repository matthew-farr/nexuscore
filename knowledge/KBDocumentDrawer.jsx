import { X, Bookmark, BookmarkCheck, Share2, Download, ExternalLink, Calendar, User, Tag, Eye, Shield, Globe, FileText, Folder, Pencil, Archive, Check, BookOpen, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ThemeProvider';
import { DOC_TYPE_CONFIG } from './kbConfig';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useState, useRef } from 'react';

export default function KBDocumentDrawer({
  doc, isOpen, onClose, isBookmarked, onToggleBookmark,
  isAdmin, onEdit, onArchived,
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [copied, setCopied] = useState(false);
  const [publicCopied, setPublicCopied] = useState(false);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [localToken, setLocalToken] = useState(null);
  const [viewingHtml, setViewingHtml] = useState(false);
  const [htmlContent, setHtmlContent] = useState(null);
  const [htmlLoading, setHtmlLoading] = useState(false);
  const [htmlError, setHtmlError] = useState(null);
  const iframeRef = useRef(null);

  // Derive these safely — doc may be null when animating out
  const typeConf = doc ? (DOC_TYPE_CONFIG[doc.doc_type] || DOC_TYPE_CONFIG['Policy']) : DOC_TYPE_CONFIG['Policy'];
  const Icon = typeConf.icon;
  const hasFile = !!doc?.file_url;
  const hasUrl = !!doc?.external_url;
  const isArchived = doc?.status === 'Archived';

  // Use locally generated token if available, otherwise doc's saved token
  const activeToken = localToken ?? doc?.public_share_token;
  const publicUrl = activeToken ? `${window.location.origin}/share/doc?token=${activeToken}` : null;

  const isHtmlFile = doc?.file_url && (doc.file_url.endsWith('.html') || doc.file_url.endsWith('.htm'));
  const hasPdf = !!doc?.pdf_url;
  
  const handleOpenHtml = async () => {
    setHtmlLoading(true);
    setHtmlError(null);
    setHtmlContent(null);
    setViewingHtml(true);
    try {
      const response = await fetch(doc.file_url);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
      const text = await response.text();
      setHtmlContent(text);
    } catch (err) {
      setHtmlError(err.message || 'Could not load HTML content');
      setHtmlContent(null);
    } finally {
      setHtmlLoading(false);
    }
  };
  
  const handleOpen = () => {
    if (hasUrl) window.open(doc.external_url, '_blank');
    else if (hasFile) {
      // View Word docs in Office Online
      if (doc.file_url.endsWith('.docx') || doc.file_url.endsWith('.doc')) {
        const viewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(doc.file_url)}`;
        window.open(viewUrl, '_blank');
      }
      // View HTML files in modal
      else if (isHtmlFile) {
        handleOpenHtml();
      }
      // Download other file types
      else {
        window.open(doc.file_url, '_blank');
      }
    }
  };
  
  const getFileButtonLabel = () => {
    if (isHtmlFile) return 'Preview Guide';
    if (doc?.file_url?.endsWith('.pdf')) return 'Preview Document';
    return 'Download File';
  };

  const doCopy = (text, onSuccess) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopy(text, onSuccess));
    } else {
      fallbackCopy(text, onSuccess);
    }
  };

  const handlePrintGuide = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      // Fallback: open in new window and print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 300);
      }
    }
  };

  const fallbackCopy = (text, onSuccess) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); onSuccess?.(); } catch { toast.error('Could not copy link'); }
    document.body.removeChild(ta);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/knowledge?doc=${doc.id}`;
    doCopy(url, () => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleCopyPublicLink = () => {
    if (!publicUrl) return;
    doCopy(publicUrl, () => { setPublicCopied(true); setTimeout(() => setPublicCopied(false), 2000); });
  };

  const handleGenerateToken = async () => {
    setGeneratingToken(true);
    const token = crypto.randomUUID();
    await base44.entities.KnowledgeDocument.update(doc.id, { public_share_token: token });
    setLocalToken(token);
    setGeneratingToken(false);
    toast.success('Public share link generated');
  };

  const handleRevokeToken = async () => {
    await base44.entities.KnowledgeDocument.update(doc.id, { public_share_token: '' });
    setLocalToken('');
    toast.success('Public share link revoked');
  };

  const handleArchive = async () => {
    const newStatus = isArchived ? 'Published' : 'Archived';
    await base44.entities.KnowledgeDocument.update(doc.id, { status: newStatus });
    toast.success(isArchived ? 'Document restored' : 'Document archived');
    onArchived?.();
    onClose();
  };



  const btnSecondary = `flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
    isDark ? 'bg-white/8 text-white hover:bg-white/14' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
  }`;

  return (
    <AnimatePresence>
      {isOpen && doc && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl flex flex-col"
            style={{
              background: isDark ? '#0b1021' : 'white',
              borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
              boxShadow: '-8px 0 40px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: typeConf.bg }}>
                  <Icon className="w-4 h-4" style={{ color: typeConf.color }} />
                </div>
                <div>
                  <span className="text-xs font-semibold" style={{ color: typeConf.color }}>{doc.doc_type}</span>
                  {isArchived && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400">Archived</span>
                  )}
                  {doc.status === 'Draft' && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-500/20 text-slate-400">Draft</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onToggleBookmark(doc)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                >
                  {isBookmarked
                    ? <BookmarkCheck className="w-4 h-4 text-purple-400" />
                    : <Bookmark className={`w-4 h-4 ${isDark ? 'text-white/60' : 'text-slate-500'}`} />}
                </button>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                >
                  <X className={`w-4 h-4 ${isDark ? 'text-white/70' : 'text-slate-600'}`} />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

              {/* Title + description */}
              <div>
                <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{doc.title}</h2>
                {doc.description && (
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-600'}`}>{doc.description}</p>
                )}
              </div>

              {/* Compliance / shareability badges */}
              {(doc.is_compliance_critical || doc.is_client_shareable || doc.is_applicant_shareable) && (
                <div className="flex flex-wrap gap-2">
                  {doc.is_compliance_critical && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400">
                      <Shield className="w-3 h-3" /> Compliance Critical
                    </span>
                  )}
                  {doc.is_client_shareable && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400">
                      <Globe className="w-3 h-3" /> Client Shareable
                    </span>
                  )}
                  {doc.is_applicant_shareable && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-400">
                      <FileText className="w-3 h-3" /> Applicant Shareable
                    </span>
                  )}
                </div>
              )}

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { Icon: Folder,   label: 'Category',    value: doc.category },
                  { Icon: User,     label: 'Owner',       value: doc.owner || 'Unassigned' },
                  { Icon: FileText, label: 'Version',     value: doc.version ? `v${doc.version}` : '—' },
                  { Icon: Eye,      label: 'Views',       value: doc.view_count ?? 0 },
                  doc.review_date   && { Icon: Calendar,  label: 'Review Date', value: format(new Date(doc.review_date), 'dd MMM yyyy') },
                  doc.published_date && { Icon: Calendar, label: 'Published',   value: format(new Date(doc.published_date), 'dd MMM yyyy') },
                ].filter(Boolean).map(item => (
                  <div key={item.label}
                    className="rounded-lg p-3"
                    style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc' }}>
                    <div className={`text-xs mb-1 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>{item.label}</div>
                    <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {doc.tags?.length > 0 && (
                <div>
                  <div className={`flex items-center gap-1.5 text-xs mb-2 font-semibold ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                    <Tag className="w-3 h-3" /> Tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doc.tags.map(tag => (
                      <span key={tag} className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-700'}`}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                {/* Primary open/view */}
                {(hasFile || hasUrl) && (
                  <button
                    onClick={handleOpen}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #ec2ca3)' }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    {doc.doc_type === 'External Link' ? 'Open Link' : 'View Document'}
                  </button>
                )}

                {/* File action — view or download based on type */}
                {hasFile && (
                  <button
                    onClick={handleOpen}
                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isDark ? 'bg-white/8 text-white hover:bg-white/14' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {isHtmlFile ? <BookOpen className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    {getFileButtonLabel()}
                  </button>
                )}

                {/* PDF download */}
                {hasPdf && (
                  <a
                    href={doc.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className={btnSecondary}
                  >
                    <Download className="w-4 h-4" /> Download PDF Version
                  </a>
                )}

                {/* Internal share link */}
                <button onClick={handleCopyLink} className={btnSecondary} disabled={copied}>
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                  {copied ? 'Link Copied!' : 'Copy Internal Link'}
                </button>

                {/* Admin-only actions */}
                {isAdmin && (
                  <>
                    <button
                      onClick={() => { const d = doc; onClose(); setTimeout(() => onEdit(d), 60); }}
                      className={btnSecondary}
                    >
                      <Pencil className="w-4 h-4" /> Edit Document
                    </button>
                    <button
                      onClick={handleArchive}
                      className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isArchived
                          ? isDark ? 'bg-green-500/15 text-green-300 hover:bg-green-500/25' : 'bg-green-50 text-green-700 hover:bg-green-100'
                          : isDark ? 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      <Archive className="w-4 h-4" />
                      {isArchived ? 'Restore Document' : 'Archive Document'}
                    </button>
                  </>
                )}
              </div>

              {/* Admin — Public Share Link section */}
              {isAdmin && (doc.is_client_shareable || doc.is_applicant_shareable) && (
                <div className="rounded-xl p-4" style={{ background: isDark ? 'rgba(34,211,238,0.06)' : 'rgba(34,211,238,0.05)', border: `1px solid ${isDark ? 'rgba(34,211,238,0.15)' : 'rgba(34,211,238,0.20)'}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span className={`text-xs font-semibold ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>Public Share Link</span>
                    <span className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>· No account required</span>
                  </div>

                  {activeToken ? (
                    <div className="space-y-2">
                      <div className={`text-xs truncate rounded-lg px-3 py-2 font-mono ${isDark ? 'bg-white/8 text-white/70' : 'bg-white text-slate-600 border border-slate-200'}`}>
                        {publicUrl}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyPublicLink}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                            isDark ? 'bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25' : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                          }`}
                        >
                          {publicCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                          {publicCopied ? 'Copied!' : 'Copy Link'}
                        </button>
                        <button
                          onClick={handleRevokeToken}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                            isDark ? 'bg-red-500/15 text-red-300 hover:bg-red-500/25' : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerateToken}
                      disabled={generatingToken}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isDark ? 'bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25' : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {generatingToken ? 'Generating…' : 'Generate Public Share Link'}
                    </button>
                  )}
                </div>
              )}

              {/* Inline content body */}
              {doc.content && (
                <div>
                  <div className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Document Content</div>
                  <div
                    className={`prose prose-sm max-w-none rounded-xl p-4 text-sm leading-relaxed ${
                      isDark ? 'prose-invert text-white/80 bg-white/5' : 'text-slate-700 bg-slate-50'
                    }`}
                    dangerouslySetInnerHTML={{ __html: doc.content }}
                  />
                </div>
              )}
              </div>
              </motion.div>
              </>
              )}

              {/* HTML viewer modal */}
              <AnimatePresence>
                {viewingHtml && doc?.file_url && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                      onClick={() => setViewingHtml(false)}
                    />
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                      className="fixed inset-6 z-50 rounded-2xl overflow-hidden flex flex-col"
                      style={{ background: isDark ? '#0b1021' : 'white' }}
                    >
                      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0 border-b"
                        style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{doc.title}</h3>
                        <div className="flex items-center gap-2">
                          <button onClick={handlePrintGuide}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                            title="Print or save as PDF">
                            <Printer className={`w-4 h-4 ${isDark ? 'text-white/70' : 'text-slate-600'}`} />
                          </button>
                          <button onClick={() => setViewingHtml(false)}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                            <X className={`w-4 h-4 ${isDark ? 'text-white/70' : 'text-slate-600'}`} />
                          </button>
                        </div>
                      </div>
                      {htmlLoading && (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Loading guide…</p>
                          </div>
                        </div>
                      )}
                      {htmlError && (
                        <div className="flex-1 flex items-center justify-center px-6">
                          <div className="text-center">
                            <p className={`text-sm font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>Could not load guide</p>
                            <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{htmlError}</p>
                          </div>
                        </div>
                      )}
                      {htmlContent && (
                        <iframe
                          ref={iframeRef}
                          title={doc.title}
                          srcDoc={htmlContent}
                          className="flex-1 w-full border-0"
                          sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox"
                        />
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
              </AnimatePresence>
              );
              }