/**
 * Generic per-hub branding context.
 * Usage: wrap any hub page in <HubBrandingProvider hubKey="operations">
 * Consume: const branding = useHubBranding();
 */
import { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { HUB_REGISTRY } from "@/lib/hubConfig";

const HubBrandingContext = createContext({});

export function HubBrandingProvider({ hubKey, children }) {
  const hubDef = HUB_REGISTRY[hubKey] || {};
  const [branding, setBranding] = useState({
    accent_colour: hubDef.defaultAccent || "#06b6d4",
    hero_title: "Good morning",
    hero_subtitle: hubDef.defaultSubtitle || "Ready to go?",
    hero_badge: hubDef.defaultBadge || hubDef.name || hubKey,
    show_ai_card: true,
    show_search: true,
    background_style: "Gradient",
    layout_density: "Comfortable",
  });

  useEffect(() => {
    if (!hubKey) return;
    base44.entities.HubConfiguration.filter({ hub_key: hubKey }, "", 1)
      .then(results => {
        const cfg = results?.[0];
        if (cfg) {
          setBranding(prev => ({ ...prev, ...cfg }));
        }
      })
      .catch(() => {});

    const unsub = base44.entities.HubConfiguration.subscribe(event => {
      if (event.data?.hub_key === hubKey) {
        setBranding(prev => ({ ...prev, ...event.data }));
      }
    });
    return unsub;
  }, [hubKey]);

  return (
    <HubBrandingContext.Provider value={branding}>
      {children}
    </HubBrandingContext.Provider>
  );
}

export function useHubBranding() {
  return useContext(HubBrandingContext);
}