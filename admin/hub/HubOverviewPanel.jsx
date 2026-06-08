import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { LayoutDashboard, Link, Zap, Bell, BarChart2, BookOpen, Layers, Settings, Download } from "lucide-react";

const STAT_CARDS = [
  { key: "quick_link",   label: "Quick Links",   icon: Link,          switchTab: "quick-links",   colour: "#06b6d4" },
  { key: "tool",         label: "Tools",          icon: Zap,           switchTab: "tools",         colour: "#8b5cf6" },
  { key: "widget",       label: "Widgets",        icon: Layers,        switchTab: "widgets",       colour: "#ec2ca3" },
  { key: "notification", label: "Notifications",  icon: Bell,          switchTab: "notifications", colour: "#f59e0b" },
  { key: "dashboard",    label: "Dashboards",     icon: BarChart2,     switchTab: "dashboard",     colour: "#10b981" },
  { key: "enablement",   label: "Resources",      icon: BookOpen,      switchTab: "enablement",    colour: "#0ea5e9" },
];

export default function HubOverviewPanel({ hubKey, hubName, onSwitchTab, refreshKey }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [counts, setCounts] = useState({});
  const [tabCount, setTabCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadStats();
  }, [hubKey, refreshKey]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [tabs, ...contentResults] = await Promise.all([
        base44.entities.SalesHubTabConfig.filter({ hub_key: hubKey }, "", 50),
        ...STAT_CARDS.map(c => base44.entities.HubContentItem.filter({ hub_key: hubKey, content_type: c.key }, "", 100)),
      ]);
      setTabCount((tabs || []).length);
      const newCounts = {};
      STAT_CARDS.forEach((c, i) => {
        newCounts[c.key] = (contentResults[i] || []).length;
      });
      setCounts(newCounts);
    } catch (err) {
      console.error("Failed to load hub stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const functionName = `seed${hubKey.charAt(0).toUpperCase() + hubKey.slice(1)}Hub`;
      const result = await base44.functions.invoke(functionName, {});
      if (result.data?.success) {
        alert(`✓ Seeded ${hubKey} hub successfully`);
        loadStats();
      } else {
        alert(`Error: ${result.data?.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`Seed failed: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        style={{
          borderRadius: "12px",
          padding: "20px 24px",
          background: isDark
            ? "linear-gradient(135deg, rgba(236,44,163,0.12), rgba(139,92,246,0.08))"
            : "linear-gradient(135deg, rgba(236,44,163,0.06), rgba(139,92,246,0.04))",
          border: isDark ? "1px solid rgba(236,44,163,0.20)" : "1px solid rgba(236,44,163,0.12)",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "linear-gradient(135deg, #ec2ca3, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Settings style={{ width: "18px", height: "18px", color: "#ffffff" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: isDark ? "#ffffff" : "hsl(230 25% 10%)", margin: 0 }}>
              {hubName} · Admin Overview
            </h3>
            <p style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.50)", margin: 0 }}>
              hub_key: <code style={{ fontFamily: "monospace", fontSize: "11px" }}>{hubKey}</code>
            </p>
          </div>
        </div>
        <p style={{ fontSize: "13px", color: isDark ? "rgba(255,255,255,0.60)" : "rgba(0,0,0,0.55)", margin: 0 }}>
          Manage branding, tabs, content, and notifications for the {hubName}. All changes take effect immediately.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px" }}>
        {/* Tabs card */}
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0 }}
          onClick={() => onSwitchTab("tabs")}
          style={{
            padding: "14px",
            borderRadius: "10px",
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.95)",
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#06b6d4"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <LayoutDashboard style={{ width: "20px", height: "20px", color: "#06b6d4", marginBottom: "8px" }} />
          <div style={{ fontSize: "22px", fontWeight: 800, color: isDark ? "#ffffff" : "hsl(230 25% 10%)", lineHeight: 1 }}>
            {loading ? "—" : tabCount}
          </div>
          <div style={{ fontSize: "11px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", marginTop: "4px" }}>Tabs</div>
        </motion.button>

        {STAT_CARDS.map((card, i) => {
          const IconComp = card.icon;
          return (
            <motion.button
              key={card.key}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: (i + 1) * 0.04 }}
              onClick={() => onSwitchTab(card.switchTab)}
              style={{
                padding: "14px",
                borderRadius: "10px",
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.95)",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = card.colour; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <IconComp style={{ width: "20px", height: "20px", color: card.colour, marginBottom: "8px" }} />
              <div style={{ fontSize: "22px", fontWeight: 800, color: isDark ? "#ffffff" : "hsl(230 25% 10%)", lineHeight: 1 }}>
                {loading ? "—" : (counts[card.key] ?? 0)}
              </div>
              <div style={{ fontSize: "11px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", marginTop: "4px" }}>
                {card.label}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Quick nav buttons */}
      <div>
        <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "10px", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>
          Quick Navigation
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {[
            { tab: "branding",      label: "Edit Branding" },
            { tab: "tabs",          label: "Manage Tabs" },
            { tab: "quick-links",   label: "Quick Links" },
            { tab: "tools",         label: "Tools" },
            { tab: "enablement",    label: "Enablement" },
            { tab: "dashboard",     label: "Dashboard" },
            { tab: "widgets",       label: "Widgets" },
            { tab: "notifications", label: "Notifications" },
          ].map(item => (
            <button
              key={item.tab}
              type="button"
              onClick={() => onSwitchTab(item.tab)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                color: isDark ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.65)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ec2ca3"; e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.borderColor = "#ec2ca3"; }}
              onMouseLeave={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"; e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.65)"; e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"; }}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              background: seeding ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))",
              border: "1px solid rgba(99,102,241,0.4)",
              color: "#6366f1",
              cursor: seeding ? "default" : "pointer",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: seeding ? 0.7 : 1,
            }}
            onMouseEnter={e => !seeding && (e.currentTarget.style.background = "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))")}
            onMouseLeave={e => !seeding && (e.currentTarget.style.background = "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))")}
          >
            <Download style={{ width: "12px", height: "12px" }} />
            {seeding ? "Seeding..." : "Seed Hub"}
          </button>
        </div>
      </div>

      {/* Replication guide */}
      <div style={{ padding: "14px 16px", borderRadius: "10px", background: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.05)", border: isDark ? "1px solid rgba(16,185,129,0.20)" : "1px solid rgba(16,185,129,0.15)" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "#10b981", marginBottom: "6px" }}>✓ Framework Ready</p>
        <p style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)", lineHeight: 1.5, margin: 0 }}>
          This panel uses the generic <code style={{ fontFamily: "monospace", fontSize: "11px" }}>HubAdminPanel</code> framework. To add a new hub, simply pass a new <code style={{ fontFamily: "monospace", fontSize: "11px" }}>hub_key</code> — no code changes required.
        </p>
      </div>
    </div>
  );
}