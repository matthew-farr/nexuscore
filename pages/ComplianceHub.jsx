import { useActivityTracking } from "../hooks/useActivityTracking";
import { HubBrandingProvider } from "../components/hub/HubBrandingContext";
import GenericHubPage from "../components/hub/GenericHubPage.jsx";

export default function ComplianceHub() {
  useActivityTracking({ entity_type: "hub", entity_id: "compliance", title: "Compliance Hub", route: "/compliance", icon: "Shield" });
  return (
    <HubBrandingProvider hubKey="compliance">
      <GenericHubPage hubKey="compliance" hubName="Compliance Hub" />
    </HubBrandingProvider>
  );
}