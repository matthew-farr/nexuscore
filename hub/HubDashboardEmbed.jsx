/**
 * HubDashboardEmbed — generic version of SalesPowerBI.
 * Loads a dashboard embed from HubContentItem (content_type="dashboard") for any hubKey.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, BarChart2, Settings } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function HubDashboardEmbed({ hubKey, accentColour }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const ACCENT = accentColour || "#06b6d4";
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  useEffect(() => {
    if (!hubKey) return;
    base44.entities.HubContentItem
      .filter({ hub_key: hubKey, content_type: "dashboard", is_active: true }, "sort_order", 1)
      .then(data => setDashboard(data?.[0] || null))
      .catch(() => setDashboard(null))
      .finally(() => setLoading(false));
  }, [hubKey]);

  if (loading) return null;

  if (!dashboard) {
    if (!isAdmin) return null;
    // Admin placeholder
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="relative rounded-2xl overflow-hidden mb-6"
        style={{
          background: isDark ? `linear-gradient(145deg, rgba(15,23,42,0.72) 0%, rgba(15,23,42,0.55) 100%)` : "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(250,248,255,0.94) 100%)",
          border: isDark ? `1px dashed ${ACCENT}30` : `1.5px dashed ${ACCENT}35`,
          height: "200px",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px",
        }}
      >
        <BarChart2 style={{ width: "32px", height: "32px", color: ACCENT, opacity: 0.4 }} />
        <p style={{ fontSize: "13px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>No dashboard configured</p>
        <button
          onClick={() => navigate("/admin")}
          style={{ fontSize: "11px", padding: "6px 14px", borderRadius: "8px", background: `${ACCENT}18`, border: `1px solid ${ACCENT}35`, color: ACCENT, cursor: "pointer" }}
        >
          Configure in Admin Hub
        </button>
      </motion.div>
    );
  }

  const embedUrl = dashboard.embed_url || dashboard.url;
  const embedHeight = dashboard.height || 460;
  const title = dashboard.title;
  const fullReportUrl = dashboard.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="relative rounded-2xl overflow-hidden mb-6 group"
      style={{
        background: isDark ? `linear-gradient(145deg, rgba(15,23,42,0.72) 0%, rgba(15,23,42,0.55) 100%)` : "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(250,248,255,0.94) 100%)",
        border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1.5px solid rgba(199,210,254,0.40)",
        boxShadow: isDark ? "0 20px 50px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset" : "0 14px 40px rgba(99,102,241,0.12), 0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.80) inset",
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: isDark ? "linear-gradient(to right, transparent, rgba(255,255,255,0.14), transparent)" : "linear-gradient(to right, transparent, rgba(255,255,255,0.90), transparent)" }} />
      {isDark && <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-10" style={{ background: ACCENT }} />}

      <div className="flex items-center justify-between p-5 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT}25, ${ACCENT}12)`, border: `1.5px solid ${ACCENT}40`, boxShadow: `0 0 12px ${ACCENT}20` }}>
            <BarChart2 className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
          <h3 className="text-sm font-bold" style={{ color: isDark ? "#ffffff" : "hsl(230 25% 10%)" }}>{title}</h3>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>LIVE</span>
        </div>
        <div className="flex items-center gap-2">
          {fullReportUrl && (
            <button
              onClick={() => window.open(fullReportUrl, "_blank")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 transition-all duration-200"
              style={{ height: "32px", borderRadius: "10px", background: `linear-gradient(135deg, ${ACCENT}28, ${ACCENT}14)`, border: `1.5px solid ${ACCENT}45`, color: ACCENT, cursor: "pointer" }}
            >
              <ExternalLink className="w-3 h-3" /> Open Full Report
            </button>
          )}
          {isAdmin && (
            <button onClick={() => navigate("/admin")} title="Configure Dashboard"
              style={{ width: "32px", height: "32px", borderRadius: "8px", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", border: "none", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Settings style={{ width: "14px", height: "14px" }} />
            </button>
          )}
        </div>
      </div>

      <div style={{ height: embedHeight, position: "relative", overflow: "hidden", margin: "0 4px 4px 4px", borderRadius: "0 0 16px 16px", background: isDark ? "#0a0e1a" : "#ffffff" }}>
        <iframe src={embedUrl} frameBorder="0" allowFullScreen title={title}
          style={{ display: "block", position: "absolute", top: 0, left: "-2%", width: "104%", height: "100%", border: "none" }} />
      </div>
    </motion.div>
  );
}