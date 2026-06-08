import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Download, Upload, Search, ChevronDown, 
  X, Edit, Trash2, Clock, Mail, Shield, MessageSquare,
  AlertCircle, CheckCircle2, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import PageContainer from '@/components/ui-custom/PageContainer';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/lib/AuthContext';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { calculateQueryAge, formatQueryAge } from '@/lib/dbsQueryUtils';
import DBSQueryForm from '@/components/dbs/DBSQueryForm';
import DBSQueryDetail from '@/components/dbs/DBSQueryDetail';
import DBSImportModal from '@/components/dbs/DBSImportModal';
import DBSKPICards from '@/components/dbs/DBSKPICards';
import DBSQueryTableEnhanced from '@/components/dbs/DBSQueryTableEnhanced';

const STAGE_OPTIONS = [
  'New CJSM', 'Sent to Client', 'Waiting on Client', 'Client Chased', 'Client Responded',
  'Responded to DBS', 'Further Clarification Required', 'Withdrawn', 'Duplicated', 'Cancelled'
];

const AGENT_OPTIONS = [
  'Matthew', 'Claire', 'Sam', 'Sandra', 'Admin Team', 'Compliance Team'
];

const QUERY_TYPES = [
  'Previous Name', 'Previous Address', 'Address History', 'Identity Query', 
  'Legislative Wording', 'Eligibility Query', 'Duplicate Application', 
  'Overseas Query', 'Barred List Query', 'Other'
];

export default function DBSQueryTracker() {
  useActivityTracking({ 
    entity_type: 'tool', 
    entity_id: 'dbs_query_tracker', 
    title: 'DBS Query & CJSM Tracker', 
    route: '/dbs-tracker',
    icon: 'Shield' 
  });

  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    search: '',
    stage: '',
    agent: '',
    queryType: '',
    dateRangeStart: '',
    dateRangeEnd: '',
    furtherClarificationOnly: false,
    waitingOnClientOnly: false,
    waitingOnClientStale: false
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showImport, setShowImport] = useState(false);

  // Fetch all queries
  const { data: queries = [], isLoading: queriesLoading, refetch: refetchQueries } = useQuery({
    queryKey: ['dbsQueries'],
    queryFn: () => base44.entities.DBSQueryTracker.list(),
  });

  // Fetch notes for selected record (sorted newest first)
  const { data: notes = [] } = useQuery({
    queryKey: ['dbsNotes', selectedRecord?.id],
    queryFn: () => selectedRecord?.id 
      ? base44.entities.DBSQueryNote.filter({ query_id: selectedRecord.id }, '-created_date', 100)
      : Promise.resolve([]),
    enabled: !!selectedRecord?.id,
    staleTime: 0 // Always refetch to ensure fresh data
  });

  // Fetch audit log for selected record
  const { data: auditLog = [] } = useQuery({
    queryKey: ['dbsAudit', selectedRecord?.id],
    queryFn: () => selectedRecord?.id
      ? base44.entities.DBSQueryAuditLog.filter({ query_id: selectedRecord.id }, '-changed_date', 100)
      : Promise.resolve([]),
    enabled: !!selectedRecord?.id
  });

  // Filter queries
  const filteredQueries = queries.filter(q => {
    const searchTerm = filters.search.toLowerCase();
    if (searchTerm && !q.company_name?.toLowerCase().includes(searchTerm) &&
        !q.eref?.toLowerCase().includes(searchTerm) &&
        !q.our_ref?.toLowerCase().includes(searchTerm)) return false;
    
    if (filters.stage && q.stage !== filters.stage) return false;
    if (filters.agent && q.agent_assigned !== filters.agent) return false;
    if (filters.queryType && q.query_type !== filters.queryType) return false;
    if (filters.furtherClarificationOnly && !q.further_clarification_required) return false;
    if (filters.waitingOnClientOnly && q.stage !== 'Waiting on Client') return false;
    if (filters.waitingOnClientStale) {
      if (q.stage !== 'Waiting on Client') return false;
      const sentDate = q.date_sent_to_client;
      if (!sentDate) return false;
      const daysDiff = Math.floor((new Date() - new Date(sentDate)) / (1000 * 60 * 60 * 24));
      if (daysDiff < 10) return false;
    }
    
    if (filters.dateRangeStart && new Date(q.date_received) < new Date(filters.dateRangeStart)) return false;
    if (filters.dateRangeEnd && new Date(q.date_received) > new Date(filters.dateRangeEnd)) return false;
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredQueries.length / pageSize);
  const paginatedQueries = filteredQueries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Fetch notes for all records
  const { data: allNotes = {} } = useQuery({
    queryKey: ['dbsAllNotes'],
    queryFn: async () => {
      const notesData = await base44.entities.DBSQueryNote.list();
      const grouped = {};
      notesData.forEach(note => {
        if (!grouped[note.query_id]) grouped[note.query_id] = [];
        grouped[note.query_id].push(note);
      });
      return grouped;
    }
  });

  // KPI calculations
  const kpis = useMemo(() => {
    const closedStages = ['Withdrawn', 'Duplicated', 'Cancelled', 'Responded to DBS'];
    return {
      waitingOnClient: queries.filter(q => q.stage === 'Waiting on Client').length,
      chaseClient: queries.filter(q => {
        if (q.stage !== 'Waiting on Client') return false;
        const sentDate = q.date_sent_to_client;
        if (!sentDate) return false;
        return Math.floor((new Date() - new Date(sentDate)) / (1000 * 60 * 60 * 24)) >= 10;
      }).length,
      respondedToDBS: queries.filter(q => q.stage === 'Responded to DBS').length,
      clarification: queries.filter(q => q.further_clarification_required).length,
      thisMonth: queries.filter(q => {
        const thisMonth = new Date().toISOString().slice(0, 7);
        return q.date_received?.slice(0, 7) === thisMonth;
      }).length,
    };
  }, [queries]);

  const handleExport = () => {
    const headers = [
      'Date Received', 'EREF', 'Our Ref', 'Company Name', 'Query Type', 'Agent Assigned',
      'Stage', 'Query Age', 'Date Sent to Client', 'Date Client Replied', 'Date Replied to DBS', 
      'Date Resent / Chased', 'Client Response', 'Response Sent to DBS', 'Action Taken',
      'Further Clarification', 'Source', 'Last Updated', 'Last Updated By', 'Created By', 'Created Date'
    ];

    const rows = queries.map(q => {
      const age = calculateQueryAge(q.date_received);
      return [
        q.date_received || '',
        q.eref || '',
        q.our_ref || '',
        q.company_name || '',
        q.query_type || '',
        q.agent_assigned || '',
        q.stage || '',
        age !== null ? age : 'Invalid date',
        q.date_sent_to_client || '',
        q.date_client_replied || '',
        q.date_replied_to_dbs || '',
        q.date_resent_chased || '',
        q.client_response || '',
        q.response_sent_to_dbs || '',
        q.action_taken_summary || '',
        q.further_clarification_required ? 'Yes' : 'No',
        q.source || '',
        q.updated_date || '',
        q.updated_by || '',
        q.created_by || '',
        q.created_date || ''
      ];
    });

    const csv = [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DBS-Queries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this query?')) {
      await base44.entities.DBSQueryTracker.delete(id);
      refetchQueries();
      setSelectedRecord(null);
    }
  };

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
            <h1 className="text-3xl font-bold mb-2" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
              DBS Query & CJSM Tracker
            </h1>
            <p style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }} className="text-sm">
              Track CJSM queries, client responses, DBS replies and clarification history.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={async () => {
                if (window.confirm('This will delete records with invalid dates and migrate imported data to "Responded to DBS". Continue?')) {
                  const res = await base44.functions.invoke('cleanupAndMigrateDBSQueries', {});
                  if (res.data.success) {
                    alert(`✓ Cleaned ${res.data.invalidRecordsDeleted} invalid records\n✓ Migrated ${res.data.recordsMigrated} records`);
                    refetchQueries();
                  }
                }
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Cleanup & Migrate
            </Button>
            <Button 
              onClick={() => setShowImport(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import Data
            </Button>
            <Button 
              onClick={handleExport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button 
              onClick={() => { setEditingRecord(null); setShowForm(true); }}
              className="flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #ec2ca3, #ec2ca388)', border: '1px solid #ec2ca380' }}
            >
              <Plus className="w-4 h-4" />
              Add Query
            </Button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <DBSKPICards 
        data={kpis} 
        isDark={isDark}
        onFilterClick={(field) => {
          setCurrentPage(1);
          if (field === 'waitingOnClient') {
            setFilters({ ...filters, stage: 'Waiting on Client', waitingOnClientStale: false });
          } else if (field === 'chaseClient') {
            setFilters({ ...filters, stage: '', waitingOnClientStale: true, waitingOnClientOnly: false });
          } else if (field === 'respondedToDBS') {
            setFilters({ ...filters, stage: 'Responded to DBS' });
          } else if (field === 'clarification') {
            setFilters({ ...filters, furtherClarificationOnly: !filters.furtherClarificationOnly });
          }
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
        {/* Row 1: Search, Stage, Agent, Query Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <Input
            type="text"
            placeholder="Search company, EREF, Our Ref..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="text-xs"
          />

          <Select value={filters.stage} onValueChange={(value) => setFilters({ ...filters, stage: value })}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Stages</SelectItem>
              {STAGE_OPTIONS.map(stage => (
                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.agent} onValueChange={(value) => setFilters({ ...filters, agent: value })}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="All Agents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Agents</SelectItem>
              {AGENT_OPTIONS.map(agent => (
                <SelectItem key={agent} value={agent}>{agent}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.queryType} onValueChange={(value) => setFilters({ ...filters, queryType: value })}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="All Query Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Query Types</SelectItem>
              {QUERY_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 2: Date From, Date To, Checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <Input
            type="date"
            value={filters.dateRangeStart}
            onChange={(e) => setFilters({ ...filters, dateRangeStart: e.target.value })}
            className="text-xs"
            placeholder="Date From"
          />
          <Input
            type="date"
            value={filters.dateRangeEnd}
            onChange={(e) => setFilters({ ...filters, dateRangeEnd: e.target.value })}
            className="text-xs"
            placeholder="Date To"
          />
          
          <div className="flex items-center gap-2">
            <Checkbox
              id="furtherClarif"
              checked={filters.furtherClarificationOnly}
              onCheckedChange={(checked) => setFilters({ ...filters, furtherClarificationOnly: checked })}
            />
            <label htmlFor="furtherClarif" className="text-xs cursor-pointer">Further Clarif</label>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox
              id="waitingOnClient"
              checked={filters.waitingOnClientOnly}
              onCheckedChange={(checked) => setFilters({ ...filters, waitingOnClientOnly: checked })}
            />
            <label htmlFor="waitingOnClient" className="text-xs cursor-pointer">Waiting on Client</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="waitingOnClientStale"
              checked={filters.waitingOnClientStale}
              onCheckedChange={(checked) => setFilters({ ...filters, waitingOnClientStale: checked, waitingOnClientOnly: false })}
            />
            <label htmlFor="waitingOnClientStale" className="text-xs cursor-pointer flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              Waiting on Client 10+ days
            </label>
          </div>
        </div>
      </motion.div>

      {/* Table or Empty State */}
      {queriesLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredQueries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold mb-2" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
            No DBS queries yet
          </p>
          <p style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }} className="mb-6">
            Upload your existing CJSM tracker or create your first DBS query.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setShowImport(true)} variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
            <Button 
              onClick={() => { setEditingRecord(null); setShowForm(true); }}
              style={{ background: 'linear-gradient(135deg, #ec2ca3, #ec2ca388)' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Query
            </Button>
          </div>
        </motion.div>
      ) : (
        <div>
          <DBSQueryTableEnhanced 
            records={paginatedQueries} 
            isDark={isDark}
            onView={setSelectedRecord}
            onEdit={(record) => { setEditingRecord(record); setShowForm(true); }}
            onDelete={handleDelete}
            notes={allNotes}
            onRecordUpdated={() => { refetchQueries(); }}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mt-6 p-4 rounded-lg"
              style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)'
              }}
            >
              <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} className="text-sm">
                Page {currentPage} of {totalPages} • Showing {paginatedQueries.length} of {filteredQueries.length} results
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Add/Edit Form Drawer */}
      <AnimatePresence>
        {showForm && (
          <DBSQueryForm
            record={editingRecord}
            onClose={() => { setShowForm(false); setEditingRecord(null); }}
            onSuccess={() => {
              refetchQueries();
              setShowForm(false);
              setEditingRecord(null);
            }}
            onRecordFound={(foundRecord) => {
              setEditingRecord(foundRecord);
            }}
            isDark={isDark}
            queryTypes={QUERY_TYPES}
            stages={STAGE_OPTIONS}
          />
        )}
      </AnimatePresence>

      {/* Detail Drawer Overlay */}
      <AnimatePresence>
        {selectedRecord && (
          <DBSQueryDetail
            record={selectedRecord}
            notes={notes}
            auditLog={auditLog}
            isDark={isDark}
            onEdit={() => { setSelectedRecord(null); setEditingRecord(selectedRecord); setShowForm(true); }}
            onDelete={() => handleDelete(selectedRecord.id)}
            onClose={() => setSelectedRecord(null)}
            onRefresh={() => refetchQueries()}
          />
        )}
      </AnimatePresence>

      {/* Import Modal */}
      {showImport && (
        <DBSImportModal
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            setShowImport(false);
            refetchQueries();
          }}
          isDark={isDark}
        />
      )}
    </PageContainer>
  );
}