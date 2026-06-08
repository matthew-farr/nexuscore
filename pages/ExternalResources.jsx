import { Globe, Link, ExternalLink, Star, FolderOpen, PlusCircle, Search, BookOpen, Tag, RefreshCw, Users, Shield } from "lucide-react";
import HubPageTemplate from "../components/hub/HubPageTemplate";
import { useActivityTracking } from "../hooks/useActivityTracking";

const ACCENT = "#6366f1";
const ACCENT2 = "#8b5cf6";

export default function ExternalResources() {
  useActivityTracking({
    entity_type: "hub",
    entity_id: "external-resources",
    title: "Client Resources",
    route: "/client-resources",
    icon: "Globe",
  });
  return (
    <HubPageTemplate
      icon={Globe}
      title="External Resources"
      description="Curated external links, tools, regulatory portals, and partner resources."
      accentColor={ACCENT}
      accentColor2={ACCENT2}
      stats={[
        { icon: Link, value: "94", label: "Saved Links" },
        { icon: FolderOpen, value: "12", label: "Categories" },
        { icon: Star, value: "22", label: "Team Favourites" },
        { icon: RefreshCw, value: "8", label: "Added This Week" },
      ]}
      quickActions={[
        { icon: PlusCircle, label: "Add Resource" },
        { icon: Search, label: "Search Links" },
        { icon: Star, label: "Favourites" },
        { icon: FolderOpen, label: "Browse Categories" },
        { icon: Tag, label: "Manage Tags" },
      ]}
      featuredItems={[
        { icon: Shield, title: "FCA Register", description: "Official FCA authorised firms register", badge: "Regulatory" },
        { icon: Globe, title: "Companies House", description: "UK company search and filing portal", badge: "Official" },
        { icon: BookOpen, title: "CIPD HR Resources", description: "Professional HR guidance and templates", badge: "Partner" },
      ]}
      resources={[
        { icon: Shield, title: "Regulatory Portals", meta: "FCA, ICO, HMRC" },
        { icon: Globe, title: "Industry Bodies", meta: "8 links" },
        { icon: Users, title: "Partner Resources", meta: "14 links" },
        { icon: BookOpen, title: "Reference Materials", meta: "28 links" },
        { icon: ExternalLink, title: "Developer Tools", meta: "18 links" },
      ]}
      activityItems={[
        { icon: PlusCircle, title: "New resource added: DSAR Template Portal", meta: "2 hours ago" },
        { icon: Star, title: "FCA Register added to team favourites", meta: "Yesterday" },
        { icon: RefreshCw, title: "ICO guidance page link updated", meta: "2 days ago" },
        { icon: Globe, title: "CIPD partnership resources refreshed", meta: "3 days ago" },
      ]}
      announcements={[
        { title: "New ICO data breach guidance published — link added", date: "Today" },
        { title: "FCA RegTech sandbox links updated for 2026", date: "Yesterday" },
        { title: "Remember to flag broken links using the report tool", date: "Reminder" },
      ]}
      pinnedItems={["FCA Register", "Companies House", "ICO Portal"]}
    />
  );
}