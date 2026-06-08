import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useTheme } from '../ThemeProvider';
import { Plus, Trash2, Edit, Code, Play, Search, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const BACKEND_FUNCTIONS = [
  { name: 'adminListProfiles', description: 'List all user profiles with filtering and pagination', impacts: { pages: ['Admin Hub'], entities: ['UserProfile'] } },
  { name: 'assignIconsToLinks', description: 'Auto-assign icons to quick links', impacts: { pages: ['Home', 'Sales Hub', 'All Hubs'], entities: ['QuickLink', 'HubContentItem'] } },
  { name: 'autoCreateReleaseDraft', description: 'Automatically create feature release drafts', impacts: { pages: ['Feature Releases'], entities: ['FeatureRelease', 'FeatureGuide'] } },
  { name: 'backfillJiraResolutionDates', description: 'Backfill resolution dates for Jira issues', impacts: { pages: ['Jira Issues'], entities: ['JiraIssue'] } },
  { name: 'bulkUpdateEscalationsStatus', description: 'Bulk update status for DBS escalations', impacts: { pages: ['DBS Escalation Tracker'], entities: ['DBSEscalation'] } },
  { name: 'cleanupAndMigrateDBSQueries', description: 'Clean up and migrate DBS query data', impacts: { pages: ['DBS Query Tracker'], entities: ['DBSQueryTracker'] } },
  { name: 'enrichJiraIssueDetails', description: 'Enrich Jira issue details with additional data', impacts: { pages: ['Jira Issues'], entities: ['JiraIssue'] } },
  { name: 'ensureOperationsHubTools', description: 'Ensure Operations Hub tools are configured', impacts: { pages: ['Operations Hub'], entities: ['HubContentItem', 'SalesHubTool'] } },
  { name: 'generateStaffCode', description: 'Generate unique staff codes', impacts: { pages: ['Admin Profiles'], entities: ['UserProfile'] } },
  { name: 'getJiraAuthInfo', description: 'Retrieve Jira authentication info', impacts: { pages: ['Admin Hub', 'Jira Issues'], entities: [] } },
  { name: 'getOrCreateProfile', description: 'Get or create user profile', impacts: { pages: ['My Profile', 'Admin Hub'], entities: ['UserProfile'] } },
  { name: 'getPublicDocument', description: 'Get publicly shared documents', impacts: { pages: ['Public Share'], entities: ['KnowledgeDocument'] } },
  { name: 'jiraDiagnosticTests', description: 'Run diagnostic tests for Jira integration', impacts: { pages: ['Jira Diagnostics'], entities: [] } },
  { name: 'logAnnouncementActivity', description: 'Log announcement view activity', impacts: { pages: ['Home'], entities: ['Activity', 'Announcement'] } },
  { name: 'logAppPublish', description: 'Log app publish event', impacts: { pages: ['Feature Releases'], entities: ['AppPublish'] } },
  { name: 'logCalendarActivity', description: 'Log calendar event activity', impacts: { pages: ['Calendar'], entities: ['Activity', 'CalendarEvent'] } },
  { name: 'onUserCreated', description: 'Handle new user creation events', impacts: { pages: ['Admin Profiles'], entities: ['UserProfile'] } },
  { name: 'postEscalationToTeams', description: 'Post DBS escalations to Microsoft Teams', impacts: { pages: ['DBS Escalation Tracker'], entities: ['DBSEscalation'] } },
  { name: 'postOpsIssueToTeams', description: 'Post operations issues to Microsoft Teams', impacts: { pages: ['Operations Issue Log'], entities: ['OperationsIssue'] } },
  { name: 'repairAppPublishVersions', description: 'Repair app publish version formats', impacts: { pages: ['Feature Releases'], entities: ['AppPublish'] } },
  { name: 'repairCertificates', description: 'Repair certificate data integrity', impacts: { pages: ['Learning Hub'], entities: ['Certificate', 'TrainingCertificate'] } },
  { name: 'seedAllHubDefaults', description: 'Seed default hub configurations', impacts: { hubs: ['All'], pages: ['All'], entities: ['HubContentItem', 'SalesHubTool'] } },
  { name: 'seedAnnouncements', description: 'Seed default announcements', impacts: { pages: ['Home'], entities: ['Announcement'] } },
  { name: 'seedCalendarEvents', description: 'Seed default calendar events', impacts: { pages: ['Calendar'], entities: ['CalendarEvent'] } },
  { name: 'seedDBSEligibilityScenarios', description: 'Seed DBS eligibility scenarios', impacts: { pages: ['DBS Eligibility Guide'], entities: ['DBSEligibilityScenario'] } },
  { name: 'seedIndustryAssignments', description: 'Seed industry assignments', impacts: { pages: ['Management Hub'], entities: ['IndustryAssignment'] } },
  { name: 'seedOperationsHub', description: 'Seed Operations Hub configuration', impacts: { hubs: ['Operations'], pages: ['Operations Hub'], entities: ['HubContentItem', 'OperationsIssue'] } },
  { name: 'seedSalesHubDefaults', description: 'Seed Sales Hub defaults', impacts: { hubs: ['Sales'], pages: ['Sales Hub'], entities: ['SalesHubTool', 'HubContentItem'] } },
  { name: 'seedSalesHubQuickLinks', description: 'Seed Sales Hub quick links', impacts: { hubs: ['Sales'], pages: ['Sales Hub'], entities: ['QuickLink'] } },
  { name: 'syncJiraIssues', description: 'Sync Jira issues to Base44', impacts: { pages: ['Jira Issues', 'Help Desk'], entities: ['JiraIssue'] } },
  { name: 'syncMissingUserProfiles', description: 'Sync missing user profiles', impacts: { pages: ['Admin Profiles'], entities: ['UserProfile'] } },
  { name: 'syncPublishEventsFromLogs', description: 'Sync app publish events from logs', impacts: { pages: ['Feature Releases'], entities: ['AppPublish'] } },
  { name: 'updateMyProfile', description: 'Update current user profile', impacts: { pages: ['My Profile'], entities: ['UserProfile'] } },
  { name: 'updateServiceIcons', description: 'Update service icons across the app', impacts: { pages: ['All'], entities: [] } },
];

export default function FunctionsManager() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const queryClient = useQueryClient();
  const [testing, setTesting] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFunctions = BACKEND_FUNCTIONS.filter(fn =>
    fn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (fn.impacts?.pages?.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))) ||
    (fn.impacts?.entities?.some(e => e.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleTest = async (functionName) => {
    setTesting(functionName);
    setTestResult(null);
    try {
      const response = await base44.functions.invoke(functionName, {});
      setTestResult({ success: true, data: response.data, functionName });
      // Invalidate related queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['appPublishes'] });
      queryClient.invalidateQueries({ queryKey: ['featureReleases'] });
      queryClient.invalidateQueries({ queryKey: ['adminProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['jiraIssues'] });
    } catch (error) {
      setTestResult({ success: false, error: error.message, functionName });
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Backend Functions</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/50' : 'text-slate-600'}`}>
            Manage backend function buttons and test function execution
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
        >
          <Plus className="w-4 h-4" /> New Function
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
        <input
          type="text"
          placeholder="Search functions by name, description, page, or entity..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none border transition-colors ${
            isDark
              ? 'bg-white/8 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/60'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-400'
          }`}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results count */}
      <div className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
        {filteredFunctions.length} of {BACKEND_FUNCTIONS.length} functions
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={`p-4 rounded-xl border ${
          testResult.success
            ? isDark ? 'border-green-500/30 bg-green-500/10' : 'border-green-200 bg-green-50'
            : isDark ? 'border-red-500/30 bg-red-500/10' : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`font-semibold text-sm ${testResult.success ? (isDark ? 'text-green-300' : 'text-green-700') : (isDark ? 'text-red-300' : 'text-red-700')}`}>
                {testResult.success ? '✓ Success' : '✕ Error'} — {testResult.functionName}
              </h3>
              <pre className={`text-xs mt-2 p-2 rounded overflow-auto max-h-48 ${isDark ? 'bg-black/20' : 'bg-white/50'}`}>
                {testResult.success
                  ? JSON.stringify(testResult.data, null, 2)
                  : testResult.error}
              </pre>
            </div>
            <button
              onClick={() => setTestResult(null)}
              className={`flex-shrink-0 ml-2 px-2 py-1 text-xs font-medium rounded transition-colors ${
                isDark ? 'text-white/50 hover:text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {filteredFunctions.map(fn => (
            <div
              key={fn.name}
              className={`p-4 rounded-xl border flex flex-col gap-3 ${
                isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fn.name}</h3>
                  <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{fn.description}</p>
                </div>
              </div>
              
              {/* Impact info */}
              <div className="flex flex-wrap gap-3">
                {fn.impacts?.hubs && fn.impacts.hubs.length > 0 && (
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Hubs</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {fn.impacts.hubs.map(hub => (
                        <span key={hub} className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                          {hub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {fn.impacts?.pages && fn.impacts.pages.length > 0 && (
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>Pages</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {fn.impacts.pages.map(page => (
                        <span key={page} className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-cyan-500/15 text-cyan-300' : 'bg-cyan-100 text-cyan-700'}`}>
                          {page}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {fn.impacts?.entities && fn.impacts.entities.length > 0 && (
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>Entities</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {fn.impacts.entities.map(entity => (
                        <span key={entity} className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-green-500/15 text-green-300' : 'bg-green-100 text-green-700'}`}>
                          {entity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTest(fn.name)}
                  disabled={testing === fn.name}
                  className={`p-2 rounded-lg transition-colors ${
                    testing === fn.name
                      ? isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                      : isDark ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                  }`}
                  title="Test function"
                >
                  {testing === fn.name ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Play className="w-4 h-4" />}
                </button>
                <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`} title="View code">
                  <Code className="w-4 h-4" />
                </button>
                <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`} title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/15 text-white/30 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`} title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          </div>
    </div>
  );
}