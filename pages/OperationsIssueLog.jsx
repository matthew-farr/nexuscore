import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Download, Activity, AlertTriangle, BarChart2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/ui-custom/PageContainer';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/lib/AuthContext';
import IssueLogForm from '@/components/operations-issue/IssueLogForm';
import IssueDetailDrawer from '@/components/operations-issue/IssueDetailDrawer';
import LiveIssuesTab from '@/components/operations-issue/LiveIssuesTab';
import ReportingTab from '@/components/operations-issue/ReportingTab';
import KnownIssuesTab from '@/components/operations-issue/KnownIssuesTab';
import { STATUS_SORT_ORDER, formatUKDateTime } from '@/components/operations-issue/issueConfig';

const TABS = [
  { key: 'live',      label: 'Live Issues',              icon: AlertTriangle  },
  { key: 'reporting', label: 'Reporting & Trends',        icon: BarChart2      },
  { key: 'known',     label: 'Known Issues',              icon: BookOpen       },
];

export default function OperationsIssueLog() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('live');
  const [showForm, setShowForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showResolved, setShowResolved] = useState(false);

  const { data: issues = [], isLoading, refetch } = useQuery({
    queryKey: ['operationsIssues'],
    queryFn: () => base44.entities.OperationsIssue.list('-created_date', 200),
    staleTime: 60000
  });

  const handleSuccess = () => { refetch(); setShowForm(false); };

  const handleUpdated = () => {
    refetch();
    if (selectedIssue) {
      base44.entities.OperationsIssue.list('-created_date', 200).then(all => {
        const updated = all?.find(i => i.id === selectedIssue.id);
        if (updated) setSelectedIssue(updated);
      });
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ['Ref', 'Title', 'Status', 'Service', 'Affected Count', 'Owner', 'Raised By', 'Created', 'Ticket', 'Ticket Ref'],
      ...issues.map(i => [
        i.issue_reference, i.title, i.status, i.affected_service || '',
        i.affected_count, i.issue_owner || '', i.raised_by,
        formatUKDateTime(i.created_date), i.ticket_raised ? 'Yes' : 'No', i.ticket_reference || ''
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ops-issues-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resolvedIssues = useMemo(() =>
    issues.filter(i => !i.is_archived && i.status === 'Resolved')
      .sort((a, b) => new Date(b.resolved_date || b.updated_date) - new Date(a.resolved_date || a.updated_date)),
    [issues]
  );

  const activeCount = useMemo(() =>
    issues.filter(i => !i.is_archived && i.status !== 'Resolved').length,
    [issues]
  );

  const outageCount = useMemo(() =>
    issues.filter(i => !i.is_archived && i.status === 'Complete Outage').length,
    [issues]
  );

  return (
    <PageContainer>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #ec2ca3, #7c3aed)' }}>
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>Operations Issue Log</h1>
              <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
                Live operational issues affecting staff, clients, applicants or systems.
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
            <Button size="sm" onClick={() => setShowForm(true)} className="flex items-center gap-1.5" style={{ background: 'linear-gradient(135deg, #ec2ca3, #7c3aed)' }}>
              <Plus className="w-3.5 h-3.5" /> Log Issue
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold flex-1 justify-center transition-all duration-200 relative"
              style={{
                background: isActive ? (isDark ? 'rgba(255,255,255,0.1)' : '#fff') : 'transparent',
                color: isActive ? (isDark ? '#fff' : '#0f0f2e') : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'),
                boxShadow: isActive ? (isDark ? '0 1px 8px rgba(0,0,0,0.3)' : '0 1px 6px rgba(0,0,0,0.08)') : 'none'
              }}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              {/* Live badge */}
              {tab.key === 'live' && outageCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold" style={{ fontSize: '9px', background: '#ef4444' }}>{outageCount}</span>
              )}
              {tab.key === 'live' && outageCount === 0 && activeCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold" style={{ fontSize: '9px', background: '#f59e0b' }}>{activeCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'live' && (
        <LiveIssuesTab
          issues={issues}
          isLoading={isLoading}
          isDark={isDark}
          onSelectIssue={setSelectedIssue}
          showResolved={showResolved}
          setShowResolved={setShowResolved}
          resolvedIssues={resolvedIssues}
          onLogNew={() => setShowForm(true)}
        />
      )}
      {activeTab === 'reporting' && (
        <ReportingTab issues={issues} isDark={isDark} />
      )}
      {activeTab === 'known' && (
        <KnownIssuesTab issues={issues} isDark={isDark} isAdmin={isAdmin} />
      )}

      {/* Log Form Drawer */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full md:w-[520px] z-50 shadow-2xl overflow-hidden"
              style={{ background: isDark ? 'rgba(10,12,30,0.97)' : 'rgba(248,248,252,0.98)', borderLeft: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', backdropFilter: 'blur(40px)' }}
            >
              <IssueLogForm onClose={() => setShowForm(false)} onSuccess={handleSuccess} isDark={isDark} user={user} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedIssue && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedIssue(null)}
              className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            <IssueDetailDrawer
              issue={selectedIssue} isDark={isDark}
              onClose={() => setSelectedIssue(null)}
              onUpdated={handleUpdated}
              isAdmin={isAdmin} user={user}
            />
          </>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}