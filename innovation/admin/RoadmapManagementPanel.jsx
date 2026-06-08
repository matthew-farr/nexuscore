import { useState } from "react";
import { Plus, Pencil, ArrowUp, ArrowDown, Map, Globe, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../ThemeProvider";
import RoadmapItemDrawer from "./RoadmapItemDrawer";
import { ROADMAP_QUARTERS, STATUS_CONFIG } from "@/lib/roadmapConfig";

const ACCENT = "#8b5cf6";

const ROADMAP_TABS = [
  { key: "Web Development", label: "Development Roadmap", icon: Globe },
  { key: "Internal",        label: "Internal Roadmap",    icon: Map },
];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Planned"];
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
      {status || "Planned"}
    </span>
  );
}

export default function RoadmapManagementPanel() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();

  const [activeType, setActiveType] = useState("Web Development");
  const [drawerItem, setDrawerItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ["roadmapItems", activeType],
    queryFn: () => base44.entities.RoadmapItem.filter({ roadmap_type: activeType }, "sort_order", 200),
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey: ["roadmapItems"] });

  const openAdd = () => { setDrawerItem({ roadmap_type: activeType }); setDrawerOpen(true); };
  const openEdit = item => { setDrawerItem(item); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setDrawerItem(null); };

  const handleReorder = async (item, direction) => {
    const sameQuarter = items.filter(i => i.quarter === item.quarter).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const idx = sameQuarter.findIndex(i => i.id === item.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sameQuarter.length) return;
    const swap = sameQuarter[swapIdx];
    await Promise.all([
      base44.entities.RoadmapItem.update(item.id, { sort_order: swap.sort_order || 0 }),
      base44.entities.RoadmapItem.update(swap.id, { sort_order: item.sort_order || 0 }),
    ]);
    refetch();
  };

  const cardBg = isDark
    ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
    : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)";
  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)";
  const cardShadow = isDark ? "0 8px 24px rgba(0,0,0,0.30)" : "0 4px 16px rgba(0,0,0,0.08)";

  return (
    <div className="space-y-4">

      {/* Panel header */}
      <div className="rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3"
        style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}30` }}>
            <Map className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>Roadmap Management</p>
            <p className="text-xs mt-0.5" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              Add, edit, reorder and delete roadmap items.
            </p>
          </div>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${ACCENT}, #6d28d9)`, boxShadow: `0 4px 16px ${ACCENT}40` }}>
          <Plus className="w-3.5 h-3.5" /> Add Item
        </button>
      </div>

      {/* Type switcher */}
      <div className="flex gap-2 flex-wrap">
        {ROADMAP_TABS.map(t => {
          const Icon = t.icon;
          const active = activeType === t.key;
          return (
            <button key={t.key} onClick={() => setActiveType(t.key)}
              className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: active ? `${ACCENT}18` : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                border: active ? `1px solid ${ACCENT}40` : isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                color: active ? ACCENT : isDark ? "#ffffff" : "#000000",
              }}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Items by quarter */}
      <div className="space-y-4">
        {ROADMAP_QUARTERS.map(q => {
          const qItems = items.filter(i => i.quarter === q.key).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          return (
            <div key={q.key} className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}>
              {/* Quarter header */}
              <div className="px-5 py-3 flex items-center justify-between gap-2"
                style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)" }}>
                <div>
                  <p className="text-xs font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>{q.label}</p>
                  {q.dateRange && <p className="text-[10px] mt-0.5" style={{ color: isDark ? "#ffffff" : "#000000" }}>{q.dateRange}</p>}
                </div>
                <span className="text-[10px] font-medium" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                  {qItems.length} item{qItems.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Items */}
              <div className="divide-y" style={{ borderColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}>
                {qItems.length === 0 ? (
                  <div className="px-5 py-4">
                    <p className="text-xs" style={{ color: isDark ? "#ffffff" : "#000000" }}>No items — add one above.</p>
                  </div>
                ) : (
                  qItems.map((item, idx) => (
                    <div key={item.id} className="px-5 py-3 flex items-center gap-3 group">

                      {/* Reorder arrows */}
                      <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => handleReorder(item, "up")} disabled={idx === 0}
                          className="w-5 h-5 rounded flex items-center justify-center disabled:opacity-25"
                          style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}>
                          <ArrowUp className="w-3 h-3" style={{ color: isDark ? "#ffffff" : "#000000" }} />
                        </button>
                        <button onClick={() => handleReorder(item, "down")} disabled={idx === qItems.length - 1}
                          className="w-5 h-5 rounded flex items-center justify-center disabled:opacity-25"
                          style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}>
                          <ArrowDown className="w-3 h-3" style={{ color: isDark ? "#ffffff" : "#000000" }} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs mt-0.5 truncate" style={{ color: isDark ? "#ffffff" : "#000000" }}>
                            {item.description}
                          </p>
                        )}
                      </div>

                      <StatusBadge status={item.status} />

                      {/* Edit */}
                      <button onClick={() => openEdit(item)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}>
                        <Pencil className="w-3.5 h-3.5" style={{ color: isDark ? "#ffffff" : "#000000" }} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {drawerOpen && (
        <RoadmapItemDrawer
          item={drawerItem}
          onClose={closeDrawer}
          onSaved={refetch}
        />
      )}
    </div>
  );
}