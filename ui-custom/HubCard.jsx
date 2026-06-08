import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";

export default function HubCard({ icon: Icon, label, subtitle, accentColor = "#ec2ca3", delay = 0, onClick }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.88, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, scale: 1.03, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative flex flex-col items-start gap-3 p-4 rounded-2xl w-full group text-left overflow-hidden transition-all duration-300"
      style={{
        background: isDark
          ? "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)"
          : "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(248,246,255,0.75) 100%)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.09)"
          : "1px solid rgba(0,0,0,0.07)",
        backdropFilter: "blur(16px)",
        boxShadow: isDark
          ? `0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 0 transparent`
          : "0 2px 8px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
      }}
    >
      {/* Top edge shimmer */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background: isDark
            ? "linear-gradient(to right, transparent, rgba(255,255,255,0.18), transparent)"
            : "linear-gradient(to right, transparent, rgba(255,255,255,0.90), transparent)",
        }}
      />

      {/* Hover glow blob */}
      <div
        className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-0 transition-opacity duration-500"
        style={{
          background: accentColor,
          // Different intensity per mode handled via group-hover
        }}
      />
      <style>{`
        .hub-card-${accentColor.replace('#','')}:hover .hub-glow { opacity: ${isDark ? '0.55' : '0.20'}; }
      `}</style>

      {/* Hover border glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: `inset 0 0 0 1px ${accentColor}${isDark ? '55' : '35'}` }}
      />

      {/* Dark mode: ambient neon tint */}
      {isDark && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-40"
          style={{
            background: `radial-gradient(ellipse at 80% 20%, ${accentColor}12 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
        style={{
          background: `linear-gradient(135deg, ${accentColor}${isDark ? '30' : '20'} 0%, ${accentColor}${isDark ? '12' : '08'} 100%)`,
          border: `1px solid ${accentColor}${isDark ? '40' : '25'}`,
          boxShadow: `0 0 ${isDark ? '16' : '8'}px ${accentColor}${isDark ? '30' : '15'}`,
        }}
      >
        {Icon && <Icon className="w-5 h-5" style={{ color: accentColor }} />}
      </div>

      <div className="relative z-10">
        <p
          className="text-[13px] font-semibold leading-tight"
          style={{ color: isDark ? "rgba(255,255,255,0.92)" : "hsl(230 25% 15%)" }}
        >
          {label}
        </p>
        {subtitle && (
          <p
            className="text-[11px] mt-0.5 leading-tight"
            style={{ color: isDark ? "rgba(180,195,220,0.75)" : "rgba(0,0,0,0.50)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </motion.button>
  );
}