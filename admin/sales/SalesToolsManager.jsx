import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import HubAdminListItem from "../hub/HubAdminListItem";
import HubAdminModal from "../hub/HubAdminModal";
import { HubAdminField, HubAdminInput, HubAdminSelect, HubAdminToggle } from "../hub/HubAdminField";

const ACCENT = "#ec2ca3";

const COLOUR_OPTIONS = ["cyan", "purple", "pink", "green", "amber", "red", "blue"];
const COLOUR_MAP = { cyan: "#06b6d4", purple: "#8b5cf6", pink: "#ec2ca3", green: "#10b981", amber: "#f59e0b", red: "#ef4444", blue: "#0ea5e9" };
const ICON_OPTIONS = ["Zap", "BarChart2", "Calculator", "DollarSign", "TrendingUp", "FileText", "PoundSterling", "Globe", "Shield", "Users"];

const BLANK_FORM = {
  title: "",
  description: "",
  route: "",
  icon: "Zap",
  colour_theme: "cyan",
  sort_order: 0,
  is_active: true,
  category: "",
  badge_text: "",
};

export default function SalesToolsManager({ onDataChange }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);

  useEffect(() => { loadTools(); }, []);

  const loadTools = async () => {
    try {
      const data = await base44.entities.SalesHubTool.list("sort_order", 100);
      setTools(data || []);
    } catch (err) {
      console.error("Failed to load tools:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingItem(null);
    setForm({ ...BLANK_FORM, sort_order: tools.length + 1 });
    setShowModal(true);
  };

  const openEdit = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingItem(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      route: item.route || "",
      icon: item.icon || "Zap",
      colour_theme: item.colour_theme || "cyan",
      sort_order: item.sort_order ?? 0,
      is_active: item.is_active !== false,
      category: item.category || "",
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
        await base44.entities.SalesHubTool.update(editingItem.id, form);
        toast.success(`"${form.title}" updated`);
      } else {
        await base44.entities.SalesHubTool.create(form);
        toast.success(`"${form.title}" created`);
      }
      setShowModal(false);
      await loadTools();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to save tool");
    }
  };

  const handleToggle = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await base44.entities.SalesHubTool.update(item.id, { is_active: !item.is_active });
      const action = item.is_active ? "hidden" : "shown";
      toast.success(`"${item.title}" ${action}`);
      await loadTools();
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
      await base44.entities.SalesHubTool.delete(item.id);
      toast.success("Tool deleted");
      await loadTools();
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
            Sales Tools
          </h3>
          <p className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.55)" }}>
            {tools.length} tools configured · shown in the Sales Hub Tools tab
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
          + Add Tool
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>Loading…</div>
      ) : tools.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: isDark ? "1px dashed rgba(255,255,255,0.10)" : "1px dashed rgba(0,0,0,0.10)" }}>
          <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }}>No sales tools yet</p>
          <p style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)" }}>Create your first sales tool to get started</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {tools.map((tool, i) => {
            const colour = COLOUR_MAP[tool.colour_theme] || COLOUR_MAP.cyan;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
              >
                <HubAdminListItem
                  title={tool.title}
                  subtitle={`${tool.route || "no route"} · sort: ${tool.sort_order}`}
                  badge={tool.badge_text || null}
                  badgeColour={colour}
                  isActive={tool.is_active}
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
                      <Zap style={{ width: "13px", height: "13px", color: colour }} />
                    </div>
                  }
                  onToggle={(e) => handleToggle(e, tool)}
                  onEdit={(e) => openEdit(e, tool)}
                  onDelete={(e) => handleDelete(e, tool)}
                />
              </motion.div>
            );
          })}
        </div>
      )}

      <HubAdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? "Edit Sales Tool" : "Add Sales Tool"}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Update" : "Create"}
      >
        <HubAdminField label="Title" required>
          <HubAdminInput value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. VAT Calculator" />
        </HubAdminField>
        <HubAdminField label="Description">
          <HubAdminInput type="textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
        </HubAdminField>
        <HubAdminField label="Route (internal tool key)">
          <HubAdminInput value={form.route} onChange={e => setForm({ ...form, route: e.target.value })} placeholder="e.g. /sales/vat-calculator" />
        </HubAdminField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <HubAdminField label="Icon">
            <HubAdminSelect value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} options={ICON_OPTIONS} />
          </HubAdminField>
          <HubAdminField label="Colour Theme">
            <HubAdminSelect value={form.colour_theme} onChange={e => setForm({ ...form, colour_theme: e.target.value })} options={COLOUR_OPTIONS} />
          </HubAdminField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <HubAdminField label="Sort Order">
            <HubAdminInput type="number" min="0" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
          </HubAdminField>
          <HubAdminField label="Badge Text">
            <HubAdminInput value={form.badge_text} onChange={e => setForm({ ...form, badge_text: e.target.value })} placeholder="e.g. New" />
          </HubAdminField>
        </div>
        <HubAdminField label="Category">
          <HubAdminInput value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Calculators" />
        </HubAdminField>
        <HubAdminToggle
          label="Active (visible in Sales Hub)"
          checked={form.is_active}
          onChange={e => setForm({ ...form, is_active: e.target.checked })}
        />
      </HubAdminModal>
    </div>
  );
}