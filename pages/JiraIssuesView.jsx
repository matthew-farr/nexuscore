import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RefreshCw, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { useTheme } from '../components/ThemeProvider';
import JiraIssuesKPIs from '../components/jira/JiraIssuesKPIs';
import JiraIssueRow from '../components/jira/JiraIssueRow';
import JiraKPIDiagnostics from '../components/jira/JiraKPIDiagnostics';
import { formatDistanceToNow, isToday, isWithinInterval, subDays, startOfWeek, endOfWeek } from 'date-fns';

const ISSUE_TYPES = ['Bug', 'Support', 'BAU Project', 'Epic'];
const STATUSES = ['To Do', 'In Progress', 'In Review', 'Ready for Testing'];
const PRIORITIES = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

export default function JiraIssuesView() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  useActivityTracking({ entity_type: 'hub', entity_id: 'jira', title: 'Jira Issues', route: '/jira-issues', icon: 'AlertCircle' });

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [activeTab, setActiveTab] = useState('open');
  const [syncing, setSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const queryClient = useQueryClient();

  // Auto-set sort field when tab changes
  useEffect(() => {
    const dateField = activeTab === 'completed' ? 'resolved_at' : 'created_at';
    setSortField(dateField);
    setSortDir('desc');
    setCurrentPage(1);
  }, [activeTab]);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: issues = [], isLoading, error, refetch } = useQuery({
    queryKey: ['jiraIssues'],
    queryFn: async () => {
      const all = await base44.entities.JiraIssue.filter({ is_active: true }, '-updated_at', 500);
      return all.filter(i => i.status_category !== 'Done');
    },
  });

  const { data: completedIssues = [], isLoading: isLoadingCompleted } = useQuery({
    queryKey: ['jiraIssuesCompleted'],
    queryFn: async () => {
      const all = await base44.entities.JiraIssue.list('-created_at', 500);
      return all.filter(i => i.status_category === 'Done');
    },
  });

  const handleSync = async () => {
    setSyncing(true);
    try {
      await base44.functions.invoke('syncJiraIssues', {});
      await queryClient.invalidateQueries({ queryKey: ['jiraIssues'] });
      await queryClient.invalidateQueries({ queryKey: ['jiraIssuesCompleted'] });
    } finally {
      setSyncing(false);
    }
  };

  const currentDataset = activeTab === 'open' ? issues : completedIssues;

  const statuses = useMemo(() => {
    const unique = [...new Set(currentDataset.map(i => i.status).filter(Boolean))];
    return unique.sort();
  }, [currentDataset]);

  const assignees = useMemo(() => {
    const unique = [...new Set(currentDataset.map(i => i.assignee_name).filter(Boolean))];
    return unique.sort();
  }, [currentDataset]);

  const normalise = (value) => String(value || '').trim().toLowerCase();

  const KPI_TYPE_MATCHERS = {
    bugs:    (t) => ['bug', 'bugs'].includes(normalise(t)),
    support: (t) => ['support'].includes(normalise(t)),
    epics:   (t) => ['epic', 'epics'].includes(normalise(t)),
    bau:     (t) => ['bau project', 'bau projects', 'bau'].includes(normalise(t)),
    triage:  (t) => ['triage'].includes(normalise(t)),
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  const filtered = useMemo(() => {
    const baseIssues = activeTab === 'open' ? issues : completedIssues;
    const now = new Date();

    // Step 1: KPI type filter
    let afterKpiFilter = baseIssues;
    if (selectedKPI && KPI_TYPE_MATCHERS[selectedKPI]) {
      const matcher = KPI_TYPE_MATCHERS[selectedKPI];
      afterKpiFilter = baseIssues.filter(issue => matcher(issue.issue_type));
    }

    // Step 2: All other filters
    let result = afterKpiFilter.filter(issue => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !issue.issue_key?.toLowerCase().includes(q) &&
          !issue.summary?.toLowerCase().includes(q) &&
          !issue.description?.toLowerCase().includes(q)
        ) return false;
      }
      if (typeFilter !== 'all' && issue.issue_type !== typeFilter) return false;
      if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false;
      if (assigneeFilter !== 'all' && issue.assignee_name !== assigneeFilter) return false;

      // Date-based KPIs (non-type)
      if (selectedKPI && !KPI_TYPE_MATCHERS[selectedKPI] && selectedKPI !== 'total') {
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        if (activeTab === 'open' && ['createdToday', 'createdThisWeek', 'createdLast30Days'].includes(selectedKPI)) {
          const createdDate = parseDate(issue.created_at);
          if (!createdDate) return false;
          if (selectedKPI === 'createdToday' && !isToday(createdDate)) return false;
          if (selectedKPI === 'createdThisWeek' && !isWithinInterval(createdDate, { start: weekStart, end: weekEnd })) return false;
          if (selectedKPI === 'createdLast30Days' && !isWithinInterval(createdDate, { start: subDays(now, 30), end: now })) return false;
        }
        if (activeTab === 'completed' && ['closedToday', 'closedThisWeek', 'closedLast30Days'].includes(selectedKPI)) {
          const resolvedDate = parseDate(issue.resolved_at);
          if (!resolvedDate) return false;
          if (selectedKPI === 'closedToday' && !isToday(resolvedDate)) return false;
          if (selectedKPI === 'closedThisWeek' && !isWithinInterval(resolvedDate, { start: weekStart, end: weekEnd })) return false;
          if (selectedKPI === 'closedLast30Days' && !isWithinInterval(resolvedDate, { start: subDays(now, 30), end: now })) return false;
        }
      }
      return true;
    });

    // Attach debug info to the array object for use in render
    result._debug = {
      baseLength: baseIssues.length,
      afterKpiLength: afterKpiFilter.length,
      finalLength: result.length,
      first5Types: result.slice(0, 5).map(i => i.issue_type || '—'),
    };

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      // For completed issues, fall back to updated_at if resolved_at is missing
      if (activeTab === 'completed' && sortField === 'resolved_at') {
        if (!aVal) aVal = a.updated_at;
        if (!bVal) bVal = b.updated_at;
      }
      if (!aVal || !bVal) return 0;
      // Parse dates if they look like ISO strings
      if (typeof aVal === 'string' && aVal.match(/^\d{4}-\d{2}-\d{2}T/)) {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [issues, completedIssues, activeTab, search, typeFilter, statusFilter, priorityFilter, assigneeFilter, sortField, sortDir, selectedKPI]);

  const totalPages = pageSize === -1 ? 1 : Math.ceil(filtered.length / pageSize);
  const paginatedIssues = pageSize === -1 
    ? filtered 
    : filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const lastSynced = issues.length > 0
    ? issues.reduce((latest, issue) => {
      const date = new Date(issue.last_synced_at);
      return date > latest ? date : latest;
    }, new Date(0))
    : null;

  if (isLoading || (activeTab === 'completed' && isLoadingCompleted)) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-background' : 'bg-white'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className={`w-8 h-8 border-2 rounded-full animate-spin ${isDark ? 'border-purple-500/20 border-t-purple-500' : 'border-purple-300 border-t-purple-600'}`} />
          <p className={`text-sm ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Loading Jira issues…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isDark ? 'bg-background' : 'bg-white'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Jira Issues</h1>
          <p className={`text-sm ${isDark ? 'text-white/50' : 'text-slate-600'}`}>
            Bugs, support tickets, BAU projects and epics synced from Jira
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('open')}
              className={`px-4 h-9 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'open'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : isDark ? 'bg-white/6 text-white/60 hover:text-white/80' : 'bg-slate-100 text-slate-600 hover:text-slate-800'
              }`}
            >
              Open Issues
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 h-9 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'completed'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : isDark ? 'bg-white/6 text-white/60 hover:text-white/80' : 'bg-slate-100 text-slate-600 hover:text-slate-800'
              }`}
            >
              Completed Issues
            </button>
          </div>
          
          <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
            <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-white/40' : 'text-slate-600'}`}>
              <Clock className="w-3.5 h-3.5" />
              {lastSynced
                ? `Last synced ${formatDistanceToNow(lastSynced, { addSuffix: true })} · ${lastSynced.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} on ${lastSynced.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                : 'Never synced'}
            </div>
            {['admin', 'super_admin'].includes(user?.role) && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing…' : 'Refresh from Jira'}
              </button>
            )}
          </div>
        </div>

        {/* KPIs */}
        <JiraIssuesKPIs issues={activeTab === 'open' ? issues : completedIssues} selectedKPI={selectedKPI} onKPIClick={setSelectedKPI} activeTab={activeTab} />
        
        {/* Active KPI Filter Chip */}
        {selectedKPI && (
          <div className={`mb-4 flex items-center gap-2 px-3 h-8 rounded-full text-xs font-semibold w-fit ${isDark ? 'bg-white/10 border border-white/20 text-white' : 'bg-slate-100 border border-slate-300 text-slate-900'}`}>
            <span>KPI Filter: {selectedKPI.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + selectedKPI.replace(/([A-Z])/g, ' $1').trim().slice(1)}</span>
            <button
              onClick={() => setSelectedKPI(null)}
              className={`ml-1 hover:opacity-70 transition-opacity ${isDark ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              ✕
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by key or summary…"
              className={`w-full pl-9 pr-3 h-9 rounded-xl text-xs outline-none ${isDark ? 'bg-white/6 placeholder:text-white/30' : 'bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
              style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgb(226,232,240)'}`, color: isDark ? '#000000' : undefined }}
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className={`px-3 h-9 rounded-xl text-xs outline-none cursor-pointer font-medium ${isDark ? 'bg-white/6 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgb(203,213,225)'}`, colorScheme: isDark ? 'dark' : 'light' }}>
            <option value="all">All Types</option>
            {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className={`px-3 h-9 rounded-xl text-xs outline-none cursor-pointer font-medium ${isDark ? 'bg-white/6 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgb(203,213,225)'}`, colorScheme: isDark ? 'dark' : 'light' }}>
            <option value="all">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className={`px-3 h-9 rounded-xl text-xs outline-none cursor-pointer font-medium ${isDark ? 'bg-white/6 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgb(203,213,225)'}`, colorScheme: isDark ? 'dark' : 'light' }}>
            <option value="all">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value)}
            className={`px-3 h-9 rounded-xl text-xs outline-none cursor-pointer font-medium ${isDark ? 'bg-white/6 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgb(203,213,225)'}`, colorScheme: isDark ? 'dark' : 'light' }}>
            <option value="all">All Assignees</option>
            {assignees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Table */}
        {error && (
          <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${isDark ? 'bg-red-500/10 border-red-500/25' : 'bg-red-50 border-red-200'}`}>
            <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            <p className={`text-xs ${isDark ? 'text-red-300' : 'text-red-700'}`}>Failed to load issues. Make sure Jira credentials are configured.</p>
          </div>
        )}

        {filtered.length === 0 && !error ? (
          <div className="text-center py-16">
            <AlertTriangle className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-purple-500/25' : 'text-purple-300'}`} />
            <p className={`text-sm ${isDark ? 'text-white/40' : 'text-slate-500'}`}>No issues found.</p>
            {search || typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all' ? (
              <p className={`text-xs mt-1 ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Try adjusting your filters.</p>
            ) : (
              <p className={`text-xs mt-1 ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Issues will appear after the first sync.</p>
            )}
          </div>
        ) : (
          <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-white/10 bg-card' : 'border-slate-200 bg-white'}`}>
            <table className={`w-full ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <thead>
                <tr className={isDark ? 'bg-white/4 border-b border-white/10' : 'bg-slate-50 border-b border-slate-200'}>
                  <th className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-slate-600'}`}>Details</th>
                  <th 
                    onClick={() => {
                      if (sortField === 'issue_key') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                      else { setSortField('issue_key'); setSortDir('asc'); }
                    }}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors ${isDark ? 'text-white/50 hover:text-white/70' : 'text-slate-600 hover:text-slate-800'}`}>
                    Key {sortField === 'issue_key' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-slate-600'}`}>Summary</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-slate-600'}`}>Type</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-slate-600'}`}>Status</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-slate-600'}`}>Priority</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-slate-600'}`}>Staff Email</th>
                  <th 
                    onClick={() => {
                      const dateField = activeTab === 'completed' ? 'resolved_at' : 'created_at';
                      if (sortField === dateField) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                      else { setSortField(dateField); setSortDir('desc'); }
                    }}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors ${isDark ? 'text-white/50 hover:text-white/70' : 'text-slate-600 hover:text-slate-800'}`}>
                    {activeTab === 'completed' ? 'Resolved' : 'Created'} {sortField === (activeTab === 'completed' ? 'resolved_at' : 'created_at') && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => {
                      if (sortField === 'updated_at') setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                      else { setSortField('updated_at'); setSortDir('desc'); }
                    }}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors ${isDark ? 'text-white/50 hover:text-white/70' : 'text-slate-600 hover:text-slate-800'}`}>
                    Updated {sortField === 'updated_at' && (sortDir === 'asc' ? '↑' : '↓')}
                    </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginatedIssues.map((issue, i) => (
                    <JiraIssueRow key={issue.id} issue={issue} index={i} isCompleted={activeTab === 'completed'} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className={isDark ? 'text-white/50' : 'text-slate-600'}>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className={`px-3 h-8 rounded-lg text-xs outline-none cursor-pointer ${isDark ? 'bg-white/6 border-white/10 text-white focus:bg-white/20 focus:text-black' : 'bg-slate-100 border-slate-200 text-slate-900'}`}
              style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgb(226,232,240)'}`, colorScheme: isDark ? 'dark' : 'light' }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={-1}>All</option>
            </select>
          </div>

          <div className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-600'}`}>
            {pageSize === -1 
              ? `Showing all ${filtered.length} issues`
              : `Showing ${Math.min((currentPage - 1) * pageSize + 1, filtered.length)}–${Math.min(currentPage * pageSize, filtered.length)} of ${filtered.length}`}
          </div>

          {pageSize !== -1 && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 h-8 rounded-lg text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${isDark ? 'text-white hover:bg-white/10' : 'text-slate-900 hover:bg-slate-100'}`}
              >
                ← Prev
              </button>
              <div className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-600'}`}>
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 h-8 rounded-lg text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${isDark ? 'text-white hover:bg-white/10' : 'text-slate-900 hover:bg-slate-100'}`}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}