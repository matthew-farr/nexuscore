import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { X, AlertCircle } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { eventTypeConfig } from "../../lib/eventTypeConfig";
import { createCalendarEvent, updateCalendarEvent } from "../../services/calendarService";
import { base44 } from "../../api/base44Client";

export default function EventFormModal({ event, onClose, onSave, userProfile }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isEditing = !!event;

  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    event_type: event?.event_type || "meeting",
    start_datetime: event?.start_datetime || new Date().toISOString(),
    end_datetime: event?.end_datetime || new Date().toISOString(),
    all_day: event?.all_day || false,
    location: event?.location || "",
    visibility_roles: event?.visibility_roles || [],
    visibility_departments: event?.visibility_departments || [],
    reminder_minutes: event?.reminder_minutes || 0,
    is_active: event?.is_active !== false,
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const roleOptions = ["Admin", "Staff", "Manager"];
  const departmentOptions = ["Operations", "Sales", "Compliance", "Marketing", "Learning", "Innovation"];

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.start_datetime) newErrors.start_datetime = "Start date is required";
    if (!formData.end_datetime) newErrors.end_datetime = "End date is required";
    if (new Date(formData.start_datetime) > new Date(formData.end_datetime)) {
      newErrors.end_datetime = "End time must be after start time";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      let result;
      if (isEditing) {
        result = await updateCalendarEvent(event.id, formData);
      } else {
        result = await createCalendarEvent(formData);
      }

      if (result) {
        // Log activity
        await base44.functions.invoke("logCalendarActivity", {
          action: isEditing ? "update" : "create",
          event: result,
        });
        onSave(result);
      }
    } catch (err) {
      console.error("Error saving event:", err);
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

  const config = eventTypeConfig[formData.event_type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div
        className="rounded-xl p-6 max-w-2xl w-full my-8"
        style={{
          background: isDark ? "rgba(20, 30, 60, 0.95)" : "rgba(255,255,255,0.95)",
          border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-bold"
            style={{ color: isDark ? "rgba(255,255,255,0.95)" : "hsl(230 25% 12%)" }}
          >
            {isEditing ? "Edit Event" : "Create Event"}
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

          {/* Description */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
            >
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm h-20"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
              }}
            />
          </div>

          {/* Event Type */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
            >
              Event Type *
            </label>
            <select
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
              }}
            >
              {Object.entries(eventTypeConfig).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="all_day"
              checked={formData.all_day}
              onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="all_day" style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}>
              All day event
            </label>
          </div>

          {/* Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
              >
                Start {formData.all_day ? "(Date)" : "(Date & Time)"} *
              </label>
              <input
                type={formData.all_day ? "date" : "datetime-local"}
                value={formData.all_day ? format(parseISO(formData.start_datetime), "yyyy-MM-dd") : formData.start_datetime.slice(0, 16)}
                onChange={(e) => {
                  const val = formData.all_day
                    ? new Date(e.target.value + "T00:00:00Z").toISOString()
                    : new Date(e.target.value).toISOString();
                  setFormData({ ...formData, start_datetime: val });
                }}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  border: errors.start_datetime ? "1px solid #ef4444" : isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                  color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
                }}
              />
              {errors.start_datetime && <p className="text-xs text-red-500 mt-1">{errors.start_datetime}</p>}
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
              >
                End {formData.all_day ? "(Date)" : "(Date & Time)"} *
              </label>
              <input
                type={formData.all_day ? "date" : "datetime-local"}
                value={formData.all_day ? format(parseISO(formData.end_datetime), "yyyy-MM-dd") : formData.end_datetime.slice(0, 16)}
                onChange={(e) => {
                  const val = formData.all_day
                    ? new Date(e.target.value + "T23:59:59Z").toISOString()
                    : new Date(e.target.value).toISOString();
                  setFormData({ ...formData, end_datetime: val });
                }}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  border: errors.end_datetime ? "1px solid #ef4444" : isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                  color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
                }}
              />
              {errors.end_datetime && <p className="text-xs text-red-500 mt-1">{errors.end_datetime}</p>}
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
            >
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Conference Room A, Virtual, etc."
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
              }}
            />
          </div>

          {/* Reminder */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}
            >
              Reminder (minutes before)
            </label>
            <select
              value={formData.reminder_minutes}
              onChange={(e) => setFormData({ ...formData, reminder_minutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)",
              }}
            >
              <option value="0">No reminder</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="1440">1 day</option>
            </select>
          </div>

          {/* Visibility - Roles */}
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

          {/* Visibility - Departments */}
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

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_active" style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}>
              Active
            </label>
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
              {saving ? "Saving..." : isEditing ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}