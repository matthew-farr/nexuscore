/**
 * GenericHubPage — unified hub layout matching Sales Hub structure exactly.
 * Hero → Tabs → Overview (Tools + Quick Launch + Dashboard + Enablement + Sidebar)
 * or widget-grid for non-overview tabs.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Search, TrendingUp, Settings2, Shield, GraduationCap, Megaphone, Lightbulb } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageContainer from "@/components/ui-custom/PageContainer";
import { useHubBranding } from "./HubBrandingContext";
import { useTheme } from "../ThemeProvider";
import { useAuth } from "@/lib/AuthContext";
import WidgetLayoutGrid from "../widgets/WidgetLayoutGrid";
import GenericHubOverviewTab from "./GenericHubOverviewTab";

const HUB_ICONS = {
  sales: TrendingUp, operations: Settings2, compliance: Shield,
  learning: GraduationCap, marketing: Megaphone, innovation: Lightbulb,
};

export default function GenericHubPage({ hubKey, hubName, showDashboard = true }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const branding = useHubBranding();
  const ACCENT = branding.accent_colour || "#06b6d4";

  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [tabWidgets, setTabWidgets] = useState([]);
  const [tabLayout, setTabLayout] = useState("single");
  const [loadingTabs, setLoadingTabs] = useState(true);
  const [loadingWidgets, setLoadingWidgets] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const firstName = user?.full_name?.split(" ")[0] || "there";
  const HubIcon = HUB_ICONS[hubKey] || TrendingUp;

  useEffect(() => {
    if (!hubKey) return;
    setLoadingTabs(true);
    base44.entities.SalesHubTabConfig
      .filter({ hub_key: hubKey, is_active: true }, "sort_order", 50)
      .then(data => {
        const sorted = data || [];
        setTabs(sorted);
        const defaultTab = sorted.find(t => t.is_default) || sorted[0];
        if (defaultTab) setActiveTab(defaultTab.tab_key);
      })
      .catch(() => {})
      .finally(() => setLoadingTabs(false));
  }, [hubKey]);

  useEffect(() => {
    if (!activeTab || !hubKey || activeTab === "overview") {
      setTabWidgets([]);
      return;
    }
    setLoadingWidgets(true);
    base44.entities.HubContentItem
      .filter({ hub_key: hubKey, content_type: "widget", category: activeTab, is_active: true }, "sort_order", 100)
      .then(items => {
        setTabWidgets(items || []);
        setTabLayout(items?.[0]?.config_json?.tab_layout || "single");
      })
      .catch(() => setTabWidgets([]))
      .finally(() => setLoadingWidgets(false));
  }, [activeTab, hubKey]);

  const activeTabConfig = tabs.find(t => t.tab_key === activeTab);
  const isOverviewTab = !activeTab || activeTab === "overview" || activeTabConfig?.is_default;

  if (loadingTabs) {
    return (
      <PageContainer>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 20px", gap: "20px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: `2px solid ${ACCENT}30`, borderTopColor: ACCENT, animation: "spin 0.8s linear infinite" }} />
          <div style={{ fontSize: "14px", color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>Loading {hubName}…</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Hero */}
      <div
        className="relative overflow-hidden mb-5"
        style={{
          borderRadius: "24px",
          border: isDark ? `1px solid ${ACCENT}30` : `1px solid rgba(0,0,0,0.08)`,
          boxShadow: isDark
            ? `0 0 40px ${ACCENT}18, 0 24px 64px rgba(0,0,0,0.50), 0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)`
            : `0 6px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)`,
        }}
      >
        <div className="absolute inset-0" style={{
          background: isDark
            ? "linear-gradient(135deg, #0a1128 0%, #07081a 55%, #050e1f 100%)"
            : "linear-gradient(135deg, #fefeff 0%, #f0f9ff 55%, #e0f2fe 100%)",
        }} />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full blur-3xl opacity-25" style={{ background: ACCENT }} />
          <div className="absolute -bottom-14 right-40 w-52 h-52 rounded-full blur-3xl opacity-15" style={{ background: ACCENT }} />
          <div className="absolute top-8 right-72 w-36 h-36 rounded-full blur-3xl opacity-10" style={{ background: "#ec4899" }} />
        </div>

        <div className="absolute inset-0 pointer-events-none" style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 25%, transparent 50%)"
            : "linear-gradient(135deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.10) 25%, transparent 50%)",
          borderRadius: "24px",
        }} />

        <div className="absolute inset-0" style={{
          background: isDark
            ? "linear-gradient(90deg, rgba(5,8,22,0.99) 0%, rgba(5,10,28,0.95) 35%, rgba(10,15,35,0.65) 60%, transparent 100%)"
            : "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 38%, rgba(255,255,255,0.60) 62%, transparent 100%)",
        }} />

        <div className="relative px-7 pt-6 pb-0 flex flex-col" style={{ zIndex: 2 }}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}30, ${ACCENT}18)`, border: `1px solid ${ACCENT}40`, boxShadow: `0 0 16px ${ACCENT}25` }}>
                  <HubIcon className="w-5 h-5" style={{ color: ACCENT }} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>
                  {branding.hero_badge || hubName}
                </span>
              </div>

              <motion.h1
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                className="font-extrabold mb-2"
                style={{ fontSize: "clamp(20px, 2.6vw, 28px)", fontWeight: 800, color: isDark ? "#ffffff" : "#000000", letterSpacing: "-0.5px" }}
              >
                {branding.hero_title || "Good morning"}, {firstName}.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.30 }}
                className="text-sm mb-2"
                style={{ color: isDark ? "rgba(255,255,255,0.52)" : "rgba(0,0,0,0.50)", maxWidth: "480px" }}
              >
                {branding.hero_subtitle}
              </motion.p>

              {branding.show_search && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.20 }} className="w-full md:w-[400px]">
                  <div className="relative flex items-center gap-2 px-3 rounded-xl transition-all duration-200"
                    style={{
                      height: "42px",
                      background: isDark
                        ? (searchFocused ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.88)")
                        : (searchFocused ? "rgba(15,23,42,0.93)" : "rgba(15,23,42,0.82)"),
                      border: isDark
                        ? `1px solid ${searchFocused ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.60)"}`
                        : `1px solid ${searchFocused ? `${ACCENT}50` : `${ACCENT}30`}`,
                      backdropFilter: "blur(24px)",
                    }}
                  >
                    <Search className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: isDark ? (searchFocused ? "#1a1a2e" : "#6a6a9a") : "rgba(255,255,255,0.65)" }} />
                    <input type="text" placeholder={`Search ${hubName}…`}
                      onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                      className="flex-1 bg-transparent focus:outline-none text-xs font-medium"
                      style={{ color: isDark ? "#0f0f2e" : "#ffffff", caretColor: ACCENT }}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {branding.show_ai_card && (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
                className="md:w-[300px] flex-shrink-0"
                style={{
                  borderRadius: "16px",
                  background: isDark ? `linear-gradient(135deg, ${ACCENT}22 0%, ${ACCENT}10 100%)` : `linear-gradient(135deg, ${ACCENT}14 0%, ${ACCENT}06 100%)`,
                  border: isDark ? `1.5px solid ${ACCENT}35` : `1px solid ${ACCENT}25`,
                  boxShadow: isDark
                    ? `0 16px 40px ${ACCENT}25, 0 0 0 1px rgba(255,255,255,0.12) inset`
                    : `0 12px 32px ${ACCENT}18, 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.60)`,
                  padding: "24px", display: "flex", flexDirection: "column", gap: "16px",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}bb)`, border: `1.5px solid ${ACCENT}80`, boxShadow: `0 6px 20px ${ACCENT}35` }}>
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: isDark ? "#ffffff" : "rgba(0,0,0,0.60)" }}>AI Assistant</p>
                </div>
                <div>
                  <p className="text-sm font-bold mb-1" style={{ color: isDark ? "#ffffff" : "#000000" }}>Need answers fast?</p>
                  <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.58)" }}>Ask AI anything about {hubName}.</p>
                </div>
                <button type="button"
                  className="w-full flex items-center justify-center gap-2 font-bold text-white text-xs py-2.5 px-4 shadow-lg transition-all duration-200"
                  style={{ borderRadius: "12px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}bb)`, border: `1.5px solid ${ACCENT}80`, boxShadow: `0 8px 24px ${ACCENT}40`, cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Ask AI
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.22 }}
          className="relative flex items-center gap-0 px-6 overflow-x-auto" style={{ zIndex: 2 }}
        >
          {loadingTabs ? (
            <div className="flex items-center gap-3 py-3">
              {[1, 2, 3].map(i => (
                <div key={i} style={{ width: "80px", height: "12px", borderRadius: "6px", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }} />
              ))}
            </div>
          ) : tabs.map(tab => {
            const isActive = activeTab === tab.tab_key;
            return (
              <button key={tab.tab_key} type="button" onClick={() => setActiveTab(tab.tab_key)}
                className="relative flex-shrink-0 px-4 py-3 text-xs font-semibold transition-all duration-200"
                style={{
                  color: isActive ? (isDark ? "#ffffff" : "#0f0f2e") : (isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)"),
                  background: "transparent", border: "none", cursor: "pointer",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.72)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)"; }}
              >
                {tab.label}
                {isActive && (
                  <motion.div layoutId={`${hubKey}TabIndicator`}
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}bb)`, boxShadow: `0 0 8px ${ACCENT}80` }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />
        </motion.div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
        >
          {isOverviewTab ? (
            <GenericHubOverviewTab hubKey={hubKey} hubName={hubName} accentColour={ACCENT} showDashboard={showDashboard} />
          ) : loadingWidgets ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
              <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: `2px solid ${ACCENT}30`, borderTopColor: ACCENT, animation: "spin 0.8s linear infinite" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : tabWidgets.length === 0 ? (
            <EmptyTabState
              hubName={hubName}
              tabLabel={activeTabConfig?.label || activeTab}
              accent={ACCENT}
              isDark={isDark}
              isAdmin={user?.role === "admin"}
            />
          ) : (
            <WidgetLayoutGrid
              widgets={tabWidgets}
              layout={tabLayout}
              tabLabel={activeTabConfig?.label}
              accentColour={ACCENT}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </PageContainer>
  );
}

function EmptyTabState({ hubName, tabLabel, accent, isDark, isAdmin }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
      <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: `${accent}15`, border: `2px dashed ${accent}40`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
        <Sparkles style={{ width: "28px", height: "28px", color: accent, opacity: 0.7 }} />
      </div>
      <p style={{ fontSize: "17px", fontWeight: 700, color: isDark ? "rgba(255,255,255,0.85)" : "hsl(230 25% 15%)", marginBottom: "8px" }}>{tabLabel}</p>
      <p style={{ fontSize: "13px", color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.45)", maxWidth: "360px", lineHeight: 1.7, marginBottom: "20px" }}>
        This tab has no widgets configured yet.
      </p>
      {isAdmin && (
        <a href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, color: "#ffffff", textDecoration: "none", background: `linear-gradient(135deg, ${accent}, ${accent}bb)`, border: `1px solid ${accent}80`, boxShadow: `0 4px 14px ${accent}30` }}>
          Configure in Admin Hub
        </a>
      )}
    </div>
  );
}