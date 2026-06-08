import { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const DEFAULT_BRANDING = {
  hero_title: "Good morning",
  hero_subtitle: "Ready to drive performance today?",
  hero_badge: "Sales Hub",
  show_search: true,
  show_ai_card: true,
  accent_colour: "#ec2ca3",
  layout_density: "Comfortable",
  background_style: "Gradient",
  default_tab: "overview",
};

const SalesHubBrandingContext = createContext(DEFAULT_BRANDING);

export function SalesHubBrandingProvider({ children }) {
  const [branding, setBranding] = useState(DEFAULT_BRANDING);

  const loadBranding = async () => {
    try {
      const data = await base44.entities.SalesHubBrandingConfig.list("", 1);
      if (data && data.length > 0) {
        setBranding({ ...DEFAULT_BRANDING, ...data[0] });
      }
    } catch (err) {
      console.error("Failed to load branding:", err);
    }
  };

  useEffect(() => {
    loadBranding();
    const unsubscribe = base44.entities.SalesHubBrandingConfig.subscribe(() => {
      loadBranding();
    });
    return () => unsubscribe();
  }, []);

  return (
    <SalesHubBrandingContext.Provider value={branding}>
      {children}
    </SalesHubBrandingContext.Provider>
  );
}

export function useSalesHubBranding() {
  return useContext(SalesHubBrandingContext);
}