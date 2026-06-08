import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Award, Trash2, Search, ExternalLink } from 'lucide-react';
import { STATUS_COLOUR } from './lmsConfig';
import { format } from 'date-fns';

const CERT_STATUS_LABEL = { active: 'Active', expiring_soon: 'Expiring Soon', expired: 'Expired' };

export default function LmsCertificatesTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const { data: certificates = [] } = useQuery({ queryKey: ['lms-certificates-all'], queryFn: () => base44.entities.TrainingCertificate.list('-issued_date', 500) });
  const { data: courses = [] } = useQuery({ queryKey: ['lms-courses'], queryFn: () => base44.entities.TrainingCourse.list('-created_date', 200) });
  const { data: users = [] } = useQuery({ queryKey: ['lms-users'], queryFn: () => base44.entities.User.list() });

  const courseMap = useMemo(() => Object.fromEntries(courses.map(c => [c.id, c])), [courses]);
  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users]);

  const filtered = certificates.filter(cert => {
    if (statusFilter && cert.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const user = userMap[cert.user_id];
      const course = courseMap[cert.course_id];
      if (!cert.certificate_name?.toLowerCase().includes(q) && !user?.full_name?.toLowerCase().includes(q) && !course?.title?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleRevoke = async (id) => {
    if (!confirm('Revoke this certificate?')) return;
    setDeletingId(id);
    await base44.entities.TrainingCertificate.delete(id);
    qc.invalidateQueries({ queryKey: ['lms-certificates-all'] });
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-white">Certificates</h2>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>{filtered.length} certificates</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.30)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search certificates…"
            className="w-full pl-8 pr-3 h-9 rounded-xl text-xs text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 h-9 rounded-xl text-xs text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
          <option value="" style={{ background: '#0f172a' }}>All Statuses</option>
          {Object.entries(CERT_STATUS_LABEL).map(([v, l]) => <option key={v} value={v} style={{ background: '#0f172a' }}>{l}</option>)}
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Certificate', 'User', 'Course', 'Issued', 'Expires', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider px-4 py-3" style={{ color: 'rgba(255,255,255,0.30)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center">
                  <Award className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.15)' }} />
                  <p className="text-xs text-white/30">No certificates found</p>
                </td></tr>
              )}
              {filtered.map(cert => {
                const user = userMap[cert.user_id];
                const course = courseMap[cert.course_id];
                const colour = STATUS_COLOUR[cert.status] || '#6b7280';
                return (
                  <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 flex-shrink-0" style={{ color: '#f59e0b' }} />
                        <span className="text-xs font-semibold text-white">{cert.certificate_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{user?.full_name || user?.email || cert.user_id}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{course?.title || '—'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {cert.issued_date ? format(new Date(cert.issued_date), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {cert.expiry_date ? format(new Date(cert.expiry_date), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${colour}18`, color: colour }}>
                        {CERT_STATUS_LABEL[cert.status] || cert.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {cert.certificate_url && (
                          <a href={cert.certificate_url} target="_blank" rel="noreferrer"
                            className="p-1.5 rounded-lg transition-colors text-white/30 hover:text-blue-400 hover:bg-blue-500/10">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button onClick={() => handleRevoke(cert.id)} disabled={deletingId === cert.id}
                          className="p-1.5 rounded-lg transition-colors text-white/30 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}