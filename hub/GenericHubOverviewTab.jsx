/**
 * GenericHubOverviewTab — two-column layout from the very top.
 * Left column: Tools → QuickLaunch → Dashboard (if configured) → Enablement → Activity/Announcements
 * Right sidebar: starts aligned with Tools at the top.
 * All data loaded from HubContentItem scoped to hubKey.
 */
import HubToolsSection from "./HubToolsSection";
import HubQuickLaunchSection from "./HubQuickLaunchSection";
import HubDashboardEmbed from "./HubDashboardEmbed";
import HubEnablementSection from "./HubEnablementSection";
import HubSidebarSection from "./HubSidebarSection";
import HubActivityFeed from "./HubActivityFeed";
import HubAnnouncementCard from "./HubAnnouncementCard";
import { Settings2, FileText } from "lucide-react";

// Placeholder activity/announcements — will be replaced with DB data in future iteration
const ACTIVITY = [
  { icon: Settings2, title: "DBS volume high — 142 checks processed today", meta: "1 hour ago" },
  { icon: FileText,  title: "SLA compliance at 97.3% — on track this week",  meta: "3 hours ago" },
  { icon: Settings2, title: "Supplier invoice approved: DocuSign",            meta: "Yesterday" },
];

const ANNOUNCEMENTS = [
  { title: "Monthly Ops Review — Monday 2 June, 09:30", date: "Upcoming" },
  { title: "System maintenance window: tonight 22:00–23:00", date: "Today" },
  { title: "New compliance policy v2.4 published",          date: "3 days ago" },
];

export default function GenericHubOverviewTab({ hubKey, hubName, accentColour, showDashboard = true }) {
  const ACCENT = accentColour || "#06b6d4";

  return (
    /* Two-column layout from the very top — sidebar aligned with Tools */
    <div className="flex flex-col xl:flex-row gap-4">
      {/* LEFT: main content column */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* 1. Tools grid */}
        <HubToolsSection hubKey={hubKey} hubName={hubName} accentColour={ACCENT} />

        {/* 2. Quick Launch pills */}
        <HubQuickLaunchSection hubKey={hubKey} accentColour={ACCENT} />

        {/* 3. Dashboard embed — conditionally rendered */}
        {showDashboard && <HubDashboardEmbed hubKey={hubKey} accentColour={ACCENT} />}

        {/* 4. Enablement / Resources grid */}
        <HubEnablementSection hubKey={hubKey} accentColour={ACCENT} />

        {/* 5. Activity + Announcements in two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HubActivityFeed items={ACTIVITY} accentColor={ACCENT} delay={0.30} />
          <HubAnnouncementCard announcements={ANNOUNCEMENTS} accentColor={ACCENT} delay={0.32} />
        </div>
      </div>

      {/* RIGHT: sidebar — starts at same vertical position as Tools */}
      <HubSidebarSection hubKey={hubKey} accentColour={ACCENT} />
    </div>
  );
}