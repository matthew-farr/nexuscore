/**
 * HubEnablementSection — generic version of SalesEnablementGrid.
 * Loads content_type="enablement" items from HubContentItem for any hubKey.
 * Groups by category and renders them in the same 2-col card grid as Sales Hub.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, FileText, Globe, Layers, Star, TrendingUp, Users, Shield, ClipboardCheck, AlertTriangle, ArrowRight, Settings } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import HubWidgetCard from "./HubWidgetCard";

const ICON_MAP = { BookOpen, FileText, Globe, Layers, Star, TrendingUp, Users, Shield, ClipboardCheck, AlertTriangle };

function EnablementItem({ item, isDark, accent }) {
  const ACCENT = accent || "#06b6d4";
  const Icon = ICON_MAP[item.icon] || FileText;
  return (
    <div
      className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-150 group"
      style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.04)" }}
      onClick={() => item.url && window.open(item.url, "_blank")}
      onMouseEnter={e => { e.currentTarget.style.background = isDark ? `${ACCENT}12` : `${ACCENT}08`; e.currentTarget.style.borderColor = `${ACCENT}28`; }}
      onMouseLeave={e => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"; e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"; }}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}25` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: ACCENT }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: isDark ? "rgba(255,255,255,0.82)" : "hsl(230 25% 12%)" }}>{item.title}</p>
        <p className="text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.38)" }}>{item.meta}</p>
      </div>
      {item.badge && (
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
          {item.badge}
        </span>
      )}
      <ArrowRight className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" style={{ color: ACCENT }} />
    </div>
  );
}

export default function HubEnablementSection({ hubKey, accentColour }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const ACCENT = accentColour || "#06b6d4";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  useEffect(() => {
    if (!hubKey) return;
    base44.entities.HubContentItem
      .filter({ hub_key: hubKey, content_type: "enablement", is_active: true }, "sort_order", 100)
      .then(data => setItems(data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [hubKey]);

  if (loading) return <div style={{ padding: "24px", textAlign: "center", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>Loading…</div>;
  if (items.length === 0) return null;

  // Group by category
  const grouped = {};
  items.forEach(item => {
    const cat = item.category || "Resources";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({
      icon: item.icon || (item.content_subtype === "PDF" ? "FileText" : "BookOpen"),
      title: item.title,
      meta: item.description || item.content_subtype || "",
      badge: item.badge_text || null,
      url: item.url || item.file_url,
    });
  });
  const sections = Object.entries(grouped).map(([title, itemsList]) => ({ title, items: itemsList }));

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex items-center justify-between px-4 py-2">
          <span style={{ fontSize: "11px", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>{items.length} active enablement items</span>
          <button onClick={() => navigate("/admin")} style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", border: "none", color: isDark ? "rgba(255,255,255,0.60)" : "rgba(0,0,0,0.60)", cursor: "pointer" }}>
            <Settings style={{ display: "inline", width: "12px", height: "12px", marginRight: "4px" }} /> Configure
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, si) => (
          <HubWidgetCard key={si} title={section.title} delay={0.18 + si * 0.04} accentColor={ACCENT}>
            <div className="space-y-1.5">
              {section.items.map((item, ii) => (
                <EnablementItem key={ii} item={item} isDark={isDark} accent={ACCENT} />
              ))}
            </div>
          </HubWidgetCard>
        ))}
      </div>
    </div>
  );
}