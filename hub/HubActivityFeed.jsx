import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";
import HubWidgetCard from "./HubWidgetCard";

export default function HubActivityFeed({ items = [], accentColor = "#0ea5e9", delay = 0 }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <HubWidgetCard title="Recent Activity" actionLabel="View all" action={() => {}} delay={delay} accentColor={accentColor}>
      <div className="space-y-1">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + i * 0.05 }}
              className="flex items-start gap-3 py-2.5 px-2 rounded-xl transition-all duration-200 cursor-pointer group"
              style={{
                background: "transparent",
              }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: `${accentColor}20`,
                  border: `1px solid ${accentColor}30`,
                }}
              >
                {Icon && <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium leading-snug truncate"
                  style={{ color: isDark ? "rgba(255,255,255,0.85)" : "hsl(230 25% 15%)" }}
                >
                  {item.title}
                </p>
                <p
                  className="text-[11px] mt-0.5"
                  style={{ color: isDark ? "rgba(180,195,220,0.50)" : "rgba(0,0,0,0.42)" }}
                >
                  {item.meta}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </HubWidgetCard>
  );
}