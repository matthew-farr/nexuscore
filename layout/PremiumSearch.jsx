import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Command } from "lucide-react";
import { useTheme } from "../ThemeProvider";

export default function PremiumSearch() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex-1 max-w-2xl relative">
      <div
        className="relative group"
        style={{
          filter: focused
            ? isDark
              ? "drop-shadow(0 0 18px rgba(236,44,163,0.22)) drop-shadow(0 0 40px rgba(124,58,237,0.12))"
              : "drop-shadow(0 8px 24px rgba(0,0,0,0.18))"
            : isDark
              ? "drop-shadow(0 2px 8px rgba(0,0,0,0.08))"
              : "drop-shadow(0 4px 12px rgba(0,0,0,0.12))",
          transition: "filter 0.35s ease",
        }}
      >
        {/* Outer glow ring (focus) */}
        <AnimatePresence>
          {focused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="absolute -inset-px rounded-2xl pointer-events-none"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(236,44,163,0.35), rgba(124,58,237,0.25), rgba(14,165,233,0.20))"
                  : "linear-gradient(135deg, rgba(0,0,0,0.15), rgba(100,50,180,0.10), rgba(0,100,200,0.08))",
                padding: "1px",
                borderRadius: "16px",
              }}
            />
          )}
        </AnimatePresence>

        {/* Glass panel */}
        <div
          className="relative flex items-center gap-3 px-4 py-0 rounded-2xl transition-all duration-300"
          style={{
            height: "46px",
            background: isDark
              ? focused
                ? "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)"
                : "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)"
              : focused
                ? "linear-gradient(135deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.04) 100%)"
                : "linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)",
            border: isDark
              ? focused
                ? "1px solid rgba(236,44,163,0.30)"
                : "1px solid rgba(255,255,255,0.09)"
              : focused
                ? "1px solid rgba(0,0,0,0.25)"
                : "1px solid rgba(0,0,0,0.10)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Search icon */}
          <Search
            className="w-4 h-4 flex-shrink-0 transition-colors duration-300"
            style={{
              color: focused
                ? isDark
                  ? "#ec2ca3"
                  : "#000000"
                : isDark
                  ? "rgba(148,163,184,0.7)"
                  : "rgba(0,0,0,0.5)",
            }}
          />

          {/* Input */}
          <input
            type="text"
            placeholder="Search anything across Checks Direct…"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"
            style={{
              fontSize: "13.5px",
              color: isDark ? "#ffffff" : "#000000",
              caretColor: isDark ? "#ec2ca3" : "#000000",
            }}
            placeholder="Search anything across Checks Direct…"
          />

          {/* AI sparkle */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-1 flex-shrink-0"
          >
            <Sparkles
              className="w-3 h-3"
              style={{
                color: focused
                  ? isDark
                    ? "#ec2ca3"
                    : "#000000"
                  : isDark
                    ? "rgba(148,163,184,0.45)"
                    : "rgba(0,0,0,0.35)",
              }}
            />
          </motion.div>

          {/* Keyboard shortcut */}
          <div
            className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg flex-shrink-0 transition-all duration-300"
            style={{
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.12)",
            }}
          >
            <Command
              className="w-2.5 h-2.5"
              style={{ color: isDark ? "rgba(148,163,184,0.4)" : "rgba(0,0,0,0.35)" }}
            />
            <span
              className="text-[10px] font-semibold"
              style={{ color: isDark ? "rgba(148,163,184,0.4)" : "rgba(0,0,0,0.35)" }}
            >
              K
            </span>
          </div>

          {/* Inner top shimmer */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl"
            style={{
              background: isDark
                ? "linear-gradient(to right, transparent, rgba(255,255,255,0.20), transparent)"
                : "linear-gradient(to right, transparent, rgba(0,0,0,0.15), transparent)",
            }}
          />
        </div>
      </div>
    </div>
  );
}