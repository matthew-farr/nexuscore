import { useState, useCallback } from "react";
import { useTheme } from "../../ThemeProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesHubOverviewTab from "./SalesHubOverviewTab";
import SalesHubQuickLinksManager from "./SalesHubQuickLinksManager";
import SalesToolsManager from "./SalesToolsManager";
import SalesHubDashboardManager from "./SalesHubDashboardManager";
import SalesHubSidebarWidgetsManager from "./SalesHubSidebarWidgetsManager";
import SalesHubProposalManager from "./SalesHubProposalManager";
import SalesEnablementManager from "./SalesEnablementManager";
import SalesHubNotificationsManager from "./SalesHubNotificationsManager";
import SalesHubPermissionsManager from "./SalesHubPermissionsManager";
import SalesHubBrandingManager from "./SalesHubBrandingManager";
import SalesHubTabsManager from "./SalesHubTabsManager";
import HubSpotConnectionCheck from "@/components/admin/HubSpotConnectionCheck";

const TABS = [
  { key: "overview",     label: "Overview" },
  { key: "branding",     label: "Branding" },
  { key: "tabs",         label: "Tabs" },
  { key: "quick-links",  label: "Quick Links" },
  { key: "sales-tools",  label: "Sales Tools" },
  { key: "enablement",   label: "Enablement" },
  { key: "dashboard",    label: "Dashboard" },
  { key: "proposals",    label: "Proposals" },
  { key: "widgets",      label: "Widgets" },
  { key: "notifications",label: "Notifications" },
  { key: "permissions",  label: "Permissions" },
  { key: "hubspot",      label: "HubSpot" },
];

export default function SalesHubAdminPanel() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("overview");
  // Increment to force overview to re-fetch stats
  const [overviewRefreshKey, setOverviewRefreshKey] = useState(0);

  // Called by child managers after any data mutation — does NOT switch tabs
  const handleDataChange = useCallback(() => {
    setOverviewRefreshKey(k => k + 1);
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ color: isDark ? "#ffffff" : "hsl(230 25% 15%)" }}
        >
          Sales Hub Configuration
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.55)" }}
        >
          Manage all Sales Hub settings, content, and permissions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-grid" style={{ gridTemplateColumns: `repeat(${TABS.length}, minmax(0, 1fr))`, minWidth: "max-content" }}>
            {TABS.map(tab => (
              <TabsTrigger key={tab.key} value={tab.key} className="text-xs px-3 whitespace-nowrap">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="mt-6">
          <TabsContent value="overview">
            <SalesHubOverviewTab
              onSwitchTab={setActiveTab}
              refreshKey={overviewRefreshKey}
            />
          </TabsContent>

          <TabsContent value="branding">
            <SalesHubBrandingManager />
          </TabsContent>

          <TabsContent value="tabs">
            <SalesHubTabsManager onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="quick-links">
            <SalesHubQuickLinksManager onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="sales-tools">
            <SalesToolsManager onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="enablement">
            <SalesEnablementManager onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="dashboard">
            <SalesHubDashboardManager onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="proposals">
            <SalesHubProposalManager onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="widgets">
            <SalesHubSidebarWidgetsManager onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="notifications">
            <SalesHubNotificationsManager onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="permissions">
            <SalesHubPermissionsManager />
          </TabsContent>

          <TabsContent value="hubspot">
            <div className="max-w-lg">
              <HubSpotConnectionCheck />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}