import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";
import { ArrowUpRight } from "lucide-react";
import HubWidgetCard from "./HubWidgetCard";

export default function HubResourceList({ title = "Resources", items = [], accentColor = "#0ea5e9", delay = 0 }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <HubWidgetCard title={title} actionLabel="View all" action={() => {}} delay={delay} accentColor={accentColor}>
      <div className="space-y-1">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + i * 0.04 }}
              className="flex items-center gap-3 py-2 px-2 rounded-xl cursor-pointer group transition-all duration-150"
              style={{ background: "transparent" }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {Icon && (
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}28` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: isDark ? "rgba(255,255,255,0.85)" : "hsl(230 25% 15%)" }}
                >
                  {item.title}
                </p>
                {item.meta && (
                  <p
                    className="text-[10px]"
                    style={{ color: isDark ? "rgba(180,195,220,0.45)" : "rgba(0,0,0,0.40)" }}
                  >
                    {item.meta}
                  </p>
                )}
              </div>
              <ArrowUpRight
                className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: accentColor }}
              />
            </motion.div>
          );
        })}
      </div>
    </HubWidgetCard>
  );
}