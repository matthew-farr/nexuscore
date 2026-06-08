import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";

export default function HubStatsRow({ stats = [], accentColor = "#0ea5e9", delay = 0 }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay + i * 0.06 }}
            className="relative rounded-2xl p-4 overflow-hidden"
            style={{
              background: isDark
                ? "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)"
                : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)",
              border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
              backdropFilter: "blur(16px)",
              boxShadow: isDark
                ? "0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)"
                : "0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.90)",
            }}
          >
            {/* Accent glow */}
            <div
              className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20"
              style={{ background: accentColor }}
            />
            <div className="relative z-10">
              {Icon && (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                  style={{
                    background: `${accentColor}20`,
                    border: `1px solid ${accentColor}30`,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: accentColor }} />
                </div>
              )}
              <p
                className="text-2xl font-bold leading-none mb-1"
                style={{ color: isDark ? "#ffffff" : "hsl(230 25% 10%)" }}
              >
                {stat.value}
              </p>
              <p
                className="text-[11px] font-medium"
                style={{ color: isDark ? "rgba(180,195,220,0.55)" : "rgba(0,0,0,0.45)" }}
              >
                {stat.label}
              </p>
              {stat.change && (
                <p
                  className="text-[10px] mt-1 font-semibold"
                  style={{ color: stat.changePositive ? "#10b981" : "#ef4444" }}
                >
                  {stat.change}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}