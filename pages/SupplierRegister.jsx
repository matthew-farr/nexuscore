import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/lib/AuthContext';
import { Building2, Plus, PackageOpen } from 'lucide-react';
import SupplierKPICards from '@/components/supplier-register/SupplierKPICards';
import SupplierFilters from '@/components/supplier-register/SupplierFilters';
import SupplierCard from '@/components/supplier-register/SupplierCard';
import SupplierDrawer from '@/components/supplier-register/SupplierDrawer';
import SupplierFormDrawer from '@/components/supplier-register/SupplierFormDrawer';

export default function SupplierRegister() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [department, setDepartment] = useState('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [viewSupplier, setViewSupplier] = useState(null);
  const [editSupplier, setEditSupplier] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['supplier-register'],
    queryFn: () => base44.entities.SupplierRegister.list('sort_order', 200),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return suppliers.filter(s => {
      if (featuredOnly && !s.featured) return false;
      if (type !== 'all' && s.supplier_type !== type) return false;
      if (status !== 'all' && s.status !== status) return false;
      if (department !== 'all' && !(s.departments || []).includes(department)) return false;
      if (q) {
        const haystack = [s.supplier_name, s.description, s.used_for, s.primary_contact_name, s.primary_contact_email, s.support_email, ...(s.tags || [])].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [suppliers, search, type, status, department, featuredOnly]);

  const clearFilters = () => { setSearch(''); setType('all'); setStatus('all'); setDepartment('all'); setFeaturedOnly(false); };

  const onSaved = () => {
    qc.invalidateQueries({ queryKey: ['supplier-register'] });
    setFormOpen(false);
    setEditSupplier(null);
  };

  return (
    <div className="min-h-screen" style={{ background: isDark ? '#050816' : '#f5f5f8' }}>
      {/* Page Header */}
      <div className="relative overflow-hidden"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #0a1128 0%, #07081a 60%, #050e1f 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 60%, #e0f2fe 100%)',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        }}>
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 right-20 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: '#ec2ca3' }} />
          <div className="absolute top-0 right-80 w-60 h-60 rounded-full blur-3xl opacity-10" style={{ background: '#7c3aed' }} />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-6 py-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(236,44,163,0.20), rgba(124,58,237,0.20))', border: '1px solid rgba(236,44,163,0.35)', boxShadow: '0 0 20px rgba(236,44,163,0.25)' }}>
              <Building2 className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: isDark ? '#fff' : '#000000' }}>Supplier Register</h1>
              <p className="text-sm mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#000000' }}>
                Central directory for supplier contacts, portals, support details and operational usage.
              </p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setEditSupplier(null); setFormOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #ec2ca3, #7c3aed)', boxShadow: '0 4px 16px rgba(236,44,163,0.35)' }}
            >
              <Plus className="w-4 h-4" /> Add Supplier
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* KPIs */}
        <SupplierKPICards suppliers={suppliers} />

        {/* Filters */}
        <SupplierFilters
          search={search} setSearch={setSearch}
          type={type} setType={setType}
          status={status} setStatus={setStatus}
          department={department} setDepartment={setDepartment}
          featuredOnly={featuredOnly} setFeaturedOnly={setFeaturedOnly}
          onClear={clearFilters}
        />

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl animate-pulse"
                style={{ height: '220px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <PackageOpen className="w-12 h-12 mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.20)' }} />
            <p className="text-base font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.40)' : '#000000' }}>No suppliers found</p>
            <p className="text-sm mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.25)' : '#000000' }}>Try adjusting your filters or add a new supplier</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((s, i) => (
                <SupplierCard key={s.id} supplier={s} onView={setViewSupplier} index={i} />
              ))}
            </div>
            <p className="text-center text-xs mt-6" style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }}>
              {filtered.length} supplier{filtered.length !== 1 ? 's' : ''} shown
            </p>
          </>
        )}
      </div>

      {/* View Drawer */}
      <AnimatePresence>
        {viewSupplier && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setViewSupplier(null)} />
            <SupplierDrawer
              supplier={viewSupplier}
              onClose={() => setViewSupplier(null)}
              onEdit={(s) => { setViewSupplier(null); setEditSupplier(s); setFormOpen(true); }}
              isAdmin={isAdmin}
            />
          </>
        )}
      </AnimatePresence>

      {/* Add/Edit Form Drawer */}
      <AnimatePresence>
        {formOpen && (
          <>
            <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => { setFormOpen(false); setEditSupplier(null); }} />
            <SupplierFormDrawer
              supplier={editSupplier}
              user={user}
              onClose={() => { setFormOpen(false); setEditSupplier(null); }}
              onSaved={onSaved}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}