import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Activity } from "lucide-react";
import GlassCard from "../ui-custom/GlassCard";
import SectionHeader from "../ui-custom/SectionHeader";
import EmptyState from "../ui-custom/EmptyState";
import { Skeleton } from "../ui/skeleton";
import { getVisibleActivities } from "@/services/activityService";
import { useTheme } from "../ThemeProvider";
import { getIconComponent } from "@/lib/iconMap";

const ACTIVITY_COLORS = {
  viewed: "hsl(200 90% 50%)",
  created: "hsl(160 84% 45%)",
  updated: "hsl(260 60% 55%)",
  deleted: "hsl(0 84% 60%)",
  completed: "hsl(142 72% 29%)",
  assigned: "hsl(30 80% 55%)",
  published: "hsl(320 85% 55%)",
  uploaded: "hsl(200 90% 50%)",
  announcement: "hsl(320 85% 55%)",
  training_completed: "hsl(142 72% 29%)",
  login: "hsl(195 90% 50%)",
  onboarding_step_completed: "hsl(160 84% 45%)",
};

function ActivityIcon({ icon, activity_type }) {
  const IconComponent = getIconComponent(icon) || Activity;
  return <IconComponent className="w-4 h-4" />;
}

export default function ActivityFeedWidget() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await getVisibleActivities(12);
      setActivities(data);
    } catch (error) {
      console.error("Failed to load activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <GlassCard>
        <SectionHeader title="Platform Activity" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </GlassCard>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <GlassCard>
        <SectionHeader title="Platform Activity" />
        <EmptyState
          icon={AlertCircle}
          title="No recent activity"
          description="Platform activities will appear here"
        />
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <SectionHeader title="Platform Activity" />
      <motion.div
        className="space-y-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.04 },
          },
        }}
      >
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
            className="group p-3 rounded-lg transition-all cursor-pointer"
            style={{
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
            }}
            whileHover={{
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                style={{
                  background: `${ACTIVITY_COLORS[activity.activity_type]}15`,
                  color: ACTIVITY_COLORS[activity.activity_type],
                }}
              >
                <ActivityIcon icon={activity.icon} activity_type={activity.activity_type} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium text-sm leading-tight truncate"
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                >
                  {activity.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs"
                    style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}
                  >
                    {activity.performed_by_name}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}
                  >
                    •
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
                  >
                    {formatDistanceToNow(new Date(activity.created_date), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </GlassCard>
  );
}