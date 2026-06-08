import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import PageContainer from '@/components/ui-custom/PageContainer';
import AdminQuickLinksManager from '@/components/admin/AdminQuickLinksManager';
import AdminHubsManager from '@/components/admin/AdminHubsManager';
import AdminWidgetsManager from '@/components/admin/AdminWidgetsManager';
import AdminProfiles from '@/components/admin/AdminProfilesPanel';
import AdminPricingManager from '@/components/admin/AdminPricingManager';
import HubAdminPanel from '@/components/admin/hub/HubAdminPanel';
import SalesHubAdminPanel from '@/components/admin/sales/SalesHubAdminPanel';
import IndustryAssignmentAdmin from '@/components/admin/industry/IndustryAssignmentAdmin';
import LearningManagementPanel from '@/components/admin/learning/LearningManagementPanel';
import FunctionsManager from '@/components/admin/FunctionsManager';
import PublicFAQManager from '@/components/public-share/PublicFAQManager';
import {
  AlertCircle, RefreshCw, Rocket, Upload,
  Users, Link2, LayoutGrid, Puzzle, Tag, Code2,
  ShoppingBag, Briefcase, ShieldCheck, Megaphone,
  Lightbulb, GraduationCap, Globe, BarChart2,
  HelpCircle, ChevronRight, Settings
} from 'lucide-react';
import LogReleaseModal from '@/components/releases/LogReleaseModal';
import ReleaseDraftsWidget from '@/components/releases/ReleaseDraftsWidget';
import ReleaseDetailDrawer from '@/components/releases/ReleaseDetailDrawer';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { HUB_DEFAULT_TABS } from "@/lib/hubConfig";

const NAV_GROUPS = [
  {
    label: 'People & Content',
    items: [
      { key: 'profiles',    label: 'User Profiles',  icon: Users },
      { key: 'quick-links', label: 'Quick Links',     icon: Link2 },
      { key: 'hubs',        label: 'Hub Config',      icon: LayoutGrid },
      { key: 'widgets',     label: 'Widgets',         icon: Puzzle },
      { key: 'pricing',     label: 'Pricing',         icon: Tag },
      { key: 'public-faqs', label: 'Public FAQs',     icon: HelpCircle },
    ],
  },
  {
    label: 'Hubs',
    items: [
      { key: 'sales',       label: 'Sales Hub',       icon: ShoppingBag },
      { key: 'operations',  label: 'Operations Hub',  icon: Briefcase },
      { key: 'compliance',  label: 'Compliance Hub',  icon: ShieldCheck },
      { key: 'marketing',   label: 'Marketing Hub',   icon: Megaphone },
      { key: 'innovation',  label: 'Innovation Hub',  icon: Lightbulb },
      { key: 'learning',    label: 'Learning Hub',    icon: GraduationCap },
    ],
  },
  {
    label: 'System',
    items: [
      { key: 'industry',    label: 'Industries',      icon: Globe },
      { key: 'jira',        label: 'Jira Issues',     icon: BarChart2 },
      { key: 'functions',   label: 'Functions',       icon: Code2 },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items);

export default function AdminHub() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState('profiles');
  const [logOpen, setLogOpen] = useState(false);
  const [reviewingDraft, setReviewingDraft] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await base44.functions.invoke('publishAppToLive', {});
      queryClient.invalidateQueries({ queryKey: ['latestAppPublish'] });
      alert(`App published to live as version ${res.data.version}`);
    } catch (error) {
      alert(`Publish failed: ${error.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleSyncFromLogs = async () => {
    setPublishing(true);
    try {
      const res = await base44.functions.invoke('syncPublishEventsFromLogs', {});
      queryClient.invalidateQueries({ queryKey: ['latestAppPublish'] });
      alert(`${res.data.synced} publish events synced from logs`);
    } catch (error) {
      alert(`Sync failed: ${error.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const { data: allGuides = [] } = useQuery({
    queryKey: ['featureGuides'],
    queryFn: () => base44.entities.FeatureGuide.list('-created_date', 200),
    enabled: !!user && user.role === 'admin',
  });
  const guidesByRelease = Object.fromEntries(allGuides.map(g => [g.release_id, g]));

  useEffect(() => {
    if (user !== undefined) setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <PageContainer>
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-destructive font-medium">Admin access required</p>
        </div>
      </PageContainer>
    );
  }

  const activeItem = ALL_ITEMS.find(i => i.key === activeKey);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">Admin Hub</h1>
            <p className="text-muted-foreground mt-1">Manage users, content, hubs, and system settings</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleSyncFromLogs}
              disabled={publishing}
              className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              <RefreshCw className={`w-4 h-4 ${publishing ? 'animate-spin' : ''}`} />
              {publishing ? 'Syncing…' : 'Sync from Logs'}
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
            >
              <Upload className={`w-4 h-4 ${publishing ? 'animate-spin' : ''}`} />
              {publishing ? 'Publishing…' : 'Publish App'}
            </button>
            <button
              onClick={() => setLogOpen(true)}
              className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}
            >
              <Rocket className="w-4 h-4" /> Log a Release
            </button>
          </div>
        </div>

        {/* Release Drafts Widget */}
        <ReleaseDraftsWidget
          onReviewDraft={setReviewingDraft}
          onEditDraft={setReviewingDraft}
        />

        {/* Main layout: sidebar + content */}
        <div className="flex gap-6 items-start">

          {/* Sidebar nav */}
          <aside className="w-56 flex-shrink-0 rounded-2xl border border-border bg-card overflow-hidden">
            {NAV_GROUPS.map((group, gi) => (
              <div key={gi}>
                <div className="px-4 pt-4 pb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{group.label}</p>
                </div>
                <div className="px-2 pb-2 space-y-0.5">
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeKey === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => setActiveKey(item.key)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                      </button>
                    );
                  })}
                </div>
                {gi < NAV_GROUPS.length - 1 && <div className="border-t border-border mx-4" />}
              </div>
            ))}
          </aside>

          {/* Content panel */}
          <div className="flex-1 min-w-0">
            {/* Section header */}
            {activeItem && (
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <activeItem.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold leading-tight">{activeItem.label}</h2>
                  <p className="text-xs text-muted-foreground">{getSectionDescription(activeItem.key)}</p>
                </div>
              </div>
            )}

            {/* Panels */}
            {activeKey === 'profiles'    && <AdminProfiles />}
            {activeKey === 'quick-links' && <AdminQuickLinksManager />}
            {activeKey === 'hubs'        && <AdminHubsManager />}
            {activeKey === 'widgets'     && <AdminWidgetsManager />}
            {activeKey === 'pricing'     && <AdminPricingManager />}
            {activeKey === 'public-faqs' && <PublicFAQManager />}
            {activeKey === 'functions'   && <FunctionsManager />}
            {activeKey === 'sales'       && <SalesHubAdminPanel />}
            {activeKey === 'industry'    && <IndustryAssignmentAdmin />}
            {activeKey === 'jira'        && <JiraAdminPanel />}
            {activeKey === 'learning'    && (
              <div className="space-y-8">
                <HubAdminPanel hubKey="learning" hubName="Learning Hub" defaultTabs={HUB_DEFAULT_TABS["learning"] || []} />
                <div>
                  <h3 className="text-lg font-bold mb-4">Learning Management</h3>
                  <LearningManagementPanel />
                </div>
              </div>
            )}
            {['operations','compliance','marketing','innovation'].includes(activeKey) && (
              <HubAdminPanel
                hubKey={activeKey}
                hubName={ALL_ITEMS.find(i => i.key === activeKey)?.label || activeKey}
                defaultTabs={HUB_DEFAULT_TABS[activeKey] || []}
              />
            )}
          </div>
        </div>
      </div>

      <LogReleaseModal isOpen={logOpen} onClose={() => setLogOpen(false)} />

      <ReleaseDetailDrawer
        release={reviewingDraft}
        guide={reviewingDraft ? guidesByRelease[reviewingDraft.id] : null}
        isOpen={!!reviewingDraft}
        onClose={() => setReviewingDraft(null)}
        isAdmin={true}
        onEdit={() => {}}
        onDelete={async (r) => {
          if (!confirm(`Delete "${r.title}"?`)) return;
          await base44.entities.FeatureRelease.delete(r.id);
          setReviewingDraft(null);
        }}
        onOpenGuide={() => {}}
        onEditGuide={() => {}}
      />
    </PageContainer>
  );
}

function getSectionDescription(key) {
  const map = {
    profiles:     'View and manage staff user profiles',
    'quick-links':'Edit homepage quick link tiles',
    hubs:         'Configure hub layout and settings',
    widgets:      'Manage homepage widget visibility',
    pricing:      'Edit pricing templates and products',
    'public-faqs':'Manage FAQs shown on public share pages',
    functions:    'Manage and test backend functions',
    sales:        'Configure the Sales Hub panels and tabs',
    operations:   'Configure the Operations Hub',
    compliance:   'Configure the Compliance Hub',
    marketing:    'Configure the Marketing Hub',
    innovation:   'Configure the Innovation Hub',
    learning:     'Configure the Learning Hub and LMS',
    industry:     'Manage industry assignments',
    jira:         'Sync and manage Jira issues',
  };
  return map[key] || '';
}

function JiraAdminPanel() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await base44.functions.invoke('syncJiraIssues', {});
      alert(`Successfully synced ${res.data?.synced ?? '?'} issues`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground text-sm mb-4">
          Sync open Jira issues (Bugs, Support tickets, BAU Projects, and Epics) to Base44 for all users to view without requiring a Jira licence.
        </p>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing…' : 'Sync from Jira Now'}
        </button>
      </div>
      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <h3 className="font-semibold mb-2">Configuration</h3>
        <p className="text-sm text-muted-foreground mb-3">Required environment variables:</p>
        <ul className="space-y-2 text-sm">
          <li className="font-mono text-xs bg-background px-3 py-1.5 rounded border border-border">JIRA_EMAIL</li>
          <li className="font-mono text-xs bg-background px-3 py-1.5 rounded border border-border">JIRA_API_TOKEN</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-3">
          Get your token from:{' '}
          <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            Atlassian API Tokens
          </a>
        </p>
      </div>
    </div>
  );
}