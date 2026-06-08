import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, FlaskConical, Rocket, Clock, Zap } from "lucide-react";
import { useTheme } from "../../ThemeProvider";
import { useEffect, useState } from "react";

const STATUS_CONFIG = {
  Completed:   { color: "#10b981", glow: "#10b981", icon: CheckCircle,    label: "Completed" },
  "In Progress":{ color: "#8b5cf6", glow: "#8b5cf6", icon: Zap,           label: "In Progress", pulse: true },
  Testing:     { color: "#06b6d4", glow: "#06b6d4", icon: FlaskConical,   label: "Testing" },
  Launched:    { color: "#22c55e", glow: "#22c55e", icon: Rocket,         label: "Launched" },
  Planned:     { color: "#475569", glow: "#64748b", icon: Clock,          label: "Planned" },
  Delayed:     { color: "#f59e0b", glow: "#f59e0b", icon: AlertTriangle,  label: "Delayed" },
};

function AnimatedProgress({ pct, color, isDark }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 200);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${width}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 8px ${color}60`, transitionDuration: "1.2s", transitionTimingFunction: "ease-out" }}
      />
    </div>
  );
}

export default function RoadmapMilestoneCard({ item, index, isActive, onClick, cardSide }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Planned;
  const Icon = cfg.icon;
  const isCompleted = item.status === "Completed";
  const isPlanned = item.status === "Planned";
  const opacity = isPlanned ? 0.65 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: cardSide === "top" ? -20 : 20, scale: 0.95 }}
      animate={{ opacity: opacity, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={onClick}
      className="cursor-pointer group"
      style={{ width: "160px" }}
    >
      <div
        className="relative rounded-2xl p-4 transition-all duration-300 group-hover:scale-[1.03]"
        style={{
          background: isDark
            ? `linear-gradient(145deg, rgba(15,23,42,0.80) 0%, rgba(15,23,42,0.60) 100%)`
            : `linear-gradient(145deg, rgba(255,255,255,0.97) 0%, rgba(248,246,255,0.90) 100%)`,
          border: isActive
            ? `1.5px solid ${cfg.color}70`
            : isDark ? `1px solid rgba(255,255,255,0.10)` : `1px solid rgba(0,0,0,0.07)`,
          boxShadow: isActive
            ? `0 0 20px ${cfg.glow}35, 0 8px 24px rgba(0,0,0,0.25)`
            : isDark ? `0 4px 16px rgba(0,0,0,0.30)` : `0 4px 16px rgba(0,0,0,0.08)`,
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Glow top line */}
        {isActive && (
          <div className="absolute inset-x-0 top-0 h-px rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}70, transparent)` }} />
        )}

        {/* Status icon */}
        <div className="flex items-center justify-between mb-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: `${cfg.color}18`,
              border: `1px solid ${cfg.color}35`,
              boxShadow: cfg.pulse ? `0 0 12px ${cfg.color}40` : "none",
            }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
            style={{ background: `${cfg.color}18`, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>

        {/* Title */}
        <p className="text-xs font-bold leading-snug mb-1.5" style={{ color: isDark ? "#ffffff" : "#000000" }}>
          {item.title}
        </p>

        {/* Owner */}
        {item.owner && (
          <p className="text-[10px] mb-2 truncate" style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.45)" }}>
            {item.owner}
          </p>
        )}

        {/* Progress */}
        <AnimatedProgress pct={item.progress_percentage || 0} color={cfg.color} isDark={isDark} />
        <p className="text-[9px] mt-1 text-right font-semibold" style={{ color: cfg.color }}>
          {item.progress_percentage || 0}%
        </p>
      </div>
    </motion.div>
  );
}