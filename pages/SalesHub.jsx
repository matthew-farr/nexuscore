import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageContainer from "../components/ui-custom/PageContainer";
import { useActivityTracking } from "../hooks/useActivityTracking";
import SalesHeroEnhanced from "../components/sales/SalesHeroEnhanced";
import SalesOverviewTab from "../components/sales/tabs/SalesOverviewTab";
import SalesAnalyticsTab from "../components/sales/tabs/SalesAnalyticsTab";
import SalesToolsTab from "../components/sales/tabs/SalesToolsTab";
import SalesGuidesTab from "../components/sales/tabs/SalesGuidesTab";
import SalesAITab from "../components/sales/tabs/SalesAITab";
import SalesCustomTab from "../components/sales/tabs/SalesCustomTab";
import HubSpotWorkspace from "../components/sales/tabs/HubSpotWorkspace";
import { SalesHubBrandingProvider } from "../components/sales/SalesHubBrandingContext";
import { useSalesHubBranding } from "../components/sales/SalesHubBrandingContext";
import { base44 } from "@/api/base44Client";

// Registry maps known tab_key → component (system tabs)
const SYSTEM_TAB_REGISTRY = {
  overview:            SalesOverviewTab,
  analytics:           SalesAnalyticsTab,
  "sales-tools":       SalesToolsTab,
  guides:              SalesGuidesTab,
  ai:                  SalesAITab,
  "hubspot-workspace": HubSpotWorkspace,
};

// Fallback tabs if DB has no config yet
const FALLBACK_TABS = [
  { tab_key: "overview",     label: "Overview",     is_active: true, is_default: true,  sort_order: 1 },
  { tab_key: "analytics",    label: "Analytics",    is_active: true, is_default: false, sort_order: 2 },
  { tab_key: "sales-tools",  label: "Sales Tools",  is_active: true, is_default: false, sort_order: 3 },
  { tab_key: "guides",       label: "Guides",       is_active: true, is_default: false, sort_order: 4 },
  { tab_key: "ai",           label: "AI Assistant", is_active: true, is_default: false, sort_order: 5 },
];

function SalesHubInner() {
  const branding = useSalesHubBranding();
  const [tabs, setTabs] = useState(FALLBACK_TABS);
  const [activeTab, setActiveTab] = useState(branding.default_tab || "overview");

  useEffect(() => {
    loadTabs();
    // Subscribe to tab config changes
    const unsub = base44.entities.SalesHubTabConfig.subscribe(() => loadTabs());
    return () => unsub();
  }, []);

  // When branding loads and has a default_tab, set it (only on first mount)
  useEffect(() => {
    if (branding.default_tab && branding.default_tab !== "overview") {
      const defaultTab = tabs.find(t => t.tab_key === branding.default_tab && t.is_active);
      if (defaultTab) setActiveTab(branding.default_tab);
    }
  }, [branding.default_tab]);

  const loadTabs = async () => {
    try {
      const data = await base44.entities.SalesHubTabConfig.filter({ hub_key: "sales" }, "sort_order", 50);
      if (data && data.length > 0) {
        const activeTabs = data.filter(t => t.is_active !== false);
        if (activeTabs.length > 0) {
          setTabs(activeTabs);
          // If current activeTab is no longer active, switch to default
          const defaultTab = activeTabs.find(t => t.is_default) || activeTabs[0];
          setActiveTab(prev => {
            const stillActive = activeTabs.find(t => t.tab_key === prev);
            return stillActive ? prev : defaultTab.tab_key;
          });
        }
      }
    } catch (err) {
      // Fall back to static tabs silently
    }
  };

  // Find the active tab config (for label and layout info)
  const activeTabConfig = tabs.find(t => t.tab_key === activeTab);
  const isSystemTab = activeTab in SYSTEM_TAB_REGISTRY;
  const SystemTabComponent = SYSTEM_TAB_REGISTRY[activeTab];

  return (
    <PageContainer>
      <SalesHeroEnhanced activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
        >
          {isSystemTab ? (
            <SystemTabComponent />
          ) : (
            <SalesCustomTab
              tabKey={activeTab}
              tabLabel={activeTabConfig?.label || activeTab}
              layoutConfig={activeTabConfig?.config_json}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </PageContainer>
  );
}

export default function SalesHub() {
  useActivityTracking({
    entity_type: "hub",
    entity_id: "sales",
    title: "Sales Hub",
    route: "/sales",
    icon: "TrendingUp",
  });

  return (
    <SalesHubBrandingProvider>
      <SalesHubInner />
    </SalesHubBrandingProvider>
  );
}