import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageContainer from "../components/ui-custom/PageContainer";
import { useActivityTracking } from "../hooks/useActivityTracking";
import InnovationHero from "../components/innovation/InnovationHero";
import InnovationSidebar from "../components/innovation/InnovationSidebar";
import InnovationOverviewTab from "../components/innovation/tabs/InnovationOverviewTab";
import InnovationIdeasBoardTab from "../components/innovation/tabs/InnovationIdeasBoardTab";
import QuarterlyRoadmapTab from "../components/innovation/tabs/QuarterlyRoadmapTab";
import InnovationAdminTab from "../components/innovation/tabs/InnovationAdminTab";
import SubmitIdeaDrawer from "../components/innovation/SubmitIdeaDrawer";

export default function InnovationHub() {
  useActivityTracking({ entity_type: "hub", entity_id: "innovation", title: "Innovation Hub", route: "/innovation", icon: "Lightbulb" });

  const [activeTab, setActiveTab] = useState("overview");
  const [submitDrawerOpen, setSubmitDrawerOpen] = useState(false);

  console.log("[InnovationHub] Rendered with activeTab =", activeTab, "submitDrawerOpen =", submitDrawerOpen);

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return (
          <InnovationOverviewTab
            onTabChange={setActiveTab}
            onSubmitIdea={() => {
              console.log("[InnovationHub] onSubmitIdea called → opening submit drawer");
              setSubmitDrawerOpen(true);
            }}
          />
        );
      case "ideas-board":
        return <InnovationIdeasBoardTab />;
      case "internal-roadmap":
        return <QuarterlyRoadmapTab roadmapType="Internal" title="Internal Roadmap" description="Operational improvements, process changes and business initiatives." />;
      case "web-dev-roadmap":
        return <QuarterlyRoadmapTab roadmapType="Web Development" title="Development Roadmap" description="Website, portal and Checks Direct OS planned work by quarter." />;
      case "admin":
        return <InnovationAdminTab />;
      default:
        return <InnovationOverviewTab onTabChange={setActiveTab} onSubmitIdea={() => setSubmitDrawerOpen(true)} />;
    }
  };

  return (
    <PageContainer>
      <InnovationHero activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex gap-5 items-start">
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>

        <InnovationSidebar />
      </div>

      <SubmitIdeaDrawer
        open={submitDrawerOpen}
        onClose={() => setSubmitDrawerOpen(false)}
      />
    </PageContainer>
  );
}