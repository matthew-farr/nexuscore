/**
 * WidgetConfigModal — configures a widget's settings, size, layout, and visibility.
 * Used inside TabContentManager when an admin edits a widget.
 */
import { useState } from "react";
import { WIDGET_REGISTRY, LAYOUT_OPTIONS, WIDGET_SIZES } from "@/lib/widgetRegistry";
import { useTheme } from "../ThemeProvider";
import { X, Settings, Eye, Shield } from "lucide-react";
import { HubAdminField, HubAdminInput, HubAdminSelect, HubAdminToggle } from "../admin/hub/HubAdminField";

const TABS = ["settings", "layout", "visibility"];

export default function WidgetConfigModal({ widget, onSave, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const def = WIDGET_REGISTRY[widget?.widget_type] || null;
  const existingConfig = widget?.config_json || {};

  const [activeTab, setActiveTab] = useState("settings");
  const [config, setConfig] = useState({ ...def?.defaultConfig, ...existingConfig });
  const [size, setSize] = useState(existingConfig.size || def?.defaultSize || "medium");
  const [title, setTitle] = useState(widget?.title || def?.label || "");
  const [isActive, setIsActive] = useState(widget?.is_active !== false);
  const [roleVisibility, setRoleVisibility] = useState((widget?.role_visibility || []).join(", "));

  const bg = isDark ? "#0d1117" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textMain = isDark ? "#ffffff" : "#0f172a";
  const textMuted = isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.50)";
  const tabActive = isDark ? "rgba(255,255,255,0.10)" : "#f0f9ff";

  const handleSave = () => {
    onSave({
      title,
      is_active: isActive,
      widget_type: widget?.widget_type,
      config_json: { ...config, size, widget_type: widget?.widget_type },
      role_visibility: roleVisibility ? roleVisibility.split(",").map(r => r.trim()).filter(Boolean) : [],
    });
  };

  const updateConfig = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: bg, borderRadius: "16px", width: "100%", maxWidth: "460px", maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.35)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: `1px solid ${cardBorder}` }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: textMain, margin: 0 }}>Configure Widget</h3>
            <p style={{ fontSize: "11px", color: textMuted, margin: "2px 0 0" }}>{def?.label || widget?.widget_type}</p>
          </div>
          <button onClick={onClose} style={{ width: "30px", height: "30px", borderRadius: "7px", border: `1px solid ${cardBorder}`, background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}>
            <X style={{ width: "15px", height: "15px" }} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", padding: "10px 20px 0", borderBottom: `1px solid ${cardBorder}` }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ padding: "6px 12px", borderRadius: "7px 7px 0 0", fontSize: "11px", fontWeight: 700, border: "none", background: activeTab === t ? tabActive : "none", color: activeTab === t ? textMain : textMuted, cursor: "pointer", textTransform: "capitalize", borderBottom: activeTab === t ? `2px solid #ec2ca3` : "2px solid transparent" }}
            >
              {t === "settings" && <Settings style={{ width: "11px", height: "11px", display: "inline", marginRight: "4px", verticalAlign: "middle" }} />}
              {t === "visibility" && <Eye style={{ width: "11px", height: "11px", display: "inline", marginRight: "4px", verticalAlign: "middle" }} />}
              {t === "layout" && <Shield style={{ width: "11px", height: "11px", display: "inline", marginRight: "4px", verticalAlign: "middle" }} />}
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {activeTab === "settings" && (
            <>
              <HubAdminField label="Widget Title">
                <HubAdminInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Widget display title" />
              </HubAdminField>

              {/* Dynamic config fields from registry */}
              {def?.configFields?.map(field => (
                <HubAdminField key={field.key} label={field.label}>
                  {field.type === "toggle" ? (
                    <HubAdminToggle label={field.label} checked={!!config[field.key]} onChange={e => updateConfig(field.key, e.target.checked)} />
                  ) : field.type === "select" ? (
                    <HubAdminSelect value={config[field.key] ?? ""} onChange={e => updateConfig(field.key, e.target.value)} options={field.options || []} />
                  ) : (
                    <HubAdminInput
                      type={field.type === "number" ? "number" : "text"}
                      value={config[field.key] ?? ""}
                      onChange={e => updateConfig(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
                      placeholder={field.placeholder || ""}
                    />
                  )}
                </HubAdminField>
              ))}

              {(!def?.configFields || def.configFields.length === 0) && (
                <p style={{ fontSize: "12px", color: textMuted, padding: "12px 0" }}>This widget has no configurable settings.</p>
              )}
            </>
          )}

          {activeTab === "layout" && (
            <>
              <HubAdminField label="Widget Size">
                <HubAdminSelect
                  value={size}
                  onChange={e => setSize(e.target.value)}
                  options={Object.entries(WIDGET_SIZES).map(([k, v]) => ({ value: k, label: `${v.label} — ${v.description}` }))}
                />
              </HubAdminField>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginTop: "4px" }}>
                {Object.entries(WIDGET_SIZES).map(([key, sz]) => (
                  <button
                    key={key}
                    onClick={() => setSize(key)}
                    style={{ padding: "8px 4px", borderRadius: "8px", border: `1px solid ${size === key ? "#ec2ca3" : cardBorder}`, background: size === key ? "#ec2ca318" : "none", color: size === key ? "#ec2ca3" : textMuted, fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {activeTab === "visibility" && (
            <>
              <HubAdminToggle label="Visible / Active" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
              <HubAdminField label="Restrict to Roles (comma-separated)">
                <HubAdminInput value={roleVisibility} onChange={e => setRoleVisibility(e.target.value)} placeholder="e.g. admin, manager (blank = all)" />
              </HubAdminField>
              <p style={{ fontSize: "11px", color: textMuted }}>Leave roles blank to show to all users. Separate multiple roles with commas.</p>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", padding: "12px 20px", borderTop: `1px solid ${cardBorder}` }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, background: "none", border: `1px solid ${cardBorder}`, color: textMuted, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSave} style={{ padding: "8px 18px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, background: "#ec2ca3", color: "#ffffff", border: "none", cursor: "pointer" }}>
            Save Widget
          </button>
        </div>
      </div>
    </div>
  );
}