import { motion } from "framer-motion";
import GlassCard from "../ui-custom/GlassCard";
import EmptyState from "../ui-custom/EmptyState";
import { Skeleton } from "../ui/skeleton";
import { Layers } from "lucide-react";
import { ICON_MAP } from "../../hooks/useHomepageData";
import { useTheme } from "../ThemeProvider";

export default function MyHubsSection({ hubs, loading }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (loading) {
    return (
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">My Hubs</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </GlassCard>
    );
  }

  if (!hubs || hubs.length === 0) {
    return (
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">My Hubs</h3>
        </div>
        <EmptyState
          icon={Layers}
          title="No hubs available"
          description="Admin will add hubs here"
        />
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">My Hubs</h3>
        <a href="#" className="text-xs text-primary hover:underline">View all hubs →</a>
      </div>
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
            },
          },
        }}
      >
        {hubs.slice(0, 6).map((hub) => {
          const Icon = ICON_MAP[hub.icon];
          return (
            <motion.button
              key={hub.id}
              onClick={() => window.location.href = hub.route}
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all"
              style={{
                background: isDark
                  ? "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)"
                  : "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(248,246,255,0.75) 100%)",
                border: isDark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(0,0,0,0.07)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 16px ${hub.accent_colour || "#ec2ca3"}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  background: `${hub.accent_colour || "#ec2ca3"}30`,
                  border: `1px solid ${hub.accent_colour || "#ec2ca3"}50`,
                }}
              >
                {Icon && <Icon className="w-6 h-6" style={{ color: hub.accent_colour || "#ec2ca3" }} />}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 12%)" }}>
                  {hub.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: isDark ? "rgba(180,195,220,0.55)" : "rgba(0,0,0,0.45)" }}>
                  {hub.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </GlassCard>
  );
}