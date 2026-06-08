import { useActivityTracking } from "../hooks/useActivityTracking";
import { HubBrandingProvider } from "../components/hub/HubBrandingContext";
import GenericHubPage from "../components/hub/GenericHubPage.jsx";

export default function MarketingHub() {
  useActivityTracking({ entity_type: "hub", entity_id: "marketing", title: "Marketing Hub", route: "/marketing", icon: "Megaphone" });
  return (
    <HubBrandingProvider hubKey="marketing">
      <GenericHubPage hubKey="marketing" hubName="Marketing Hub" />
    </HubBrandingProvider>
  );
}