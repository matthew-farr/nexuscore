import { motion } from 'framer-motion';
import { ExternalLink, ChevronRight, Star, Mail, Phone } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const STATUS_STYLES = {
  'Active':       { cls: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30' },
  'Under Review': { cls: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30' },
  'Inactive':     { cls: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30' },
};

const TYPE_COLOURS = ['#ec2ca3', '#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#3b82f6', '#f97316', '#8b5cf6', '#14b8a6', '#6b7280'];

function SupplierAvatar({ supplier, size = 44 }) {
  const initial = supplier.supplier_name?.charAt(0)?.toUpperCase() || '?';
  const colourIndex = supplier.supplier_name ? supplier.supplier_name.charCodeAt(0) % TYPE_COLOURS.length : 0;
  const colour = supplier.logo_colour || TYPE_COLOURS[colourIndex];

  if (supplier.logo_url) {
    return (
      <img src={supplier.logo_url} alt={supplier.supplier_name} className="rounded-full object-contain bg-white"
        style={{ width: size, height: size, border: `2px solid rgba(255,255,255,0.15)` }}
        onError={e => { e.target.style.display = 'none'; }}
      />
    );
  }
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${colour}, ${colour}aa)`, fontSize: size * 0.38, border: `2px solid ${colour}50` }}>
      {initial}
    </div>
  );
}

export { SupplierAvatar };

export default function SupplierCard({ supplier, onView, index }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const statusStyle = STATUS_STYLES[supplier.status] || STATUS_STYLES['Active'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="rounded-2xl flex flex-col overflow-hidden group transition-all duration-200 hover:scale-[1.015]"
      style={{
        background: isDark
          ? 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)'
          : 'rgba(255,255,255,1)',
        border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.08)',
        boxShadow: isDark
          ? '0 4px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.08)'
          : '0 2px 16px rgba(0,0,0,0.06)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Card Header */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <SupplierAvatar supplier={supplier} size={44} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm truncate" style={{ color: isDark ? '#fff' : '#000000' }}>
                  {supplier.supplier_name}
                </h3>
                {supplier.featured && <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="currentColor" />}
              </div>
              {supplier.supplier_type && (
                <span className="text-xs" style={{ color: isDark ? '#ffffff' : '#000000' }}>
                  {supplier.supplier_type}
                </span>
              )}
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 ${statusStyle.cls}`}>
            {supplier.status || 'Active'}
          </span>
        </div>

        {/* Description */}
        {supplier.description && (
          <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: isDark ? '#ffffff' : '#000000' }}>
            {supplier.description}
          </p>
        )}

        {/* Contact preview */}
        {(supplier.support_email || supplier.primary_contact_email || supplier.support_phone || supplier.primary_contact_phone) && (
          <div className="space-y-1 mb-3">
            {(supplier.support_email || supplier.primary_contact_email) && (
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 flex-shrink-0" style={{ color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.30)' }} />
                <span className="text-xs truncate" style={{ color: isDark ? '#ffffff' : '#000000' }}>
                  {supplier.support_email || supplier.primary_contact_email}
                </span>
              </div>
            )}
            {(supplier.support_phone || supplier.primary_contact_phone) && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 flex-shrink-0" style={{ color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.30)' }} />
                <span className="text-xs" style={{ color: isDark ? '#ffffff' : '#000000' }}>
                  {supplier.support_phone || supplier.primary_contact_phone}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {supplier.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {supplier.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: isDark ? '#ffffff' : '#000000' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 pb-4 flex gap-2 mt-auto pt-3"
        style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
        {supplier.portal_url && supplier.portal_url !== '#' && (
          <a
            href={supplier.portal_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #ec2ca3, #7c3aed)' }}
          >
            <ExternalLink className="w-3 h-3" /> Launch Portal
          </a>
        )}
        <button
          onClick={() => onView(supplier)}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
            color: isDark ? '#ffffff' : '#000000',
            border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.08)',
          }}
        >
          View Details <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}