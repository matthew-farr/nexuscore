import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Shield, Search, Workflow, Settings } from 'lucide-react';
import RoleFinderTab from '@/components/dbs-eligibility/RoleFinderTab';
import DecisionGuideTab from '@/components/dbs-eligibility/DecisionGuideTab';
import ScenarioAdminTab from '@/components/dbs-eligibility/ScenarioAdminTab';
import ScenarioDrawer from '@/components/dbs-eligibility/ScenarioDrawer';

const TABS = [
  { key: 'finder', label: 'Role Finder', icon: Search },
  { key: 'guide', label: 'Decision Guide', icon: Workflow },
  { key: 'admin', label: 'Admin / Scenario Library', icon: Settings, adminOnly: true },
];

export default function DBSEligibilityGuide() {
  const [activeTab, setActiveTab] = useState('finder');
  const [selectedScenario, setSelectedScenario] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: scenarios = [], isLoading } = useQuery({
    queryKey: ['dbs-eligibility-scenarios'],
    queryFn: () => base44.entities.DBSEligibilityScenario.filter({ status: 'Active' }, 'role_title', 200),
  });

  const isAdmin = user?.role === 'admin';
  const visibleTabs = TABS.filter(t => !t.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050816]">
      {/* Header */}
      <div className="relative overflow-hidden bg-white dark:bg-transparent border-b border-gray-200 dark:border-white/[0.08]">
        {/* Ambient glows — dark only */}
        <div className="absolute inset-0 pointer-events-none hidden dark:block">
          <div className="absolute top-0 left-1/4 w-96 h-32 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, #ec2ca3, transparent)' }} />
          <div className="absolute top-0 right-1/4 w-96 h-32 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #ec2ca3, #7c3aed)' }}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DBS Eligibility Guide</h1>
              <p className="text-sm mt-1 text-gray-500 dark:text-white/50">
                A practical guide to help staff assess DBS check level, workforce and barred list considerations.
              </p>
              <p className="text-xs mt-1.5 font-semibold text-gray-400 dark:text-white/30">
                Guide only — always verify actual duties before submitting
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto">
            {visibleTabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                    active
                      ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                      : 'border-transparent text-gray-500 dark:text-white/45 hover:text-gray-700 dark:hover:text-white/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'finder' && (
              <RoleFinderTab
                scenarios={scenarios}
                onSelectScenario={setSelectedScenario}
                isLoading={isLoading}
              />
            )}
            {activeTab === 'guide' && <DecisionGuideTab />}
            {activeTab === 'admin' && isAdmin && (
              <ScenarioAdminTab user={user} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scenario Drawer */}
      <AnimatePresence>
        {selectedScenario && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setSelectedScenario(null)}
            />
            <ScenarioDrawer
              scenario={selectedScenario}
              onClose={() => setSelectedScenario(null)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}