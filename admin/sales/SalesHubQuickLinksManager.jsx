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

const COLOUR_OPTIONS = ["cyan", "purple", "pink", "green", "amber", "red", "blue"];
const COLOUR_MAP = {
  cyan: "#06b6d4", purple: "#8b5cf6", pink: "#ec2ca3",
  green: "#10b981", amber: "#f59e0b", red: "#ef4444", blue: "#0ea5e9",
};
const ICON_OPTIONS = [
  "Globe", "BarChart2", "BookOpen", "UserPlus", "Shield", "CheckSquare",
  "Zap", "CreditCard", "ScanLine", "Link", "ExternalLink", "Settings",
  "Home", "Search", "Users", "FileText", "Calendar", "Mail",
];

const BLANK_FORM = {
  title: "",
  description: "",
  url: "",
  icon: "Globe",
  colour_theme: "cyan",
  sort_order: 0,
  is_active: true,
  open_in_new_tab: true,
  badge_text: "",
  category: "",
};

export default function SalesHubQuickLinksManager({ onDataChange }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);

  useEffect(() => { loadLinks(); }, []);

  const loadLinks = async () => {
    try {
      const data = await base44.entities.SalesHubQuickLink.list("sort_order", 100);
      setLinks(data || []);
    } catch (err) {
      console.error("Failed to load links:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingItem(null);
    setForm({ ...BLANK_FORM, sort_order: links.length + 1 });
    setShowModal(true);
  };

  const openEdit = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingItem(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      url: item.url || "",
      icon: item.icon || "Globe",
      colour_theme: item.colour_theme || "cyan",
      sort_order: item.sort_order ?? 0,
      is_active: item.is_active !== false,
      open_in_new_tab: item.open_in_new_tab !== false,
      badge_text: item.badge_text || "",
      category: item.category || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.url) {
      toast.error("Title and URL are required");
      return;
    }
    try {
      if (editingItem) {
        await base44.entities.SalesHubQuickLink.update(editingItem.id, form);
        toast.success(`"${form.title}" updated`);
      } else {
        await base44.entities.SalesHubQuickLink.create(form);
        toast.success(`"${form.title}" created`);
      }
      setShowModal(false);
      await loadLinks();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to save link");
    }
  };

  const handleToggle = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await base44.entities.SalesHubQuickLink.update(item.id, { is_active: !item.is_active });
      const action = item.is_active ? "hidden" : "shown";
      toast.success(`"${item.title}" ${action}`);
      await loadLinks();
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
      await base44.entities.SalesHubQuickLink.delete(item.id);
      toast.success("Link deleted");
      await loadLinks();
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
            Quick Links
          </h3>
          <p className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.55)" }}>
            {links.length} links · shown in the Quick Launch bar on the Sales Hub
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
          + Add Link
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>Loading…</div>
      ) : links.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: isDark ? "1px dashed rgba(255,255,255,0.10)" : "1px dashed rgba(0,0,0,0.10)" }}>
          <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }}>No quick links yet</p>
          <p style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)" }}>Add links to external tools used by your sales team</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {links.map((link, i) => {
            const colour = COLOUR_MAP[link.colour_theme] || COLOUR_MAP.cyan;
            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
              >
                <HubAdminListItem
                  title={link.title}
                  subtitle={link.url}
                  badge={link.badge_text || null}
                  badgeColour={colour}
                  isActive={link.is_active}
                  leftSlot={
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        background: `${colour}20`,
                        border: `1px solid ${colour}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: "10px", color: colour }}>●</span>
                    </div>
                  }
                  rightExtra={
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(link.url, "_blank", "noopener,noreferrer"); }}
                      title="Open link"
                      style={{ width: "30px", height: "30px", borderRadius: "6px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}
                    >
                      <ExternalLink style={{ width: "13px", height: "13px" }} />
                    </button>
                  }
                  onToggle={(e) => handleToggle(e, link)}
                  onEdit={(e) => openEdit(e, link)}
                  onDelete={(e) => handleDelete(e, link)}
                />
              </motion.div>
            );
          })}
        </div>
      )}

      <HubAdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? "Edit Quick Link" : "Add Quick Link"}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Update" : "Create"}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <HubAdminField label="Title" required>
            <HubAdminInput value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Open HubSpot" />
          </HubAdminField>
          <HubAdminField label="URL" required>
            <HubAdminInput value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
          </HubAdminField>
        </div>
        <HubAdminField label="Description">
          <HubAdminInput value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short tooltip/description" />
        </HubAdminField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <HubAdminField label="Icon">
            <HubAdminSelect value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} options={ICON_OPTIONS} />
          </HubAdminField>
          <HubAdminField label="Colour">
            <HubAdminSelect value={form.colour_theme} onChange={e => setForm({ ...form, colour_theme: e.target.value })} options={COLOUR_OPTIONS} />
          </HubAdminField>
          <HubAdminField label="Sort Order">
            <HubAdminInput type="number" min="0" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
          </HubAdminField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <HubAdminField label="Category">
            <HubAdminInput value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. CRM" />
          </HubAdminField>
          <HubAdminField label="Badge Text">
            <HubAdminInput value={form.badge_text} onChange={e => setForm({ ...form, badge_text: e.target.value })} placeholder="e.g. New" />
          </HubAdminField>
        </div>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <HubAdminToggle label="Active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
          <HubAdminToggle label="Open in new tab" checked={form.open_in_new_tab} onChange={e => setForm({ ...form, open_in_new_tab: e.target.checked })} />
        </div>
      </HubAdminModal>
    </div>
  );
}