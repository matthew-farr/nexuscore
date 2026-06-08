import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";

export default function HubQuickActions({ actions = [], accentColor = "#0ea5e9" }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="flex items-center gap-2 flex-wrap mb-5"
    >
      {actions.map((action, i) => {
        const Icon = action.icon;
        const isPrimary = i === 0;
        return (
          <motion.button
            key={action.label}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={action.onClick}
            className="flex items-center gap-2 font-semibold text-xs"
            style={{
              height: "36px",
              padding: "0 14px",
              borderRadius: "12px",
              background: isPrimary
                ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`
                : isDark
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(255,255,255,0.85)",
              border: isPrimary
                ? "none"
                : isDark
                  ? "1px solid rgba(255,255,255,0.10)"
                  : "1px solid rgba(0,0,0,0.08)",
              color: isPrimary
                ? "#ffffff"
                : isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 20%)",
              backdropFilter: "blur(12px)",
              boxShadow: isPrimary
                ? `0 6px 20px ${accentColor}30`
                : isDark
                  ? "0 2px 8px rgba(0,0,0,0.20)"
                  : "0 1px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.90)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {action.label}
          </motion.button>
        );
      })}
    </motion.div>
  );
}