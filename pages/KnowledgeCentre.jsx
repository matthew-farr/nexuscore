import { BookOpen, FileText, Search, FolderOpen, PlusCircle, Star, RefreshCw, Users, Tag, Archive, CheckCircle } from "lucide-react";
import HubPageTemplate from "../components/hub/HubPageTemplate";
import { useActivityTracking } from "../hooks/useActivityTracking";

const ACCENT = "#10b981";
const ACCENT2 = "#22d3ee";

export default function KnowledgeCentre() {
  useActivityTracking({
    entity_type: "hub",
    entity_id: "knowledge",
    title: "Knowledge Centre",
    route: "/knowledge",
    icon: "BookOpen",
  });
  return (
    <HubPageTemplate
      icon={BookOpen}
      title="Knowledge Centre"
      description="Documentation, guides, and institutional knowledge for the entire Checks Direct organisation."
      accentColor={ACCENT}
      accentColor2={ACCENT2}
      stats={[
        { icon: FileText, value: "386", label: "Articles", change: "+12 this month", changePositive: true },
        { icon: FolderOpen, value: "24", label: "Categories" },
        { icon: Search, value: "1.2K", label: "Searches/Month", change: "+8%", changePositive: true },
        { icon: RefreshCw, value: "14", label: "Updated This Week" },
      ]}
      quickActions={[
        { icon: PlusCircle, label: "New Article" },
        { icon: Search, label: "Search Docs" },
        { icon: FolderOpen, label: "Browse Categories" },
        { icon: Archive, label: "Archived Docs" },
        { icon: Tag, label: "Manage Tags" },
      ]}
      featuredItems={[
        { icon: Star, title: "Employee Handbook 2026", description: "Company policies, benefits, and procedures", badge: "Updated" },
        { icon: FileText, title: "Product Knowledge Base", description: "All Checks Direct products and features", badge: "Essential" },
        { icon: CheckCircle, title: "IT Systems Guide", description: "Setup, access, and support documentation", badge: "Updated" },
      ]}
      resources={[
        { icon: FileText, title: "Getting Started Guides", meta: "12 articles" },
        { icon: FolderOpen, title: "HR Policies", meta: "34 documents" },
        { icon: BookOpen, title: "Technical Documentation", meta: "88 articles" },
        { icon: Users, title: "Department Wikis", meta: "8 wikis" },
        { icon: Archive, title: "Legacy Documents", meta: "Archived" },
      ]}
      activityItems={[
        { icon: RefreshCw, title: "Employee Handbook updated — Section 4: Benefits", meta: "1 hour ago" },
        { icon: PlusCircle, title: "New article: How to use the Checks Portal", meta: "3 hours ago" },
        { icon: FileText, title: "IT Setup Guide reviewed and updated", meta: "Yesterday" },
        { icon: Tag, title: "New tag created: Q2-2026 for seasonal content", meta: "2 days ago" },
      ]}
      announcements={[
        { title: "Knowledge base audit — please review your department docs", date: "This week" },
        { title: "New search functionality live — AI-powered results", date: "Today" },
        { title: "Employee Handbook 2026 edition now published", date: "2 days ago" },
      ]}
      pinnedItems={["Employee Handbook", "IT Setup Guide", "Product Docs"]}
    />
  );
}