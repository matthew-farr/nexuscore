import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Pin, AlertCircle, CheckCircle } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { getCategoryConfig } from "../../lib/announcementConfig";

export default function AnnouncementCard({ announcement, onClick, isPriority = false }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const config = getCategoryConfig(announcement.category);

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      onClick={onClick}
      className="w-full text-left transition-all duration-200 rounded-xl p-4"
      style={{
        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)",
        border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${config.colour}20`, border: `1px solid ${config.colour}30` }}
        >
          <config.icon className="w-5 h-5" style={{ color: config.colour }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-sm line-clamp-2"
                style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 12%)" }}
              >
                {announcement.title}
              </h3>
              <p
                className="text-xs mt-1 line-clamp-2"
                style={{ color: isDark ? "rgba(255,255,255,0.60)" : "rgba(0,0,0,0.60)" }}
              >
                {announcement.excerpt}
              </p>
            </div>
            {announcement.is_pinned && (
              <Pin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: config.colour }} />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${config.colour}20`, color: config.colour }}
            >
              {config.label}
            </span>

            {announcement.priority !== "low" && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background:
                    announcement.priority === "critical"
                      ? "rgba(239, 68, 68, 0.2)"
                      : announcement.priority === "high"
                      ? "rgba(245, 158, 11, 0.2)"
                      : "rgba(59, 130, 246, 0.2)",
                  color:
                    announcement.priority === "critical"
                      ? "#ef4444"
                      : announcement.priority === "high"
                      ? "#f59e0b"
                      : "#3b82f6",
                }}
              >
                {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
              </span>
            )}

            <span
              className="text-xs ml-auto"
              style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}
            >
              {announcement.publish_datetime
                ? format(parseISO(announcement.publish_datetime), "MMM d, yyyy")
                : format(new Date(announcement.created_date), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}