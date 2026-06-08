import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, CheckCircle2, AlertTriangle, XCircle, ExternalLink, FileText } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { daysUntil } from './trainingConfig';

const CERT_STATUS = {
  active:        { label: 'Active',        Icon: CheckCircle2, cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  expiring_soon: { label: 'Expiring Soon', Icon: AlertTriangle, cls: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  expired:       { label: 'Expired',       Icon: XCircle,      cls: 'text-red-400 bg-red-500/10 border-red-500/30' },
};

export default function CertificatesTab({ certificates, courses, user = null }) {
  const [filter, setFilter] = useState('all');
  const [generating, setGenerating] = useState({});
  const [repairing, setRepairing] = useState(false);
  const queryClient = useQueryClient();

  const handleRepairAll = async () => {
    if (repairing) return;
    setRepairing(true);
    try {
      const res = await base44.functions.invoke('repairCertificates', {});
      if (res.data?.repaired > 0) {
        queryClient.invalidateQueries({ queryKey: ['trainingCertificates'] });
      }
    } finally {
      setRepairing(false);
    }
  };

  // Helper: generate certificate HTML
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

  const handleGenerateMissing = async (cert) => {
    if (generating[cert.id] || !cert.course_title || !cert.learner_name) return;
    setGenerating(prev => ({ ...prev, [cert.id]: true }));
    try {
      const certId = cert.certificate_id || `CERT-${cert.course_id}-${cert.user_id}-${Date.now()}`;
      const completedDate = cert.completed_date || cert.issued_date || new Date().toISOString().split('T')[0];
      const certificateHtml = generateCertificateHtml(cert.course_title, cert.learner_name, completedDate, certId);
      const certificateDataUrl = `data:text/html,${encodeURIComponent(certificateHtml)}`;

      await base44.entities.TrainingCertificate.update(cert.id, {
        certificate_html: certificateHtml,
        certificate_url: certificateDataUrl,
        certificate_id: certId,
        file_generation_status: 'generated',
        status: 'active',
      });

      queryClient.invalidateQueries({ queryKey: ['trainingCertificates'] });
    } finally {
      setGenerating(prev => ({ ...prev, [cert.id]: false }));
    }
  };

  const enriched = useMemo(() =>
    certificates.map(cert => {
      const course = courses.find(c => c.id === cert.course_id);
      const days = daysUntil(cert.expiry_date);
      let status = cert.status;
      if (!status) {
        if (!cert.expiry_date) status = 'active';
        else if (days !== null && days < 0) status = 'expired';
        else if (days !== null && days <= 30) status = 'expiring_soon';
        else status = 'active';
      }
      return { ...cert, course, status, daysLeft: days };
    }).filter(c => filter === 'all' || c.status === filter),
    [certificates, courses, filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {['all', 'active', 'expiring_soon', 'expired'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
              style={filter === s
                ? { background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff' }
                : { color: 'rgba(255,255,255,0.50)' }}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        {['admin', 'super_admin'].includes(user?.role) && (
          <button onClick={handleRepairAll} disabled={repairing}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.30)', color: '#fca5a5' }}>
            {repairing ? 'Repairing…' : 'Repair Certificates'}
          </button>
        )}
      </div>

      {enriched.length === 0 ? (
        <div className="text-center py-20">
          <Award className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(139,92,246,0.25)' }} />
          <p className="text-white/40 text-sm">No certificates yet.</p>
          <p className="text-white/25 text-xs mt-1">Complete courses with certificate enabled to earn one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enriched.map((cert, i) => {
            const s = CERT_STATUS[cert.status] || CERT_STATUS.active;
            const StatusIcon = s.Icon;
            return (
              <motion.div key={cert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: 'linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))', border: '1px solid rgba(255,255,255,0.09)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.30)' }}>
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${s.cls}`}>
                    <StatusIcon className="w-2.5 h-2.5" /> {s.label}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">{cert.certificate_name}</h3>
                  {cert.course && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>{cert.course.title}</p>}
                </div>
                <div className="space-y-1.5">
                  {cert.issued_date && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'rgba(255,255,255,0.40)' }}>Issued</span>
                      <span className="text-white font-medium">{new Date(cert.issued_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                  {cert.expiry_date && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'rgba(255,255,255,0.40)' }}>Expires</span>
                      <span className={cert.daysLeft !== null && cert.daysLeft <= 30 ? 'text-amber-400 font-medium' : 'text-white font-medium'}>
                        {new Date(cert.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {cert.daysLeft !== null && cert.daysLeft > 0 && cert.daysLeft <= 30 && ` (${cert.daysLeft}d)`}
                      </span>
                    </div>
                  )}
                </div>
                <div className="pt-2 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {cert.certificate_url ? (
                    <>
                      <button
                        onClick={() => {
                          if (cert.certificate_url.startsWith('data:')) {
                            // Data URL — create download link
                            const link = document.createElement('a');
                            link.href = cert.certificate_url;
                            link.download = `${cert.certificate_name || 'certificate'}.html`;
                            link.click();
                          } else {
                            // Normal URL — open in new tab
                            window.open(cert.certificate_url, '_blank');
                          }
                        }}
                        className="flex items-center justify-center gap-1.5 w-full h-8 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                        <Download className="w-3 h-3" /> Download Certificate
                      </button>
                      <button onClick={() => {
                          if (cert.certificate_url.startsWith('data:')) {
                            // Decode data URL and open in new window
                            const html = decodeURIComponent(cert.certificate_url.replace('data:text/html,', ''));
                            const blob = new Blob([html], { type: 'text/html' });
                            const blobUrl = URL.createObjectURL(blob);
                            window.open(blobUrl, '_blank');
                          } else {
                            window.open(cert.certificate_url, '_blank');
                          }
                        }}
                        className="flex items-center justify-center gap-1.5 w-full h-8 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                        style={{ background: 'rgba(59,130,246,0.20)', border: '1px solid rgba(59,130,246,0.30)', color: '#93c5fd' }}>
                        <FileText className="w-3 h-3" /> View Certificate
                      </button>
                    </>
                  ) : cert.course_title && cert.learner_name ? (
                    <button
                      onClick={() => handleGenerateMissing(cert)}
                      disabled={generating[cert.id]}
                      className="flex items-center justify-center gap-1.5 w-full h-8 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'rgba(59,130,246,0.20)', border: '1px solid rgba(59,130,246,0.30)', color: '#93c5fd' }}>
                      {generating[cert.id] ? 'Generating…' : 'Generate Certificate'}
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 w-full h-8 rounded-xl text-xs font-semibold"
                      style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.30)', color: '#fca5a5' }}>
                      <AlertTriangle className="w-3 h-3" /> Unavailable
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}