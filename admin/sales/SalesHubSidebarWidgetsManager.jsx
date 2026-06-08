import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { toast } from "sonner";
import { GripVertical } from "lucide-react";
import HubAdminListItem from "../hub/HubAdminListItem";
import HubAdminModal from "../hub/HubAdminModal";
import { HubAdminField, HubAdminInput, HubAdminSelect, HubAdminToggle } from "../hub/HubAdminField";

const ACCENT = "#ec2ca3";

const WIDGET_TYPES = [
  "Calendar",
  "Notifications",
  "Top Performers",
  "Upcoming Events",
  "KPI Snapshot",
  "Custom Link List",
  "Custom Text Card",
];

const COLOUR_OPTIONS = ["cyan", "purple", "pink", "green", "amber", "red", "blue"];

const BLANK_FORM = {
  title: "",
  widget_type: "Calendar",
  description: "",
  sort_order: 0,
  is_active: true,
  colour_theme: "cyan",
};

export default function SalesHubSidebarWidgetsManager({ onDataChange }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);

  useEffect(() => { loadWidgets(); }, []);

  const loadWidgets = async () => {
    try {
      const data = await base44.entities.SalesHubSidebarWidget.list("sort_order", 100);
      setWidgets(data || []);
    } catch (err) {
      console.error("Failed to load widgets:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingItem(null);
    setForm({ ...BLANK_FORM, sort_order: widgets.length + 1 });
    setShowModal(true);
  };

  const openEdit = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingItem(item);
    setForm({
      title: item.title || "",
      widget_type: item.widget_type || "Calendar",
      description: item.description || "",
      sort_order: item.sort_order ?? 0,
      is_active: item.is_active !== false,
      colour_theme: item.colour_theme || "cyan",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title) {
      toast.error("Title is required");
      return;
    }
    try {
      if (editingItem) {
        await base44.entities.SalesHubSidebarWidget.update(editingItem.id, form);
        toast.success(`"${form.title}" updated`);
      } else {
        await base44.entities.SalesHubSidebarWidget.create(form);
        toast.success(`"${form.title}" created`);
      }
      setShowModal(false);
      await loadWidgets();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to save widget");
    }
  };

  const handleToggle = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await base44.entities.SalesHubSidebarWidget.update(item.id, { is_active: !item.is_active });
      const action = item.is_active ? "hidden" : "shown";
      toast.success(`"${item.title}" ${action}`);
      await loadWidgets();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to update visibility");
    }
  };

  const handleDelete = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await base44.entities.SalesHubSidebarWidget.delete(item.id);
      toast.success("Widget deleted");
      await loadWidgets();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 15%)" }}>
            Sidebar Widgets
          </h3>
          <p className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.55)" }}>
            {widgets.length} widgets configured · shown in the Sales Hub right sidebar
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          style={{
            padding: "7px 14px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 700,
            background: ACCENT,
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
          }}
        >
          + Add Widget
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>Loading…</div>
      ) : widgets.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: isDark ? "1px dashed rgba(255,255,255,0.10)" : "1px dashed rgba(0,0,0,0.10)" }}>
          <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }}>No sidebar widgets yet</p>
          <p style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)" }}>Add widgets to display on the Sales Hub sidebar</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {widgets.map((widget, i) => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <HubAdminListItem
                title={widget.title}
                subtitle={`${widget.widget_type} · sort: ${widget.sort_order}`}
                badge={widget.colour_theme}
                isActive={widget.is_active}
                leftSlot={
                  <GripVertical style={{ width: "14px", height: "14px", color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)" }} />
                }
                onToggle={(e) => handleToggle(e, widget)}
                onEdit={(e) => openEdit(e, widget)}
                onDelete={(e) => handleDelete(e, widget)}
              />
            </motion.div>
          ))}
        </div>
      )}

      <HubAdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? "Edit Widget" : "Add Widget"}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Update" : "Create"}
      >
        <HubAdminField label="Title" required>
          <HubAdminInput value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Calendar" />
        </HubAdminField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <HubAdminField label="Widget Type">
            <HubAdminSelect
              value={form.widget_type}
              onChange={e => setForm({ ...form, widget_type: e.target.value })}
              options={WIDGET_TYPES}
            />
          </HubAdminField>
          <HubAdminField label="Colour Theme">
            <HubAdminSelect
              value={form.colour_theme}
              onChange={e => setForm({ ...form, colour_theme: e.target.value })}
              options={COLOUR_OPTIONS}
            />
          </HubAdminField>
        </div>
        <HubAdminField label="Description">
          <HubAdminInput value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" />
        </HubAdminField>
        <HubAdminField label="Sort Order">
          <HubAdminInput type="number" min="0" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
        </HubAdminField>
        <HubAdminToggle
          label="Active (visible in Sales Hub sidebar)"
          checked={form.is_active}
          onChange={e => setForm({ ...form, is_active: e.target.checked })}
        />
      </HubAdminModal>
    </div>
  );
}