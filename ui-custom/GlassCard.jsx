import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "../ThemeProvider";

export default function GlassCard({ children, className, delay = 0, hover = true, ...props }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { y: -3, transition: { duration: 0.22 } } : undefined}
      className={cn(
        "relative rounded-2xl p-5 transition-all duration-300 overflow-hidden backdrop-blur-xl",
        hover && "hover:border-pink-500/40 hover:shadow-[0_0_30px_rgba(236,44,163,0.20)]",
        className
      )}
      style={{
        background: isDark
          ? `linear-gradient(145deg, rgba(15, 23, 42, 0.68) 0%, rgba(15, 23, 42, 0.50) 100%)`
          : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.12)"
          : "1px solid rgba(0,0,0,0.08)",
        boxShadow: isDark
          ? "0 20px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset"
          : "0 8px 20px rgba(0,0,0,0.10), 0 0 0 1px rgba(255,255,255,0.60) inset",
      }}
      {...props}
    >
      {/* Top edge shimmer */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
        style={{
          background: isDark
            ? "linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)"
            : "linear-gradient(to right, transparent, rgba(255,255,255,0.90), transparent)",
        }}
      />

      {/* Dark mode: ambient corner neon glow */}
      {isDark && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background:
              "radial-gradient(ellipse at 0% 0%, rgba(236,44,163,0.06) 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(14,165,233,0.05) 0%, transparent 55%)",
          }}
        />
      )}

      {/* Light mode: subtle corner tints */}
      {!isDark && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background:
              "radial-gradient(ellipse at 0% 0%, rgba(236,44,163,0.025) 0%, transparent 60%), radial-gradient(ellipse at 100% 100%, rgba(14,165,233,0.025) 0%, transparent 60%)",
          }}
        />
      )}

      {children}
    </motion.div>
  );
}