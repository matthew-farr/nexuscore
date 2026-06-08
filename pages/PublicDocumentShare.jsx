import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import {
  FileText, Download, BookOpen, Globe, X, Printer,
  Phone, Mail, MessageCircle, Ticket, ChevronRight,
  Tag, User, Calendar, Layers, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import PublicFAQSection from '@/components/public-share/PublicFAQSection';
import QuickAccessDocuments from '@/components/public-share/QuickAccessDocuments';

const LOGO_COLOUR = 'https://media.base44.com/images/public/6a16abdb83b84eec69c55112/ee2dfca27_logocolour.png';
const LOGO_WHITE = 'https://media.base44.com/images/public/6a16abdb83b84eec69c55112/9ab886bb6_LogoWhite.png';

export default function PublicDocumentShare() {
  const [doc, setDoc] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingHtml, setViewingHtml] = useState(false);
  const [htmlContent, setHtmlContent] = useState(null);
  const [htmlLoading, setHtmlLoading] = useState(false);
  const [htmlError, setHtmlError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) { setError('No document token provided.'); setLoading(false); return; }
    base44.functions.invoke('getPublicDocument', { token })
      .then(res => { setDoc(res.data.doc); setFaqs(res.data.faqs || []); setLoading(false); })
      .catch(() => { setError('This document is not available or the link has expired.'); setLoading(false); });
  }, []);

  const isHtmlFile = doc?.file_url && (doc.file_url.endsWith('.html') || doc.file_url.endsWith('.htm'));
  const isWordFile = doc?.file_url && (doc.file_url.endsWith('.docx') || doc.file_url.endsWith('.doc'));
  const isPdfFile = doc?.file_url && doc.file_url.endsWith('.pdf');

  const handleOpenHtml = async (urlOverride) => {
    const url = urlOverride || doc?.file_url;
    setHtmlLoading(true); setHtmlError(null); setHtmlContent(null); setViewingHtml(true);
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(r.statusText);
      let html = await r.text();
      // Inject script to prevent navigation and convert anchor links to smooth scroll
      const interceptScript = `
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            document.addEventListener('click', function(e) {
              var el = e.target.closest('a');
              if (!el) return;
              var href = el.getAttribute('href');
              if (href && href.startsWith('#')) {
                e.preventDefault();
                var target = document.getElementById(href.slice(1)) || document.querySelector('[name="' + href.slice(1) + '"]');
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else if (href && !href.startsWith('http') && !href.startsWith('mailto')) {
                e.preventDefault();
              }
            });
          });
        <\/script>
      `;
      html = html.replace('</head>', interceptScript + '</head>');
      if (!html.includes('</head>')) html = interceptScript + html;
      setHtmlContent(html);
    } catch (e) { setHtmlError(e.message || 'Could not load content'); }
    finally { setHtmlLoading(false); }
  };

  const handlePrintGuide = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    try { iframe.contentWindow.focus(); iframe.contentWindow.print(); }
    catch {
      const w = window.open('', '_blank');
      if (w) { w.document.open(); w.document.write(htmlContent); w.document.close(); w.focus(); setTimeout(() => w.print(), 300); }
    }
  };

  const getViewHref = () => {
    if (doc?.external_url) return doc.external_url;
    if (isWordFile) return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(doc.file_url)}`;
    if (isPdfFile) return doc.file_url;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <img src={LOGO_COLOUR} alt="Checks Direct" className="h-9 object-contain" />
          <div className="w-7 h-7 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <img src={LOGO_COLOUR} alt="Checks Direct" className="h-8 object-contain" />
        </header>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Document Not Available</h1>
            <p className="text-slate-500 text-sm leading-relaxed">{error}</p>
            <p className="text-slate-400 text-xs mt-2">Please contact the person who shared this link.</p>
          </div>
        </div>
      </div>
    );
  }

  const viewHref = getViewHref();
  const hasPdf = !!doc?.pdf_url;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* ── Slim sticky header ── */}
      <header className="bg-white border-b border-slate-200 px-6 lg:px-10 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <img src={LOGO_COLOUR} alt="Checks Direct" className="h-8 object-contain" />
        <span className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Secure document share
        </span>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-5 lg:px-10 py-0 flex flex-col">

        {/* ══════════════════════════════════════
            HERO — full-width gradient
        ══════════════════════════════════════ */}
        <section className="relative overflow-hidden rounded-b-3xl mb-10"
          style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 45%, #ec2ca3 100%)' }}>
          {/* ambient blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-pink-500/20 blur-3xl translate-x-1/3 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-violet-700/30 blur-3xl -translate-x-1/4 translate-y-1/3" />
          </div>
          <div className="relative px-8 lg:px-16 py-8 lg:py-10 flex flex-col lg:flex-row items-start gap-8">
            {/* Left — title & description */}
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 backdrop-blur-sm">
                <FileText className="w-3.5 h-3.5" />
                {doc.doc_type}
              </span>
              <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">{doc.title}</h1>
              {doc.description && (
                <p className="text-purple-100 text-base leading-relaxed">{doc.description}</p>
              )}
            </div>

            {/* Right — document info box */}
            <div className="w-full lg:w-72 flex-shrink-0 rounded-2xl overflow-hidden backdrop-blur-md"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Document Information</p>
              </div>
              <div className="px-4 py-3 flex flex-col gap-0">
                {[
                  doc.category        && { icon: Layers,   label: 'Category',     value: doc.category },
                  doc.version         && { icon: Tag,       label: 'Version',      value: `v${doc.version}` },
                  doc.published_date  && { icon: Calendar,  label: 'Last Updated', value: format(new Date(doc.published_date), 'dd MMM yyyy') },
                  doc.owner           && { icon: User,      label: 'Owner',        value: doc.owner },
                ].filter(Boolean).map((item, idx, arr) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label}>
                      <div className="flex items-center gap-3 py-2.5">
                        <Icon className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                          <span className="text-white/50 text-xs">{item.label}</span>
                          <span className="text-white text-xs font-semibold truncate text-right">{item.value}</span>
                        </div>
                      </div>
                      {idx < arr.length - 1 && <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <QuickAccessDocuments onOpenHtml={handleOpenHtml} />

        {/* ══════════════════════════════════════
            MAIN CONTENT — formats + FAQ side by side
        ══════════════════════════════════════ */}
        <section className="mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left — Available Formats (35%) */}
            <div className="w-full lg:w-[35%] flex-shrink-0 bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Available Formats</h2>
              </div>
              <div className="px-6 py-6 flex flex-col gap-3">

                {/* Primary — Start Guide */}
                {isHtmlFile ? (
                  <button onClick={() => handleOpenHtml(doc.file_url)}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] group"
                    style={{ background: 'linear-gradient(135deg, #5b21b6, #ec2ca3)' }}>
                    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold">Open Guide</p>
                      <p className="text-xs text-white/70 font-normal">Open the interactive guide</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ) : viewHref ? (
                  <a href={viewHref} target="_blank" rel="noreferrer"
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] group"
                    style={{ background: 'linear-gradient(135deg, #5b21b6, #ec2ca3)' }}>
                    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold">Open Guide</p>
                      <p className="text-xs text-white/70 font-normal">Open and read the document</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ) : null}

                {/* Secondary — Interactive Guide (if HTML and there's also an external link) */}
                {isHtmlFile && doc.external_url && (
                  <a href={doc.external_url} target="_blank" rel="noreferrer"
                    className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:border-purple-300 hover:text-purple-700 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">View Online</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}

                {/* Secondary — Interactive Guide if not html but pdf/word exists */}
                {!isHtmlFile && doc.file_url && !isPdfFile && !isWordFile && (
                  <a href={doc.file_url} target="_blank" rel="noreferrer"
                    className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:border-purple-300 hover:text-purple-700 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">Interactive Guide</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}

                {/* Tertiary — Download PDF */}
                {(hasPdf || isPdfFile) && (
                  <a href={hasPdf ? doc.pdf_url : doc.file_url} target="_blank" rel="noreferrer"
                    className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-medium border border-dashed border-slate-200 text-slate-500 hover:border-purple-200 hover:text-purple-600 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Download PDF</p>
                      <p className="text-xs text-slate-400">Save a copy to your device</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}

                {/* No actions fallback */}
                {!viewHref && !isHtmlFile && !hasPdf && !isPdfFile && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-slate-400">No files or links are attached to this document.</p>
                  </div>
                )}
              </div>
              {/* Tags */}
              {doc.tags?.length > 0 && (
                <div className="px-6 pb-4 flex flex-wrap gap-2">
                  {doc.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Right — FAQ (65%) */}
            <div className="w-full lg:w-[65%]">
              <PublicFAQSection doc={doc} faqs={faqs} />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            QUICK ACCESS — two portal cards
        ══════════════════════════════════════ */}
        <section className="mb-12">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Quick Access</h2>
            <p className="text-sm text-slate-400">Access the services most commonly used alongside this guide.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Applicant Portal */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #ede9fe, #fce7f3)' }}>
                    👤
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Applicant Portal</p>
                    <p className="text-xs text-slate-400">Completing an application or DBS process?</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <a href="https://portal.checksdirect.co.uk/app-login.php" target="_blank" rel="noreferrer"
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 hover:scale-[1.01] transition-all"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #ec2ca3)' }}>
                    <ExternalLink className="w-4 h-4" />
                    <span className="flex-1">Open Applicant Portal</span>
                  </a>
                  <a href="https://portal.checksdirect.co.uk/app-login.php" target="_blank" rel="noreferrer"
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:border-purple-200 hover:text-purple-700 transition-all">
                    <MessageCircle className="w-4 h-4" />
                    Live Chat
                  </a>
                  <a href="https://2eflyq.share-eu1.hsforms.com/20qtYTv2ZSiepGrjpiQwYtw" target="_blank" rel="noreferrer"
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:border-purple-200 hover:text-purple-700 transition-all">
                    <Ticket className="w-4 h-4" />
                    Create Support Ticket
                  </a>
                </div>
              </div>
            </div>

            {/* Client Portal */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #ede9fe, #e0f2fe)' }}>
                    🏢
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Client Portal</p>
                    <p className="text-xs text-slate-400">Managing checks, applicants and account activity?</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <a href="https://portal.checksdirect.co.uk/" target="_blank" rel="noreferrer"
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 hover:scale-[1.01] transition-all"
                    style={{ background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)' }}>
                    <ExternalLink className="w-4 h-4" />
                    <span className="flex-1">Open Client Portal</span>
                  </a>
                  <a href="https://portal.checksdirect.co.uk/" target="_blank" rel="noreferrer"
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:border-purple-200 hover:text-purple-700 transition-all">
                    <MessageCircle className="w-4 h-4" />
                    Live Chat
                  </a>
                  <a href="https://2eflyq.share-eu1.hsforms.com/20qtYTv2ZSiepGrjpiQwYtw" target="_blank" rel="noreferrer"
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:border-purple-200 hover:text-purple-700 transition-all">
                    <Ticket className="w-4 h-4" />
                    Create Support Ticket
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            INLINE CONTENT (if any)
        ══════════════════════════════════════ */}
        {doc.content && (
          <section className="mb-12">
            <div className="bg-white rounded-2xl border border-slate-100 p-8 prose prose-sm max-w-none text-slate-700"
              dangerouslySetInnerHTML={{ __html: doc.content }} />
          </section>
        )}

        {/* ══════════════════════════════════════
            SUPPORT BAR — horizontal, premium
        ══════════════════════════════════════ */}
        <section className="mb-14">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Need Help?</h2>
            <p className="text-sm text-slate-400">Can't find what you're looking for? Our support team is here to help.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

              {/* Support Ticket */}
              <a href="https://2eflyq.share-eu1.hsforms.com/20qtYTv2ZSiepGrjpiQwYtw" target="_blank" rel="noreferrer"
                className="group flex flex-col gap-3 p-6 hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #ec2ca3)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
                  <Ticket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">Create Support Ticket</p>
                  <p className="text-xs text-white/80 leading-relaxed">Raise a request with our support team</p>
                </div>
                <span className="text-xs font-semibold text-white flex items-center gap-1 mt-auto group-hover:gap-2 transition-all">
                  Open form <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </a>

              {/* Live Chat */}
              <div className="flex flex-col gap-3 p-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-0.5">Live Chat</p>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">Chat with us through your portal</p>
                  <div className="flex flex-col gap-1.5">
                    <a href="https://portal.checksdirect.co.uk/app-login.php" target="_blank" rel="noreferrer"
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1">
                      Applicant Chat <ExternalLink className="w-3 h-3" />
                    </a>
                    <a href="https://portal.checksdirect.co.uk/" target="_blank" rel="noreferrer"
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1">
                      Client Chat <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-3 p-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-0.5">Email Support</p>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">We'll get back to you promptly</p>
                  <div className="flex flex-col gap-1.5">
                    <a href="mailto:Applicant@checksdirect.co.uk" style={{ display: 'none' }}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
                      Applicant@checksdirect.co.uk
                    </a>
                    <a href="mailto:contact@checksdirect.co.uk"
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
                      contact@checksdirect.co.uk
                    </a>
                  </div>
                </div>
              </div>

              {/* Telephone */}
              <div className="flex flex-col gap-3 p-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-0.5">Telephone</p>
                  <p className="text-xs font-semibold text-slate-700 mb-2">02920 602356</p>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-slate-400" style={{ display: 'none' }}>Applicants — select <em>Support</em></p>
                    <p className="text-xs text-slate-400" style={{ display: 'none' }}>Clients — select <em>Account Manager</em></p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <img src={LOGO_COLOUR} alt="Checks Direct" className="h-7 object-contain opacity-60" />
          <p className="text-xs text-slate-400">Shared via Checks Direct OS · Read-only document</p>
        </div>
      </footer>

      {/* ── HTML viewer modal ── */}
      {viewingHtml && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setViewingHtml(false)} />
          <div className="fixed inset-4 sm:inset-8 z-50 rounded-2xl overflow-hidden flex flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4c1d95, #7c3aed)' }}>
              <div className="flex items-center gap-3">
                <img src={LOGO_WHITE} alt="Checks Direct" className="h-6 object-contain" />
                <span className="text-white/80 text-sm font-medium truncate">{doc?.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handlePrintGuide}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors">
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button onClick={() => setViewingHtml(false)}
                  className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {htmlLoading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              </div>
            )}
            {htmlError && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-red-500">{htmlError}</p>
              </div>
            )}
            {htmlContent && (
              <iframe ref={iframeRef} title={doc?.title} srcDoc={htmlContent}
                className="flex-1 w-full border-0"
                sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox" />
            )}
          </div>
        </>
      )}
    </div>
  );
}