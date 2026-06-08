/**
 * WidgetSelector — admin widget picker modal.
 * Groups widgets by category, supports template quick-picks.
 */
import { useState } from "react";
import { WIDGET_REGISTRY, WIDGET_CATEGORIES, WIDGET_TEMPLATES } from "@/lib/widgetRegistry";
import { useTheme } from "../ThemeProvider";
import {
  X, Zap, Calendar, Link2, Megaphone, Bell, Activity, TrendingUp, BookOpen,
  BarChart2, Monitor, ExternalLink, Sparkles, CheckSquare, FileText,
  Target, Star, Trophy, ShieldCheck, AlertTriangle, ClipboardCheck,
  ListChecks, AlertOctagon, GitBranch, GraduationCap, ClipboardList,
  Award, AlarmClock, Wand2, Search, LayoutDashboard, Settings
} from "lucide-react";

const ICON_MAP = {
  Calendar, Link2, Megaphone, Bell, Activity, TrendingUp, BookOpen, BarChart2,
  Monitor, ExternalLink, Sparkles, CheckSquare, FileText, Target, Star, Trophy,
  ShieldCheck, AlertTriangle, ClipboardCheck, ListChecks, AlertOctagon, GitBranch,
  GraduationCap, ClipboardList, Award, AlarmClock, Wand2, Search, LayoutDashboard,
  Settings, Zap,
};

function getIcon(name) {
  return ICON_MAP[name] || LayoutDashboard;
}

export default function WidgetSelector({ onSelect, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeCategory, setActiveCategory] = useState("all");
  const [view, setView] = useState("widgets"); // "widgets" | "templates"

  const bg = isDark ? "#0d1117" : "#ffffff";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#f8fafc";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardHover = isDark ? "rgba(255,255,255,0.08)" : "#f0f9ff";
  const textMain = isDark ? "#ffffff" : "#0f172a";
  const textMuted = isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.50)";
  const tabActive = isDark ? "rgba(255,255,255,0.10)" : "#ffffff";
  const tabBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";

  const allWidgets = Object.values(WIDGET_REGISTRY);
  const displayed = activeCategory === "all" ? allWidgets : allWidgets.filter(w => w.category === activeCategory);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: bg, borderRadius: "18px", width: "100%", maxWidth: "700px", maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.35)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px 14px", borderBottom: `1px solid ${cardBorder}` }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: textMain, margin: 0 }}>Add Widget</h3>
            <p style={{ fontSize: "12px", color: textMuted, margin: "3px 0 0" }}>Choose a widget to add to this tab</p>
          </div>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "8px", border: `1px solid ${cardBorder}`, background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}>
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        {/* View switcher */}
        <div style={{ display: "flex", gap: "4px", padding: "12px 22px 0" }}>
          {["widgets", "templates"].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, border: `1px solid ${view === v ? tabBorder : "transparent"}`, background: view === v ? tabActive : "none", color: view === v ? textMain : textMuted, cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s" }}
            >
              {v === "templates" ? "⚡ Templates" : "🧩 All Widgets"}
            </button>
          ))}
        </div>

        {view === "widgets" && (
          <>
            {/* Category filter */}
            <div style={{ display: "flex", gap: "6px", padding: "10px 22px", overflowX: "auto", flexShrink: 0 }}>
              <button onClick={() => setActiveCategory("all")}
                style={{ padding: "5px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, border: `1px solid ${activeCategory === "all" ? "#ec2ca3" : cardBorder}`, background: activeCategory === "all" ? "#ec2ca320" : "none", color: activeCategory === "all" ? "#ec2ca3" : textMuted, cursor: "pointer", whiteSpace: "nowrap" }}
              >All</button>
              {Object.entries(WIDGET_CATEGORIES).map(([key, cat]) => (
                <button key={key} onClick={() => setActiveCategory(key)}
                  style={{ padding: "5px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, border: `1px solid ${activeCategory === key ? cat.colour : cardBorder}`, background: activeCategory === key ? `${cat.colour}18` : "none", color: activeCategory === key ? cat.colour : textMuted, cursor: "pointer", whiteSpace: "nowrap" }}
                >{cat.label}</button>
              ))}
            </div>

            {/* Widget grid */}
            <div style={{ overflowY: "auto", padding: "4px 22px 22px", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "8px" }}>
                {displayed.map(widget => {
                  const Icon = getIcon(widget.icon);
                  const cat = WIDGET_CATEGORIES[widget.category];
                  return (
                    <button key={widget.type} onClick={() => onSelect({ widget_type: widget.type, config: { ...widget.defaultConfig }, size: widget.defaultSize })}
                      style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px", padding: "12px", borderRadius: "10px", background: cardBg, border: `1px solid ${cardBorder}`, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = cardHover; e.currentTarget.style.borderColor = cat?.colour || "#ec2ca3"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = cardBg; e.currentTarget.style.borderColor = cardBorder; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: cat ? `${cat.colour}18` : "#ec2ca318", border: `1px solid ${cat ? `${cat.colour}30` : "#ec2ca330"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon style={{ width: "15px", height: "15px", color: cat?.colour || "#ec2ca3" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: textMain }}>{widget.label}</div>
                        <div style={{ fontSize: "10px", color: textMuted, marginTop: "2px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{widget.description}</div>
                      </div>
                      <div style={{ fontSize: "10px", color: cat?.colour || "#ec2ca3", fontWeight: 600, background: cat ? `${cat.colour}12` : "#ec2ca312", padding: "2px 7px", borderRadius: "4px" }}>{cat?.label || "Core"}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {view === "templates" && (
          <div style={{ overflowY: "auto", padding: "14px 22px 22px", flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
              {WIDGET_TEMPLATES.map(tpl => {
                const def = WIDGET_REGISTRY[tpl.type];
                const Icon = def ? getIcon(def.icon) : Zap;
                const cat = def ? WIDGET_CATEGORIES[def.category] : null;
                return (
                  <button key={tpl.id} onClick={() => onSelect({ widget_type: tpl.type, config: { ...def?.defaultConfig, ...tpl.config, size: tpl.size }, size: tpl.size })}
                    style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px", borderRadius: "10px", background: cardBg, border: `1px solid ${cardBorder}`, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = cardHover; e.currentTarget.style.borderColor = cat?.colour || "#ec2ca3"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = cardBg; e.currentTarget.style.borderColor = cardBorder; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: cat ? `${cat.colour}18` : "#ec2ca318", border: `1px solid ${cat ? `${cat.colour}30` : "#ec2ca330"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon style={{ width: "14px", height: "14px", color: cat?.colour || "#ec2ca3" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: textMain }}>{tpl.label}</div>
                      <div style={{ fontSize: "10px", color: textMuted, marginTop: "2px" }}>{def?.label} · {tpl.size}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}