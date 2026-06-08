import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";
import { cn } from "@/lib/utils";

export default function HubWidgetCard({ title, action, actionLabel, children, className, delay = 0, accentColor }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn("relative rounded-2xl p-4 overflow-hidden", className)}
      style={{
        background: isDark
          ? "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)"
          : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)",
        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
        backdropFilter: "blur(20px)",
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 2px 12px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.90)",
      }}
    >
      {/* Top shimmer */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: isDark
            ? "linear-gradient(to right, transparent, rgba(255,255,255,0.14), transparent)"
            : "linear-gradient(to right, transparent, rgba(255,255,255,0.90), transparent)",
        }}
      />

      {/* Accent corner glow */}
      {accentColor && isDark && (
        <div
          className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-10"
          style={{ background: accentColor }}
        />
      )}

      {/* Header */}
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-sm font-semibold"
            style={{ color: isDark ? "rgba(255,255,255,0.88)" : "hsl(230 25% 15%)" }}
          >
            {title}
          </h3>
          {action && actionLabel && (
            <button
              onClick={action}
              className="text-xs font-medium transition-colors"
              style={{ color: isDark ? "rgba(180,195,220,0.65)" : "rgba(0,0,0,0.45)" }}
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}

      {children}
    </motion.div>
  );
}