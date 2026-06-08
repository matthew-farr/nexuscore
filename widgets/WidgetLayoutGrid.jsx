/**
 * WidgetLayoutGrid — renders widgets in the configured layout.
 * Supports: single, two, three, dashboard, hero_grid, sidebar
 */
import { motion } from "framer-motion";
import WidgetRenderer from "./WidgetRenderer";
import { LayoutDashboard, Link, BarChart2, FileText, Sparkles } from "lucide-react";
import { buildHubTheme } from "@/lib/hubTheme";
import { useTheme } from "../ThemeProvider";

function EmptyCanvas({ tabLabel, accent }) {
  const { theme: mode } = useTheme();
  const isDark = mode === "dark";
  const theme = buildHubTheme(accent, isDark);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: theme.surface, border: `2px dashed ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
        <LayoutDashboard style={{ width: "28px", height: "28px", color: accent, opacity: 0.7 }} />
      </div>
      <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "8px", opacity: 0.75, color: theme.text }}>{tabLabel}</h3>
      <p style={{ fontSize: "13px", opacity: 0.45, maxWidth: "280px", marginBottom: "20px", color: theme.textMuted }}>
        This tab has no widgets yet. Configure it in Admin Hub → Tabs.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
        {[{ icon: Link, label: "Quick Links" }, { icon: BarChart2, label: "Dashboard" }, { icon: FileText, label: "Resource" }, { icon: Sparkles, label: "AI Widget" }].map(({ icon: Icon, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: theme.surface, border: `1px solid ${theme.border}`, fontSize: "11px", fontWeight: 600, color: accent, opacity: 0.7 }}>
            <Icon style={{ width: "12px", height: "12px" }} />
            {label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function gridCols(count) {
  if (count === 1) return "1fr";
  if (count === 2) return "1fr 1fr";
  return "1fr 1fr 1fr";
}

/**
 * Main WidgetLayoutGrid component
 *
 * @param {array} widgets   — filtered, active HubContentItem records
 * @param {string} layout   — "single" | "two" | "three" | "dashboard" | "hero_grid" | "sidebar"
 * @param {string} tabLabel — for empty state
 * @param {string} accentColour
 */
export default function WidgetLayoutGrid({ widgets = [], layout = "single", tabLabel = "Tab", accentColour = "#ec2ca3" }) {
  if (widgets.length === 0) {
    return <EmptyCanvas tabLabel={tabLabel} accent={accentColour} />;
  }

  // ── SIDEBAR layout: first widget full-width left (2fr), remaining right (1fr) ──
  if (layout === "sidebar") {
    const [mainWidget, ...sideWidgets] = widgets;
    return (
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", alignItems: "start" }}>
        <div>
          <WidgetRenderer widget={mainWidget} accentColour={accentColour} delay={0} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sideWidgets.map((w, i) => (
            <WidgetRenderer key={w.id} widget={w} accentColour={accentColour} delay={0.05 * (i + 1)} />
          ))}
        </div>
      </div>
    );
  }

  // ── HERO + GRID: first widget full-width, rest in 2-col grid ──
  if (layout === "hero_grid") {
    const [heroWidget, ...gridWidgets] = widgets;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <WidgetRenderer widget={heroWidget} accentColour={accentColour} delay={0} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {gridWidgets.map((w, i) => (
            <WidgetRenderer key={w.id} widget={w} accentColour={accentColour} delay={0.05 * (i + 1)} />
          ))}
        </div>
      </div>
    );
  }

  // ── DASHBOARD: uses widget size from config_json.size ──
  if (layout === "dashboard") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "12px", alignItems: "start" }}>
        {widgets.map((w, i) => {
          const size = w.config_json?.size || "medium";
          const span = size === "full" ? 12 : size === "large" ? 8 : size === "small" ? 3 : 6;
          return (
            <div key={w.id} style={{ gridColumn: `span ${span}` }}>
              <WidgetRenderer widget={w} accentColour={accentColour} delay={0.04 * i} />
            </div>
          );
        })}
      </div>
    );
  }

  // ── SINGLE / TWO / THREE column ──
  const cols = layout === "three" ? 3 : layout === "two" ? 2 : 1;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: gridCols(cols),
      gap: "14px",
      alignItems: "start",
    }}>
      {widgets.map((w, i) => (
        <WidgetRenderer key={w.id} widget={w} accentColour={accentColour} delay={0.04 * i} />
      ))}
    </div>
  );
}