import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { toast } from "sonner";
import { ExternalLink, Bell, BarChart2, Zap, Link } from "lucide-react";
import HubAdminListItem from "./HubAdminListItem";
import HubAdminModal from "./HubAdminModal";
import { HubAdminField, HubAdminInput, HubAdminSelect, HubAdminToggle } from "./HubAdminField";

const COLOUR_OPTIONS = ["cyan", "purple", "pink", "green", "amber", "red", "blue", "orange", "yellow", "emerald"];
const COLOUR_MAP = { cyan: "#06b6d4", purple: "#8b5cf6", pink: "#ec2ca3", green: "#10b981", amber: "#f59e0b", red: "#ef4444", blue: "#0ea5e9" };
const ICON_OPTIONS = ["Globe", "BarChart2", "BookOpen", "UserPlus", "Shield", "CheckSquare", "Zap", "CreditCard", "ScanLine", "Link", "ExternalLink", "Settings", "Home", "Search", "Users", "FileText", "Calendar", "Mail", "Bell", "Star", "Award", "Clipboard"];
const NOTIFICATION_TYPES = ["Info", "Warning", "Success", "Alert", "Update"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];
const EMBED_TYPES = ["Power BI", "HubSpot", "Looker Studio", "Custom iframe"];
const WIDGET_TYPES = ["Calendar", "Notifications", "Top Performers", "Upcoming Events", "KPI Snapshot", "Custom Link List", "Custom Text Card"];
const ENABLEMENT_TYPES = ["PDF", "Guide", "Playbook", "Video", "Template", "External Link"];

const CONTENT_TYPE_CONFIG = {
  quick_link: {
    label: "Quick Links",
    addLabel: "+ Add Link",
    icon: Link,
    emptyText: "No quick links yet",
    emptyHint: "Add links to external tools",
  },
  tool: {
    label: "Tools",
    addLabel: "+ Add Tool",
    icon: Zap,
    emptyText: "No tools yet",
    emptyHint: "Add internal tools and calculators",
  },
  widget: {
    label: "Sidebar Widgets",
    addLabel: "+ Add Widget",
    icon: BarChart2,
    emptyText: "No widgets yet",
    emptyHint: "Add widgets to the sidebar",
  },
  notification: {
    label: "Notifications",
    addLabel: "+ Add Notification",
    icon: Bell,
    emptyText: "No notifications yet",
    emptyHint: "Add banners and alerts for hub users",
  },
  dashboard: {
    label: "Dashboard Embeds",
    addLabel: "+ Add Dashboard",
    icon: BarChart2,
    emptyText: "No dashboards configured",
    emptyHint: "Add a Power BI, HubSpot or custom iframe embed",
  },
  enablement: {
    label: "Enablement Resources",
    addLabel: "+ Add Resource",
    icon: BookOpen,
    emptyText: "No resources yet",
    emptyHint: "Add playbooks, guides and templates",
  },
};

function BookOpen(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}

const BLANK_FORM = {
  title: "", description: "", url: "", icon: "Globe",
  colour_theme: "cyan", sort_order: 0, is_active: true,
  open_in_new_tab: true, badge_text: "", category: "",
  notification_type: "Info", priority: "Medium",
  start_date: "", end_date: "",
  embed_url: "", embed_type: "Power BI", height: 460,
  widget_type: "Calendar",
  content_subtype: "Guide", file_url: "",
  logo_url: "", logo_light_url: "", logo_dark_url: "", use_logo: false,
};

/**
 * Generic hub content manager — works for quick_link, tool, widget, notification, dashboard, enablement.
 * Props: hubKey, hubName, contentType, onDataChange
 */
export default function HubContentManager({ hubKey, hubName, contentType, onDataChange }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);

  const cfg = CONTENT_TYPE_CONFIG[contentType] || CONTENT_TYPE_CONFIG.quick_link;

  useEffect(() => { loadItems(); }, [hubKey, contentType]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.HubContentItem.filter({ hub_key: hubKey, content_type: contentType }, "sort_order", 100);
      setItems(data || []);
    } catch (err) {
      console.error(`Failed to load ${contentType}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = (e) => {
    e.preventDefault(); e.stopPropagation();
    setEditingItem(null);
    setForm({ ...BLANK_FORM, sort_order: items.length + 1 });
    setShowModal(true);
  };

  const openEdit = (e, item) => {
    e.preventDefault(); e.stopPropagation();
    setEditingItem(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      url: item.url || "",
      icon: item.icon || "Globe",
      colour_theme: item.colour_theme || "cyan",
      sort_order: item.sort_order ?? 0,
      is_active: item.is_active !== false,
      open_in_new_tab: item.open_in_new_tab !== false,
      badge_text: item.badge_text || "",
      category: item.category || "",
      logo_url: item.logo_url || "",
      logo_light_url: item.logo_light_url || "",
      logo_dark_url: item.logo_dark_url || "",
      use_logo: item.use_logo || false,
      notification_type: item.notification_type || "Info",
      priority: item.priority || "Medium",
      start_date: item.start_date || "",
      end_date: item.end_date || "",
      embed_url: item.embed_url || "",
      embed_type: item.embed_type || "Power BI",
      height: item.height || 460,
      widget_type: item.widget_type || "Calendar",
      content_subtype: item.content_subtype || "Guide",
      file_url: item.file_url || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    if (contentType === "quick_link" && !form.url) { toast.error("URL is required"); return; }
    if (contentType === "dashboard" && !form.embed_url) { toast.error("Embed URL is required"); return; }
    try {
      const payload = { ...form, hub_key: hubKey, content_type: contentType };
      if (editingItem) {
        await base44.entities.HubContentItem.update(editingItem.id, payload);
        toast.success(`"${form.title}" updated`);
      } else {
        await base44.entities.HubContentItem.create(payload);
        toast.success(`"${form.title}" created`);
      }
      setShowModal(false);
      await loadItems();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to save");
    }
  };

  const handleToggle = async (e, item) => {
    e.preventDefault(); e.stopPropagation();
    try {
      await base44.entities.HubContentItem.update(item.id, { is_active: !item.is_active });
      toast.success(`"${item.title}" ${item.is_active ? "hidden" : "shown"}`);
      await loadItems();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to update visibility");
    }
  };

  const handleDelete = async (e, item) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await base44.entities.HubContentItem.delete(item.id);
      toast.success("Deleted");
      await loadItems();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const getSubtitle = (item) => {
    if (contentType === "quick_link" || contentType === "tool") return item.url || item.route || `sort: ${item.sort_order}`;
    if (contentType === "notification") return `${item.notification_type} · ${item.priority}`;
    if (contentType === "dashboard") return `${item.embed_type} · ${item.height}px`;
    if (contentType === "widget") return `${item.widget_type} · sort: ${item.sort_order}`;
    if (contentType === "enablement") return `${item.content_subtype} · sort: ${item.sort_order}`;
    return `sort: ${item.sort_order}`;
  };

  const IconComp = cfg.icon;
  const colour = (item) => COLOUR_MAP[item.colour_theme] || COLOUR_MAP.cyan;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 15%)" }}>
            {hubName} · {cfg.label}
          </h3>
          <p className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.55)" }}>
            {items.length} items configured
          </p>
        </div>
        <button type="button" onClick={openCreate} style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, background: "#ec2ca3", color: "#ffffff", border: "none", cursor: "pointer" }}>
          {cfg.addLabel}
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: isDark ? "1px dashed rgba(255,255,255,0.10)" : "1px dashed rgba(0,0,0,0.10)" }}>
          <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }}>{cfg.emptyText}</p>
          <p style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)" }}>{cfg.emptyHint}</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, i) => {
            const c = colour(item);
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }}>
                <HubAdminListItem
                  title={item.title}
                  subtitle={getSubtitle(item)}
                  badge={item.badge_text || null}
                  badgeColour={c}
                  isActive={item.is_active}
                  leftSlot={
                    <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: `${c}20`, border: `1px solid ${c}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <IconComp style={{ width: "13px", height: "13px", color: c }} />
                    </div>
                  }
                  rightExtra={item.url ? (
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(item.url, "_blank", "noopener,noreferrer"); }} style={{ width: "30px", height: "30px", borderRadius: "6px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>
                      <ExternalLink style={{ width: "13px", height: "13px" }} />
                    </button>
                  ) : null}
                  onToggle={(e) => handleToggle(e, item)}
                  onEdit={(e) => openEdit(e, item)}
                  onDelete={(e) => handleDelete(e, item)}
                />
              </motion.div>
            );
          })}
        </div>
      )}

      <HubAdminModal open={showModal} onClose={() => setShowModal(false)} title={editingItem ? `Edit ${cfg.label.slice(0, -1)}` : `Add ${cfg.label.slice(0, -1)}`} onSubmit={handleSubmit} submitLabel={editingItem ? "Update" : "Create"}>
        <HubAdminField label="Title" required>
          <HubAdminInput value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Display title" />
        </HubAdminField>
        <HubAdminField label="Description">
          <HubAdminInput value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" />
        </HubAdminField>

        {(contentType === "quick_link" || contentType === "tool" || contentType === "enablement") && (
          <HubAdminField label="URL" required={contentType === "quick_link"}>
            <HubAdminInput value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
          </HubAdminField>
        )}

        {contentType === "quick_link" && (
          <div style={{ padding: "10px 12px", borderRadius: "8px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
              Logo (optional — overrides icon when enabled)
            </p>
            <HubAdminField label="Logo URL (universal)">
              <HubAdminInput value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} placeholder="https://... (PNG, SVG, WebP)" />
            </HubAdminField>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" }}>
              <HubAdminField label="Logo for Light Mode">
                <HubAdminInput value={form.logo_light_url} onChange={e => setForm({ ...form, logo_light_url: e.target.value })} placeholder="Optional light version" />
              </HubAdminField>
              <HubAdminField label="Logo for Dark Mode">
                <HubAdminInput value={form.logo_dark_url} onChange={e => setForm({ ...form, logo_dark_url: e.target.value })} placeholder="Optional dark version" />
              </HubAdminField>
            </div>
            <div style={{ marginTop: "8px" }}>
              <HubAdminToggle label="Use logo instead of icon" checked={form.use_logo} onChange={e => setForm({ ...form, use_logo: e.target.checked })} />
            </div>
            {form.logo_url && (
              <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}>Preview:</span>
                <img src={form.logo_url} alt="Logo preview" style={{ height: "32px", maxWidth: "80px", objectFit: "contain", borderRadius: "6px", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)", padding: "4px" }} />
              </div>
            )}
          </div>
        )}

        {contentType === "dashboard" && (
          <>
            <HubAdminField label="Embed Type">
              <HubAdminSelect value={form.embed_type} onChange={e => setForm({ ...form, embed_type: e.target.value })} options={EMBED_TYPES} />
            </HubAdminField>
            <HubAdminField label="Embed URL" required>
              <HubAdminInput value={form.embed_url} onChange={e => setForm({ ...form, embed_url: e.target.value })} placeholder="https://app.powerbi.com/view?r=..." />
            </HubAdminField>
            <HubAdminField label="Height (px)">
              <HubAdminInput type="number" min="200" step="10" value={form.height} onChange={e => setForm({ ...form, height: parseInt(e.target.value) || 460 })} />
            </HubAdminField>
          </>
        )}

        {contentType === "widget" && (
          <HubAdminField label="Widget Type">
            <HubAdminSelect value={form.widget_type} onChange={e => setForm({ ...form, widget_type: e.target.value })} options={WIDGET_TYPES} />
          </HubAdminField>
        )}

        {contentType === "notification" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <HubAdminField label="Notification Type">
              <HubAdminSelect value={form.notification_type} onChange={e => setForm({ ...form, notification_type: e.target.value })} options={NOTIFICATION_TYPES} />
            </HubAdminField>
            <HubAdminField label="Priority">
              <HubAdminSelect value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} options={PRIORITY_OPTIONS} />
            </HubAdminField>
          </div>
        )}

        {contentType === "enablement" && (
          <HubAdminField label="Content Type">
            <HubAdminSelect value={form.content_subtype} onChange={e => setForm({ ...form, content_subtype: e.target.value })} options={ENABLEMENT_TYPES} />
          </HubAdminField>
        )}

        {contentType !== "notification" && contentType !== "dashboard" && contentType !== "widget" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <HubAdminField label="Icon">
              <HubAdminSelect value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} options={ICON_OPTIONS} />
            </HubAdminField>
            <HubAdminField label="Colour">
              <HubAdminSelect value={form.colour_theme} onChange={e => setForm({ ...form, colour_theme: e.target.value })} options={COLOUR_OPTIONS} />
            </HubAdminField>
            <HubAdminField label="Sort Order">
              <HubAdminInput type="number" min="0" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
            </HubAdminField>
          </div>
        )}

        {(contentType === "widget" || contentType === "notification") && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <HubAdminField label="Colour Theme">
              <HubAdminSelect value={form.colour_theme} onChange={e => setForm({ ...form, colour_theme: e.target.value })} options={COLOUR_OPTIONS} />
            </HubAdminField>
            <HubAdminField label="Sort Order">
              <HubAdminInput type="number" min="0" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
            </HubAdminField>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <HubAdminField label="Category">
            <HubAdminInput value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. CRM, Calculators" />
          </HubAdminField>
          <HubAdminField label="Badge Text">
            <HubAdminInput value={form.badge_text} onChange={e => setForm({ ...form, badge_text: e.target.value })} placeholder="e.g. New" />
          </HubAdminField>
        </div>

        {/* Permissions */}
        <div style={{ padding: "10px 12px", borderRadius: "8px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
            Visibility (leave blank = all roles)
          </p>
          <HubAdminField label="Role Visibility (comma-separated)">
            <HubAdminInput
              value={(form.role_visibility || []).join(", ")}
              onChange={e => setForm({ ...form, role_visibility: e.target.value.split(",").map(r => r.trim()).filter(Boolean) })}
              placeholder="e.g. admin, manager"
            />
          </HubAdminField>
        </div>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <HubAdminToggle label="Active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
          {(contentType === "quick_link" || contentType === "tool") && (
            <HubAdminToggle label="Open in new tab" checked={form.open_in_new_tab} onChange={e => setForm({ ...form, open_in_new_tab: e.target.checked })} />
          )}
        </div>
      </HubAdminModal>
    </div>
  );
}