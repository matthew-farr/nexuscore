import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Map } from "lucide-react";
import { useTheme } from "../../ThemeProvider";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ROADMAP_QUARTERS, CURRENT_QUARTER_KEY, STATUS_CONFIG } from "@/lib/roadmapConfig";
import RoadmapItemDetailDrawer from "../roadmap/RoadmapItemDetailDrawer";

const ACCENT = "#8b5cf6";

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Planned"];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
      
      {status || "Planned"}
    </span>);

}

function StatusSummary({ items, isDark }) {
  const counts = {};
  items.forEach((i) => {
    const s = i.status || "Planned";
    counts[s] = (counts[s] || 0) + 1;
  });
  if (Object.keys(counts).length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {Object.entries(counts).map(([status, count]) => {
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Planned"];
        return (
          <span key={status} className="text-[10px] font-semibold" style={{ color: cfg.color }}>
            {count} {status}
          </span>);

      })}
    </div>);

}

function QuarterCard({ quarter, items, isDark, onSelectItem, isInternal }) {
  const isCurrent = quarter.key === CURRENT_QUARTER_KEY;
  const isFuture = quarter.key === "Future Considerations";

  const quarterItems = items.
  filter((i) => i.quarter === quarter.key).
  sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const cardBg = isDark ?
  "linear-gradient(145deg, rgba(15,23,42,0.70) 0%, rgba(10,15,35,0.55) 100%)" :
  "linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(248,246,255,0.88) 100%)";

  const borderStyle = isCurrent ?
  isDark ? `1px solid ${ACCENT}50` : `1px solid ${ACCENT}35` :
  isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)";

  const cardShadow = isCurrent ?
  isDark ? `0 8px 32px ${ACCENT}22, 0 4px 16px rgba(0,0,0,0.30)` : `0 8px 32px ${ACCENT}14, 0 4px 16px rgba(0,0,0,0.08)` :
  isDark ? "0 4px 16px rgba(0,0,0,0.25)" : "0 4px 16px rgba(0,0,0,0.06)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: cardBg, border: borderStyle, boxShadow: cardShadow, backdropFilter: "blur(20px)" }}>
      
      {/* Current quarter accent line */}
      {isCurrent &&
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}90, transparent)` }} />
      }

      {/* Header */}
      <div className="px-5 pt-4 pb-3 text-[hsl(var(--text-foreground))]" style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.05)" }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                {quarter.label}
              </h3>
              {isCurrent &&
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}40`, color: ACCENT }}>
                  <Zap className="w-2.5 h-2.5" /> Current
                </span>
              }
              {isFuture &&
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)", color: isDark ? "#ffffff" : "#000000" }}>
                   Future
                 </span>
              }
            </div>
            {quarter.dateRange &&
            <p className="text-[11px] mt-0.5 font-medium text-[hsl(var(--text-foreground))]" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                {quarter.dateRange}
              </p>
            }
            <StatusSummary items={quarterItems} isDark={isDark} />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="px-5 py-4 flex flex-col gap-3 flex-1">
        {quarterItems.length === 0 ?
        <p className="text-xs py-2 text-center" style={{ color: isDark ? "#ffffff" : "#000000" }}>
            Nothing scheduled yet
          </p> :

        quarterItems.map((item) =>
        <button
          key={item.id}
          onClick={() => isInternal && onSelectItem(item)}
          type="button"
          className="flex flex-col gap-1 text-left rounded-lg p-3 transition-all"
          style={{
            background: isInternal ? (isDark ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.05)") : "transparent",
            border: isInternal ? `1px solid ${ACCENT}20` : "none",
            cursor: isInternal ? "pointer" : "default",
          }}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-snug" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                  {item.title}
                </p>
                <StatusBadge status={item.status} />
              </div>
              {item.description &&
          <p className="text-xs leading-relaxed" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                   {item.description}
                 </p>
          }
            </button>
        )
        }
      </div>
    </motion.div>);

}

export default function QuarterlyRoadmapTab({ roadmapType, title, description, icon: IconComponent }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const Icon = IconComponent || Map;
  const isInternal = roadmapType === "Internal";
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ["roadmapItems", roadmapType],
    queryFn: () => base44.entities.RoadmapItem.filter({ roadmap_type: roadmapType }, "sort_order", 200)
  });

  const cardBg = isDark ?
  "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)" :
  "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)";
  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)";
  const cardShadow = isDark ? "0 8px 24px rgba(0,0,0,0.30)" : "0 4px 16px rgba(0,0,0,0.08)";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl p-5" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}30`, boxShadow: `0 0 14px ${ACCENT}22` }}>
            <Icon className="w-5 h-5" style={{ color: ACCENT }} />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>{title}</h2>
            <p className="text-xs mt-0.5" style={{ color: isDark ? "#ffffff" : "#000000" }}>{description}</p>
          </div>
        </div>
      </div>

      {isLoading ?
      <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${ACCENT}40`, borderTopColor: ACCENT }} />
        </div> :

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROADMAP_QUARTERS.map((q) =>
        <QuarterCard key={q.key} quarter={q} items={items} isDark={isDark} onSelectItem={setSelectedItem} isInternal={isInternal} />
        )}
        </div>
      }

      {isInternal && selectedItem && (
        <RoadmapItemDetailDrawer
          item={selectedItem}
          user={user}
          onClose={() => setSelectedItem(null)}
          onSaved={() => {
            refetch();
            setSelectedItem(null);
          }}
        />
      )}
    </div>);

}