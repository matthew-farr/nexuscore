/**
 * HubQuickLaunch — renders quick_link items from HubContentItem as a quick-launch bar.
 * Loads items for the given hubKey with content_type="quick_link".
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../ThemeProvider";
import { ExternalLink } from "lucide-react";

const COLOUR_MAP = {
  cyan: "#06b6d4", purple: "#8b5cf6", pink: "#ec2ca3",
  green: "#10b981", amber: "#f59e0b", red: "#ef4444", blue: "#0ea5e9",
};

export default function HubQuickLaunch({ hubKey, accentColour }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hubKey) return;
    base44.entities.HubContentItem
      .filter({ hub_key: hubKey, content_type: "quick_link", is_active: true }, "sort_order", 12)
      .then(data => setLinks(data || []))
      .catch(() => setLinks([]))
      .finally(() => setLoading(false));
  }, [hubKey]);

  if (loading || links.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <div
        className="p-3 overflow-x-auto"
        style={{
          borderRadius: "16px",
          background: isDark ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.85)",
          border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex gap-2 min-w-max">
          {links.map((link, i) => {
            const colour = COLOUR_MAP[link.colour_theme] || accentColour;
            return (
              <motion.a
                key={link.id}
                href={link.url || "#"}
                target={link.open_in_new_tab !== false ? "_blank" : "_self"}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold no-underline flex-shrink-0 transition-all duration-150"
                style={{
                  background: isDark ? `${colour}18` : `${colour}12`,
                  border: `1px solid ${colour}30`,
                  color: isDark ? "#ffffff" : "#0f172a",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = isDark ? `${colour}30` : `${colour}20`;
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = isDark ? `${colour}18` : `${colour}12`;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: `${colour}25`, border: `1px solid ${colour}40` }}
                >
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: colour }} />
                </div>
                {link.title}
                {link.badge_text && (
                  <span className="px-1.5 py-0.5 rounded-full text-white text-[9px] font-bold" style={{ background: colour }}>
                    {link.badge_text}
                  </span>
                )}
                <ExternalLink style={{ width: "9px", height: "9px", color: colour, opacity: 0.6 }} />
              </motion.a>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}