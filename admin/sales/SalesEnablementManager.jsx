import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import HubAdminListItem from "../hub/HubAdminListItem";
import HubAdminModal from "../hub/HubAdminModal";
import { HubAdminField, HubAdminInput, HubAdminSelect, HubAdminToggle } from "../hub/HubAdminField";

const ACCENT = "#ec2ca3";

const CONTENT_TYPES = ["PDF", "Guide", "Playbook", "Video", "Template", "External Link"];

const TYPE_EMOJI = {
  PDF: "📄", Guide: "📖", Playbook: "📋", Video: "🎥", Template: "📑", "External Link": "🔗",
};

const BLANK_FORM = {
  title: "",
  description: "",
  content_type: "Guide",
  url: "",
  file_url: "",
  category: "",
  sort_order: 0,
  is_active: true,
  badge_text: "",
};

export default function SalesEnablementManager({ onDataChange }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      const data = await base44.entities.SalesEnablementItem.list("sort_order", 200);
      setItems(data || []);
    } catch (err) {
      console.error("Failed to load items:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingItem(null);
    setForm({ ...BLANK_FORM, sort_order: items.length + 1 });
    setShowModal(true);
  };

  const openEdit = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingItem(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      content_type: item.content_type || "Guide",
      url: item.url || "",
      file_url: item.file_url || "",
      category: item.category || "",
      sort_order: item.sort_order ?? 0,
      is_active: item.is_active !== false,
      badge_text: item.badge_text || "",
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
        await base44.entities.SalesEnablementItem.update(editingItem.id, form);
        toast.success(`"${form.title}" updated`);
      } else {
        await base44.entities.SalesEnablementItem.create(form);
        toast.success(`"${form.title}" created`);
      }
      setShowModal(false);
      await loadItems();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to save item");
    }
  };

  const handleToggle = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await base44.entities.SalesEnablementItem.update(item.id, { is_active: !item.is_active });
      const action = item.is_active ? "hidden" : "shown";
      toast.success(`"${item.title}" ${action}`);
      await loadItems();
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
      await base44.entities.SalesEnablementItem.delete(item.id);
      toast.success("Item deleted");
      await loadItems();
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
            Sales Enablement
          </h3>
          <p className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.55)" }}>
            {items.length} items · guides, playbooks and resources for the sales team
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
          + Add Item
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: isDark ? "1px dashed rgba(255,255,255,0.10)" : "1px dashed rgba(0,0,0,0.10)" }}>
          <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }}>No enablement items yet</p>
          <p style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)" }}>Add guides, playbooks and resources for your sales team</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <HubAdminListItem
                title={item.title}
                subtitle={`${item.content_type}${item.category ? ` · ${item.category}` : ""} · sort: ${item.sort_order}`}
                badge={item.badge_text || null}
                badgeColour={ACCENT}
                isActive={item.is_active}
                leftSlot={<span style={{ fontSize: "16px" }}>{TYPE_EMOJI[item.content_type] || "📄"}</span>}
                rightExtra={item.url ? (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(item.url, "_blank", "noopener,noreferrer"); }}
                    style={{ width: "30px", height: "30px", borderRadius: "6px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT }}
                    title="Open link"
                  >
                    <ExternalLink style={{ width: "13px", height: "13px" }} />
                  </button>
                ) : null}
                onToggle={(e) => handleToggle(e, item)}
                onEdit={(e) => openEdit(e, item)}
                onDelete={(e) => handleDelete(e, item)}
              />
            </motion.div>
          ))}
        </div>
      )}

      <HubAdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? "Edit Enablement Item" : "Add Enablement Item"}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Update" : "Create"}
      >
        <HubAdminField label="Title" required>
          <HubAdminInput value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Q2 Sales Playbook" />
        </HubAdminField>
        <HubAdminField label="Description">
          <HubAdminInput value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" />
        </HubAdminField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <HubAdminField label="Content Type">
            <HubAdminSelect
              value={form.content_type}
              onChange={e => setForm({ ...form, content_type: e.target.value })}
              options={CONTENT_TYPES}
            />
          </HubAdminField>
          <HubAdminField label="Category">
            <HubAdminInput value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Sales Enablement" />
          </HubAdminField>
        </div>
        <HubAdminField label="URL">
          <HubAdminInput value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
        </HubAdminField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <HubAdminField label="Sort Order">
            <HubAdminInput type="number" min="0" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
          </HubAdminField>
          <HubAdminField label="Badge Text">
            <HubAdminInput value={form.badge_text} onChange={e => setForm({ ...form, badge_text: e.target.value })} placeholder="e.g. New" />
          </HubAdminField>
        </div>
        <HubAdminToggle
          label="Active (visible in Sales Hub)"
          checked={form.is_active}
          onChange={e => setForm({ ...form, is_active: e.target.checked })}
        />
      </HubAdminModal>
    </div>
  );
}