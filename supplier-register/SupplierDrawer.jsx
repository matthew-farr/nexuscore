import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Globe, Mail, Phone, User, Building2, Calendar, Edit2, Share2, Star, Link } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { SupplierAvatar } from './SupplierCard';

const STATUS_STYLES = {
  'Active':       'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Under Review': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Inactive':     'text-red-400 bg-red-500/10 border-red-500/30',
};

const TABS = ['Overview', 'Contacts', 'Details', 'Notes & Files'];

function InfoRow({ label, value, link }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-2.5"
      style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)' }}>
      <span className="text-xs font-medium flex-shrink-0 w-36" style={{ color: isDark ? '#ffffff' : 'rgba(0,0,0,0.40)' }}>{label}</span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer"
          className="text-xs text-pink-400 hover:text-pink-300 truncate flex items-center gap-1">
          {value} <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </a>
      ) : (
        <span className="text-xs text-right" style={{ color: isDark ? '#ffffff' : '#000000' }}>{value}</span>
      )}
    </div>
  );
}

function ContactCard({ title, name, role, email, phone }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  if (!name && !email && !phone) return null;
  return (
    <div className="rounded-xl p-4 space-y-2"
      style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#ffffff' : 'rgba(0,0,0,0.35)' }}>{title}</p>
      {name && <p className="text-sm font-semibold" style={{ color: isDark ? '#ffffff' : '#000000' }}>{name}</p>}
      {role && <p className="text-xs" style={{ color: isDark ? '#ffffff' : 'rgba(0,0,0,0.45)' }}>{role}</p>}
      {email && (
        <a href={`mailto:${email}`} className="flex items-center gap-2 text-xs text-pink-400 hover:text-pink-300">
          <Mail className="w-3.5 h-3.5" /> {email}
        </a>
      )}
      {phone && (
        <a href={`tel:${phone}`} className="flex items-center gap-2 text-xs" style={{ color: isDark ? '#ffffff' : 'rgba(0,0,0,0.55)' }}>
          <Phone className="w-3.5 h-3.5" /> {phone}
        </a>
      )}
    </div>
  );
}

export default function SupplierDrawer({ supplier, onClose, onEdit, isAdmin }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('Overview');

  if (!supplier) return null;

  const statusCls = STATUS_STYLES[supplier.status] || STATUS_STYLES['Active'];
  const textMuted = isDark ? '#ffffff' : '#000000';

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 280, damping: 30 }}
      className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl overflow-hidden"
      style={{
        width: 'min(680px, 100vw)',
        background: isDark ? 'rgba(6,8,24,0.97)' : 'rgba(250,250,253,0.99)',
        borderLeft: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)',
        backdropFilter: 'blur(40px)',
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-6"
        style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <SupplierAvatar supplier={supplier} size={52} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold" style={{ color: isDark ? '#fff' : '#000000' }}>{supplier.supplier_name}</h2>
                {supplier.featured && <Star className="w-4 h-4 text-amber-400" fill="currentColor" />}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${statusCls}`}>{supplier.status}</span>
                {supplier.supplier_type && (
                  <span className="text-xs px-2 py-0.5 rounded-full border" style={{
                    color: isDark ? '#ffffff' : 'rgba(0,0,0,0.50)',
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)',
                  }}>{supplier.supplier_type}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={() => onEdit(supplier)}
                className="p-2 rounded-xl transition-colors hover:bg-white/10"
                style={{ color: isDark ? '#ffffff' : 'rgba(0,0,0,0.5)' }}>
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose}
              className="p-2 rounded-xl transition-colors hover:bg-white/10"
              style={{ color: isDark ? '#ffffff' : 'rgba(0,0,0,0.5)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="relative px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all"
              style={{
                borderBottomColor: activeTab === tab ? '#ec2ca3' : 'transparent',
                color: activeTab === tab ? '#ec2ca3' : (isDark ? '#ffffff' : 'rgba(0,0,0,0.40)'),
              }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>

            {activeTab === 'Overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left */}
                <div className="lg:col-span-2 space-y-5">
                  {supplier.description && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: isDark ? '#ffffff' : 'rgba(0,0,0,0.35)' }}>About</p>
                      <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{supplier.description}</p>
                    </div>
                  )}
                  {supplier.used_for && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: isDark ? '#ffffff' : 'rgba(0,0,0,0.35)' }}>Used For</p>
                      <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{supplier.used_for}</p>
                    </div>
                  )}
                  {supplier.tags?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: isDark ? '#ffffff' : 'rgba(0,0,0,0.35)' }}>Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {supplier.tags.map(tag => (
                          <span key={tag} className="text-xs px-2.5 py-1 rounded-full"
                            style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: isDark ? '#ffffff' : '#000000' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <div className="rounded-2xl p-4 space-y-3"
                    style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>Quick Actions</p>
                    {supplier.portal_url && (
                      <a href={supplier.portal_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full h-9 rounded-xl text-xs font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #ec2ca3, #7c3aed)' }}>
                        <ExternalLink className="w-3.5 h-3.5" /> Launch Portal
                      </a>
                    )}
                    {supplier.website && (
                      <a href={supplier.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full h-9 rounded-xl text-xs font-semibold transition-colors"
                        style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: isDark ? '#ffffff' : '#000000', border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)' }}>
                        <Globe className="w-3.5 h-3.5" /> Visit Website
                      </a>
                    )}
                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); }}
                      className="flex items-center justify-center gap-2 w-full h-9 rounded-xl text-xs font-semibold transition-colors"
                      style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: isDark ? '#ffffff' : '#000000', border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)' }}>
                      <Share2 className="w-3.5 h-3.5" /> Share Supplier
                    </button>
                  </div>
                  {/* Supplier Info */}
                  <div className="rounded-2xl p-4"
                    style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: isDark ? '#ffffff' : 'rgba(0,0,0,0.35)' }}>Info</p>
                    <InfoRow label="Status" value={supplier.status} />
                    <InfoRow label="Type" value={supplier.supplier_type} />
                    <InfoRow label="Contract Owner" value={supplier.contract_owner} />
                    <InfoRow label="Renewal Date" value={supplier.renewal_date} />
                    <InfoRow label="Next Review" value={supplier.next_review_date} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Contacts' && (
              <div className="space-y-4">
                <ContactCard title="Primary Contact"
                  name={supplier.primary_contact_name} role={supplier.primary_contact_role}
                  email={supplier.primary_contact_email} phone={supplier.primary_contact_phone} />
                <ContactCard title="Support Contact"
                  email={supplier.support_email} phone={supplier.support_phone} />
                <ContactCard title="Escalation Contact"
                  name={supplier.escalation_contact_name}
                  email={supplier.escalation_contact_email} phone={supplier.escalation_contact_phone} />
                {!supplier.primary_contact_email && !supplier.support_email && !supplier.escalation_contact_email && (
                  <p className="text-center py-12 text-sm" style={{ color: textMuted }}>No contacts recorded.</p>
                )}
              </div>
            )}

            {activeTab === 'Details' && (
              <div className="rounded-2xl overflow-hidden"
                style={{ border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
                <div className="p-4 space-y-0">
                  <InfoRow label="Website" value={supplier.website} link={supplier.website} />
                  <InfoRow label="Portal URL" value={supplier.portal_url} link={supplier.portal_url} />
                  <InfoRow label="Supplier Type" value={supplier.supplier_type} />
                  <InfoRow label="Contract Owner" value={supplier.contract_owner} />
                  <InfoRow label="Renewal Date" value={supplier.renewal_date} />
                  <InfoRow label="Next Review" value={supplier.next_review_date} />
                  <InfoRow label="Departments" value={supplier.departments?.join(', ')} />
                  <InfoRow label="Featured" value={supplier.featured ? 'Yes' : 'No'} />
                  <InfoRow label="Created" value={supplier.created_date ? new Date(supplier.created_date).toLocaleDateString('en-GB') : null} />
                </div>
              </div>
            )}

            {activeTab === 'Notes & Files' && (
              <div className="space-y-4">
                {supplier.internal_notes ? (
                  <div className="rounded-2xl p-5"
                    style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: isDark ? '#ffffff' : 'rgba(0,0,0,0.35)' }}>Internal Notes</p>
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: textMuted }}>{supplier.internal_notes}</p>
                  </div>
                ) : null}
                <div className="rounded-2xl p-5 text-center"
                  style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: isDark ? '1px dashed rgba(255,255,255,0.10)' : '1px dashed rgba(0,0,0,0.12)' }}>
                  <Link className="w-8 h-8 mx-auto mb-2" style={{ color: isDark ? '#ffffff' : 'rgba(0,0,0,0.20)' }} />
                  <p className="text-xs font-medium" style={{ color: isDark ? '#ffffff' : 'rgba(0,0,0,0.30)' }}>Contracts, SLAs, Price Lists &amp; Guides</p>
                  <p className="text-xs mt-1" style={{ color: isDark ? '#ffffff' : 'rgba(0,0,0,0.20)' }}>Document attachments — coming soon</p>
                </div>
                {!supplier.internal_notes && null}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}