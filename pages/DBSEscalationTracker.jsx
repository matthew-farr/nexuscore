import { useState, useMemo, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, Upload, ChevronUp, ChevronDown, ChevronsUpDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageContainer from '@/components/ui-custom/PageContainer';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/lib/AuthContext';
import DBSEscalationKPIs from '@/components/dbs-escalation/DBSEscalationKPIs';
import DBSEscalationDetail from '@/components/dbs-escalation/DBSEscalationDetail';
import DBSEscalationDrawer from '@/components/dbs-escalation/DBSEscalationDrawer';
import DBSEscalationImportDrawer from '@/components/dbs-escalation/DBSEscalationImportDrawer';
import { POLICE_FORCE_OPTIONS } from '@/lib/dbsEscalationImportUtils';

const STATUS_OPTIONS = [
  'LPF DETAILS',
  'WITHDRAWN',
  'ESCALATED',
  'DUE TO BE ESCALATED',
  'UNABLE TO ESCALATE ONLINE',
  'CJSM',
  'INTERNAL QUERY - INCONFLICT'
];

const STATUS_COLORS = {
  'LPF DETAILS': '#06b6d4',
  'WITHDRAWN': '#eab308',
  'ESCALATED': '#22c55e',
  'DUE TO BE ESCALATED': '#f97316',
  'UNABLE TO ESCALATE ONLINE': '#6b7280',
  'CJSM': '#ef4444',
  'INTERNAL QUERY - INCONFLICT': '#a855f7'
};

export default function DBSEscalationTracker() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({ eref: '', company: '', status: '', account_manager: '', escalated_agent: '' });
  const [sort, setSort] = useState({ field: 'dbs_submitted_date', dir: 'desc' });

  const handleSort = (field) => {
    setSort(prev => prev.field === field
      ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { field, dir: 'asc' }
    );
    setCurrentPage(1);
  };

  const formatDate = (val) => {
    if (!val) return '-';
    // val is yyyy-mm-dd
    const parts = val.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[2].length === 4 ? parts[0].slice(2) : parts[0]}`;
    return val;
  };
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showImportDrawer, setShowImportDrawer] = useState(false);

  // Inline editing state
  const [editingCell, setEditingCell] = useState(null); // { recordId, field }
  const [savingCell, setSavingCell] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [loadTime, setLoadTime] = useState(null);
  const debounceTimer = useRef(null);

  // Fetch records once on mount (100 max, sorted by date descending)
  const { data: records = [], isLoading, error: loadError, refetch } = useQuery({
    queryKey: ['dbsEscalations'],
    queryFn: async () => {
      try {
        console.time('dbs-escalation-initial-load');
        const startTime = performance.now();
        const result = await base44.entities.DBSEscalation.list('-dbs_submitted_date', 500);
        const endTime = performance.now();
        setLoadTime(endTime - startTime);
        console.timeEnd('dbs-escalation-initial-load');
        return result || [];
      } catch (err) {
        console.error('Failed to load DBSEscalations:', err);
        throw err;
      }
    },
    staleTime: 300000, // 5 minutes
    retry: 2,
  });

  // Debounced filter handler
  const handleFilterChange = (newFilters) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setFilters(newFilters);
      setCurrentPage(1);
    }, 50);
  };

  // Memoized filtered + sorted records
  const filteredRecords = useMemo(() => {
    const filtered = records.filter(r => {
      if (filters.eref && !r.eref?.toLowerCase().includes(filters.eref.toLowerCase())) return false;
      if (filters.company && !r.company?.toLowerCase().includes(filters.company.toLowerCase())) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.account_manager && !r.account_manager?.toLowerCase().includes(filters.account_manager.toLowerCase())) return false;
      if (filters.escalated_agent && !r.escalated_agent?.toLowerCase().includes(filters.escalated_agent.toLowerCase())) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      const aVal = a[sort.field] ?? '';
      const bVal = b[sort.field] ?? '';
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [records, filters, sort]);

  // Memoized pagination
  const totalPages = useMemo(() => Math.ceil(filteredRecords.length / pageSize), [filteredRecords.length, pageSize]);
  const paginatedRecords = useMemo(() => 
    filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredRecords, currentPage, pageSize]
  );

  // Calculate KPIs
  const kpis = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const escalatedRecords = records.filter(r => r.status === 'ESCALATED');

    return {
      total: records.length,
      dueToBeEscalated: records.filter(r => r.status === 'DUE TO BE ESCALATED').length,
      escalated: escalatedRecords.length,
      withdrawn: records.filter(r => r.status === 'WITHDRAWN').length,
      escalatedThisWeek: escalatedRecords.filter(r => r.escalated_date && new Date(r.escalated_date) >= startOfWeek).length,
      escalatedThisMonth: escalatedRecords.filter(r => r.escalated_date && new Date(r.escalated_date) >= startOfMonth).length,
    };
  }, [records]);

  const handleRowClick = (record) => {
    console.time('dbs-escalation-detail-open');
    setSelectedRecord(record);
    setIsNewRecord(false);
    setShowDetail(true);
    console.timeEnd('dbs-escalation-detail-open');
  };

  const handleAddNew = () => {
    console.time('dbs-escalation-drawer-open');
    setShowCreateDrawer(true);
    console.timeEnd('dbs-escalation-drawer-open');
  };

  const handleCreateSuccess = () => {
    console.time('dbs-escalation-refresh-after-create');
    refetch();
    console.timeEnd('dbs-escalation-refresh-after-create');
  };

  const handleInlineSave = async (record, field, newValue) => {
    if (newValue === record[field]) {
      setEditingCell(null);
      return;
    }
    setSavingCell({ recordId: record.id, field });
    try {
      const updates = { [field]: newValue };

      // Auto-fill escalated_agent and escalated_date when status changes to ESCALATED
      if (field === 'status' && newValue === 'ESCALATED') {
        if (!record.escalated_agent) {
          updates.escalated_agent = user?.full_name || user?.email || '';
        }
        if (!record.escalated_date) {
          updates.escalated_date = new Date().toISOString().split('T')[0];
        }
      }

      const oldRecord = record;
      await base44.entities.DBSEscalation.update(record.id, updates);

      // Write audit log for each changed field
      const auditEntries = Object.keys(updates).map(f =>
        base44.entities.DBSEscalationAudit.create({
          escalation_id: record.id,
          field_changed: f,
          old_value: String(oldRecord[f] ?? ''),
          new_value: String(updates[f] ?? ''),
          changed_by: user?.email || user?.full_name || 'Unknown'
        })
      );
      await Promise.all(auditEntries);
      refetch();
    } catch (err) {
      console.error('Inline save failed:', err);
    } finally {
      setSavingCell(null);
      setEditingCell(null);
    }
  };

  // Error state
  if (loadError) {
    return (
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-3xl font-bold mb-2">
            60 Day DBS Escalations
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 rounded-xl"
          style={{
            background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.3)'
          }}
        >
          <p style={{ color: '#ef4444' }} className="font-semibold mb-2">Failed to load records</p>
          <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} className="text-sm mb-4">
            {loadError.message || 'An error occurred while loading DBS escalations.'}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
        </motion.div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <h1 style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-3xl font-bold mb-2">
              60 Day DBS Escalations
            </h1>
            <p style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }} className="text-sm">
              Track DBS escalation records and status monitoring.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleAddNew}
              className="flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #ec2ca3, #ec2ca388)' }}
            >
              <Plus className="w-4 h-4" />
              Add Escalation
            </Button>
            <Button
              onClick={() => setShowImportDrawer(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import Escalations
            </Button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <DBSEscalationKPIs
        data={kpis}
        isDark={isDark}
        activeFilter={filters.status || null}
        onFilter={(statusValue) => {
          handleFilterChange({ ...filters, status: filters.status === statusValue ? '' : (statusValue || '') });
        }}
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6 p-4 rounded-xl"
        style={{
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <Input
              placeholder="Search ERef..."
              value={filters.eref}
              onChange={(e) => handleFilterChange({ ...filters, eref: e.target.value })}
              className="h-10"
            />
            <Input
              placeholder="Search Company..."
              value={filters.company}
              onChange={(e) => handleFilterChange({ ...filters, company: e.target.value })}
              className="h-10"
            />
            <Select value={filters.status || '__all__'} onValueChange={(value) => handleFilterChange({ ...filters, status: value === '__all__' ? '' : value })}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Search Account Manager..."
              value={filters.account_manager}
              onChange={(e) => handleFilterChange({ ...filters, account_manager: e.target.value })}
              className="h-10"
            />
            <Input
              placeholder="Search Escalated Agent..."
              value={filters.escalated_agent}
              onChange={(e) => handleFilterChange({ ...filters, escalated_agent: e.target.value })}
              className="h-10"
            />
          </div>
        </div>
      </motion.div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredRecords.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <p style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-lg font-semibold mb-2">
            {records.length === 0 ? 'No escalations yet' : 'No escalations found'}
          </p>
          <p style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }} className="mb-6">
            {records.length === 0 ? 'Create your first 60 Day DBS escalation record.' : 'Try adjusting your filters.'}
          </p>
          <Button onClick={handleAddNew} style={{ background: 'linear-gradient(135deg, #ec2ca3, #ec2ca388)' }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Escalation
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl overflow-hidden"
          style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  {[
                    { label: 'ERef', field: 'eref' },
                    { label: 'DBS Submitted', field: 'dbs_submitted_date' },
                    { label: 'App Ref', field: 'application_ref' },
                    { label: 'Status', field: 'status' },
                    { label: 'Escalated Agent', field: 'escalated_agent' },
                    { label: 'Escalated Date', field: 'escalated_date' },
                    { label: 'Local Police Force', field: 'police_details' },
                    { label: 'Account Manager', field: 'account_manager' },
                  ].map(({ label, field }) => {
                    const isActive = sort.field === field;
                    const Icon = isActive ? (sort.dir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown;
                    return (
                      <th
                        key={field}
                        onClick={() => handleSort(field)}
                        style={{ color: isActive ? (isDark ? '#ffffff' : '#0f0f2e') : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)') }}
                        className="text-left font-semibold p-4 whitespace-nowrap cursor-pointer select-none hover:opacity-80"
                      >
                        <span className="flex items-center gap-1">
                          {label}
                          <Icon className="w-3.5 h-3.5 opacity-70" />
                        </span>
                      </th>
                    );
                  })}
                  <th style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} className="text-left font-semibold p-4 whitespace-nowrap">
                    Portal
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((record) => {
                  const isEditingStatus = editingCell?.recordId === record.id && editingCell?.field === 'status';
                  const isEditingDate = editingCell?.recordId === record.id && editingCell?.field === 'escalated_date';
                  const isEditingPolice = editingCell?.recordId === record.id && editingCell?.field === 'police_details';
                  const isSaving = savingCell?.recordId === record.id;

                  return (
                    <tr
                      key={record.id}
                      style={{
                        borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: 'transparent'
                      }}
                      className="hover:opacity-80"
                    >
                      {/* ERef - click opens drawer */}
                      <td className="p-4 font-semibold text-primary" onClick={() => handleRowClick(record)}>{record.eref}</td>
                      {/* DBS Submitted - click opens drawer */}
                      <td className="p-4 text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }} onClick={() => handleRowClick(record)}>
                        {formatDate(record.dbs_submitted_date)}
                      </td>
                      {/* App Ref - click opens portal if company_id exists, else opens drawer */}
                      <td className="p-4 text-xs" onClick={(e) => {
                        if (record.company_id) { e.stopPropagation(); window.open(`https://portal.checksdirect.co.uk/admin/view-company.php?id=${record.company_id}#listPrevChk`, '_blank'); }
                        else handleRowClick(record);
                      }}>
                        {record.company_id ? (
                          <span className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors font-medium">
                            {record.application_ref || '-'}
                          </span>
                        ) : (
                          <span style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)' }}>
                            {record.application_ref || '-'}
                          </span>
                        )}
                      </td>

                      {/* Status - always-visible select */}
                      <td className="p-2" onClick={(e) => e.stopPropagation()}>
                        {isSaving && savingCell?.field === 'status' ? (
                          <span className="text-xs px-2.5 py-1">...</span>
                        ) : (
                          <Select
                            value={record.status || ''}
                            onValueChange={(val) => handleInlineSave(record, 'status', val)}
                          >
                            <SelectTrigger className="h-7 text-xs w-44 border-0 bg-transparent p-0 shadow-none focus:ring-0" onClick={(e) => e.stopPropagation()}>
                              <span
                                style={{ background: STATUS_COLORS[record.status] + '20', color: STATUS_COLORS[record.status] }}
                                className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                              >
                                {record.status || '-'}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                      </td>

                      {/* Escalated Agent - click opens drawer */}
                      <td className="p-4 text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)' }} onClick={() => handleRowClick(record)}>
                        {record.escalated_agent || '-'}
                      </td>

                      {/* Escalated Date - inline editable */}
                      <td className="p-2" onClick={(e) => { e.stopPropagation(); if (!isEditingDate) setEditingCell({ recordId: record.id, field: 'escalated_date' }); }}>
                        {isEditingDate ? (
                          <input
                            type="date"
                            autoFocus
                            defaultValue={record.escalated_date || ''}
                            className="text-xs border rounded px-2 py-1 h-7"
                            style={{ background: isDark ? '#1a1a2e' : '#fff', color: isDark ? '#fff' : '#000', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
                            onClick={(e) => e.stopPropagation()}
                            onBlur={(e) => handleInlineSave(record, 'escalated_date', e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditingCell(null); }}
                          />
                        ) : (
                          <span className="text-xs hover:opacity-75 transition-opacity" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)' }} title="Click to edit">
                            {isSaving && savingCell?.field === 'escalated_date' ? '...' : formatDate(record.escalated_date)}
                          </span>
                        )}
                      </td>

                      {/* Police Force - always-visible select */}
                      <td className="p-2" onClick={(e) => e.stopPropagation()}>
                        {isSaving && savingCell?.field === 'police_details' ? (
                          <span className="text-xs px-2">...</span>
                        ) : (
                          <Select
                            value={record.police_details || '__blank__'}
                            onValueChange={(val) => handleInlineSave(record, 'police_details', val === '__blank__' ? '' : val)}
                          >
                            <SelectTrigger className="h-7 text-xs w-48" onClick={(e) => e.stopPropagation()}>
                              <SelectValue placeholder="— None —" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__blank__">— None —</SelectItem>
                              {POLICE_FORCE_OPTIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                      </td>

                      {/* Account Manager - click opens drawer */}
                      <td className="p-4 text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)' }} onClick={() => handleRowClick(record)}>
                        {record.account_manager || '-'}
                      </td>

                      {/* Portal link */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        {record.company_id ? (
                          <a
                            href={`https://portal.checksdirect.co.uk/admin/view-company.php?id=${record.company_id}#listPrevChk`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View
                          </a>
                        ) : (
                          <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Pagination & Load Time */}
      {filteredRecords.length > pageSize && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mt-6 p-4 rounded-lg"
          style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)'
          }}
        >
          <div style={{ flex: 1 }}>
            <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} className="text-sm">
              Page {currentPage} of {totalPages} • Showing {paginatedRecords.length} of {filteredRecords.length} results
            </span>
            {loadTime && (
              <div style={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)', marginTop: '4px' }}>
                Query time: {loadTime.toFixed(0)}ms
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Detail Drawer */}
      <AnimatePresence>
        {showDetail && (
          <DBSEscalationDetail
            record={selectedRecord}
            isDark={isDark}
            onClose={() => setShowDetail(false)}
            onSave={handleCreateSuccess}
            isNew={isNewRecord}
          />
        )}
      </AnimatePresence>

      {/* Create Drawer */}
      <DBSEscalationDrawer
        isOpen={showCreateDrawer}
        onClose={() => setShowCreateDrawer(false)}
        onSuccess={handleCreateSuccess}
        isDark={isDark}
        userDisplayName={user?.full_name || user?.email || ''}
      />

      {/* Import Drawer */}
      <DBSEscalationImportDrawer
        isOpen={showImportDrawer}
        onClose={() => setShowImportDrawer(false)}
        onSuccess={handleCreateSuccess}
        isDark={isDark}
      />
    </PageContainer>
  );
}