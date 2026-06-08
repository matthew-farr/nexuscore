import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";
import { useTheme } from "../../ThemeProvider";
import { base44 } from "@/api/base44Client";

const ACCENT = "#8b5cf6";
const STATUSES = ["Planned", "In Progress", "Testing", "Launched", "Completed", "Delayed"];

export default function AddRoadmapItemModal({ roadmapType, nextOrder, onClose, onSaved }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", status: "Planned",
    owner: "", target_date: "", progress_percentage: 0,
    roadmap_order: nextOrder, notes: "", roadmap_type: roadmapType,
  });

  const drawerBg = isDark ? "linear-gradient(145deg, #0d1128 0%, #090d1e 100%)" : "#ffffff";
  const border = isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.08)";
  const textColor = isDark ? "#ffffff" : "#000000";
  const labelColor = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const inputBorder = isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.10)";
  const inputStyle = { background: inputBg, border: inputBorder, color: textColor, borderRadius: "10px", padding: "8px 12px", fontSize: "13px", width: "100%", outline: "none" };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await base44.entities.RoadmapItem.create(form);
    setSaving(false);
    onSaved?.();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50"
        style={{ background: isDark ? "rgba(5,6,20,0.85)" : "rgba(0,0,0,0.45)" }}
      />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{ width: "min(480px, 92vw)", background: drawerBg, borderLeft: border, boxShadow: isDark ? "-24px 0 80px rgba(0,0,0,0.60)" : "-12px 0 40px rgba(0,0,0,0.12)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0" style={{ borderBottom: border }}>
          <div>
            <p className="text-sm font-bold" style={{ color: textColor }}>Add Roadmap Item</p>
            <p className="text-[10px]" style={{ color: labelColor }}>{roadmapType}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", border }}>
            <X className="w-4 h-4" style={{ color: textColor }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {[
            { label: "Title *", field: "title", type: "text" },
          ].map(({ label, field, type }) => (
            <div key={field}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: labelColor }}>{label}</p>
              <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} style={inputStyle} />
            </div>
          ))}

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: labelColor }}>Description</p>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: labelColor }}>Status</p>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: labelColor }}>Progress %</p>
              <input type="number" min="0" max="100" value={form.progress_percentage} onChange={e => setForm(f => ({ ...f, progress_percentage: Number(e.target.value) }))} style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: labelColor }}>Owner</p>
              <input type="text" value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: labelColor }}>Target Date</p>
              <input type="date" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} style={inputStyle} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: labelColor }}>Road Order</p>
            <input type="number" value={form.roadmap_order} onChange={e => setForm(f => ({ ...f, roadmap_order: Number(e.target.value) }))} style={inputStyle} />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: labelColor }}>Notes</p>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: border }}>
          <button onClick={onClose} className="flex-1 h-9 rounded-xl text-xs font-semibold"
            style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", color: textColor, border: inputBorder }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !form.title.trim()} className="flex-1 h-9 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #6d28d9)`, boxShadow: `0 4px 16px ${ACCENT}40`, opacity: !form.title.trim() ? 0.5 : 1 }}>
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving…" : "Add Item"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}