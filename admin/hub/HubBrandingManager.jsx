import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { toast } from "sonner";
import { HubAdminField, HubAdminInput, HubAdminSelect, HubAdminToggle } from "./HubAdminField";

const COLOUR_PRESETS = [
  { label: "Cyan",   value: "#06b6d4" },
  { label: "Pink",   value: "#ec2ca3" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Green",  value: "#10b981" },
  { label: "Amber",  value: "#f59e0b" },
  { label: "Blue",   value: "#0ea5e9" },
  { label: "Red",    value: "#ef4444" },
];

const DEFAULTS = {
  hero_title: "Good morning",
  hero_subtitle: "Ready to drive performance today?",
  hero_badge: "",
  accent_colour: "#06b6d4",
  background_style: "Gradient",
  layout_density: "Comfortable",
  show_ai_card: true,
  show_search: true,
  is_active: true,
  allowed_roles: [],
  notes: "",
};

/**
 * Generic hub branding manager.
 * Props: hubKey (string), hubName (string), onDataChange (fn)
 */
export default function HubBrandingManager({ hubKey, hubName, onDataChange }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState(DEFAULTS);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadConfig(); }, [hubKey]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const results = await base44.entities.HubConfiguration.filter({ hub_key: hubKey }, "", 1);
      const existing = results?.[0] || null;
      if (existing) {
        setConfig(existing);
        setForm({
          hero_title: existing.hero_title || DEFAULTS.hero_title,
          hero_subtitle: existing.hero_subtitle || DEFAULTS.hero_subtitle,
          hero_badge: existing.hero_badge || hubName || "",
          accent_colour: existing.accent_colour || DEFAULTS.accent_colour,
          background_style: existing.background_style || DEFAULTS.background_style,
          layout_density: existing.layout_density || DEFAULTS.layout_density,
          show_ai_card: existing.show_ai_card !== false,
          show_search: existing.show_search !== false,
          is_active: existing.is_active !== false,
          notes: existing.notes || "",
        });
      } else {
        setForm({ ...DEFAULTS, hero_badge: hubName || "" });
      }
    } catch (err) {
      console.error("Failed to load hub config:", err);
    } finally {
      setLoading(false);
      setDirty(false);
    }
  };

  const updateForm = (updates) => {
    setForm(prev => ({ ...prev, ...updates }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, hub_key: hubKey, hub_name: hubName };
      if (config) {
        await base44.entities.HubConfiguration.update(config.id, payload);
      } else {
        const created = await base44.entities.HubConfiguration.create(payload);
        setConfig(created);
      }
      toast.success(`${hubName} branding saved`);
      setDirty(false);
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error("Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "32px", textAlign: "center", fontSize: "13px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>Loading…</div>;
  }

  const ACCENT = form.accent_colour || "#06b6d4";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 15%)" }}>
            {hubName} Branding
          </h3>
          <p className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.55)" }}>
            Configure hero text, colours, and layout for the {hubName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={loadConfig}
              style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, background: "transparent", border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.15)", color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)", cursor: "pointer" }}
            >
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, background: dirty ? ACCENT : (isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)"), color: dirty ? "#ffffff" : (isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"), border: "none", cursor: dirty ? "pointer" : "default", transition: "all 0.2s" }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Accent colour preview swatch */}
      <div
        style={{
          height: "6px",
          borderRadius: "99px",
          background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}88)`,
          transition: "background 0.3s",
          marginBottom: "4px",
        }}
      />

      {/* Colour presets */}
      <div>
        <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px", color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }}>
          Accent Colour
        </p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          {COLOUR_PRESETS.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => updateForm({ accent_colour: p.value })}
              title={p.label}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: p.value,
                border: form.accent_colour === p.value ? `3px solid ${isDark ? "#ffffff" : "#000000"}` : "3px solid transparent",
                cursor: "pointer",
                transition: "border 0.15s",
                flexShrink: 0,
              }}
            />
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input
              type="color"
              value={form.accent_colour}
              onChange={e => updateForm({ accent_colour: e.target.value })}
              style={{ width: "28px", height: "28px", borderRadius: "50%", border: "none", padding: 0, cursor: "pointer", background: "none" }}
            />
            <span style={{ fontSize: "11px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>Custom</span>
          </div>
        </div>
      </div>

      {/* Hero text */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <HubAdminField label="Hero Title">
          <HubAdminInput value={form.hero_title} onChange={e => updateForm({ hero_title: e.target.value })} placeholder="Good morning" />
        </HubAdminField>
        <HubAdminField label="Hero Badge">
          <HubAdminInput value={form.hero_badge} onChange={e => updateForm({ hero_badge: e.target.value })} placeholder={hubName} />
        </HubAdminField>
      </div>
      <HubAdminField label="Hero Subtitle">
        <HubAdminInput value={form.hero_subtitle} onChange={e => updateForm({ hero_subtitle: e.target.value })} placeholder="Ready to drive performance today?" />
      </HubAdminField>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <HubAdminField label="Background Style">
          <HubAdminSelect value={form.background_style} onChange={e => updateForm({ background_style: e.target.value })} options={["Gradient", "Solid", "Mesh"]} />
        </HubAdminField>
        <HubAdminField label="Layout Density">
          <HubAdminSelect value={form.layout_density} onChange={e => updateForm({ layout_density: e.target.value })} options={["Compact", "Comfortable", "Spacious"]} />
        </HubAdminField>
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <HubAdminToggle label="Show AI card" checked={form.show_ai_card} onChange={e => updateForm({ show_ai_card: e.target.checked })} />
        <HubAdminToggle label="Show search bar" checked={form.show_search} onChange={e => updateForm({ show_search: e.target.checked })} />
        <HubAdminToggle label="Hub active" checked={form.is_active} onChange={e => updateForm({ is_active: e.target.checked })} />
      </div>

      <HubAdminField label="Admin Notes">
        <HubAdminInput type="textarea" value={form.notes} onChange={e => updateForm({ notes: e.target.value })} placeholder="Internal notes about this hub configuration" />
      </HubAdminField>
    </div>
  );
}