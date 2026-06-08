import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Settings, Loader2, Globe, BarChart2, BookOpen, UserPlus, Shield, CheckSquare, Zap, CreditCard, ScanLine, Link, ExternalLink, Mail, Users, FileText, Home, Search } from "lucide-react";
import { useSalesHubBranding } from "./SalesHubBrandingContext";
import { COLOUR_MAP } from "./salesToolsConfig";

const ICON_MAP = {
  Globe, BarChart2, BookOpen, UserPlus, Shield, CheckSquare, Zap, CreditCard, ScanLine, Link, ExternalLink, Mail, Users, FileText, Home, Search,
};

const DEFAULT_QUICK_LINKS = [
  { title: "CRM Platform", url: "https://crm.example.com", icon: "Globe", colour_theme: "cyan", badge_text: "" },
  { title: "Analytics", url: "https://analytics.example.com", icon: "BarChart2", colour_theme: "purple", badge_text: "" },
  { title: "Sales Playbook", url: "https://playbook.example.com", icon: "BookOpen", colour_theme: "pink", badge_text: "New" },
];

export default function SalesActionLauncher() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const branding = useSalesHubBranding();
  const ACCENT = branding.accent_colour || "#06b6d4";
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuickLinks();
  }, []);

  const loadQuickLinks = async () => {
    try {
      const links = await base44.entities.SalesHubQuickLink.filter({ is_active: true }, "sort_order", 100);
      setActions(links && links.length > 0 ? links : DEFAULT_QUICK_LINKS);
    } catch (err) {
      console.error("Failed to load quick links:", err);
      setActions(DEFAULT_QUICK_LINKS);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.06 }}
      className="relative rounded-2xl p-4 mb-6 overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)"
          : "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(250,248,255,0.90) 100%)",
        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(199,210,254,0.35)",
        backdropFilter: "blur(20px)",
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 10px 32px rgba(99,102,241,0.12), 0 4px 12px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,0.90)",
      }}
    >
      {/* Shimmer top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: isDark
            ? "linear-gradient(to right, transparent, rgba(255,255,255,0.14), transparent)"
            : "linear-gradient(to right, transparent, rgba(255,255,255,0.90), transparent)",
        }}
      />

      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-sm font-semibold"
          style={{ color: isDark ? "rgba(255,255,255,0.88)" : "hsl(230 25% 15%)" }}
        >
          Quick Launch
        </h3>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-medium uppercase tracking-wider"
            style={{ color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.30)" }}
          >
            {loading ? "..." : `${actions.length} tools`}
          </span>
          {isAdmin && (
            <button
              onClick={() => navigate("/admin/homepage?tab=sales-quick-links")}
              title="Edit Quick Links in Admin"
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                border: "none",
                color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
                e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.70)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
                e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
              }}
            >
              <Settings style={{ width: "14px", height: "14px" }} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 gap-2">
          <Loader2 style={{ width: "18px", height: "18px", animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>Loading…</span>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {/* Quick Links */}
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {actions.map((action, i) => {
                const IconComponent = ICON_MAP[action.icon];
                const color = COLOUR_MAP[action.colour_theme] || COLOUR_MAP.cyan;
                return (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.08 + i * 0.025 }}
                    onClick={() => {
                      if (action.url) {
                        window.open(action.url, action.open_in_new_tab ? "_blank" : "_self");
                      }
                    }}
                    className="flex-1 min-w-[80px] flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 group relative overflow-hidden"
                    style={{
                      background: isDark
                        ? `linear-gradient(145deg, rgba(15, 23, 42, 0.60) 0%, rgba(15, 23, 42, 0.40) 100%)`
                        : "linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(250,248,255,0.95) 100%)",
                      border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1.5px solid rgba(199,210,254,0.50)",
                      cursor: "pointer",
                      boxShadow: isDark
                        ? "0 8px 24px rgba(0,0,0,0.25)"
                        : "0 8px 20px rgba(99,102,241,0.10), 0 2px 6px rgba(0,0,0,0.06)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = isDark
                        ? `linear-gradient(145deg, ${color}18, ${color}08)`
                        : `linear-gradient(145deg, ${color}15, ${color}08)`;
                      e.currentTarget.style.borderColor = isDark ? `${color}50` : `${color}60`;
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow = isDark
                        ? `0 0 24px ${color}30, 0 12px 32px rgba(0,0,0,0.35)`
                        : `0 14px 36px ${color}22, 0 6px 16px rgba(0,0,0,0.10)`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = isDark
                        ? `linear-gradient(145deg, rgba(15, 23, 42, 0.60) 0%, rgba(15, 23, 42, 0.40) 100%)`
                        : "linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(250,248,255,0.95) 100%)";
                      e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.10)" : "rgba(199,210,254,0.50)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = isDark
                        ? "0 8px 24px rgba(0,0,0,0.25)"
                        : "0 8px 20px rgba(99,102,241,0.10), 0 2px 6px rgba(0,0,0,0.06)";
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ring-1 shadow-md group-hover:shadow-lg transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${color}28, ${color}12)`,
                        border: `1.5px solid ${color}40`,
                        boxShadow: `0 0 12px ${color}20`,
                      }}
                    >
                      {IconComponent ? <IconComponent className="w-4 h-4" style={{ color }} /> : <span style={{ color }}>●</span>}
                    </div>
                    <span
                      className="text-[10px] font-semibold text-center leading-tight"
                      style={{ color: isDark ? "#ffffff" : "hsl(230 25% 12%)" }}
                    >
                      {action.title}
                      {action.badge_text && <div style={{ fontSize: "8px", color: color, marginTop: "2px" }}>{action.badge_text}</div>}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}


        </>
      )}


    </motion.div>
  );
}