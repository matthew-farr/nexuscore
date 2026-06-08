import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Archive, AlertTriangle, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { CHECK_LEVEL_COLOURS } from './dbsEligibilityConfig';
import ScenarioAdminDrawer from './ScenarioAdminDrawer';

const STATUS_COLOURS = {
  Active: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-400/10 border-green-300 dark:border-green-400/30',
  Draft: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-400/10 border-gray-300 dark:border-gray-400/30',
  Archived: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-400/10 border-red-300 dark:border-red-400/30',
  'Needs Compliance Review': 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-400/10 border-yellow-300 dark:border-yellow-400/30',
};

export default function ScenarioAdminTab({ user }) {
  const [drawerScenario, setDrawerScenario] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const qc = useQueryClient();

  const { data: scenarios = [], isLoading } = useQuery({
    queryKey: ['dbs-eligibility-scenarios-admin'],
    queryFn: () => base44.entities.DBSEligibilityScenario.list('-updated_date', 200),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DBSEligibilityScenario.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dbs-eligibility-scenarios-admin'] }),
  });

  const filtered = scenarios.filter(s => {
    const matchSearch = !search || s.role_title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1 flex-col sm:flex-row">
          <Input
            placeholder="Search scenarios..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-white dark:bg-white/[0.06] border-gray-200 dark:border-white/[0.12] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/35"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-52 bg-white dark:bg-white/[0.06] border-gray-200 dark:border-white/[0.12] text-gray-900 dark:text-white">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {['Active', 'Draft', 'Archived', 'Needs Compliance Review'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => { setDrawerScenario(null); setDrawerOpen(true); }}
          size="sm"
          style={{ background: 'linear-gradient(135deg, #ec2ca3, #7c3aed)' }}
          className="gap-2 flex-shrink-0 text-white"
        >
          <Plus className="w-4 h-4" /> Add Scenario
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-white/40" />
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/[0.08] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/[0.04] border-b border-gray-200 dark:border-white/[0.07]">
                  {['Role Title', 'Sector', 'Check Level', 'Workforce', 'Status', 'Escalation', 'Updated', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-white/45">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-b border-gray-100 dark:border-white/[0.05] ${i % 2 === 1 ? 'bg-gray-50/50 dark:bg-white/[0.01]' : 'bg-white dark:bg-transparent'} hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.role_title}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-white/45">{s.sector || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${CHECK_LEVEL_COLOURS[s.likely_check_level] || 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-400/10 border-gray-300 dark:border-gray-400/30'}`}>
                        {s.likely_check_level || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-white/45">{s.workforce || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLOURS[s.status] || 'text-gray-500'}`}>{s.status || 'Active'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {s.escalation_required
                        ? <span className="text-xs text-red-600 dark:text-red-400 font-semibold">Yes</span>
                        : <span className="text-gray-400 dark:text-white/25">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-white/45">
                      {s.updated_date ? new Date(s.updated_date).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setDrawerScenario(s); setDrawerOpen(true); }}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-white/45"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({ id: s.id, data: { status: 'Needs Compliance Review', updated_by: user?.email } })}
                          className="p-1.5 rounded hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors text-amber-500"
                          title="Flag for Review"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({ id: s.id, data: { status: s.status === 'Archived' ? 'Active' : 'Archived', updated_by: user?.email } })}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-white/45"
                          title={s.status === 'Archived' ? 'Restore' : 'Archive'}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-gray-400 dark:text-white/35">No scenarios found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {drawerOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
            <ScenarioAdminDrawer
              scenario={drawerScenario}
              user={user}
              onClose={() => setDrawerOpen(false)}
              onSaved={() => {
                setDrawerOpen(false);
                qc.invalidateQueries({ queryKey: ['dbs-eligibility-scenarios-admin'] });
                qc.invalidateQueries({ queryKey: ['dbs-eligibility-scenarios'] });
              }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}