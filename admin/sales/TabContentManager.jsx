/**
 * TabContentManager — manages HubContentItem widget records for a specific tab.
 * Uses the global Widget Framework V1.
 */
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { toast } from "sonner";
import {
  GripVertical, ArrowLeft, Plus, Settings, Eye, EyeOff, Trash2, LayoutDashboard,
  Calendar, Link2, Megaphone, Bell, Activity, TrendingUp, BookOpen, BarChart2,
  Monitor, ExternalLink, Sparkles, CheckSquare, FileText, Target, Star, Trophy,
  ShieldCheck, AlertTriangle, ClipboardCheck, ListChecks, AlertOctagon, GitBranch,
  GraduationCap, ClipboardList, Award, AlarmClock, Wand2, Search, Layers, Zap
} from "lucide-react";
import { WIDGET_REGISTRY, WIDGET_CATEGORIES, LAYOUT_OPTIONS } from "@/lib/widgetRegistry";
import WidgetSelector from "../../widgets/WidgetSelector";
import WidgetConfigModal from "../../widgets/WidgetConfigModal";
import { HubAdminField, HubAdminSelect } from "../hub/HubAdminField";

const ACCENT = "#ec2ca3";

const ICON_MAP = {
  Calendar, Link2, Megaphone, Bell, Activity, TrendingUp, BookOpen, BarChart2,
  Monitor, ExternalLink, Sparkles, CheckSquare, FileText, Target, Star, Trophy,
  ShieldCheck, AlertTriangle, ClipboardCheck, ListChecks, AlertOctagon, GitBranch,
  GraduationCap, ClipboardList, Award, AlarmClock, Wand2, Search, LayoutDashboard,
  Settings, Zap, Layers,
};

function getIcon(name) {
  return ICON_MAP[name] || Layers;
}

/**
 * Props:
 *   hubKey   — which hub (sales, operations, etc.) — defaults to "sales"
 *   tabKey   — the tab_key to manage widgets for
 *   tabLabel — display label
 *   onBack   — callback to go back to the tabs list
 */
export default function TabContentManager({ hubKey = "sales", tabKey, tabLabel, onBack }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);
  const [configuringWidget, setConfiguringWidget] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [layout, setLayout] = useState("single");

  const textMain = isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 15%)";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.55)";
  const borderColour = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";

  useEffect(() => { loadItems(); }, [tabKey, hubKey]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.HubContentItem.filter(
        { hub_key: hubKey, category: tabKey },
        "sort_order",
        100
      );
      setItems(data || []);
      if (data && data.length > 0 && data[0].config_json?.tab_layout) {
        setLayout(data[0].config_json.tab_layout);
      }
    } catch (err) {
      console.error("Failed to load tab widgets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWidgetSelected = async ({ widget_type, config, size }) => {
    setShowSelector(false);
    const def = WIDGET_REGISTRY[widget_type];
    try {
      await base44.entities.HubContentItem.create({
        hub_key: hubKey,
        category: tabKey,
        content_type: "widget",
        widget_type,
        title: def?.label || widget_type,
        description: def?.description || "",
        is_active: true,
        sort_order: items.length + 1,
        config_json: { ...config, size: size || "medium", widget_type },
      });
      toast.success(`${def?.label || widget_type} added`);
      await loadItems();
    } catch (err) {
      toast.error("Failed to add widget");
    }
  };

  const handleConfigSave = async (updates) => {
    if (!configuringWidget) return;
    try {
      await base44.entities.HubContentItem.update(configuringWidget.id, {
        title: updates.title,
        is_active: updates.is_active,
        role_visibility: updates.role_visibility,
        config_json: updates.config_json,
        widget_type: updates.widget_type,
      });
      toast.success("Widget updated");
      setConfiguringWidget(null);
      await loadItems();
    } catch (err) {
      toast.error("Failed to update widget");
    }
  };

  const handleToggle = async (e, item) => {
    e.preventDefault(); e.stopPropagation();
    try {
      await base44.entities.HubContentItem.update(item.id, { is_active: !item.is_active });
      toast.success(`Widget ${item.is_active ? "hidden" : "shown"}`);
      await loadItems();
    } catch (err) {
      toast.error("Failed to toggle");
    }
  };

  const handleDelete = async (e, item) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm(`Remove "${item.title}"?`)) return;
    try {
      await base44.entities.HubContentItem.delete(item.id);
      toast.success("Widget removed");
      await loadItems();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const updated = reordered.map((item, i) => ({ ...item, sort_order: i + 1 }));
    setItems(updated);
    setSavingOrder(true);
    try {
      await Promise.all(
        updated.map((item, i) => {
          if (items[i]?.id !== item.id || items[i]?.sort_order !== item.sort_order) {
            return base44.entities.HubContentItem.update(item.id, { sort_order: item.sort_order });
          }
          return Promise.resolve();
        })
      );
    } catch (err) {
      toast.error("Failed to save order");
      await loadItems();
    } finally {
      setSavingOrder(false);
    }
  };

  const handleLayoutChange = async (newLayout) => {
    setLayout(newLayout);
    if (items.length > 0) {
      try {
        await base44.entities.HubContentItem.update(items[0].id, {
          config_json: { ...items[0].config_json, tab_layout: newLayout },
        });
      } catch (err) { /* silently ignore */ }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button type="button" onClick={onBack}
          style={{ width: "32px", height: "32px", borderRadius: "8px", background: "none", border: `1px solid ${borderColour}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}
        >
          <ArrowLeft style={{ width: "14px", height: "14px" }} />
        </button>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: textMain, margin: 0 }}>{tabLabel} — Widgets</h3>
          <p style={{ fontSize: "11px", color: textMuted, margin: "2px 0 0" }}>
            {items.length} widget{items.length !== 1 ? "s" : ""} · drag to reorder
            {savingOrder && <span style={{ marginLeft: "8px", color: ACCENT }}>Saving…</span>}
          </p>
        </div>
        <button type="button" onClick={() => setShowSelector(true)}
          style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, background: ACCENT, color: "#ffffff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
        >
          <Plus style={{ width: "13px", height: "13px" }} />
          Add Widget
        </button>
      </div>

      {/* Layout selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", background: cardBg, border: `1px solid ${borderColour}` }}>
        <LayoutDashboard style={{ width: "14px", height: "14px", color: textMuted, flexShrink: 0 }} />
        <span style={{ fontSize: "12px", fontWeight: 700, color: textMuted, whiteSpace: "nowrap" }}>Layout:</span>
        <div style={{ flex: 1, maxWidth: "200px" }}>
          <HubAdminSelect
            value={layout}
            onChange={e => handleLayoutChange(e.target.value)}
            options={LAYOUT_OPTIONS.map(l => ({ value: l.key, label: l.label }))}
          />
        </div>
        <span style={{ fontSize: "11px", color: textMuted }}>
          {LAYOUT_OPTIONS.find(l => l.key === layout)?.description || ""}
        </span>
      </div>

      {/* Widget list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "24px", fontSize: "13px", color: textMuted }}>Loading widgets…</div>
      ) : items.length === 0 ? (
        <div style={{ padding: "36px", textAlign: "center", borderRadius: "12px", background: cardBg, border: `2px dashed ${borderColour}` }}>
          <LayoutDashboard style={{ width: "28px", height: "28px", margin: "0 auto 10px", color: textMuted, opacity: 0.5 }} />
          <p style={{ fontSize: "14px", fontWeight: 600, color: textMain, marginBottom: "6px" }}>"{tabLabel}" has no widgets</p>
          <p style={{ fontSize: "12px", color: textMuted, marginBottom: "14px" }}>Add widgets that appear when users visit this tab</p>
          <button type="button" onClick={() => setShowSelector(true)}
            style={{ padding: "8px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, background: ACCENT, color: "#ffffff", border: "none", cursor: "pointer" }}
          >
            + Add First Widget
          </button>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId={`widgets-${hubKey}-${tabKey}`}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {items.map((item, i) => {
                  const widgetType = item.widget_type || item.config_json?.widget_type || "widget";
                  const def = WIDGET_REGISTRY[widgetType];
                  const cat = def ? WIDGET_CATEGORIES[def.category] : null;
                  const Icon = def ? getIcon(def.icon) : Layers;
                  const size = item.config_json?.size || "medium";

                  return (
                    <Draggable key={item.id} draggableId={item.id} index={i}>
                      {(drag, snapshot) => (
                        <div ref={drag.innerRef} {...drag.draggableProps}
                          style={{ ...drag.draggableProps.style, borderRadius: "10px", boxShadow: snapshot.isDragging ? `0 8px 24px ${ACCENT}30` : "none", opacity: snapshot.isDragging ? 0.88 : 1 }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "10px", background: item.is_active ? (isDark ? "rgba(255,255,255,0.04)" : "#ffffff") : (isDark ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.03)"), border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, opacity: item.is_active ? 1 : 0.55 }}>
                            <div {...drag.dragHandleProps} style={{ cursor: "grab", display: "flex", alignItems: "center", flexShrink: 0 }}>
                              <GripVertical style={{ width: "14px", height: "14px", color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)" }} />
                            </div>
                            <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: cat ? `${cat.colour}18` : "#ec2ca318", border: `1px solid ${cat ? `${cat.colour}30` : "#ec2ca330"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Icon style={{ width: "13px", height: "13px", color: cat?.colour || ACCENT }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>{item.title}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                                {cat && <span style={{ fontSize: "10px", color: cat.colour, fontWeight: 600, background: `${cat.colour}12`, padding: "1px 6px", borderRadius: "3px" }}>{cat.label}</span>}
                                <span style={{ fontSize: "10px", color: textMuted }}>{def?.label || widgetType} · {size}</span>
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "2px", flexShrink: 0 }}>
                              <button type="button" onClick={() => setConfiguringWidget(item)} title="Configure"
                                style={{ width: "28px", height: "28px", borderRadius: "6px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT }}
                              >
                                <Settings style={{ width: "13px", height: "13px" }} />
                              </button>
                              <button type="button" onClick={(e) => handleToggle(e, item)} title={item.is_active ? "Hide" : "Show"}
                                style={{ width: "28px", height: "28px", borderRadius: "6px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}
                              >
                                {item.is_active ? <Eye style={{ width: "13px", height: "13px" }} /> : <EyeOff style={{ width: "13px", height: "13px" }} />}
                              </button>
                              <button type="button" onClick={(e) => handleDelete(e, item)} title="Remove"
                                style={{ width: "28px", height: "28px", borderRadius: "6px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}
                              >
                                <Trash2 style={{ width: "13px", height: "13px" }} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {showSelector && (
        <WidgetSelector onSelect={handleWidgetSelected} onClose={() => setShowSelector(false)} />
      )}

      {configuringWidget && (
        <WidgetConfigModal widget={configuringWidget} onSave={handleConfigSave} onClose={() => setConfiguringWidget(null)} />
      )}
    </div>
  );
}