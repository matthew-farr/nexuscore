import { useTheme } from "../ThemeProvider";
import { motion } from "framer-motion";

export default function ProfileSection({ title, icon: SectionIcon, children, delay = 0, accentColor = "#ec2ca3" }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)"
          : "linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(248,246,255,0.88) 100%)",
        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
        backdropFilter: "blur(20px)",
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.90)",
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: isDark
            ? "linear-gradient(to right, transparent, rgba(255,255,255,0.13), transparent)"
            : "linear-gradient(to right, transparent, rgba(255,255,255,0.90), transparent)"
        }} />

      <div className="flex items-center gap-2.5 mb-4">
        {SectionIcon && (
          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}30` }}>
            <SectionIcon className="w-3.5 h-3.5" style={{ color: accentColor }} />
          </div>
        )}
        <h2 className="text-sm font-semibold"
          style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 12%)" }}>
          {title}
        </h2>
      </div>

      {children}
    </motion.div>
  );
}