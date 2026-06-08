import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageContainer from "@/components/ui-custom/PageContainer";
import HubHero from "@/components/hub/HubHero";
import HubSidebarPanel from "@/components/hub/HubSidebarPanel";
import CalendarWidget from "@/components/home/CalendarWidget";
import SkillsMatrixTab from "@/components/management/SkillsMatrixTab";
import SalesKickoffTab from "@/components/sales/kickoff/SalesKickoffTab";

const ACCENT = "#8b5cf6";

export default function ManagementHub() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: hubConfig } = useQuery({
    queryKey: ["hubConfig", "management"],
    queryFn: () => base44.entities.HubConfiguration.filter({ hub_key: "management" }).then(r => r?.[0]),
  });

  const heroConfig = {
    title: "Management Hub",
    description: "Central command center for operations, compliance, and strategic oversight.",
    icon: "Gauge",
    accentColor: ACCENT,
  };

  return (
    <PageContainer>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Content */}
        <div className="min-w-0">
          {/* Hero */}
          <HubHero
            title={heroConfig.title}
            description={heroConfig.description}
            icon={heroConfig.icon}
            accentColor={heroConfig.accentColor}
          />

          {/* Tab Navigation */}
           <div className="flex gap-4 mt-6 border-b" style={{ borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)" }}>
             {["Overview", "Skills Matrix", "Sales Kickoff", "Reports"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase().replace(" ", "-"))}
                className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 ${
                  activeTab === tab.toLowerCase().replace(" ", "-")
                    ? "border-primary"
                    : "border-transparent"
                }`}
                style={{
                  color:
                    activeTab === tab.toLowerCase().replace(" ", "-")
                      ? ACCENT
                      : isDark ? "#ffffff" : "#000000",
                }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="mt-6">
            {activeTab === "overview" && (
              <div className="rounded-2xl p-6"
                style={{
                  background: isDark
                    ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
                    : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)",
                  border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
                  boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.30)" : "0 4px 16px rgba(0,0,0,0.08)",
                }}>
                <p style={{ color: isDark ? "#ffffff" : "#000000" }}>
                  Management Hub Overview content
                </p>
              </div>
            )}

            {activeTab === "skills-matrix" && (
              <SkillsMatrixTab user={user} />
            )}

            {activeTab === "sales-kickoff" && (
              <SalesKickoffTab showDrafts={true} />
            )}

            {activeTab === "reports" && (
              <div className="rounded-2xl p-6"
                style={{
                  background: isDark
                    ? "linear-gradient(145deg, rgba(15,23,42,0.68) 0%, rgba(15,23,42,0.50) 100%)"
                    : "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,246,255,0.85) 100%)",
                  border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.07)",
                  boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.30)" : "0 4px 16px rgba(0,0,0,0.08)",
                }}>
                <p style={{ color: isDark ? "#ffffff" : "#000000" }}>
                  Reports coming soon
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <CalendarWidget />
          <HubSidebarPanel hubKey="management" />
        </div>
      </div>
    </PageContainer>
  );
}