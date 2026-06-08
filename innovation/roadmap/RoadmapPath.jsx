import { motion } from "framer-motion";
import { useTheme } from "../../ThemeProvider";

// Generates a smooth SVG path through milestone points
export function buildRoadPath(points, height) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cx1 = curr.x + (next.x - curr.x) * 0.45;
    const cy1 = curr.y;
    const cx2 = next.x - (next.x - curr.x) * 0.45;
    const cy2 = next.y;
    d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${next.x} ${next.y}`;
  }
  return d;
}

export default function RoadmapPath({ points, svgWidth, svgHeight }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const pathD = buildRoadPath(points, svgHeight);
  const pathId = "road-path-" + Math.random().toString(36).slice(2, 8);

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <defs>
        <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#10b981" stopOpacity="0.9" />
          <stop offset="40%"  stopColor="#8b5cf6" stopOpacity="0.9" />
          <stop offset="70%"  stopColor="#06b6d4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#475569" stopOpacity="0.5" />
        </linearGradient>
        <filter id="roadGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Road shadow / track */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
        strokeWidth={14}
        strokeLinecap="round"
      />

      {/* Road surface */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"}
        strokeWidth={10}
        strokeLinecap="round"
      />

      {/* Animated glowing road line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="url(#roadGrad)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="6 4"
        filter="url(#roadGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.2, ease: "easeInOut", delay: 0.3 }}
      />

      {/* Solid centre line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="url(#roadGrad)"
        strokeWidth={1.5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.0, ease: "easeInOut", delay: 0.4 }}
      />
    </svg>
  );
}