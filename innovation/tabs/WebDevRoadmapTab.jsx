import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Map, CheckCircle, Zap, FlaskConical, Clock, Rocket, AlertTriangle } from "lucide-react";
import { useTheme } from "../../ThemeProvider";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import RoadmapMilestoneCard from "../roadmap/RoadmapMilestoneCard";
import RoadmapPath from "../roadmap/RoadmapPath";
import RoadmapDetailDrawer from "../roadmap/RoadmapDetailDrawer";
import AddRoadmapItemModal from "../roadmap/AddRoadmapItemModal";

const ACCENT = "#8b5cf6";
const ROADMAP_TYPE = "Web Development";

const STATUS_CONFIG = {
  Completed:    { color: "#10b981", icon: CheckCircle },
  "In Progress":{ color: "#8b5cf6", icon: Zap },
  Testing:      { color: "#06b6d4", icon: FlaskConical },
  Launched:     { color: "#22c55e", icon: Rocket },
  Planned:      { color: "#475569", icon: Clock },
  Delayed:      { color: "#f59e0b", icon: AlertTriangle },
};

// Each milestone alternates above/below the road path
const WAVE_PATTERN = ["top", "bottom", "bottom", "top", "top", "bottom", "bottom", "top", "top", "bottom"];

export default function WebDevRoadmapTab() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 320 });

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const isAdmin = user?.role === "admin";

  const { data: items = [], refetch } = useQuery({
    queryKey: ["roadmapItems", ROADMAP_TYPE],
    queryFn: () => base44.entities.RoadmapItem.filter({ roadmap_type: ROADMAP_TYPE }, "roadmap_order", 100),
  });

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setDimensions({ width: w, height: Math.max(280, Math.min(360, w * 0.28)) });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const sorted = [...items].sort((a, b) => (a.roadmap_order || 0) - (b.roadmap_order || 0));

  // Compute milestone anchor points along a sinusoidal road path
  const milestonePoints = sorted.map((_, i) => {
    const n = sorted.length;
    const pad = 100;
    const x = n <= 1 ? dimensions.width / 2 : pad + (i / (n - 1)) * (dimensions.width - pad * 2);
    const midY = dimensions.height / 2;
    const amplitude = dimensions.height * 0.20;
    const y = midY + Math.sin((i / Math.max(n - 1, 1)) * Math.PI * 1.8) * amplitude;
    return { x, y };
  });

  const cardBg = isDark
    ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
    : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)";
  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)";
  const cardShadow = isDark ? "0 8px 24px rgba(0,0,0,0.30)" : "0 4px 16px rgba(0,0,0,0.08)";

  const kpis = [
    { label: "Total Items",  value: sorted.length },
    { label: "In Progress", value: sorted.filter(i => i.status === "In Progress").length, color: "#8b5cf6" },
    { label: "Completed",   value: sorted.filter(i => i.status === "Completed").length,   color: "#10b981" },
    { label: "Next Launch", value: sorted.find(i => i.status === "Testing" || (i.status === "In Progress" && i.target_date))?.title?.split(" ").slice(0,2).join(" ") || "—" },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}30`, boxShadow: `0 0 16px ${ACCENT}25` }}>
              <Map className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>Web Development Roadmap</h2>
              <p className="text-xs mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.48)" : "rgba(0,0,0,0.48)" }}>
                Website, portal and Checks Direct OS development journey.
              </p>
            </div>
          </div>
          {isAdmin && (
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #6d28d9)`, boxShadow: `0 4px 16px ${ACCENT}40` }}>
              <Plus className="w-3.5 h-3.5" /> Add Stop
            </button>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          {kpis.map((k, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.40)" }}>{k.label}</p>
              <p className="text-lg font-extrabold leading-tight" style={{ color: k.color || (isDark ? "#ffffff" : "#000000") }}>{k.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Road Map Canvas */}
      <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)" }}>
            Development Journey — click any stop for details
          </p>
        </div>

        {/* Scrollable road */}
        <div className="overflow-x-auto pb-2">
          <div
            ref={containerRef}
            className="relative"
            style={{ minWidth: Math.max(900, sorted.length * 180), height: dimensions.height + 200 }}
          >
            {/* Ambient glow layer */}
            {isDark && (
              <div className="absolute inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse at 30% 50%, rgba(139,92,246,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(6,182,212,0.04) 0%, transparent 60%)"
              }} />
            )}

            {/* Animated road */}
            {milestonePoints.length >= 2 && (
              <RoadmapPath
                points={milestonePoints}
                svgWidth={Math.max(900, sorted.length * 180)}
                svgHeight={dimensions.height + 200}
              />
            )}

            {/* Milestone nodes + cards */}
            {sorted.map((item, i) => {
              const pt = milestonePoints[i];
              if (!pt) return null;
              const side = WAVE_PATTERN[i % WAVE_PATTERN.length];
              const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Planned;
              const isActive = item.status === "In Progress";

              return (
                <div key={item.id} className="absolute" style={{ left: pt.x, top: pt.y, transform: "translate(-50%, -50%)" }}>

                  {/* Card above/below */}
                  <div
                    className="absolute"
                    style={{
                      left: "50%",
                      transform: "translateX(-50%)",
                      ...(side === "top" ? { bottom: "calc(100% + 18px)" } : { top: "calc(100% + 18px)" }),
                      zIndex: 10,
                    }}
                  >
                    <RoadmapMilestoneCard
                      item={item}
                      index={i}
                      isActive={isActive}
                      onClick={() => setSelectedItem(item)}
                      cardSide={side}
                    />
                  </div>

                  {/* Connector line */}
                  <div
                    className="absolute left-1/2"
                    style={{
                      width: "1px",
                      height: "18px",
                      background: isDark ? `linear-gradient(to ${side === "top" ? "top" : "bottom"}, ${cfg.color}60, transparent)` : `linear-gradient(to ${side === "top" ? "top" : "bottom"}, ${cfg.color}80, transparent)`,
                      transform: "translateX(-50%)",
                      ...(side === "top" ? { bottom: "50%" } : { top: "50%" }),
                      zIndex: 1,
                    }}
                  />

                  {/* Milestone marker dot */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
                    className="relative"
                    style={{ zIndex: 5 }}
                  >
                    {/* Outer glow ring */}
                    {isActive && (
                      <motion.div
                        animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full"
                        style={{ background: cfg.color, margin: "-6px" }}
                      />
                    )}
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}bb)`,
                        border: `2px solid ${isDark ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.80)"}`,
                        boxShadow: `0 0 16px ${cfg.color}70, 0 2px 8px rgba(0,0,0,0.40)`,
                      }}
                    >
                      <cfg.icon className="w-2.5 h-2.5 text-white" />
                    </div>
                  </motion.div>

                  {/* Order label below/above marker */}
                  <div
                    className="absolute left-1/2"
                    style={{
                      transform: "translateX(-50%)",
                      ...(side === "top" ? { top: "calc(100% + 4px)" } : { bottom: "calc(100% + 4px)" }),
                    }}
                  >
                    <span className="text-[9px] font-bold" style={{ color: isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.30)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)" }}>
                  No roadmap items yet. {isAdmin ? "Add the first stop above." : "Check back soon."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 px-5 py-4" style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
              <span className="text-[10px] font-medium" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.50)" }}>{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedItem && (
        <RoadmapDetailDrawer
          item={selectedItem}
          user={user}
          onClose={() => setSelectedItem(null)}
          onSaved={() => { refetch(); setSelectedItem(null); }}
        />
      )}

      {/* Add Item Modal */}
      {showAdd && (
        <AddRoadmapItemModal
          roadmapType={ROADMAP_TYPE}
          nextOrder={sorted.length + 1}
          onClose={() => setShowAdd(false)}
          onSaved={refetch}
        />
      )}
    </div>
  );
}