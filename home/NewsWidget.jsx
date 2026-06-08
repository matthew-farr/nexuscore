import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useTheme } from "../ThemeProvider";
import GlassCard from "../ui-custom/GlassCard";
import SectionHeader from "../ui-custom/SectionHeader";
import { getPublishedAnnouncements } from "../../services/announcementService";
import { getCategoryConfig } from "../../lib/announcementConfig";

export default function NewsWidget({ userProfile, onSelectAnnouncement, onViewAll }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncements = async () => {
      if (!userProfile) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const published = await getPublishedAnnouncements(userProfile);
      // Sort: pinned first, then by publish date
      const sorted = published.sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        return new Date(b.publish_datetime || b.created_date) - new Date(a.publish_datetime || a.created_date);
      });
      setAnnouncements(sorted.slice(0, 3));
      setLoading(false);
    };
    loadAnnouncements();
  }, [userProfile]);

  return (
    <GlassCard delay={0.25} hover={false} className="p-4">
      <SectionHeader title="News & Updates" action={onViewAll} actionLabel="View all" />
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <p
            className="text-xs text-center py-4"
            style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}
          >
            No announcements yet
          </p>
        ) : (
          announcements.map((item, i) => {
            const config = getCategoryConfig(item.category);
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                onClick={() => onSelectAnnouncement?.(item)}
                className="w-full flex items-start gap-3 group cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${config.colour}20`, border: `1px solid ${config.colour}30` }}
                >
                  <config.icon className="w-5 h-5" style={{ color: config.colour }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className="text-xs font-semibold group-hover:opacity-80 transition-opacity truncate"
                      style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
                    >
                      {item.title}
                      {item.is_pinned && " 📌"}
                    </p>
                    <span
                      className="text-[10px] flex-shrink-0"
                      style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}
                    >
                      {formatDistanceToNow(parseISO(item.publish_datetime || item.created_date), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p
                    className="text-[11px] truncate mt-0.5"
                    style={{ color: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.50)" }}
                  >
                    {item.excerpt}
                  </p>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}