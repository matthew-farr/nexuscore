import { motion } from "framer-motion";
import { Sparkles, Search } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../ThemeProvider";

export default function HubHero({ icon: Icon, title, description, accentColor = "#0ea5e9", accentColor2, stats = [] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [searchFocused, setSearchFocused] = useState(false);
  const secondary = accentColor2 || accentColor;

  return (
    <div
      className="relative overflow-hidden mb-5"
      style={{
        borderRadius: "24px",
        minHeight: "148px",
        boxShadow: isDark
          ? `0 16px 48px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.06)`
          : `0 6px 32px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.04)`,
      }}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? `linear-gradient(135deg, #070c1e 0%, #060a18 55%, #050e1c 100%)`
            : `linear-gradient(135deg, #fefeff 0%, #f7f5ff 55%, #eef6ff 100%)`,
        }}
      />

      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-8 -right-8 w-64 h-64 rounded-full blur-3xl opacity-30"
          style={{ background: accentColor }}
        />
        <div
          className="absolute -bottom-12 right-32 w-48 h-48 rounded-full blur-3xl opacity-20"
          style={{ background: secondary }}
        />
      </div>

      {/* Text-safe overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "linear-gradient(90deg, rgba(6,10,24,0.98) 0%, rgba(6,10,24,0.92) 35%, rgba(6,10,24,0.60) 55%, transparent 100%)"
            : "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.93) 35%, rgba(255,255,255,0.65) 58%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative px-7 py-6 flex flex-col md:flex-row md:items-center gap-5" style={{ zIndex: 2 }}>
        {/* LEFT */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {/* Hub icon badge */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${accentColor}30, ${secondary}18)`,
                border: `1px solid ${accentColor}40`,
                boxShadow: `0 0 16px ${accentColor}25`,
              }}
            >
              <Icon className="w-5 h-5" style={{ color: accentColor }} />
            </div>

            <motion.h1
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="font-extrabold"
              style={{
                fontSize: "clamp(20px, 2.4vw, 26px)",
                fontWeight: 800,
                color: isDark ? "#ffffff" : "#000000",
                letterSpacing: "-0.4px",
              }}
            >
              {title}
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-sm mb-4 max-w-md"
            style={{ color: isDark ? "rgba(255,255,255,0.60)" : "rgba(0,0,0,0.52)" }}
          >
            {description}
          </motion.p>

          {/* Stats row */}
          {stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14 }}
              className="flex items-center gap-4 flex-wrap"
            >
              {stats.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span
                    className="text-lg font-bold"
                    style={{ color: accentColor }}
                  >
                    {s.value}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}
                  >
                    {s.label}
                  </span>
                  {i < stats.length - 1 && (
                    <span style={{ color: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)" }}>·</span>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* RIGHT: Search + AI button */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="w-full md:w-[300px] flex-shrink-0 flex flex-col gap-2"
        >
          {/* Search */}
          <div
            className="relative flex items-center gap-2 px-3 rounded-xl transition-all duration-200"
            style={{
              height: "42px",
              background: isDark
                ? searchFocused ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.88)"
                : searchFocused ? "rgba(15,23,42,0.93)" : "rgba(15,23,42,0.82)",
              border: isDark
                ? `1px solid ${searchFocused ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.60)"}`
                : `1px solid ${searchFocused ? `${accentColor}50` : "rgba(124,58,237,0.18)"}`,
              backdropFilter: "blur(24px)",
              boxShadow: isDark
                ? "inset 0 1px 0 rgba(255,255,255,0.90)"
                : "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 16px rgba(0,0,0,0.18)",
            }}
          >
            <Search
              className="w-3.5 h-3.5 flex-shrink-0"
              style={{ color: isDark ? (searchFocused ? "#1a1a2e" : "#6a6a9a") : "rgba(255,255,255,0.65)" }}
            />
            <input
              type="text"
              placeholder={`Search ${title}…`}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="flex-1 bg-transparent focus:outline-none text-xs font-medium"
              style={{
                color: isDark ? "#0f0f2e" : "#ffffff",
                caretColor: accentColor,
              }}
            />
            <style>{`input::placeholder { color: ${isDark ? "rgba(15,15,46,0.45)" : "rgba(255,255,255,0.50)"}; }`}</style>
          </div>

          {/* AI action */}
          <button
            className="flex items-center justify-center gap-2 font-semibold text-white text-xs"
            style={{
              height: "36px",
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${accentColor}, ${secondary})`,
              boxShadow: `0 8px 24px ${accentColor}35`,
              border: "none",
              cursor: "pointer",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask AI about this hub
          </button>
        </motion.div>
      </div>
    </div>
  );
}