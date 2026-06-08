import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../ui-custom/GlassCard";
import SectionHeader from "../ui-custom/SectionHeader";
import EmptyState from "../ui-custom/EmptyState";
import { Skeleton } from "../ui/skeleton";
import { getRecentlyViewed } from "@/services/activityService";
import { useTheme } from "../ThemeProvider";
import { getIconComponent } from "@/lib/iconMap";

function ItemIcon({ icon }) {
  const IconComponent = getIconComponent(icon) || FileText;
  return <IconComponent className="w-4 h-4" />;
}

export default function RecentlyViewedWidget() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  const loadRecentlyViewed = async () => {
    try {
      setLoading(true);
      const data = await getRecentlyViewed(6);
      setItems(data);
    } catch (error) {
      console.error("Failed to load recently viewed:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <GlassCard>
        <SectionHeader title="Recently Viewed" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 rounded-lg" />
          ))}
        </div>
      </GlassCard>
    );
  }

  if (!items || items.length === 0) {
    return (
      <GlassCard>
        <SectionHeader title="Recently Viewed" />
        <EmptyState
          icon={Clock}
          title="Nothing viewed yet"
          description="Items you visit will appear here"
        />
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <SectionHeader title="Recently Viewed" />
      <motion.div
        className="space-y-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
          },
        }}
      >
        {items.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => navigate(item.route)}
            variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
            className="w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left group"
            style={{
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
            }}
            whileHover={{
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              x: 4,
            }}
          >
            {/* Icon */}
            <div
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: isDark ? "rgba(236,44,163,0.15)" : "rgba(236,44,163,0.10)",
                color: "hsl(320 85% 55%)",
              }}
            >
              <ItemIcon icon={item.icon} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className="font-medium text-sm truncate"
                style={{ color: isDark ? "#ffffff" : "#000000" }}
              >
                {item.title}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
              >
                {formatDistanceToNow(new Date(item.last_viewed_date), {
                  addSuffix: true,
                })}
              </p>
            </div>

            {/* Type badge */}
            <div
              className="flex-shrink-0 px-2 py-1 rounded text-xs font-medium"
              style={{
                background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
              }}
            >
              {item.entity_type}
            </div>
          </motion.button>
        ))}
      </motion.div>
    </GlassCard>
  );
}