import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { toast } from "sonner";
import { GripVertical, Star, Settings } from "lucide-react";
import HubAdminListItem from "../hub/HubAdminListItem";
import HubAdminModal from "../hub/HubAdminModal";
import { HubAdminField, HubAdminInput, HubAdminSelect, HubAdminToggle } from "../hub/HubAdminField";
import TabContentManager from "./TabContentManager";

const ACCENT = "#ec2ca3";

// System tabs — cannot be used as templates for new custom tabs
const SYSTEM_TAB_KEYS = new Set(["overview", "analytics", "sales-tools", "guides", "ai"]);

const DEFAULT_TABS = [
  { hub_key: "sales", tab_key: "overview",     label: "Overview",     sort_order: 1, is_active: true, is_default: true,  icon: "LayoutDashboard", description: "Sales overview and quick actions" },
  { hub_key: "sales", tab_key: "analytics",    label: "Analytics",    sort_order: 2, is_active: true, is_default: false, icon: "BarChart2",       description: "Sales performance and dashboards" },
  { hub_key: "sales", tab_key: "sales-tools",  label: "Sales Tools",  sort_order: 3, is_active: true, is_default: false, icon: "Zap",             description: "Internal calculators and tools" },
  { hub_key: "sales", tab_key: "guides",       label: "Guides",       sort_order: 4, is_active: true, is_default: false, icon: "BookOpen",        description: "Sales enablement resources" },
  { hub_key: "sales", tab_key: "ai",           label: "AI Assistant", sort_order: 5, is_active: true, is_default: false, icon: "Sparkles",        description: "AI assistant for sales queries" },
];

const BLANK_FORM = {
  hub_key: "sales",
  tab_key: "",
  label: "",
  sort_order: 0,
  is_active: true,
  is_default: false,
  icon: "",
  description: "",
};

export default function SalesHubTabsManager({ onDataChange }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTab, setEditingTab] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [seeding, setSeeding] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [managingContentFor, setManagingContentFor] = useState(null); // { tabKey, tabLabel }

  useEffect(() => { loadTabs(); }, []);

  const loadTabs = async () => {
    try {
      const data = await base44.entities.SalesHubTabConfig.filter({ hub_key: "sales" }, "sort_order", 50);
      setTabs(data || []);
    } catch (err) {
      console.error("Failed to load tabs:", err);
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultTabs = async (e) => {
    e.preventDefault(); e.stopPropagation();
    setSeeding(true);
    try {
      const existing = await base44.entities.SalesHubTabConfig.filter({ hub_key: "sales" }, "", 50);
      const existingKeys = new Set((existing || []).map(t => t.tab_key));
      const toCreate = DEFAULT_TABS.filter(t => !existingKeys.has(t.tab_key));
      if (toCreate.length > 0) {
        await base44.entities.SalesHubTabConfig.bulkCreate(toCreate);
        toast.success(`Created ${toCreate.length} default tabs`);
      } else {
        toast.success("All default tabs already exist");
      }
      await loadTabs();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to seed tabs");
    } finally {
      setSeeding(false);
    }
  };

  const openCreate = (e) => {
    e.preventDefault(); e.stopPropagation();
    setEditingTab(null);
    setForm({ ...BLANK_FORM, sort_order: tabs.length + 1 });
    setShowModal(true);
  };

  const openEdit = (e, tab) => {
    e.preventDefault(); e.stopPropagation();
    setEditingTab(tab);
    setForm({
      hub_key: tab.hub_key || "sales",
      tab_key: tab.tab_key || "",
      label: tab.label || "",
      sort_order: tab.sort_order ?? 0,
      is_active: tab.is_active !== false,
      is_default: tab.is_default === true,
      icon: tab.icon || "",
      description: tab.description || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.tab_key || !form.label) {
      toast.error("Tab Key and Label are required");
      return;
    }
    // Prevent using a system tab key for new custom tabs
    if (!editingTab && SYSTEM_TAB_KEYS.has(form.tab_key)) {
      toast.error(`"${form.tab_key}" is a system tab key. Use a different key.`);
      return;
    }
    try {
      if (editingTab) {
        await base44.entities.SalesHubTabConfig.update(editingTab.id, form);
        toast.success(`"${form.label}" updated`);
      } else {
        await base44.entities.SalesHubTabConfig.create(form);
        toast.success(`"${form.label}" created`);
      }
      setShowModal(false);
      await loadTabs();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to save tab");
    }
  };

  const handleToggle = async (e, tab) => {
    e.preventDefault(); e.stopPropagation();
    try {
      await base44.entities.SalesHubTabConfig.update(tab.id, { is_active: !tab.is_active });
      toast.success(`"${tab.label}" ${tab.is_active ? "hidden" : "shown"}`);
      await loadTabs();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to toggle tab");
    }
  };

  const handleSetDefault = async (e, tab) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const current = tabs.filter(t => t.is_default && t.id !== tab.id);
      await Promise.all(current.map(t => base44.entities.SalesHubTabConfig.update(t.id, { is_default: false })));
      await base44.entities.SalesHubTabConfig.update(tab.id, { is_default: true });
      toast.success(`"${tab.label}" set as default tab`);
      await loadTabs();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to set default tab");
    }
  };

  const handleDelete = async (e, tab) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm(`Delete "${tab.label}" tab?`)) return;
    try {
      await base44.entities.SalesHubTabConfig.delete(tab.id);
      toast.success(`"${tab.label}" deleted`);
      await loadTabs();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to delete tab");
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const src = result.source.index;
    const dst = result.destination.index;
    if (src === dst) return;

    // Optimistically reorder
    const reordered = Array.from(tabs);
    const [moved] = reordered.splice(src, 1);
    reordered.splice(dst, 0, moved);

    // Assign new sort_order values
    const updated = reordered.map((tab, i) => ({ ...tab, sort_order: i + 1 }));
    setTabs(updated);

    // Persist all changed sort_orders
    setSavingOrder(true);
    try {
      await Promise.all(
        updated.map((tab, i) => {
          if (tabs[i]?.id !== tab.id || tabs[i]?.sort_order !== tab.sort_order) {
            return base44.entities.SalesHubTabConfig.update(tab.id, { sort_order: tab.sort_order });
          }
          return Promise.resolve();
        })
      );
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to save tab order");
      await loadTabs(); // revert on failure
    } finally {
      setSavingOrder(false);
    }
  };

  // If managing content for a specific tab, show the TabContentManager
  if (managingContentFor) {
    return (
      <TabContentManager
        tabKey={managingContentFor.tabKey}
        tabLabel={managingContentFor.tabLabel}
        onBack={() => setManagingContentFor(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 15%)" }}>
            Sales Hub Tabs
          </h3>
          <p className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.55)" }}>
            {tabs.length} tabs · drag to reorder · controls which tabs show in the live Sales Hub
            {savingOrder && <span className="ml-2" style={{ color: ACCENT }}>Saving order…</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tabs.length === 0 && (
            <button
              type="button"
              onClick={seedDefaultTabs}
              disabled={seeding}
              style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.30)", color: "#60a5fa", cursor: seeding ? "not-allowed" : "pointer" }}
            >
              {seeding ? "Seeding…" : "Seed Defaults"}
            </button>
          )}
          <button
            type="button"
            onClick={openCreate}
            style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, background: ACCENT, color: "#ffffff", border: "none", cursor: "pointer" }}
          >
            + Add Tab
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "24px", textAlign: "center", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", fontSize: "13px" }}>Loading tabs…</div>
      ) : tabs.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: isDark ? "1px dashed rgba(255,255,255,0.10)" : "1px dashed rgba(0,0,0,0.10)" }}>
          <p style={{ fontSize: "14px", fontWeight: 500, color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)", marginBottom: "8px" }}>No tabs configured</p>
          <p style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)" }}>Click "Seed Defaults" to create the standard Sales Hub tabs, or "Add Tab" to create a custom one</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sales-tabs">
            {(provided) => (
              <div
                className="space-y-1.5"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {tabs.map((tab, i) => (
                  <Draggable key={tab.id} draggableId={tab.id} index={i}>
                    {(drag, snapshot) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        style={{
                          ...drag.draggableProps.style,
                          opacity: snapshot.isDragging ? 0.85 : 1,
                          transform: drag.draggableProps.style?.transform,
                          borderRadius: "8px",
                          boxShadow: snapshot.isDragging ? `0 8px 24px ${ACCENT}30` : "none",
                        }}
                      >
                        <HubAdminListItem
                          title={tab.label}
                          subtitle={`key: ${tab.tab_key}${SYSTEM_TAB_KEYS.has(tab.tab_key) ? " · system" : " · custom"} · #${tab.sort_order}`}
                          badge={tab.is_default ? "Default" : SYSTEM_TAB_KEYS.has(tab.tab_key) ? "System" : "Custom"}
                          badgeColour={tab.is_default ? "#10b981" : SYSTEM_TAB_KEYS.has(tab.tab_key) ? "#8b5cf6" : ACCENT}
                          isActive={tab.is_active}
                          leftSlot={
                            <div {...drag.dragHandleProps} style={{ cursor: "grab", display: "flex", alignItems: "center" }}>
                              <GripVertical style={{ width: "14px", height: "14px", color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)" }} />
                            </div>
                          }
                          rightExtra={
                            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                              {/* Configure content — only for custom tabs */}
                              {!SYSTEM_TAB_KEYS.has(tab.tab_key) && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setManagingContentFor({ tabKey: tab.tab_key, tabLabel: tab.label }); }}
                                  title="Configure tab content"
                                  style={{ width: "30px", height: "30px", borderRadius: "6px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT }}
                                >
                                  <Settings style={{ width: "13px", height: "13px" }} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => handleSetDefault(e, tab)}
                                title="Set as default tab"
                                style={{ width: "30px", height: "30px", borderRadius: "6px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: tab.is_default ? "#f59e0b" : (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)") }}
                              >
                                <Star style={{ width: "14px", height: "14px" }} />
                              </button>
                            </div>
                          }
                          onToggle={(e) => handleToggle(e, tab)}
                          onEdit={(e) => openEdit(e, tab)}
                          onDelete={(e) => handleDelete(e, tab)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <div style={{ padding: "10px 14px", borderRadius: "8px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)", fontSize: "11px", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.40)" }}>
        💡 Drag tabs to reorder · Star = default tab · System tabs have built-in content · Custom tabs use HubContentItem records (use hub_key=sales + category=your-tab-key to add content)
      </div>

      <HubAdminModal open={showModal} onClose={() => setShowModal(false)} title={editingTab ? "Edit Tab" : "Add Custom Tab"} onSubmit={handleSubmit} submitLabel={editingTab ? "Update" : "Create"}>
        <HubAdminField label="Tab Label" required>
          <HubAdminInput
            value={form.label}
            onChange={e => {
              const label = e.target.value;
              const autoKey = editingTab ? form.tab_key : label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
              setForm({ ...form, label, tab_key: editingTab ? form.tab_key : autoKey });
            }}
            placeholder="e.g. Competitors"
          />
        </HubAdminField>
        <HubAdminField label="Tab Key" required>
          <HubAdminInput
            value={form.tab_key}
            onChange={e => setForm({ ...form, tab_key: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
            placeholder="e.g. competitors (auto-generated from label)"
          />
        </HubAdminField>
        <HubAdminField label="Description">
          <HubAdminInput
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Admin notes about this tab's purpose"
          />
        </HubAdminField>
        <HubAdminField label="Icon (Lucide name)">
          <HubAdminInput
            value={form.icon}
            onChange={e => setForm({ ...form, icon: e.target.value })}
            placeholder="e.g. BarChart2, Zap, Globe"
          />
        </HubAdminField>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <HubAdminToggle label="Active (visible to users)" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
          <HubAdminToggle label="Set as default tab" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} />
        </div>
        <div style={{ padding: "10px 12px", borderRadius: "8px", background: isDark ? "rgba(236,44,163,0.08)" : "rgba(236,44,163,0.06)", border: "1px solid rgba(236,44,163,0.20)", fontSize: "11px", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }}>
          💡 After creating this tab, add content to it via <strong>Admin Hub → Sales → Content Manager</strong> — set <code>hub_key=sales</code> and <code>category=[tab-key]</code>.
        </div>
      </HubAdminModal>
    </div>
  );
}