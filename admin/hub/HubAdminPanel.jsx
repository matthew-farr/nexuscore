import { useState, useCallback } from "react";
import { useTheme } from "../../ThemeProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HubBrandingManager from "./HubBrandingManager";
import HubTabsManager from "./HubTabsManager";
import HubContentManager from "./HubContentManager";
import HubOverviewPanel from "./HubOverviewPanel";

/**
 * Generic, fully-reusable hub admin panel.
 *
 * Props:
 *   hubKey      — "sales" | "operations" | "compliance" | "learning" | "marketing" | "innovation"
 *   hubName     — "Sales Hub" | "Operations Hub" | etc.
 *   defaultTabs — array of default tab config objects for seeding
 *   extraModules — optional array of { key, label, component } for hub-specific extra tabs
 */
export default function HubAdminPanel({ hubKey, hubName, defaultTabs = [], extraModules = [] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataChange = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const STANDARD_TABS = [
    { key: "overview",       label: "Overview" },
    { key: "branding",       label: "Branding" },
    { key: "tabs",           label: "Tabs" },
    { key: "quick-links",    label: "Quick Links" },
    { key: "tools",          label: "Tools" },
    { key: "enablement",     label: "Enablement" },
    { key: "dashboard",      label: "Dashboard" },
    { key: "widgets",        label: "Widgets" },
    { key: "notifications",  label: "Notifications" },
    ...extraModules.map(m => ({ key: m.key, label: m.label })),
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: isDark ? "#ffffff" : "hsl(230 25% 15%)" }}>
          {hubName} Configuration
        </h2>
        <p className="text-sm mt-1" style={{ color: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.55)" }}>
          Manage all {hubName} settings, content, and permissions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1">
          <TabsList
            className="inline-grid"
            style={{
              gridTemplateColumns: `repeat(${STANDARD_TABS.length}, minmax(0, 1fr))`,
              minWidth: "max-content",
            }}
          >
            {STANDARD_TABS.map(tab => (
              <TabsTrigger key={tab.key} value={tab.key} className="text-xs px-3 whitespace-nowrap">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="mt-6">
          <TabsContent value="overview">
            <HubOverviewPanel
              hubKey={hubKey}
              hubName={hubName}
              onSwitchTab={setActiveTab}
              refreshKey={refreshKey}
            />
          </TabsContent>

          <TabsContent value="branding">
            <HubBrandingManager hubKey={hubKey} hubName={hubName} onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="tabs">
            <HubTabsManager hubKey={hubKey} hubName={hubName} defaultTabs={defaultTabs} onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="quick-links">
            <HubContentManager hubKey={hubKey} hubName={hubName} contentType="quick_link" onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="tools">
            <HubContentManager hubKey={hubKey} hubName={hubName} contentType="tool" onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="enablement">
            <HubContentManager hubKey={hubKey} hubName={hubName} contentType="enablement" onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="dashboard">
            <HubContentManager hubKey={hubKey} hubName={hubName} contentType="dashboard" onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="widgets">
            <HubContentManager hubKey={hubKey} hubName={hubName} contentType="widget" onDataChange={handleDataChange} />
          </TabsContent>

          <TabsContent value="notifications">
            <HubContentManager hubKey={hubKey} hubName={hubName} contentType="notification" onDataChange={handleDataChange} />
          </TabsContent>

          {/* Extra hub-specific modules */}
          {extraModules.map(m => (
            <TabsContent key={m.key} value={m.key}>
              <m.component hubKey={hubKey} hubName={hubName} onDataChange={handleDataChange} />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}