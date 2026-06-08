import { motion } from "framer-motion";
import { Lightbulb, Search, BarChart2 } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../ThemeProvider";
import { useAuth } from "../../lib/AuthContext";

const ACCENT = "#8b5cf6";
const ACCENT2 = "#6d28d9";

const TABS = [
  { key: "overview",          label: "Overview" },
  { key: "ideas-board",       label: "Ideas Board" },
  { key: "internal-roadmap",  label: "Internal Roadmap" },
  { key: "web-dev-roadmap",   label: "Web Development Roadmap" },
  { key: "admin",             label: "Admin" },
];

export default function InnovationHero({ activeTab, onTabChange, user: userProp }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user: authUser } = useAuth();
  const user = userProp || authUser;
  const [searchFocused, setSearchFocused] = useState(false);
  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div
      className="relative overflow-hidden mb-5"
      style={{
        borderRadius: "24px",
        border: isDark ? `1px solid ${ACCENT}30` : `1px solid rgba(0,0,0,0.08)`,
        boxShadow: isDark
          ? `0 0 40px ${ACCENT}18, 0 24px 64px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.08)`
          : `0 6px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)`,
      }}
    >
      {/* Background */}
      <div className="absolute inset-0" style={{
        background: isDark
          ? `linear-gradient(135deg, #0a0b1e 0%, #07081a 55%, #050616 100%)`
          : `linear-gradient(135deg, #fefeff 0%, #f5f3ff 55%, #ede9fe 100%)`,
      }} />

      {/* Glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full blur-3xl opacity-25" style={{ background: ACCENT }} />
        <div className="absolute -bottom-14 right-40 w-52 h-52 rounded-full blur-3xl opacity-15" style={{ background: ACCENT2 }} />
        <div className="absolute top-8 right-72 w-36 h-36 rounded-full blur-3xl opacity-10" style={{ background: "#ec4899" }} />
      </div>

      {/* Glass reflection */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.40) 0%, transparent 50%)",
        borderRadius: "24px",
      }} />

      {/* Text overlay */}
      <div className="absolute inset-0" style={{
        background: isDark
          ? "linear-gradient(90deg, rgba(5,6,22,0.99) 0%, rgba(7,8,26,0.95) 35%, rgba(10,11,30,0.65) 60%, transparent 100%)"
          : "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 38%, rgba(255,255,255,0.60) 62%, transparent 100%)",
      }} />

      {/* Main content */}
      <div className="relative px-7 pt-6 pb-0 flex flex-col" style={{ zIndex: 2 }}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-2">

          {/* LEFT */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                background: `linear-gradient(135deg, ${ACCENT}30, ${ACCENT2}18)`,
                border: `1px solid ${ACCENT}40`,
                boxShadow: `0 0 16px ${ACCENT}25`,
              }}>
                <Lightbulb className="w-5 h-5" style={{ color: ACCENT }} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: isDark ? "#ffffff" : "#000000" }}>
                Innovation Hub
              </span>
            </div>

            <motion.h1
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="font-extrabold mb-2"
              style={{ fontSize: "clamp(20px, 2.6vw, 28px)", fontWeight: 800, color: isDark ? "#ffffff" : "#000000", letterSpacing: "-0.5px" }}
            >
              Innovation Hub, {firstName}.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-sm mb-3"
               style={{ color: isDark ? "#ffffff" : "#000000", maxWidth: "480px" }}
            >
              Submit ideas, vote on improvements and track what we're building.
            </motion.p>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14 }}
              className="w-full md:w-[400px]"
            >
              <div
                className="relative flex items-center gap-2 px-3 rounded-xl transition-all duration-200"
                style={{
                  height: "42px",
                  background: isDark
                    ? searchFocused ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.88)"
                    : searchFocused ? "rgba(15,23,42,0.93)" : "rgba(15,23,42,0.82)",
                  border: isDark
                    ? `1px solid ${searchFocused ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.60)"}`
                    : `1px solid ${searchFocused ? `${ACCENT}50` : `${ACCENT}30`}`,
                  backdropFilter: "blur(24px)",
                }}
              >
                <Search className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: isDark ? "#ffffff" : "#ffffff" }} />
                <input
                  type="text"
                  placeholder="Search ideas, roadmaps and updates…"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="flex-1 bg-transparent focus:outline-none text-xs font-medium"
                  style={{ color: isDark ? "#ffffff" : "#000000", caretColor: ACCENT }}
                />
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Innovation Summary */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="md:w-[260px] flex-shrink-0"
            style={{
              borderRadius: "16px",
              background: isDark
                ? `linear-gradient(135deg, ${ACCENT}22 0%, ${ACCENT}10 100%)`
                : `linear-gradient(135deg, ${ACCENT}14 0%, ${ACCENT}06 100%)`,
              border: isDark ? `1.5px solid ${ACCENT}35` : `1px solid ${ACCENT}25`,
              boxShadow: isDark
                ? `0 16px 40px ${ACCENT}25, inset 0 1px 0 rgba(255,255,255,0.12)`
                : `0 12px 32px ${ACCENT}18, 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.60)`,
              padding: "20px",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4" style={{ color: ACCENT }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                Innovation Summary
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "—", label: "Ideas Submitted" },
                { value: "—", label: "In Progress" },
                { value: "—", label: "Completed" },
                { value: "—", label: "Votes Cast" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-xl font-bold" style={{ color: ACCENT }}>{s.value}</span>
                  <span className="text-[10px] mt-0.5" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22 }}
        className="relative flex items-center gap-0 px-6 overflow-x-auto"
        style={{ zIndex: 2 }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className="relative flex-shrink-0 px-4 py-3 text-xs font-semibold transition-all duration-200"
              style={{
                color: isDark ? "#ffffff" : "#000000",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="innovationTabIndicator"
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`, boxShadow: `0 0 8px ${ACCENT}80` }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />
      </motion.div>
    </div>
  );
}