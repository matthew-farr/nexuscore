import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";
import { Megaphone, ChevronRight } from "lucide-react";

export default function HubAnnouncementCard({ announcements = [], accentColor = "#0ea5e9", delay = 0 }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="relative rounded-2xl p-4 overflow-hidden"
      style={{
        background: isDark
          ? `linear-gradient(135deg, ${accentColor}15 0%, rgba(255,255,255,0.03) 100%)`
          : `linear-gradient(135deg, ${accentColor}08 0%, rgba(255,255,255,0.90) 100%)`,
        border: isDark ? `1px solid ${accentColor}25` : `1px solid ${accentColor}20`,
        backdropFilter: "blur(20px)",
        boxShadow: isDark
          ? `0 4px 20px rgba(0,0,0,0.25), 0 0 40px ${accentColor}08`
          : `0 2px 12px rgba(0,0,0,0.05)`,
      }}
    >
      {/* Corner glow */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: accentColor }}
      />

      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${accentColor}25`, border: `1px solid ${accentColor}35` }}
        >
          <Megaphone className="w-3.5 h-3.5" style={{ color: accentColor }} />
        </div>
        <h3
          className="text-sm font-semibold"
          style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 12%)" }}
        >
          Announcements
        </h3>
      </div>

      <div className="space-y-2">
        {announcements.map((a, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-2 p-2.5 rounded-xl cursor-pointer group transition-all duration-150"
            style={{
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.60)",
              border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <div>
              <p
                className="text-xs font-medium"
                style={{ color: isDark ? "rgba(255,255,255,0.85)" : "hsl(230 25% 15%)" }}
              >
                {a.title}
              </p>
              <p
                className="text-[10px] mt-0.5"
                style={{ color: isDark ? "rgba(180,195,220,0.50)" : "rgba(0,0,0,0.42)" }}
              >
                {a.date}
              </p>
            </div>
            <ChevronRight
              className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
              style={{ color: accentColor }}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}