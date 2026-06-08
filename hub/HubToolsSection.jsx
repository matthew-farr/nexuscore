/**
 * HubToolsSection — generic version of SalesToolsHero.
 * Loads content_type="tool" items from HubContentItem for any hubKey.
 * Non-Sales hubs: clicking a tool card opens its URL (no modal launcher needed).
 */
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, ExternalLink, ChevronRight, Globe, BarChart2, BookOpen, Shield, CheckSquare, Zap, Users, Settings2, Search, ClipboardCheck, AlertTriangle, UserPlus, Database, Workflow, TrendingUp, Calculator, DollarSign, Briefcase, AlertCircle, Building2, BookCheck } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { base44 } from "@/api/base44Client";
import IndustryAssignmentQuickView from "@/components/industry/IndustryAssignmentQuickView";

const COLOUR_MAP = {
  cyan: "#06b6d4", purple: "#8b5cf6", pink: "#ec2ca3",
  green: "#10b981", amber: "#f59e0b", red: "#ef4444", blue: "#0ea5e9",
};

const ICON_MAP = {
  FileText, Globe, BarChart2, BookOpen, Shield, CheckSquare, Zap, Users, Settings2, Search,
  ClipboardCheck, AlertTriangle, UserPlus, Database, Workflow, TrendingUp, Calculator, DollarSign,
  ExternalLink, Briefcase, AlertCircle, Building2, BookCheck,
};

export default function HubToolsSection({ hubKey, hubName, accentColour }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const ACCENT = accentColour || "#06b6d4";
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIndustryModal, setShowIndustryModal] = useState(false);

  const cols = useMemo(() => {
    const len = tools.length;
    if (len <= 2) return "lg:grid-cols-2";
    if (len === 3) return "lg:grid-cols-3";
    return "lg:grid-cols-4";
  }, [tools.length]);

  useEffect(() => {
    if (!hubKey) return;
    base44.entities.HubContentItem
      .filter({ hub_key: hubKey, content_type: "tool", is_active: true }, "sort_order", 20)
      .then(data => setTools(data || []))
      .catch(() => setTools([]))
      .finally(() => setLoading(false));
  }, [hubKey]);

  if (loading || tools.length === 0) return null;

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-6"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.88)" : "hsl(230 25% 15%)" }}>
          {hubName} Tools
        </h2>
        <p className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}>
          Quick access to tools and resources
        </p>
      </div>

      <div className={`grid gap-3 grid-cols-1 sm:grid-cols-2 ${cols}`}>
        {tools.map((t, i) => {
          const color = COLOUR_MAP[t.colour_theme] || ACCENT;
          const Icon = ICON_MAP[t.icon] || FileText;
          const hasUrl = !!t.url;

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              onClick={() => {
                if (t.title === "Industry Assignment Manager" || t.title === "Industry Register") {
                  setShowIndustryModal(true);
                  return;
                }
                if (hasUrl) {
                  if (t.url.startsWith("/")) {
                    window.location.href = t.url;
                  } else {
                    window.open(t.url, t.open_in_new_tab !== false ? "_blank" : "_self");
                  }
                }
              }}
              className="relative rounded-xl p-4 flex flex-col gap-3 text-left border transition-all duration-200"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)"
                  : "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,246,255,0.90) 100%)",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)",
                backdropFilter: "blur(20px)",
                boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.25)" : "0 6px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,0.70)",
                cursor: hasUrl ? "pointer" : "default",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${color}60`;
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}35` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.88)" : "hsl(230 25% 15%)" }}>
                  {t.title}
                </h3>
                <p className="text-xs mt-1 leading-snug" style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.45)" }}>
                  {t.description}
                </p>
              </div>
              {hasUrl && (
                <div className="flex items-center gap-1.5 text-xs font-semibold mt-2" style={{ color }}>
                  Launch <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>

    <IndustryAssignmentQuickView
      isOpen={showIndustryModal}
      onClose={() => setShowIndustryModal(false)}
    />
    </>
  );
}