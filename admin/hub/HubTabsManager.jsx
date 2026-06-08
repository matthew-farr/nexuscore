import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { toast } from "sonner";
import { GripVertical, Star, Settings } from "lucide-react";
import HubAdminListItem from "./HubAdminListItem";
import HubAdminModal from "./HubAdminModal";
import { HubAdminField, HubAdminInput, HubAdminToggle } from "./HubAdminField";
import TabContentManager from "../sales/TabContentManager";

const BLANK_FORM = {
  tab_key: "",
  label: "",
  sort_order: 0,
  is_active: true,
  is_default: false,
  icon: "",
  description: "",
};

const ACCENT = "#ec2ca3";

/**
 * Generic hub tabs manager with drag-and-drop reordering.
 * Props: hubKey, hubName, defaultTabs (array of tab config objects), onDataChange
 */
export default function HubTabsManager({ hubKey, hubName, defaultTabs = [], onDataChange }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTab, setEditingTab] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [seeding, setSeeding] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [managingContentFor, setManagingContentFor] = useState(null);

  useEffect(() => { loadTabs(); }, [hubKey]);

  const loadTabs = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.SalesHubTabConfig.filter({ hub_key: hubKey }, "sort_order", 50);
      setTabs(data || []);
    } catch (err) {
      console.error("Failed to load tabs:", err);
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultTabs = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!defaultTabs.length) { toast.error("No default tabs defined for this hub"); return; }
    setSeeding(true);
    try {
      const existing = await base44.entities.SalesHubTabConfig.filter({ hub_key: hubKey }, "", 50);
      const existingKeys = new Set((existing || []).map(t => t.tab_key));
      const toCreate = defaultTabs.filter(t => !existingKeys.has(t.tab_key)).map(t => ({ ...t, hub_key: hubKey }));
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
    if (!form.tab_key || !form.label) { toast.error("Tab Key and Label are required"); return; }
    try {
      const payload = { ...form, hub_key: hubKey };
      if (editingTab) {
        await base44.entities.SalesHubTabConfig.update(editingTab.id, payload);
        toast.success(`"${form.label}" updated`);
      } else {
        await base44.entities.SalesHubTabConfig.create(payload);
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

    const reordered = Array.from(tabs);
    const [moved] = reordered.splice(src, 1);
    reordered.splice(dst, 0, moved);
    const updated = reordered.map((tab, i) => ({ ...tab, sort_order: i + 1 }));
    setTabs(updated);

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
      await loadTabs();
    } finally {
      setSavingOrder(false);
    }
  };

  if (managingContentFor) {
    return (
      <TabContentManager
        hubKey={hubKey}
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
            {hubName} Tabs
          </h3>
          <p className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.55)" }}>
            {tabs.length} tabs · drag to reorder
            {savingOrder && <span className="ml-2" style={{ color: ACCENT }}>Saving order…</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tabs.length === 0 && defaultTabs.length > 0 && (
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
          <p style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)" }}>
            {defaultTabs.length > 0 ? `Click "Seed Defaults" to create the standard ${hubName} tabs` : "Add a tab to get started"}
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId={`${hubKey}-tabs`}>
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
                          borderRadius: "8px",
                          boxShadow: snapshot.isDragging ? `0 8px 24px ${ACCENT}30` : "none",
                        }}
                      >
                        <HubAdminListItem
                          title={tab.label}
                          subtitle={`key: ${tab.tab_key} · #${tab.sort_order}`}
                          badge={tab.is_default ? "Default" : null}
                          badgeColour="#10b981"
                          isActive={tab.is_active}
                          leftSlot={
                            <div {...drag.dragHandleProps} style={{ cursor: "grab", display: "flex", alignItems: "center" }}>
                              <GripVertical style={{ width: "14px", height: "14px", color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)" }} />
                            </div>
                          }
                          rightExtra={
                            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                              <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setManagingContentFor({ tabKey: tab.tab_key, tabLabel: tab.label }); }}
                                title="Configure tab widgets"
                                style={{ width: "30px", height: "30px", borderRadius: "6px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT }}
                              >
                                <Settings style={{ width: "13px", height: "13px" }} />
                              </button>
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
        💡 Drag tabs to reorder · Star = default tab on load · Changes apply live to the {hubName}
      </div>

      <HubAdminModal open={showModal} onClose={() => setShowModal(false)} title={editingTab ? "Edit Tab" : "Add Tab"} onSubmit={handleSubmit} submitLabel={editingTab ? "Update" : "Create"}>
        <HubAdminField label="Label" required>
          <HubAdminInput
            value={form.label}
            onChange={e => {
              const label = e.target.value;
              const autoKey = editingTab ? form.tab_key : label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
              setForm({ ...form, label, tab_key: editingTab ? form.tab_key : autoKey });
            }}
            placeholder="e.g. Resources"
          />
        </HubAdminField>
        <HubAdminField label="Tab Key" required>
          <HubAdminInput
            value={form.tab_key}
            onChange={e => setForm({ ...form, tab_key: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
            placeholder="e.g. resources"
          />
        </HubAdminField>
        <HubAdminField label="Description">
          <HubAdminInput value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Admin notes about this tab" />
        </HubAdminField>
        <HubAdminField label="Icon (Lucide name)">
          <HubAdminInput value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="e.g. BarChart2" />
        </HubAdminField>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <HubAdminToggle label="Active (visible to users)" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
          <HubAdminToggle label="Set as default tab" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} />
        </div>
      </HubAdminModal>
    </div>
  );
}