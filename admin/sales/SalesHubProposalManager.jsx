import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import HubAdminListItem from "../hub/HubAdminListItem";
import HubAdminModal from "../hub/HubAdminModal";
import { HubAdminField, HubAdminInput, HubAdminSelect, HubAdminToggle } from "../hub/HubAdminField";

const ACCENT = "#ec2ca3";

const BLANK_FORM = {
  template_name: "",
  template_type: "Standard Proposal",
  description: "",
  is_active: false,
  default_theme: "Light",
  version: "1.0",
  html_template: "<div style='padding: 20px;'><h1>Proposal</h1><p>Your content here</p></div>",
};

export default function SalesHubProposalManager({ onDataChange }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    try {
      const data = await base44.entities.SalesProposalTemplate.list("", 100);
      setTemplates(data || []);
    } catch (err) {
      console.error("Failed to load templates:", err);
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
      template_name: item.template_name || "",
      template_type: item.template_type || "Standard Proposal",
      description: item.description || "",
      is_active: item.is_active !== false,
      default_theme: item.default_theme || "Light",
      version: item.version || "1.0",
      html_template: item.html_template || BLANK_FORM.html_template,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.template_name) {
      toast.error("Template name is required");
      return;
    }
    try {
      if (editingItem) {
        await base44.entities.SalesProposalTemplate.update(editingItem.id, form);
        toast.success(`"${form.template_name}" updated`);
      } else {
        await base44.entities.SalesProposalTemplate.create(form);
        toast.success(`"${form.template_name}" created`);
      }
      setShowModal(false);
      await loadTemplates();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to save template");
    }
  };

  const handleToggle = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await base44.entities.SalesProposalTemplate.update(item.id, { is_active: !item.is_active });
      const action = item.is_active ? "hidden" : "shown";
      toast.success(`"${item.template_name}" ${action}`);
      await loadTemplates();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to update visibility");
    }
  };

  const handleDelete = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${item.template_name}"?`)) return;
    try {
      await base44.entities.SalesProposalTemplate.delete(item.id);
      toast.success("Template deleted");
      await loadTemplates();
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
            Proposal Templates
          </h3>
          <p className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.55)" }}>
            {templates.length} templates configured
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
          + Add Template
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>Loading…</div>
      ) : templates.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: isDark ? "1px dashed rgba(255,255,255,0.10)" : "1px dashed rgba(0,0,0,0.10)" }}>
          <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }}>No proposal templates</p>
          <p style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)" }}>Create your first proposal template to get started</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {templates.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <HubAdminListItem
                title={t.template_name}
                subtitle={`${t.template_type} · v${t.version || "1.0"} · ${t.default_theme}`}
                badge={t.is_active ? "Active" : null}
                badgeColour="#10b981"
                isActive={t.is_active}
                leftSlot={<FileText style={{ width: "15px", height: "15px", color: ACCENT, flexShrink: 0 }} />}
                onToggle={(e) => handleToggle(e, t)}
                onEdit={(e) => openEdit(e, t)}
                onDelete={(e) => handleDelete(e, t)}
              />
            </motion.div>
          ))}
        </div>
      )}

      <HubAdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? "Edit Template" : "Add Template"}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Update" : "Create"}
      >
        <HubAdminField label="Template Name" required>
          <HubAdminInput value={form.template_name} onChange={e => setForm({ ...form, template_name: e.target.value })} placeholder="e.g. Standard Proposal" />
        </HubAdminField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <HubAdminField label="Template Type">
            <HubAdminSelect
              value={form.template_type}
              onChange={e => setForm({ ...form, template_type: e.target.value })}
              options={["Standard Proposal", "Enterprise Proposal", "Renewal Proposal", "One-page Summary", "Price List"]}
            />
          </HubAdminField>
          <HubAdminField label="Default Theme">
            <HubAdminSelect
              value={form.default_theme}
              onChange={e => setForm({ ...form, default_theme: e.target.value })}
              options={["Light", "Dark"]}
            />
          </HubAdminField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <HubAdminField label="Version">
            <HubAdminInput value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} placeholder="1.0" />
          </HubAdminField>
          <HubAdminField label="Description">
            <HubAdminInput value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" />
          </HubAdminField>
        </div>
        <HubAdminField label="HTML Template">
          <HubAdminInput
            type="textarea"
            value={form.html_template}
            onChange={e => setForm({ ...form, html_template: e.target.value })}
            placeholder="<div>...</div>"
            style={{ minHeight: "100px", fontFamily: "monospace", fontSize: "12px" }}
          />
        </HubAdminField>
        <HubAdminToggle
          label="Active (available in Proposal Builder)"
          checked={form.is_active}
          onChange={e => setForm({ ...form, is_active: e.target.checked })}
        />
      </HubAdminModal>
    </div>
  );
}