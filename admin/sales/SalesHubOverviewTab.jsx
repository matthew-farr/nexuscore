import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { ArrowRight, Zap, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const ACCENT = "#ec2ca3";

export default function SalesHubOverviewTab({ onSwitchTab, refreshKey }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [stats, setStats] = useState({
    quickLinks: 0,
    salesTools: 0,
    dashboards: 0,
    widgets: 0,
    proposals: 0,
    enablement: 0,
    notifications: 0,
    tabs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState(null);

  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  useEffect(() => {
    // Auto-seed only if completely empty
    const autoSeed = async () => {
      try {
        const [t, l, w, e] = await Promise.all([
          base44.entities.SalesHubTool.list("", 1).then(r => r?.length || 0),
          base44.entities.SalesHubQuickLink.list("", 1).then(r => r?.length || 0),
          base44.entities.SalesHubSidebarWidget.list("", 1).then(r => r?.length || 0),
          base44.entities.SalesEnablementItem.list("", 1).then(r => r?.length || 0),
        ]);
        if (t === 0 && l === 0 && w === 0 && e === 0) {
          await base44.functions.invoke('seedSalesHubDefaults', {});
          await loadStats();
        }
      } catch (err) {
        console.error("Auto-seed failed:", err);
      }
    };
    autoSeed();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [links, tools, dashboards, widgets, proposals, enablement, notifications, tabs] = await Promise.all([
        base44.entities.SalesHubQuickLink.list("", 500).catch(() => []),
        base44.entities.SalesHubTool.list("", 500).catch(() => []),
        base44.entities.SalesHubDashboardEmbed.list("", 500).catch(() => []),
        base44.entities.SalesHubSidebarWidget.list("", 500).catch(() => []),
        base44.entities.SalesProposalTemplate.list("", 500).catch(() => []),
        base44.entities.SalesEnablementItem.list("", 500).catch(() => []),
        base44.entities.SalesHubNotificationConfig.list("", 500).catch(() => []),
        base44.entities.SalesHubTabConfig.filter({ hub_key: "sales" }, "", 50).catch(() => []),
      ]);
      setStats({
        quickLinks: links?.length || 0,
        salesTools: tools?.length || 0,
        dashboards: dashboards?.length || 0,
        widgets: widgets?.length || 0,
        proposals: proposals?.length || 0,
        enablement: enablement?.length || 0,
        notifications: notifications?.length || 0,
        tabs: tabs?.length || 0,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSeeding(true);
    setSeedStatus(null);
    toast.loading("Checking Sales Hub defaults…");
    try {
      const result = await base44.functions.invoke('seedSalesHubDefaults', {});
      const data = result.data;
      const parts = [];
      if (data.seeded?.tools > 0) parts.push(`${data.seeded.tools} tools`);
      if (data.seeded?.links > 0) parts.push(`${data.seeded.links} quick links`);
      if (data.seeded?.widgets > 0) parts.push(`${data.seeded.widgets} widgets`);
      if (data.seeded?.enablement > 0) parts.push(`${data.seeded.enablement} enablement items`);
      if (data.seeded?.proposals > 0) parts.push(`${data.seeded.proposals} proposal templates`);
      if (data.seeded?.dashboards > 0) parts.push(`${data.seeded.dashboards} dashboards`);

      const msg = parts.length > 0
        ? `Created: ${parts.join(", ")}`
        : "All Sales Hub defaults already exist — no duplicates created";

      toast.dismiss();
      toast.success(msg);
      setSeedStatus({ success: true, message: msg });
      await loadStats();
    } catch (err) {
      console.error("Seeding failed:", err);
      toast.dismiss();
      const errorMsg = err.response?.data?.error || err.message || "Unknown error";
      toast.error(`Seeding failed: ${errorMsg}`);
      setSeedStatus({ success: false, error: errorMsg });
    } finally {
      setSeeding(false);
    }
  };

  const statCards = [
    { label: "Quick Links",    value: stats.quickLinks,    tab: "quick-links"   },
    { label: "Sales Tools",    value: stats.salesTools,    tab: "sales-tools"   },
    { label: "Dashboards",     value: stats.dashboards,    tab: "dashboard"     },
    { label: "Widgets",        value: stats.widgets,       tab: "widgets"       },
    { label: "Proposals",      value: stats.proposals,     tab: "proposals"     },
    { label: "Enablement",     value: stats.enablement,    tab: "enablement"    },
    { label: "Notifications",  value: stats.notifications, tab: "notifications" },
    { label: "Tabs",           value: stats.tabs,          tab: "tabs"          },
  ];

  const actionButtons = [
    { label: "Quick Links",      tab: "quick-links",   icon: "🔗" },
    { label: "Sales Tools",      tab: "sales-tools",   icon: "🛠️" },
    { label: "Branding",         tab: "branding",      icon: "🎨" },
    { label: "Hub Tabs",         tab: "tabs",          icon: "📑" },
    { label: "Dashboard Embed",  tab: "dashboard",     icon: "📊" },
    { label: "Proposal Templates", tab: "proposals",   icon: "📄" },
  ];

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 rounded-xl"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(236,44,163,0.12), rgba(139,92,246,0.08))"
            : "linear-gradient(135deg, rgba(236,44,163,0.08), rgba(139,92,246,0.05))",
          border: isDark ? "1px solid rgba(236,44,163,0.25)" : "1px solid rgba(236,44,163,0.20)",
        }}
      >
        <div className="flex items-start gap-3">
          <Zap style={{ width: "18px", height: "18px", color: ACCENT, flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 10%)" }}>
              Configure Your Sales Hub
            </p>
            <p className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.60)" }}>
              All settings here control what users see in the live Sales Hub. Changes take effect immediately after saving.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {statCards.map((stat, i) => (
          <motion.button
            type="button"
            key={stat.tab}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSwitchTab(stat.tab); }}
            className="p-3 rounded-lg text-left transition-all"
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(15,23,42,0.70), rgba(15,23,42,0.50))"
                : "linear-gradient(135deg, rgba(255,255,255,1), rgba(250,248,255,0.94))",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(199,210,254,0.40)",
              cursor: "pointer",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${ACCENT}40`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(199,210,254,0.40)"; }}
          >
            <div className="text-xl font-bold" style={{ color: ACCENT }}>
              {loading ? "–" : stat.value}
            </div>
            <div className="text-[10px] mt-1 leading-tight" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.55)" }}>
              {stat.label}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold mb-2" style={{ color: isDark ? "rgba(255,255,255,0.88)" : "hsl(230 25% 15%)" }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {actionButtons.map((btn, i) => (
            <motion.button
              type="button"
              key={btn.tab}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSwitchTab(btn.tab); }}
              className="p-3 rounded-lg text-left flex items-center justify-between transition-all"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.06))"
                  : "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.04))",
                border: isDark ? "1px solid rgba(139,92,246,0.20)" : "1px solid rgba(139,92,246,0.15)",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${ACCENT}40`;
                e.currentTarget.style.background = isDark
                  ? "linear-gradient(135deg, rgba(236,44,163,0.15), rgba(236,44,163,0.08))"
                  : "linear-gradient(135deg, rgba(236,44,163,0.10), rgba(236,44,163,0.05))";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = isDark ? "rgba(139,92,246,0.20)" : "rgba(139,92,246,0.15)";
                e.currentTarget.style.background = isDark
                  ? "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.06))"
                  : "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.04))";
              }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "16px" }}>{btn.icon}</span>
                <span className="text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.85)" : "hsl(230 25% 15%)" }}>
                  {btn.label}
                </span>
              </div>
              <ArrowRight style={{ width: "14px", height: "14px", color: ACCENT }} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Seed status */}
      {seedStatus && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl flex items-start gap-3"
          style={{
            background: seedStatus.success
              ? (isDark ? "rgba(16,185,129,0.10)" : "rgba(16,185,129,0.07)")
              : (isDark ? "rgba(239,68,68,0.10)" : "rgba(239,68,68,0.07)"),
            border: seedStatus.success
              ? "1px solid rgba(16,185,129,0.25)"
              : "1px solid rgba(239,68,68,0.25)",
          }}
        >
          {seedStatus.success
            ? <CheckCircle style={{ width: "16px", height: "16px", color: "#10b981", flexShrink: 0 }} />
            : <AlertCircle style={{ width: "16px", height: "16px", color: "#ef4444", flexShrink: 0 }} />
          }
          <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}>
            {seedStatus.success ? seedStatus.message : seedStatus.error}
          </p>
        </motion.div>
      )}

      {/* Seed Button */}
      <button
        type="button"
        onClick={handleSeed}
        disabled={seeding}
        className="w-full p-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.06))"
            : "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.04))",
          border: isDark ? "1px solid rgba(59,130,246,0.22)" : "1px solid rgba(59,130,246,0.18)",
          color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
          cursor: seeding ? "not-allowed" : "pointer",
          opacity: seeding ? 0.6 : 1,
          fontSize: "13px",
        }}
        onMouseEnter={e => { if (!seeding) { e.currentTarget.style.borderColor = "rgba(59,130,246,0.40)"; } }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? "rgba(59,130,246,0.22)" : "rgba(59,130,246,0.18)"; }}
      >
        <RefreshCw style={{ width: "15px", height: "15px", animation: seeding ? "spin 1s linear infinite" : "none" }} />
        {seeding ? "Seeding…" : "Reset / Seed Default Sales Hub Content"}
      </button>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}