import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { toast } from "sonner";
import { AlertCircle, Info, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import HubAdminListItem from "../hub/HubAdminListItem";
import HubAdminModal from "../hub/HubAdminModal";
import { HubAdminField, HubAdminInput, HubAdminSelect, HubAdminToggle } from "../hub/HubAdminField";

const ACCENT = "#ec2ca3";

const BLANK_FORM = {
  title: "",
  message: "",
  notification_type: "Info",
  priority: "Medium",
  is_active: true,
  start_date: "",
  end_date: "",
  link_url: "",
};

const TYPE_ICONS = {
  Alert:   AlertCircle,
  Warning: AlertTriangle,
  Success: CheckCircle,
  Info:    Info,
  Update:  Clock,
};

const TYPE_COLOURS = {
  Alert:   "#ef4444",
  Warning: "#f59e0b",
  Success: "#10b981",
  Info:    "#0ea5e9",
  Update:  ACCENT,
};

export default function SalesHubNotificationsManager({ onDataChange }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const data = await base44.entities.SalesHubNotificationConfig.list("-created_date", 200);
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
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
      message: item.message || "",
      notification_type: item.notification_type || "Info",
      priority: item.priority || "Medium",
      is_active: item.is_active !== false,
      start_date: item.start_date ? item.start_date.slice(0, 16) : "",
      end_date: item.end_date ? item.end_date.slice(0, 16) : "",
      link_url: item.link_url || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.message) {
      toast.error("Title and message are required");
      return;
    }
    const payload = { ...form };
    if (!payload.start_date) delete payload.start_date;
    if (!payload.end_date) delete payload.end_date;
    if (!payload.link_url) delete payload.link_url;
    try {
      if (editingItem) {
        await base44.entities.SalesHubNotificationConfig.update(editingItem.id, payload);
        toast.success(`"${form.title}" updated`);
      } else {
        await base44.entities.SalesHubNotificationConfig.create(payload);
        toast.success(`Notification created`);
      }
      setShowModal(false);
      await loadAll();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to save notification");
    }
  };

  const handleToggle = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await base44.entities.SalesHubNotificationConfig.update(item.id, { is_active: !item.is_active });
      const action = item.is_active ? "hidden" : "shown";
      toast.success(`"${item.title}" ${action}`);
      await loadAll();
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
      await base44.entities.SalesHubNotificationConfig.delete(item.id);
      toast.success("Notification deleted");
      await loadAll();
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
            Notifications
          </h3>
          <p className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.55)" }}>
            {notifications.length} configured · shown in the Sales Hub sidebar
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
          + Add Notification
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
          Loading…
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: isDark ? "1px dashed rgba(255,255,255,0.10)" : "1px dashed rgba(0,0,0,0.10)" }}>
          <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }}>No notifications yet</p>
          <p style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)" }}>Create notifications to keep your sales team informed</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {notifications.map((notif, i) => {
            const Icon = TYPE_ICONS[notif.notification_type] || Clock;
            const colour = TYPE_COLOURS[notif.notification_type] || ACCENT;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
              >
                <HubAdminListItem
                  title={notif.title}
                  subtitle={`${notif.notification_type} · ${notif.priority}`}
                  badge={notif.is_active ? "Active" : "Hidden"}
                  badgeColour={notif.is_active ? "#10b981" : "#94a3b8"}
                  isActive={notif.is_active}
                  leftSlot={<Icon style={{ width: "16px", height: "16px", color: colour, flexShrink: 0 }} />}
                  onToggle={(e) => handleToggle(e, notif)}
                  onEdit={(e) => openEdit(e, notif)}
                  onDelete={(e) => handleDelete(e, notif)}
                />
              </motion.div>
            );
          })}
        </div>
      )}

      <HubAdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? "Edit Notification" : "Add Notification"}
        onSubmit={handleSubmit}
        submitLabel={editingItem ? "Update" : "Create"}
      >
        <HubAdminField label="Title" required>
          <HubAdminInput value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Notification title" />
        </HubAdminField>
        <HubAdminField label="Message" required>
          <HubAdminInput type="textarea" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Notification body text" />
        </HubAdminField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <HubAdminField label="Type">
            <HubAdminSelect
              value={form.notification_type}
              onChange={e => setForm({ ...form, notification_type: e.target.value })}
              options={["Info", "Warning", "Alert", "Success", "Update"]}
            />
          </HubAdminField>
          <HubAdminField label="Priority">
            <HubAdminSelect
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
              options={["Low", "Medium", "High", "Critical"]}
            />
          </HubAdminField>
        </div>
        <HubAdminField label="Link URL (optional)">
          <HubAdminInput value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." />
        </HubAdminField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <HubAdminField label="Start Date (optional)">
            <HubAdminInput type="datetime-local" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
          </HubAdminField>
          <HubAdminField label="End Date (optional)">
            <HubAdminInput type="datetime-local" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
          </HubAdminField>
        </div>
        <HubAdminToggle
          label="Active (show in Sales Hub)"
          checked={form.is_active}
          onChange={e => setForm({ ...form, is_active: e.target.checked })}
        />
      </HubAdminModal>
    </div>
  );
}