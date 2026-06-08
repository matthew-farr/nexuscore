import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useTheme } from "../../ThemeProvider";
import { toast } from "sonner";
import { Save, RotateCcw } from "lucide-react";
import { HubAdminField, HubAdminInput, HubAdminSelect, HubAdminToggle } from "../hub/HubAdminField";

const ACCENT = "#ec2ca3";

const DEFAULT_CONFIG = {
  hero_title: "Good morning",
  hero_subtitle: "Ready to drive performance today?",
  hero_badge: "Sales Hub",
  background_style: "Gradient",
  accent_colour: "#ec2ca3",
  show_ai_card: true,
  show_search: true,
  default_tab: "overview",
  layout_density: "Comfortable",
};

const ACCENT_PRESETS = [
  { label: "Pink",   value: "#ec2ca3" },
  { label: "Cyan",   value: "#06b6d4" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Blue",   value: "#0ea5e9" },
  { label: "Green",  value: "#10b981" },
  { label: "Amber",  value: "#f59e0b" },
];

export default function SalesHubBrandingManager() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [config, setConfig] = useState(null);
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edited, setEdited] = useState(false);

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    try {
      const data = await base44.entities.SalesHubBrandingConfig.list("", 1);
      if (data && data.length > 0) {
        const cfg = { ...DEFAULT_CONFIG, ...data[0] };
        setConfig(cfg);
        setOriginal(cfg);
      } else {
        const created = await base44.entities.SalesHubBrandingConfig.create(DEFAULT_CONFIG);
        const cfg = { ...DEFAULT_CONFIG, ...created };
        setConfig(cfg);
        setOriginal(cfg);
        toast.success("Default branding config created");
      }
    } catch (err) {
      console.error("Failed to load branding config:", err);
      toast.error("Failed to load branding config");
    } finally {
      setLoading(false);
    }
  };

  const update = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setEdited(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!config?.id) return;
    setSaving(true);
    try {
      await base44.entities.SalesHubBrandingConfig.update(config.id, config);
      setOriginal(config);
      setEdited(false);
      toast.success("Branding saved — changes will appear in Sales Hub immediately");
    } catch (err) {
      console.error("Failed to save:", err);
      toast.error("Failed to save branding config");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setConfig(original);
    setEdited(false);
  };

  if (loading) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", fontSize: "13px" }}>
        Loading branding config…
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 15%)" }}>
            Branding & Layout
          </h3>
          <p className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.55)" }}>
            Changes apply live to the Sales Hub when saved
          </p>
        </div>
        {edited && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2"
          >
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
                color: isDark ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.70)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <RotateCcw style={{ width: "12px", height: "12px" }} />
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)`,
                color: "#ffffff",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: `0 4px 14px ${ACCENT}35`,
                opacity: saving ? 0.7 : 1,
              }}
            >
              <Save style={{ width: "12px", height: "12px" }} />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </motion.div>
        )}
      </div>

      {/* Live preview swatch */}
      <div
        style={{
          borderRadius: "12px",
          padding: "16px",
          background: isDark
            ? `linear-gradient(135deg, ${config.accent_colour}18, ${config.accent_colour}08)`
            : `linear-gradient(135deg, ${config.accent_colour}12, ${config.accent_colour}05)`,
          border: `1px solid ${config.accent_colour}30`,
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: config.accent_colour,
            boxShadow: `0 6px 18px ${config.accent_colour}50`,
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: isDark ? "#fff" : "#000" }}>
            {config.hero_badge} · {config.hero_title}
          </div>
          <div style={{ fontSize: "11px", marginTop: "2px", color: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.50)" }}>
            {config.hero_subtitle}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Hero text */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <HubAdminField label="Hero Title">
            <HubAdminInput
              value={config.hero_title || ""}
              onChange={e => update("hero_title", e.target.value)}
              placeholder="Good morning"
            />
          </HubAdminField>
          <HubAdminField label="Hero Badge">
            <HubAdminInput
              value={config.hero_badge || ""}
              onChange={e => update("hero_badge", e.target.value)}
              placeholder="Sales Hub"
            />
          </HubAdminField>
        </div>

        <HubAdminField label="Hero Subtitle">
          <HubAdminInput
            value={config.hero_subtitle || ""}
            onChange={e => update("hero_subtitle", e.target.value)}
            placeholder="Ready to drive performance today?"
          />
        </HubAdminField>

        {/* Accent colour */}
        <HubAdminField label="Accent Colour">
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="color"
              value={config.accent_colour || "#ec2ca3"}
              onChange={e => update("accent_colour", e.target.value)}
              style={{
                width: "44px",
                height: "38px",
                borderRadius: "8px",
                border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.12)",
                cursor: "pointer",
                padding: "2px",
                background: "none",
              }}
            />
            <HubAdminInput
              value={config.accent_colour || "#ec2ca3"}
              onChange={e => update("accent_colour", e.target.value)}
              placeholder="#ec2ca3"
            />
          </div>
          {/* Presets */}
          <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
            {ACCENT_PRESETS.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={(e) => { e.preventDefault(); update("accent_colour", p.value); }}
                title={p.label}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "7px",
                  background: p.value,
                  border: config.accent_colour === p.value
                    ? "2.5px solid #ffffff"
                    : "2px solid transparent",
                  cursor: "pointer",
                  boxShadow: config.accent_colour === p.value ? `0 0 0 2px ${p.value}` : "none",
                  transition: "all 0.15s",
                }}
              />
            ))}
          </div>
        </HubAdminField>

        {/* Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <HubAdminField label="Layout Density">
            <HubAdminSelect
              value={config.layout_density || "Comfortable"}
              onChange={e => update("layout_density", e.target.value)}
              options={["Compact", "Comfortable", "Spacious"]}
            />
          </HubAdminField>
          <HubAdminField label="Background Style">
            <HubAdminSelect
              value={config.background_style || "Gradient"}
              onChange={e => update("background_style", e.target.value)}
              options={["Gradient", "Solid", "Mesh"]}
            />
          </HubAdminField>
        </div>

        {/* Toggles */}
        <div
          style={{
            padding: "14px",
            borderRadius: "10px",
            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <p style={{ fontSize: "11px", fontWeight: 700, color: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.45)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
            Feature Toggles
          </p>
          <HubAdminToggle
            label="Show AI Assistant Card in hero"
            checked={config.show_ai_card !== false}
            onChange={e => update("show_ai_card", e.target.checked)}
          />
          <HubAdminToggle
            label="Show Search Bar in hero"
            checked={config.show_search !== false}
            onChange={e => update("show_search", e.target.checked)}
          />
        </div>

        {/* Save hint */}
        {!edited && (
          <p style={{ fontSize: "11px", textAlign: "center", color: isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.30)" }}>
            Make changes above to enable save
          </p>
        )}
      </form>
    </div>
  );
}