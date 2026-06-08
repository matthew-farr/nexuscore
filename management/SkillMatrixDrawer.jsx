import { useState } from "react";
import { X } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { base44 } from "@/api/base44Client";
import { SKILL_CATEGORIES, RATING_SCALE, STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/lib/skillsMatrixConfig";

const ACCENT = "#8b5cf6";

export default function SkillMatrixDrawer({ record, isOpen, onClose, onSaved }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [formData, setFormData] = useState(record || {
    skill_category: "",
    skill_name: "",
    rating: 3,
    target_rating: 3,
    status: "Not Started",
    priority: "Medium",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (record?.id) {
        await base44.entities.SkillMatrixRecord.update(record.id, formData);
      } else {
        await base44.entities.SkillMatrixRecord.create(formData);
      }
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md rounded-l-2xl overflow-hidden flex flex-col"
        style={{
          background: isDark
            ? "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(10,15,35,0.85) 100%)"
            : "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,246,255,0.95) 100%)",
          boxShadow: isDark
            ? "0 20px 60px rgba(0,0,0,0.50)"
            : "0 20px 60px rgba(0,0,0,0.12)",
        }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{
          borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)",
        }}>
          <h2 className="text-lg font-bold" style={{ color: isDark ? "#ffffff" : "#000000" }}>
            {record ? "Edit Skill" : "Add Skill"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-foreground/[0.08] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              Category
            </label>
            <select
              value={formData.skill_category || ""}
              onChange={(e) => setFormData({ ...formData, skill_category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
                color: isDark ? "#ffffff" : "#000000",
              }}>
              <option value="">Select Category</option>
              {SKILL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Skill Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              Skill Name
            </label>
            <input
              type="text"
              value={formData.skill_name || ""}
              onChange={(e) => setFormData({ ...formData, skill_name: e.target.value })}
              placeholder="e.g., DBS Application Process"
              className="w-full px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
                color: isDark ? "#ffffff" : "#000000",
              }}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              Current Rating
            </label>
            <select
              value={formData.rating || 3}
              onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
                color: isDark ? "#ffffff" : "#000000",
              }}>
              {Object.entries(RATING_SCALE).map(([rating, config]) => (
                <option key={rating} value={rating}>{rating} - {config.label}</option>
              ))}
            </select>
          </div>

          {/* Target Rating */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              Target Rating
            </label>
            <select
              value={formData.target_rating || 3}
              onChange={(e) => setFormData({ ...formData, target_rating: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
                color: isDark ? "#ffffff" : "#000000",
              }}>
              {Object.entries(RATING_SCALE).map(([rating, config]) => (
                <option key={rating} value={rating}>{rating} - {config.label}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              Priority
            </label>
            <select
              value={formData.priority || "Medium"}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
                color: isDark ? "#ffffff" : "#000000",
              }}>
              {PRIORITY_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Manager Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              Manager Notes
            </label>
            <textarea
              value={formData.manager_notes || ""}
              onChange={(e) => setFormData({ ...formData, manager_notes: e.target.value })}
              placeholder="Add assessment notes..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium resize-none"
              style={{
                background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
                color: isDark ? "#ffffff" : "#000000",
              }}
            />
          </div>

          {/* Development Action */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              Development Action
            </label>
            <textarea
              value={formData.development_action || ""}
              onChange={(e) => setFormData({ ...formData, development_action: e.target.value })}
              placeholder="Planned development action..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium resize-none"
              style={{
                background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
                color: isDark ? "#ffffff" : "#000000",
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t" style={{
          borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)",
        }}>
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
              color: isDark ? "#ffffff" : "#000000",
              border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
            }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
            style={{
              background: ACCENT,
              boxShadow: `0 4px 12px ${ACCENT}40`,
              opacity: saving ? 0.7 : 1,
            }}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}