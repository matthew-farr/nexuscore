import { motion } from "framer-motion";
import { ExternalLink, BarChart2, Settings } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useSalesHubBranding } from "./SalesHubBrandingContext";

const FALLBACK_EMBED_URL = "https://app.powerbi.com/reportEmbed?reportId=e99fe8bf-8640-4e6d-8601-1ca0cb2ccccf&autoAuth=true&ctid=56d16e33-21b0-4f89-b37a-296d05ee8535&filterPaneEnabled=false&navContentPaneEnabled=false";

export default function SalesPowerBI() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const branding = useSalesHubBranding();
  const ACCENT = branding.accent_colour || "#06b6d4";
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const dashboards = await base44.entities.SalesHubDashboardEmbed.filter({ is_active: true }, "", 1);
      setDashboard(dashboards && dashboards.length > 0 ? dashboards[0] : null);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const embedUrl = dashboard?.embed_url || FALLBACK_EMBED_URL;
  const embedHeight = dashboard?.height || 460;
  const title = dashboard?.title || "Sales Dashboard";
  const fullReportUrl = dashboard?.open_full_report_url;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="relative rounded-2xl overflow-hidden mb-6 p-6 flex items-center justify-center"
        style={{
          background: isDark
            ? `linear-gradient(145deg, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.55) 100%)`
            : "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(250,248,255,0.94) 100%)",
          border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1.5px solid rgba(199,210,254,0.40)",
          height: "200px",
        }}
      >
        <div style={{ fontSize: "13px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
          Loading dashboard…
        </div>
      </motion.div>
    );
  }

  if (!dashboard && !isAdmin) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="relative rounded-2xl overflow-hidden mb-6 group"
      style={{
        background: isDark
          ? `linear-gradient(145deg, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.55) 100%)`
          : "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(250,248,255,0.94) 100%)",
        border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1.5px solid rgba(199,210,254,0.40)",
        backdropFilter: "blur-xl",
        boxShadow: isDark
          ? "0 20px 50px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset"
          : "0 14px 40px rgba(99,102,241,0.12), 0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.80) inset",
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

      {/* Accent glow */}
      {isDark && (
        <div
          className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-10"
          style={{ background: ACCENT }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center ring-1"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}25, ${ACCENT}12)`,
              border: `1.5px solid ${ACCENT}40`,
              boxShadow: `0 0 12px ${ACCENT}20`,
            }}
          >
            <BarChart2 className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
          <h3
            className="text-sm font-bold"
            style={{ color: isDark ? "#ffffff" : "hsl(230 25% 10%)" }}
          >
            {title}
          </h3>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{
              background: `${ACCENT}18`,
              color: ACCENT,
              border: `1px solid ${ACCENT}30`,
            }}
          >
            LIVE
          </span>
        </div>

        <div className="flex items-center gap-2">
          {fullReportUrl && (
            <button
              onClick={() => window.open(fullReportUrl, "_blank")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 transition-all duration-200 ring-1 shadow-md"
              style={{
                height: "32px",
                borderRadius: "10px",
                background: `linear-gradient(135deg, ${ACCENT}28, ${ACCENT}14)`,
                border: `1.5px solid ${ACCENT}45`,
                color: ACCENT,
                cursor: "pointer",
                boxShadow: `0 0 12px ${ACCENT}15`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${ACCENT}30, ${ACCENT}20)`;
                e.currentTarget.style.boxShadow = `0 4px 16px ${ACCENT}30`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = isDark
                  ? "linear-gradient(135deg, rgba(6,182,212,0.18), rgba(14,165,233,0.12))"
                  : "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(14,165,233,0.08))";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <ExternalLink className="w-3 h-3" />
              Open Full Report
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => navigate("/admin/homepage?tab=sales-dashboard")}
              title="Configure Dashboard"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
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

      {/* iFrame */}
      <div style={{
        height: embedHeight,
        position: "relative",
        overflow: "hidden",
        margin: "0 4px 4px 4px",
        borderRadius: isDark ? "0 0 16px 16px" : "0 0 16px 16px",
        background: isDark ? "#0a0e1a" : "#ffffff",
        border: isDark ? "none" : "1px solid rgba(199,210,254,0.30)",
      }}>
        <iframe
          src={embedUrl}
          frameBorder="0"
          allowFullScreen={true}
          title={title}
          style={{
            display: "block",
            position: "absolute",
            top: 0,
            left: "-2%",
            width: "104%",
            height: "100%",
            border: "none",
          }}
        />
      </div>
    </motion.div>
  );
}