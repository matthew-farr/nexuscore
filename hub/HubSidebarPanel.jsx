import { useTheme } from "../ThemeProvider";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function HubSidebarPanel({ title, children, className, delay = 0 }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn("relative rounded-2xl p-4 overflow-hidden group", className)}
      style={{
        background: isDark
          ? `linear-gradient(145deg, rgba(15, 23, 42, 0.68) 0%, rgba(15, 23, 42, 0.50) 100%)`
          : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)",
        border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
        backdropFilter: "blur-xl",
        boxShadow: isDark
          ? "0 20px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset"
          : "0 8px 20px rgba(0,0,0,0.10), 0 0 0 1px rgba(255,255,255,0.60) inset",
        transition: "all 0.3s ease",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: isDark
            ? "linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)"
            : "linear-gradient(to right, transparent, rgba(255,255,255,0.90), transparent)",
        }}
      />
      {title && (
        <h3
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{ color: isDark ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.45)" }}
        >
          {title}
        </h3>
      )}
      {children}
    </motion.div>
  );
}