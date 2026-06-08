import { useState, useEffect } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { ROADMAP_TYPES, QUARTER_OPTIONS, STATUSES } from "@/lib/roadmapConfig";
import RoadmapItemForm from "../roadmap/RoadmapItemForm";

const ACCENT = "#8b5cf6";

const EMPTY = {
  title: "",
  description: "",
  roadmap_type: "Web Development",
  quarter: "Q4-2026",
  status: "Planned",
  start_date: "",
  end_date: "",
  sort_order: 0,
};

export default function RoadmapItemDrawer({ item, onClose, onSaved }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isEdit = !!item?.id;

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setForm(item?.id ? { ...EMPTY, ...item } : { ...EMPTY, ...(item || {}) });
    setConfirmDelete(false);
  }, [item]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = { ...form };
    if (!payload.start_date) delete payload.start_date;
    if (!payload.end_date) delete payload.end_date;
    if (isEdit) {
      await base44.entities.RoadmapItem.update(item.id, payload);
    } else {
      await base44.entities.RoadmapItem.create(payload);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    await base44.entities.RoadmapItem.delete(item.id);
    setDeleting(false);
    onSaved();
    onClose();
  };

  const bg = isDark
    ? "linear-gradient(160deg, #0d1124 0%, #080b1a 100%)"
    : "linear-gradient(160deg, #ffffff 0%, #f5f3ff 100%)";

  const inputStyle = {
    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    border: isDark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(0,0,0,0.12)",
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "13px",
    color: isDark ? "#ffffff" : "#000000",
    outline: "none",
    width: "100%",
  };

  const labelStyle = {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: isDark ? "#ffffff" : "#000000",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(4px)" }} onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
        style={{ width: "min(460px, 95vw)", background: bg, borderLeft: isDark ? `1px solid ${ACCENT}30` : "1px solid rgba(0,0,0,0.10)", boxShadow: isDark ? `-24px 0 64px rgba(0,0,0,0.60)` : `-12px 0 40px rgba(0,0,0,0.12)` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)" }}>
          <div>
            <p className="text-sm font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              {isEdit ? "Edit Roadmap Item" : "Add Roadmap Item"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              {isEdit ? "Update the details below." : "Fill in the details to add a new item."}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}>
            <X className="w-4 h-4" style={{ color: isDark ? "#ffffff" : "#000000" }} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <RoadmapItemForm formData={form} setFormData={set} isDark={isDark} labelStyle={labelStyle} inputStyle={inputStyle} isReadOnly={false} />
        </div>

        {/* Footer */}
        <div className="px-6 py-5 space-y-3"
          style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)" }}>
          <button onClick={handleSave} disabled={saving || !form.title.trim()}
            className="w-full h-10 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #6d28d9)`, opacity: saving || !form.title.trim() ? 0.6 : 1 }}>
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Item"}
          </button>

          {isEdit && (
            <button onClick={handleDelete} disabled={deleting}
              className="w-full h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              style={{
                background: confirmDelete ? "rgba(239,68,68,0.15)" : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                border: confirmDelete ? "1px solid rgba(239,68,68,0.40)" : isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
                color: confirmDelete ? "#ef4444" : isDark ? "#ffffff" : "#000000",
              }}>
              <Trash2 className="w-4 h-4" />
              {deleting ? "Deleting…" : confirmDelete ? "Confirm Delete" : "Delete Item"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}