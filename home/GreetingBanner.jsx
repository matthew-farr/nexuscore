import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, HelpCircle, Search, Command } from "lucide-react";
import { useTheme } from "../ThemeProvider";

function LiquidRibbonSVG() {
  return (
    <svg
      viewBox="0 0 600 340"
      preserveAspectRatio="xMaxYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", overflow: "visible" }}
    >
      <defs>
        {/* Gradient definitions */}
        <linearGradient id="grad-pink-purple-blue" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ec2ca3" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="grad-blue-cyan-purple" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="grad-purple-pink" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#ec2ca3" />
        </linearGradient>
        <linearGradient id="grad-full" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ec2ca3" />
          <stop offset="33%" stopColor="#7c3aed" />
          <stop offset="66%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="grad-white-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="30%" stopColor="white" stopOpacity="0.55" />
          <stop offset="65%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="grad-specular" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="40%" stopColor="white" stopOpacity="0.80" />
          <stop offset="70%" stopColor="white" stopOpacity="0.50" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="grad-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.50)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.20)" />
        </linearGradient>

        {/* Blur filters */}
        <filter id="blur-22" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <filter id="blur-14" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="blur-5" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="blur-2" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* Layer 1 — Glow orbs */}
      <g filter="url(#blur-22)">
        <circle cx="430" cy="20" r="80" fill="rgba(236,44,163,0.65)">
          <animate attributeName="r" values="80;96;68;80" dur="11s" repeatCount="indefinite" />
          <animate attributeName="cx" values="430;440;418;430" dur="15s" repeatCount="indefinite" />
        </circle>
        <circle cx="580" cy="250" r="55" fill="rgba(14,165,233,0.55)">
          <animate attributeName="r" values="55;68;44;55" dur="13s" repeatCount="indefinite" />
        </circle>
        <circle cx="510" cy="140" r="40" fill="rgba(124,58,237,0.45)">
          <animate attributeName="r" values="40;52;32;40" dur="9s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Layer 2 — Dark shadow underlay */}
      <g filter="url(#blur-14)">
        <path
          d="M 580,300 C 500,240 430,160 370,100 C 320,52 360,10 420,-10"
          stroke="url(#grad-shadow)"
          strokeWidth="60"
          fill="none"
        />
      </g>

      {/* Layer 3 — Wide glow bloom */}
      <g filter="url(#blur-14)">
        <path
          d="M 600,320 C 510,250 440,165 375,95 C 318,38 365,0 430,-15"
          stroke="url(#grad-pink-purple-blue)"
          strokeWidth="48"
          fill="none"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 8,4; -4,8; 0,0"
            dur="13s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
          />
        </path>
        <path
          d="M 600,260 C 520,200 450,130 395,70 C 345,22 380,-10 445,-20"
          stroke="url(#grad-blue-cyan-purple)"
          strokeWidth="38"
          fill="none"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -6,6; 5,-3; 0,0"
            dur="10s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
          />
        </path>
      </g>

      {/* Layer 4 — Mid body ribbons */}
      <g filter="url(#blur-5)">
        <path
          d="M 600,320 C 510,250 440,165 375,95 C 318,38 365,0 430,-15"
          stroke="url(#grad-full)"
          strokeWidth="40"
          fill="none"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 7,3; -3,7; 0,0"
            dur="11s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
          />
        </path>
        <path
          d="M 600,260 C 520,200 450,130 395,70 C 345,22 380,-10 445,-20"
          stroke="url(#grad-purple-pink)"
          strokeWidth="28"
          fill="none"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -5,5; 4,-2; 0,0"
            dur="14s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
          />
        </path>
      </g>

      {/* Layer 5 — Sharp ribbon body */}
      <g filter="url(#blur-2)">
        <path
          d="M 590,290 C 508,226 440,148 378,85 C 326,34 364,2 428,-12"
          stroke="url(#grad-full)"
          strokeWidth="18"
          fill="none"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 5,2; -2,5; 0,0"
            dur="9s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
          />
        </path>
      </g>

      {/* Layer 6 — Wide white shimmer */}
      <g filter="url(#blur-2)">
        <path
          d="M 575,285 C 496,222 430,146 370,84 C 320,34 355,4 415,-10"
          stroke="url(#grad-white-shimmer)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        >
          <animate attributeName="opacity" values="0.4;0.9;0.6;0.4" dur="16s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Layer 7 — Specular streak */}
      <path
        d="M 565,280 C 488,218 422,144 364,82 C 314,34 348,6 408,-9"
        stroke="url(#grad-specular)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      >
        <animate attributeName="opacity" values="0.3;1;0.6;0.3" dur="6s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

export default function GreetingBanner() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div
      className="relative overflow-hidden mb-6"
      style={{
        borderRadius: "28px",
        minHeight: "160px",
        boxShadow: isDark
          ? "0 20px 60px rgba(124,58,237,0.18), 0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 8px 40px rgba(124,58,237,0.10), 0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {/* Hero card background */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #0d0418 0%, #060c20 55%, #060e1c 100%)"
            : "linear-gradient(135deg, #fefeff 0%, #f8f6ff 55%, #edf5ff 100%)",
        }}
      />

      {/* Liquid ribbon SVG — right side */}
      <div
        className="absolute"
        style={{
          top: "-15%",
          right: "-3%",
          bottom: "-15%",
          width: "65%",
          zIndex: 0,
        }}
      >
        <LiquidRibbonSVG />
      </div>

      {/* Text-safe gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "linear-gradient(90deg, rgba(5,8,22,1.0) 0%, rgba(5,8,22,0.95) 30%, rgba(5,8,22,0.70) 48%, rgba(5,8,22,0.15) 68%, transparent 100%)"
            : "linear-gradient(90deg, rgba(255,255,255,1.0) 0%, rgba(255,255,255,0.96) 32%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0.20) 70%, transparent 100%)",
          zIndex: 1,
        }}
      />

      {/* Content — two column on md+, stacked on mobile */}
      <div
        className="relative px-8 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        style={{ zIndex: 2 }}
      >
        {/* LEFT: Greeting + buttons */}
        <div className="flex-shrink-0">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-extrabold mb-2"
            style={{ fontSize: "clamp(26px, 3.2vw, 34px)", fontWeight: 800, color: isDark ? "#ffffff" : "#000000", letterSpacing: "-0.5px" }}
          >
            {greeting}, Matthew 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-5"
            style={{ fontSize: "15px", color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.60)" }}
          >
            Welcome back to Checks Direct Intranet
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <motion.button
              whileHover={{ translateY: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 text-white font-semibold"
              style={{
                height: "44px", padding: "0 22px", borderRadius: "14px",
                background: "linear-gradient(135deg, #ec2ca3, #7c3aed)",
                boxShadow: "0 12px 30px rgba(236,44,163,0.35)",
                fontSize: "14px", border: "none", cursor: "pointer",
              }}
            >
              <Sparkles className="w-4 h-4" />
              Ask AI
            </motion.button>
            <motion.button
              onClick={() => navigate("/news")}
              whileHover={{ translateY: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 font-medium"
              style={{
                height: "44px", padding: "0 22px", borderRadius: "14px",
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.65)",
                border: isDark ? "1px solid rgba(255,255,255,0.14)" : "1px solid #e2e8f0",
                color: isDark ? "#ffffff" : "#000000",
                fontSize: "14px", cursor: "pointer",
              }}
            >
              <HelpCircle className="w-4 h-4" />
              What's new?
            </motion.button>
          </motion.div>
        </div>

        {/* RIGHT: Command search bar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="w-full md:w-[360px] lg:w-[420px] flex-shrink-0"
        >
          <div
            className="relative"
            style={{
              filter: searchFocused
                ? isDark
                  ? "drop-shadow(0 0 32px rgba(250,250,255,0.35)) drop-shadow(0 8px 32px rgba(0,0,0,0.15))"
                  : "drop-shadow(0 0 40px rgba(236,44,163,0.50)) drop-shadow(0 0 80px rgba(124,58,237,0.25)) drop-shadow(0 12px 40px rgba(0,0,0,0.35))"
                : isDark
                  ? "drop-shadow(0 8px 28px rgba(200,200,255,0.20))"
                  : "drop-shadow(0 8px 32px rgba(0,0,0,0.30))",
              transition: "filter 0.3s ease",
            }}
          >
            {/* Focus ring — DARK MODE: white glow, LIGHT MODE: pink/purple neon */}
            {searchFocused && (
              <div
                className="absolute -inset-px rounded-2xl pointer-events-none"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, rgba(255,255,255,0.45), rgba(230,240,255,0.25))"
                    : "linear-gradient(135deg, rgba(236,44,163,0.60), rgba(124,58,237,0.50))",
                  borderRadius: "18px",
                }}
              />
            )}

            <div
              className="relative flex items-center gap-3 px-4 rounded-2xl transition-all duration-250"
              style={{
                height: "52px",
                // DARK MODE: white frosted glass, LIGHT MODE: dark navy/black glass
                background: isDark
                  ? searchFocused
                    ? "rgba(255,255,255,0.98)"
                    : "rgba(255,255,255,0.92)"
                  : searchFocused
                    ? "rgba(15,23,42,0.95)"
                    : "rgba(15,23,42,0.88)",
                border: isDark
                  ? searchFocused
                    ? "1px solid rgba(255,255,255,0.85)"
                    : "1px solid rgba(255,255,255,0.70)"
                  : searchFocused
                    ? "1px solid rgba(236,44,163,0.40)"
                    : "1px solid rgba(124,58,237,0.20)",
                backdropFilter: "blur(32px)",
                boxShadow: isDark
                  ? "inset 0 1px 2px rgba(255,255,255,0.95), inset 0 -1px 0 rgba(0,0,0,0.05), 0 4px 16px rgba(200,200,255,0.15)"
                  : "inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.20), 0 0 24px rgba(236,44,163,0.20), 0 8px 24px rgba(0,0,0,0.25)",
              }}
            >
              {/* Search icon — DARK MODE: dark, LIGHT MODE: white */}
              <Search
                className="w-4 h-4 flex-shrink-0 transition-colors duration-250"
                style={{ 
                  color: isDark 
                    ? (searchFocused ? "#1a1a2e" : "#4a4a6a") 
                    : (searchFocused ? "#ffffff" : "rgba(255,255,255,0.70)")
                }}
              />

              {/* Input — DARK MODE: dark text, LIGHT MODE: white text */}
              <input
                type="text"
                placeholder="Search anything across Checks Direct…"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="flex-1 bg-transparent focus:outline-none min-w-0 font-medium"
                style={{
                  fontSize: "13.5px",
                  color: isDark ? "#0f0f2e" : "#ffffff",
                  caretColor: isDark ? "#7c3aed" : "#ec2ca3",
                  WebkitTextFillColor: isDark ? "#0f0f2e" : "#ffffff",
                }}
              />

              {/* Placeholder styling */}
              <style>{`
                input::placeholder {
                  color: ${isDark ? "rgba(15,15,46,0.50)" : "rgba(255,255,255,0.55)"};
                }
              `}</style>

              {/* Sparkle — DARK MODE: dark, LIGHT MODE: pink/cyan */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex-shrink-0"
              >
                <Sparkles
                  className="w-3.5 h-3.5"
                  style={{ 
                    color: isDark 
                      ? (searchFocused ? "#7c3aed" : "rgba(15,15,46,0.40)") 
                      : (searchFocused ? "#ec2ca3" : "rgba(255,255,255,0.50)")
                  }}
                />
              </motion.div>

              {/* ⌘K badge — DARK MODE: dark, LIGHT MODE: white */}
              <div
                className="flex items-center gap-0.5 px-2 py-1 rounded-lg flex-shrink-0"
                style={{
                  background: isDark 
                    ? "rgba(0,0,0,0.06)" 
                    : "rgba(255,255,255,0.12)",
                  border: isDark 
                    ? "1px solid rgba(0,0,0,0.12)" 
                    : "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <Command
                  className="w-2.5 h-2.5"
                  style={{ 
                    color: isDark 
                      ? "rgba(0,0,0,0.50)" 
                      : "rgba(255,255,255,0.65)"
                  }}
                />
                <span
                  className="text-[10px] font-semibold"
                  style={{ 
                    color: isDark 
                      ? "rgba(0,0,0,0.50)" 
                      : "rgba(255,255,255,0.65)"
                  }}
                >
                  K
                </span>
              </div>

              {/* Top shimmer — DARK MODE: white, LIGHT MODE: subtle */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl"
                style={{
                  background: isDark
                    ? "linear-gradient(to right, transparent, rgba(255,255,255,0.95), transparent)"
                    : "linear-gradient(to right, transparent, rgba(255,255,255,0.25), transparent)",
                }}
              />
            </div>
          </div>

          {/* Hint label */}
          <p
            className="text-[11px] mt-2 text-center"
            style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.60)" }}
          >
            Press <kbd className="px-1 py-0.5 rounded text-[10px]" style={{ background: isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.15)", color: isDark ? "rgba(0,0,0,0.50)" : "rgba(255,255,255,0.70)" }}>⌘K</kbd> to open global search
          </p>
        </motion.div>
      </div>
    </div>
  );
}