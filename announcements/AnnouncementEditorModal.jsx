import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { X } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { createAnnouncement, updateAnnouncement } from "../../services/announcementService";
import { base44 } from "../../api/base44Client";

export default function AnnouncementEditorModal({ announcement, onClose, onSave, userProfile }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isEditing = !!announcement;

  const [formData, setFormData] = useState({
    title: announcement?.title || "",
    excerpt: announcement?.excerpt || "",
    body: announcement?.body || "",
    category: announcement?.category || "company_update",
    status: announcement?.status || "draft",
    priority: announcement?.priority || "medium",
    cover_image_url: announcement?.cover_image_url || "",
    publish_datetime: announcement?.publish_datetime || "",
    expiry_datetime: announcement?.expiry_datetime || "",
    requires_acknowledgement: announcement?.requires_acknowledgement || false,
    visibility_roles: announcement?.visibility_roles || [],
    visibility_departments: announcement?.visibility_departments || [],
    is_pinned: announcement?.is_pinned || false,
    is_active: announcement?.is_active !== false,
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const roleOptions = ["Admin", "Staff"];
  const departmentOptions = ["Operations", "Sales", "Compliance", "Marketing", "Learning", "Innovation"];

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.body.trim()) newErrors.body = "Body is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const data = {
        ...formData,
        author_user_id: userProfile?.id,
        author_name: userProfile?.full_name || "System",
      };

      let result;
      if (isEditing) {
        result = await updateAnnouncement(announcement.id, data);
      } else {
        result = await createAnnouncement(data);
      }

      if (result) {
        await base44.functions.invoke("logAnnouncementActivity", {
          action: isEditing ? "updated" : "created",
          announcement: result,
        });
        onSave();
      }
    } catch (err) {
      console.error("Error saving announcement:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRoleToggle = (role) => {
    setFormData((prev) => ({
      ...prev,
      visibility_roles: prev.visibility_roles.includes(role)
        ? prev.visibility_roles.filter((r) => r !== role)
        : [...prev.visibility_roles, role],
    }));
  };

  const handleDeptToggle = (dept) => {
    setFormData((prev) => ({
      ...prev,
      visibility_departments: prev.visibility_departments.includes(dept)
        ? prev.visibility_departments.filter((d) => d !== dept)
        : [...prev.visibility_departments, dept],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div
        className="rounded-xl p-6 max-w-2xl w-full my-8"
        style={{
          background: isDark ? "rgba(20, 30, 60, 0.95)" : "rgba(255,255,255,0.95)",
          border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-bold"
            style={{ color: isDark ? "rgba(255,255,255,0.95)" : "hsl(230 25% 12%)" }}
          >
            {isEditing ? "Edit Announcement" : "Create Announcement"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
            >
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                border: errors.title ? "1px solid #ef4444" : isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
              }}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Excerpt */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
            >
              Excerpt (for preview)
            </label>
            <input
              type="text"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              maxLength={200}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
              }}
            />
            <p className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}>
              {formData.excerpt.length}/200
            </p>
          </div>

          {/* Body */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
            >
              Body (Markdown supported) *
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm h-32 font-mono text-xs"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                border: errors.body ? "1px solid #ef4444" : isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
              }}
            />
            {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body}</p>}
          </div>

          {/* Cover image */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
            >
              Cover Image URL
            </label>
            <input
              type="url"
              value={formData.cover_image_url}
              onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
              }}
            />
          </div>

          {/* Category, Priority, Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
              >
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                  color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
                }}
              >
                <option value="company_update">Company Update</option>
                <option value="operations">Operations</option>
                <option value="sales">Sales</option>
                <option value="training">Training</option>
                <option value="compliance">Compliance</option>
                <option value="system">System</option>
                <option value="product">Product</option>
                <option value="people">People</option>
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
              >
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                  color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
              >
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                  color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
                }}
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Publish & Expiry dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
              >
                Publish DateTime (leave blank for now)
              </label>
              <input
                type="datetime-local"
                value={formData.publish_datetime ? formData.publish_datetime.slice(0, 16) : ""}
                onChange={(e) => {
                  const val = e.target.value ? new Date(e.target.value).toISOString() : "";
                  setFormData({ ...formData, publish_datetime: val });
                }}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                  color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
              >
                Expiry DateTime (optional)
              </label>
              <input
                type="datetime-local"
                value={formData.expiry_datetime ? formData.expiry_datetime.slice(0, 16) : ""}
                onChange={(e) => {
                  const val = e.target.value ? new Date(e.target.value).toISOString() : "";
                  setFormData({ ...formData, expiry_datetime: val });
                }}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                  color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
                }}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="pinned"
                checked={formData.is_pinned}
                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="pinned" style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}>
                Pin announcement (appears first)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="acknowledgement"
                checked={formData.requires_acknowledgement}
                onChange={(e) => setFormData({ ...formData, requires_acknowledgement: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="acknowledgement" style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}>
                Require acknowledgement
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="active" style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}>
                Active
              </label>
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label
              className="block text-sm font-semibold mb-3"
              style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
            >
              Visible to Roles (empty = all)
            </label>
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleToggle(role)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: formData.visibility_roles.includes(role)
                      ? "hsl(320 85% 55%)"
                      : isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
                    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                    color: formData.visibility_roles.includes(role)
                      ? "white"
                      : isDark
                      ? "rgba(255,255,255,0.70)"
                      : "hsl(230 25% 20%)",
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-3"
              style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
            >
              Visible to Departments (empty = all)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {departmentOptions.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => handleDeptToggle(dept)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all text-left"
                  style={{
                    background: formData.visibility_departments.includes(dept)
                      ? "hsl(195 90% 50%)"
                      : isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
                    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                    color: formData.visibility_departments.includes(dept)
                      ? "white"
                      : isDark
                      ? "rgba(255,255,255,0.70)"
                      : "hsl(230 25% 20%)",
                  }}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            className="pt-4 border-t flex gap-3"
            style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                color: isDark ? "rgba(255,255,255,0.70)" : "hsl(230 25% 20%)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-all"
              style={{
                background: saving ? "rgba(236, 44, 163, 0.5)" : "hsl(320 85% 55%)",
              }}
            >
              {saving ? "Saving..." : isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}