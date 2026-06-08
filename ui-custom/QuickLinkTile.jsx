import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";

export default function QuickLinkTile({ svgIcon, label, glowColor = "#ec2ca3", delay = 0, onClick }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.82, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.10, y: -5, transition: { duration: 0.18 } }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-2.5 rounded-2xl group relative"
      style={{ outline: "none" }}
    >
      {/* Glass tile */}
      <div
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden"
        style={{
          background: isDark
            ? "linear-gradient(145deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)"
            : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(245,244,255,0.80) 100%)",
          border: isDark
            ? "1px solid rgba(255,255,255,0.12)"
            : "1px solid rgba(0,0,0,0.07)",
          backdropFilter: "blur(16px)",
          boxShadow: isDark
            ? `0 6px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.15)`
            : `0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,1.0)`,
          transition: "box-shadow 0.25s ease, transform 0.25s ease",
        }}
      >
        {/* Hover glow overlay */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${glowColor}${isDark ? '40' : '25'} 0%, transparent 65%)`,
            boxShadow: `0 0 ${isDark ? '28' : '16'}px ${glowColor}${isDark ? '60' : '35'}`,
            transition: "opacity 0.25s ease",
          }}
        />

        {/* Top specular highlight */}
        <div
          className="absolute inset-x-2 top-0 h-px pointer-events-none"
          style={{
            background: isDark
              ? "linear-gradient(to right, transparent, rgba(255,255,255,0.45), transparent)"
              : "linear-gradient(to right, transparent, rgba(255,255,255,0.80), transparent)",
          }}
        />

        {/* Bottom subtle shadow */}
        <div
          className="absolute inset-x-0 bottom-0 h-4 pointer-events-none"
          style={{ background: `linear-gradient(to top, rgba(0,0,0,${isDark ? '0.15' : '0.05'}), transparent)` }}
        />

        {/* Icon */}
        <div className="relative z-10 w-8 h-8 flex items-center justify-center drop-shadow-sm">
          {svgIcon}
        </div>
      </div>

      <span
        className="text-[11px] font-semibold leading-tight text-center"
        style={{ color: isDark ? "rgba(200,210,230,0.85)" : "hsl(230 25% 25%)" }}
      >
        {label}
      </span>
    </motion.button>
  );
}