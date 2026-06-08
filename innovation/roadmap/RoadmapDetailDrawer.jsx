import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Trash2, CheckCircle, AlertTriangle, FlaskConical, Rocket, Clock, Zap, Calendar, User, BarChart2, StickyNote } from "lucide-react";
import { useTheme } from "../../ThemeProvider";
import { base44 } from "@/api/base44Client";

const ACCENT = "#8b5cf6";

const STATUS_CONFIG = {
  Completed:    { color: "#10b981", icon: CheckCircle },
  "In Progress":{ color: "#8b5cf6", icon: Zap },
  Testing:      { color: "#06b6d4", icon: FlaskConical },
  Launched:     { color: "#22c55e", icon: Rocket },
  Planned:      { color: "#475569", icon: Clock },
  Delayed:      { color: "#f59e0b", icon: AlertTriangle },
};

const STATUSES = ["Planned", "In Progress", "Testing", "Launched", "Completed", "Delayed"];

export default function RoadmapDetailDrawer({ item, isAdmin, onClose, onSave, onDelete }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...item });
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm({ ...item }); setEditing(false); }, [item]);

  const cfg = STATUS_CONFIG[form.status] || STATUS_CONFIG.Planned;
  const Icon = cfg.icon;

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.RoadmapItem.update(item.id, form);
    setSaving(false);
    setEditing(false);
    onSave?.();
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this roadmap item?")) return;
    await base44.entities.RoadmapItem.delete(item.id);
    onDelete?.();
    onClose();
  };

  const overlay = isDark ? "rgba(5,6,20,0.85)" : "rgba(0,0,0,0.45)";
  const drawerBg = isDark ? "linear-gradient(145deg, #0d1128 0%, #090d1e 100%)" : "#ffffff";
  const border = isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.08)";
  const labelColor = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)";
  const textColor = isDark ? "#ffffff" : "#000000";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const inputBorder = isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.10)";
  const inputStyle = { background: inputBg, border: inputBorder, color: textColor, borderRadius: "10px", padding: "8px 12px", fontSize: "13px", width: "100%", outline: "none" };

  return (
    <AnimatePresence>
      <motion.div
        key="drawer-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50"
        style={{ background: overlay }}
      />
      <motion.div
        key="drawer-panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{ width: "min(520px, 92vw)", background: drawerBg, borderLeft: border, boxShadow: isDark ? "-24px 0 80px rgba(0,0,0,0.60)" : "-12px 0 40px rgba(0,0,0,0.12)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: border }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}35`, boxShadow: `0 0 12px ${cfg.color}30` }}>
              <Icon className="w-4 h-4" style={{ color: cfg.color }} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: cfg.color }}>{form.status}</p>
              <p className="text-[10px]" style={{ color: labelColor }}>Roadmap Item</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && !editing && (
              <button onClick={() => setEditing(true)} className="px-3 h-8 rounded-lg text-xs font-semibold"
                style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
                Edit
              </button>
            )}
            {isAdmin && (
              <button onClick={handleDelete} className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <Trash2 className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", border }}>
              <X className="w-4 h-4" style={{ color: textColor }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Title */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: labelColor }}>Title</p>
            {editing ? (
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
            ) : (
              <h2 className="text-lg font-bold" style={{ color: textColor }}>{form.title}</h2>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: labelColor }}>Description</p>
            {editing ? (
              <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.70)" }}>
                {form.description || "No description."}
              </p>
            )}
          </div>

          {/* Status + Progress */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: labelColor }}>Status</p>
              {editing ? (
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  style={{ ...inputStyle, cursor: "pointer" }}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              ) : (
                <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                  {form.status}
                </span>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: labelColor }}>Progress</p>
              {editing ? (
                <input type="number" min="0" max="100" value={form.progress_percentage || 0}
                  onChange={e => setForm(f => ({ ...f, progress_percentage: Number(e.target.value) }))}
                  style={inputStyle} />
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl font-bold" style={{ color: cfg.color }}>{form.progress_percentage || 0}%</span>
                  </div>
                  <div className="rounded-full overflow-hidden" style={{ height: 6, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
                    <div className="h-full rounded-full" style={{ width: `${form.progress_percentage || 0}%`, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}aa)`, boxShadow: `0 0 8px ${cfg.color}50` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Owner + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1" style={{ color: labelColor }}>
                <User className="w-3 h-3" /> Owner
              </p>
              {editing ? (
                <input value={form.owner || ""} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} style={inputStyle} />
              ) : (
                <p className="text-sm font-semibold" style={{ color: textColor }}>{form.owner || "—"}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1" style={{ color: labelColor }}>
                <Calendar className="w-3 h-3" /> Target Date
              </p>
              {editing ? (
                <input type="date" value={form.target_date || ""} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} style={inputStyle} />
              ) : (
                <p className="text-sm font-semibold" style={{ color: textColor }}>
                  {form.target_date ? new Date(form.target_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </p>
              )}
            </div>
          </div>

          {/* Order (admin edit) */}
          {editing && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: labelColor }}>Road Order</p>
              <input type="number" value={form.roadmap_order || 0} onChange={e => setForm(f => ({ ...f, roadmap_order: Number(e.target.value) }))} style={inputStyle} />
            </div>
          )}

          {/* Notes */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1" style={{ color: labelColor }}>
              <StickyNote className="w-3 h-3" /> Notes
            </p>
            {editing ? (
              <textarea value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)" }}>
                {form.notes || "No notes."}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        {editing && (
          <div className="flex items-center gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: border }}>
            <button onClick={() => setEditing(false)} className="flex-1 h-9 rounded-xl text-xs font-semibold"
              style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", color: textColor, border: inputBorder }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 h-9 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #6d28d9)`, boxShadow: `0 4px 16px ${ACCENT}40` }}>
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}