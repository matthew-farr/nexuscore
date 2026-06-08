import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { toast } from "sonner";
import { ExternalLink, BarChart2 } from "lucide-react";
import HubAdminListItem from "../hub/HubAdminListItem";
import HubAdminModal from "../hub/HubAdminModal";
import { HubAdminField, HubAdminInput, HubAdminSelect, HubAdminToggle } from "../hub/HubAdminField";

const ACCENT = "#ec2ca3";

const BLANK_FORM = {
  title: "",
  description: "",
  embed_url: "",
  embed_type: "Power BI",
  height: 460,
  is_active: false,
  show_header: true,
  open_full_report_url: "",
};

export default function SalesHubDashboardManager({ onDataChange }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);

  useEffect(() => { loadDashboards(); }, []);

  const loadDashboards = async () => {
    try {
      const data = await base44.entities.SalesHubDashboardEmbed.list("", 100);
      setDashboards(data || []);
    } catch (err) {
      console.error("Failed to load dashboards:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingItem(null);
    setForm(BLANK_FORM);
    setShowModal(true);
  };

  const openEdit = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingItem(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      embed_url: item.embed_url || "",
      embed_type: item.embed_type || "Power BI",
      height: item.height || 460,
      is_active: item.is_active !== false,
      show_header: item.show_header !== false,
      open_full_report_url: item.open_full_report_url || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.embed_url) {
      toast.error("Title and Embed URL are required");
      return;
    }
    try {
      // Only one can be active — deactivate others if this one is being set active
      if (form.is_active) {
        const others = dashboards.filter(d => d.is_active && d.id !== editingItem?.id);
        await Promise.all(others.map(d => base44.entities.SalesHubDashboardEmbed.update(d.id, { is_active: false })));
      }
      if (editingItem) {
        await base44.entities.SalesHubDashboardEmbed.update(editingItem.id, form);
        toast.success(`"${form.title}" updated`);
      } else {
        await base44.entities.SalesHubDashboardEmbed.create(form);
        toast.success(`"${form.title}" created`);
      }
      setShowModal(false);
      await loadDashboards();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to save dashboard");
    }
  };

  const handleToggle = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      // Only one active at a time
      if (!item.is_active) {
        const others = dashboards.filter(d => d.is_active && d.id !== item.id);
        await Promise.all(others.map(d => base44.entities.SalesHubDashboardEmbed.update(d.id, { is_active: false })));
      }
      await base44.entities.SalesHubDashboardEmbed.update(item.id, { is_active: !item.is_active });
      const action = item.is_active ? "hidden" : "set as active";
      toast.success(`"${item.title}" ${action}`);
      await loadDashboards();
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
      await base44.entities.SalesHubDashboardEmbed.delete(item.id);
      toast.success("Dashboard deleted");
      await loadDashboards();
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
            Dashboard Embeds
          </h3>
          <p className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.55)" }}>
            {dashboards.length} configured · only one can be active at a time
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
          + Add Dashboard
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>Loading…</div>
      ) : dashboards.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: isDark ? "1px dashed rgba(255,255,255,0.10)" : "1px dashed rgba(0,0,0,0.10)" }}>
          <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }}>No dashboards configured</p>
          <p style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)" }}>Add a Power BI, HubSpot or custom iframe embed</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {dashboards.map((dash, i) => (
            <motion.div
              key={dash.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <HubAdminListItem
                title={dash.title}
                subtitle={`${dash.embed_type} · ${dash.height}px`}
                badge={dash.is_active ? "Active" : null}
                badgeColour="#10b981"
                isActive={dash.is_active}
                leftSlot={<BarChart2 style={{ width: "15px", height: "15px", color: ACCENT, flexShrink: 0 }} />}
                rightExtra={dash.open_full_report_url ? (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(dash.open_full_report_url, "_blank", "noopener,noreferrer"); }}
                    style={{ width: "30px", height: "30px", borderRadius: "6px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT }}
                    title="Open full report"
                  >
                    <ExternalLink style={{ width: "13px", height: "13px" }} />
                  </button>
                ) : null}
                onToggle={(e) => handleToggle(e, dash)}
                onEdit={(e) => openEdit(e, dash)}
                onDelete={(e) => handleDelete(e, dash)}
              />
            </motion.div>
          ))}
        </div>
      )}

      <HubAdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? "Edit Dashboard" : "Add Dashboard"}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Update" : "Create"}
      >
        <HubAdminField label="Title" required>
          <HubAdminInput value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Main Sales Dashboard" />
        </HubAdminField>
        <HubAdminField label="Embed Type">
          <HubAdminSelect
            value={form.embed_type}
            onChange={e => setForm({ ...form, embed_type: e.target.value })}
            options={["Power BI", "HubSpot", "Looker Studio", "Custom iframe"]}
          />
        </HubAdminField>
        <HubAdminField label="Embed URL" required>
          <HubAdminInput value={form.embed_url} onChange={e => setForm({ ...form, embed_url: e.target.value })} placeholder="https://app.powerbi.com/view?r=..." />
        </HubAdminField>
        <HubAdminField label="Full Report URL (optional)">
          <HubAdminInput value={form.open_full_report_url} onChange={e => setForm({ ...form, open_full_report_url: e.target.value })} placeholder="https://..." />
        </HubAdminField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <HubAdminField label="Height (px)">
            <HubAdminInput type="number" min="200" step="10" value={form.height} onChange={e => setForm({ ...form, height: parseInt(e.target.value) || 460 })} />
          </HubAdminField>
          <HubAdminField label="Description">
            <HubAdminInput value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional notes" />
          </HubAdminField>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <HubAdminToggle
            label="Set as active dashboard"
            checked={form.is_active}
            onChange={e => setForm({ ...form, is_active: e.target.checked })}
          />
          <HubAdminToggle
            label="Show header"
            checked={form.show_header}
            onChange={e => setForm({ ...form, show_header: e.target.checked })}
          />
        </div>
      </HubAdminModal>
    </div>
  );
}