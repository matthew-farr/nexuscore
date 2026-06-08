/**
 * seedAllHubDefaults — idempotent seed function.
 * Creates HubConfiguration, tabs, and default Overview widgets for all 6 hubs.
 * SAFE: never deletes or overwrites existing records. Only creates missing ones.
 * Can be run multiple times safely.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ── HUB BRANDING CONFIGS ─────────────────────────────────────────────────────
const HUB_CONFIGS = [
  { hub_key: "sales",      hub_name: "Sales Hub",      accent_colour: "#ec2ca3", hero_badge: "Sales Hub",      hero_subtitle: "Ready to drive performance today?", background_style: "Gradient", layout_density: "Comfortable", show_ai_card: true, show_search: true, is_active: true },
  { hub_key: "operations", hub_name: "Operations Hub", accent_colour: "#0ea5e9", hero_badge: "Operations Hub", hero_subtitle: "Keep the business running smoothly.",   background_style: "Gradient", layout_density: "Comfortable", show_ai_card: true, show_search: true, is_active: true },
  { hub_key: "compliance", hub_name: "Compliance Hub", accent_colour: "#10b981", hero_badge: "Compliance Hub", hero_subtitle: "Stay compliant, stay protected.",         background_style: "Gradient", layout_density: "Comfortable", show_ai_card: true, show_search: true, is_active: true },
  { hub_key: "learning",   hub_name: "Learning Hub",   accent_colour: "#8b5cf6", hero_badge: "Learning Hub",   hero_subtitle: "Grow your skills and knowledge.",       background_style: "Gradient", layout_density: "Comfortable", show_ai_card: true, show_search: true, is_active: true },
  { hub_key: "marketing",  hub_name: "Marketing Hub",  accent_colour: "#f59e0b", hero_badge: "Marketing Hub",  hero_subtitle: "Drive brand and pipeline growth.",      background_style: "Gradient", layout_density: "Comfortable", show_ai_card: true, show_search: true, is_active: true },
  { hub_key: "innovation", hub_name: "Innovation Hub", accent_colour: "#6366f1", hero_badge: "Innovation Hub", hero_subtitle: "Build the future of Checks Direct.",    background_style: "Gradient", layout_density: "Comfortable", show_ai_card: true, show_search: true, is_active: true },
];

// ── DEFAULT TABS ─────────────────────────────────────────────────────────────
const HUB_DEFAULT_TABS = {
  sales: [
    { tab_key: "overview",    label: "Overview",     sort_order: 1, is_active: true, is_default: true,  icon: "LayoutDashboard" },
    { tab_key: "analytics",   label: "Analytics",    sort_order: 2, is_active: true, is_default: false, icon: "BarChart2" },
    { tab_key: "sales-tools", label: "Sales Tools",  sort_order: 3, is_active: true, is_default: false, icon: "Zap" },
    { tab_key: "guides",      label: "Guides",       sort_order: 4, is_active: true, is_default: false, icon: "BookOpen" },
    { tab_key: "ai",          label: "AI Assistant", sort_order: 5, is_active: true, is_default: false, icon: "Sparkles" },
  ],
  operations: [
    { tab_key: "overview",   label: "Overview",          sort_order: 1, is_active: true, is_default: true,  icon: "LayoutDashboard" },
    { tab_key: "compliance", label: "Compliance",        sort_order: 2, is_active: true, is_default: false, icon: "Shield" },
    { tab_key: "processes",  label: "Processes",         sort_order: 3, is_active: true, is_default: false, icon: "GitBranch" },
    { tab_key: "documents",  label: "Documents",         sort_order: 4, is_active: true, is_default: false, icon: "FileText" },
    { tab_key: "templates",  label: "Templates",         sort_order: 5, is_active: true, is_default: false, icon: "Layout" },
    { tab_key: "ops-tools",  label: "Operations Tools",  sort_order: 6, is_active: true, is_default: false, icon: "Zap" },
    { tab_key: "ai",         label: "AI Assistant",      sort_order: 7, is_active: true, is_default: false, icon: "Sparkles" },
  ],
  compliance: [
    { tab_key: "overview",  label: "Overview",            sort_order: 1, is_active: true, is_default: true,  icon: "LayoutDashboard" },
    { tab_key: "policies",  label: "Policies",            sort_order: 2, is_active: true, is_default: false, icon: "Shield" },
    { tab_key: "audits",    label: "Audit Actions",       sort_order: 3, is_active: true, is_default: false, icon: "ClipboardCheck" },
    { tab_key: "expiring",  label: "Expiring Checks",     sort_order: 4, is_active: true, is_default: false, icon: "AlertTriangle" },
    { tab_key: "training",  label: "Training Compliance", sort_order: 5, is_active: true, is_default: false, icon: "GraduationCap" },
    { tab_key: "ai",        label: "AI Assistant",        sort_order: 6, is_active: true, is_default: false, icon: "Sparkles" },
  ],
  learning: [
    { tab_key: "overview",    label: "Overview",          sort_order: 1, is_active: true, is_default: true,  icon: "LayoutDashboard" },
    { tab_key: "my-learning", label: "My Learning",       sort_order: 2, is_active: true, is_default: false, icon: "BookOpen" },
    { tab_key: "assigned",    label: "Assigned Training",  sort_order: 3, is_active: true, is_default: false, icon: "ClipboardList" },
    { tab_key: "certs",       label: "Certificates",       sort_order: 4, is_active: true, is_default: false, icon: "Award" },
    { tab_key: "library",     label: "Course Library",     sort_order: 5, is_active: true, is_default: false, icon: "Layers" },
    { tab_key: "ai",          label: "AI Assistant",       sort_order: 6, is_active: true, is_default: false, icon: "Sparkles" },
  ],
  marketing: [
    { tab_key: "overview",  label: "Overview",         sort_order: 1, is_active: true, is_default: true,  icon: "LayoutDashboard" },
    { tab_key: "campaigns", label: "Campaigns",        sort_order: 2, is_active: true, is_default: false, icon: "Megaphone" },
    { tab_key: "calendar",  label: "Content Calendar", sort_order: 3, is_active: true, is_default: false, icon: "Calendar" },
    { tab_key: "assets",    label: "Brand Assets",     sort_order: 4, is_active: true, is_default: false, icon: "Image" },
    { tab_key: "resources", label: "Resources",        sort_order: 5, is_active: true, is_default: false, icon: "BookOpen" },
    { tab_key: "ai",        label: "AI Assistant",     sort_order: 6, is_active: true, is_default: false, icon: "Sparkles" },
  ],
  innovation: [
    { tab_key: "overview",    label: "Overview",     sort_order: 1, is_active: true, is_default: true,  icon: "LayoutDashboard" },
    { tab_key: "ideas",       label: "Ideas",        sort_order: 2, is_active: true, is_default: false, icon: "Lightbulb" },
    { tab_key: "projects",    label: "Projects",     sort_order: 3, is_active: true, is_default: false, icon: "Layers" },
    { tab_key: "roadmap",     label: "Roadmap",      sort_order: 4, is_active: true, is_default: false, icon: "Map" },
    { tab_key: "experiments", label: "Experiments",  sort_order: 5, is_active: true, is_default: false, icon: "FlaskConical" },
    { tab_key: "ai",          label: "AI Assistant", sort_order: 6, is_active: true, is_default: false, icon: "Sparkles" },
  ],
};

// ── DEFAULT OVERVIEW WIDGETS ──────────────────────────────────────────────────
// Each widget is a HubContentItem with content_type="widget" and config_json.
// tab_layout on the first widget defines the overall layout for the tab.
// size: "small"=3 cols, "medium"=6 cols, "large"=8 cols, "full"=12 cols (in dashboard grid)

const HUB_DEFAULT_WIDGETS = {

  // ── SALES ────────────────────────────────────────────────────────────────
  sales: [
    {
      hub_key: "sales", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "Monthly Revenue", category: "overview", sort_order: 1,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Monthly Revenue", value: "£84,200", unit: "MTD", trend: "+12% vs last month", trendDirection: "up", description: "Month-to-date revenue" }
    },
    {
      hub_key: "sales", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "New Deals", category: "overview", sort_order: 2,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "New Deals", value: "24", unit: "This Month", trend: "+3 vs last month", trendDirection: "up", description: "Deals opened this month" }
    },
    {
      hub_key: "sales", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "Conversion Rate", category: "overview", sort_order: 3,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Conversion Rate", value: "38%", unit: "Avg", trend: "-2% vs last month", trendDirection: "down", description: "Lead-to-deal conversion" }
    },
    {
      hub_key: "sales", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "Pipeline Value", category: "overview", sort_order: 4,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Pipeline Value", value: "£312K", unit: "Open", trend: "+£18K this week", trendDirection: "up", description: "Total open pipeline" }
    },
    {
      hub_key: "sales", content_type: "widget", widget_type: "target_tracker", is_active: true,
      title: "Monthly Target", category: "overview", sort_order: 5,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "target_tracker", target: 100000, current: 84200, period: "Monthly", unit: "£" }
    },
    {
      hub_key: "sales", content_type: "widget", widget_type: "leaderboard", is_active: true,
      title: "Sales Leaderboard", category: "overview", sort_order: 6,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "leaderboard", maxItems: 5, metric: "revenue" }
    },
    {
      hub_key: "sales", content_type: "widget", widget_type: "sales_pipeline", is_active: true,
      title: "Pipeline Snapshot", category: "overview", sort_order: 7,
      config_json: { tab_layout: "dashboard", size: "large", widget_type: "sales_pipeline" }
    },
    {
      hub_key: "sales", content_type: "widget", widget_type: "announcements", is_active: true,
      title: "Sales Announcements", category: "overview", sort_order: 8,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "announcements", maxItems: 3, category: "sales" }
    },
    {
      hub_key: "sales", content_type: "widget", widget_type: "calendar", is_active: true,
      title: "Upcoming Events", category: "overview", sort_order: 9,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "calendar", maxEvents: 5 }
    },
    {
      hub_key: "sales", content_type: "widget", widget_type: "quick_links", is_active: true,
      title: "Sales Quick Links", category: "overview", sort_order: 10,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "quick_links", display: "grid", hub_key: "sales" }
    },
    {
      hub_key: "sales", content_type: "widget", widget_type: "ai_assistant", is_active: true,
      title: "AI Assistant", category: "overview", sort_order: 11,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "ai_assistant", title: "Sales AI", promptSuggestions: ["Help me write a proposal", "Summarise this week's pipeline", "What are our top products?"] }
    },
  ],

  // ── OPERATIONS ────────────────────────────────────────────────────────────
  operations: [
    {
      hub_key: "operations", content_type: "widget", widget_type: "operational_alerts", is_active: true,
      title: "Operational Alerts", category: "overview", sort_order: 1,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "operational_alerts", maxItems: 5 }
    },
    {
      hub_key: "operations", content_type: "widget", widget_type: "service_status", is_active: true,
      title: "Service Status", category: "overview", sort_order: 2,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "service_status" }
    },
    {
      hub_key: "operations", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "Checks Processed Today", category: "overview", sort_order: 3,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Checks Today", value: "142", unit: "Today", trend: "+8 vs yesterday", trendDirection: "up", description: "Background checks processed" }
    },
    {
      hub_key: "operations", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "SLA Compliance", category: "overview", sort_order: 4,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "SLA Compliance", value: "97.3%", unit: "This Week", trend: "+0.4% vs last week", trendDirection: "up", description: "On-time delivery rate" }
    },
    {
      hub_key: "operations", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "Queue Backlog", category: "overview", sort_order: 5,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Queue Backlog", value: "18", unit: "Items", trend: "-4 since yesterday", trendDirection: "up", description: "Pending items in queue" }
    },
    {
      hub_key: "operations", content_type: "widget", widget_type: "workflow_queue", is_active: true,
      title: "Workflow Queue", category: "overview", sort_order: 6,
      config_json: { tab_layout: "dashboard", size: "large", widget_type: "workflow_queue", maxItems: 8 }
    },
    {
      hub_key: "operations", content_type: "widget", widget_type: "processing_volumes", is_active: true,
      title: "Processing Volumes", category: "overview", sort_order: 7,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "processing_volumes", period: "Daily" }
    },
    {
      hub_key: "operations", content_type: "widget", widget_type: "tasks", is_active: true,
      title: "Operational Tasks", category: "overview", sort_order: 8,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "tasks", maxItems: 6, showCompleted: false }
    },
    {
      hub_key: "operations", content_type: "widget", widget_type: "announcements", is_active: true,
      title: "Operations Updates", category: "overview", sort_order: 9,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "announcements", maxItems: 3, category: "operations" }
    },
    {
      hub_key: "operations", content_type: "widget", widget_type: "calendar", is_active: true,
      title: "Team Calendar", category: "overview", sort_order: 10,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "calendar", maxEvents: 5 }
    },
    {
      hub_key: "operations", content_type: "widget", widget_type: "resource_library", is_active: true,
      title: "Resource Library", category: "overview", sort_order: 11,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "resource_library", maxItems: 6 }
    },
    {
      hub_key: "operations", content_type: "widget", widget_type: "ai_assistant", is_active: true,
      title: "AI Assistant", category: "overview", sort_order: 12,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "ai_assistant", title: "Ops AI", promptSuggestions: ["Show me today's SLA status", "What's in the workflow queue?", "Summarise operational alerts"] }
    },
  ],

  // ── COMPLIANCE ────────────────────────────────────────────────────────────
  compliance: [
    {
      hub_key: "compliance", content_type: "widget", widget_type: "compliance_status", is_active: true,
      title: "Compliance Status", category: "overview", sort_order: 1,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "compliance_status" }
    },
    {
      hub_key: "compliance", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "Compliance Score", category: "overview", sort_order: 2,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Compliance Score", value: "94%", unit: "Overall", trend: "+2% vs last quarter", trendDirection: "up", description: "Organisation-wide compliance" }
    },
    {
      hub_key: "compliance", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "Expiring Soon", category: "overview", sort_order: 3,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Expiring Certs", value: "7", unit: "30 Days", trend: "+2 vs last month", trendDirection: "down", description: "Certificates expiring soon" }
    },
    {
      hub_key: "compliance", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "Policies Pending", category: "overview", sort_order: 4,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Policies Pending", value: "3", unit: "Awaiting", trend: "-1 since last week", trendDirection: "up", description: "Awaiting acknowledgement" }
    },
    {
      hub_key: "compliance", content_type: "widget", widget_type: "expiring_certs", is_active: true,
      title: "Expiring Certifications", category: "overview", sort_order: 5,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "expiring_certs", daysAhead: 60 }
    },
    {
      hub_key: "compliance", content_type: "widget", widget_type: "policy_acknowledgement", is_active: true,
      title: "Policy Acknowledgements", category: "overview", sort_order: 6,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "policy_acknowledgement" }
    },
    {
      hub_key: "compliance", content_type: "widget", widget_type: "audit_actions", is_active: true,
      title: "Audit Actions", category: "overview", sort_order: 7,
      config_json: { tab_layout: "dashboard", size: "large", widget_type: "audit_actions", maxItems: 8 }
    },
    {
      hub_key: "compliance", content_type: "widget", widget_type: "training_due", is_active: true,
      title: "Training Due Soon", category: "overview", sort_order: 8,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "training_due", daysAhead: 30 }
    },
    {
      hub_key: "compliance", content_type: "widget", widget_type: "announcements", is_active: true,
      title: "Compliance Announcements", category: "overview", sort_order: 9,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "announcements", maxItems: 3, category: "compliance" }
    },
    {
      hub_key: "compliance", content_type: "widget", widget_type: "resource_library", is_active: true,
      title: "Policy & Resource Library", category: "overview", sort_order: 10,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "resource_library", maxItems: 6 }
    },
    {
      hub_key: "compliance", content_type: "widget", widget_type: "ai_knowledge_search", is_active: true,
      title: "Compliance AI Search", category: "overview", sort_order: 11,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "ai_knowledge_search", placeholder: "Ask about policies, audits, or certifications…" }
    },
  ],

  // ── LEARNING ──────────────────────────────────────────────────────────────
  learning: [
    {
      hub_key: "learning", content_type: "widget", widget_type: "my_learning", is_active: true,
      title: "My Learning", category: "overview", sort_order: 1,
      config_json: { tab_layout: "dashboard", size: "large", widget_type: "my_learning", maxItems: 5 }
    },
    {
      hub_key: "learning", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "Courses Completed", category: "overview", sort_order: 2,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Courses Completed", value: "12", unit: "This Year", trend: "+3 vs last quarter", trendDirection: "up", description: "Team training completions" }
    },
    {
      hub_key: "learning", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "Training Hours", category: "overview", sort_order: 3,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Training Hours", value: "48h", unit: "This Year", trend: "+6h vs last quarter", trendDirection: "up", description: "Total learning time logged" }
    },
    {
      hub_key: "learning", content_type: "widget", widget_type: "training_due", is_active: true,
      title: "Training Due Soon", category: "overview", sort_order: 4,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "training_due", daysAhead: 30 }
    },
    {
      hub_key: "learning", content_type: "widget", widget_type: "assigned_training", is_active: true,
      title: "Assigned Training", category: "overview", sort_order: 5,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "assigned_training", maxItems: 5 }
    },
    {
      hub_key: "learning", content_type: "widget", widget_type: "certificates", is_active: true,
      title: "Certificates & Badges", category: "overview", sort_order: 6,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "certificates" }
    },
    {
      hub_key: "learning", content_type: "widget", widget_type: "resource_library", is_active: true,
      title: "Course Library", category: "overview", sort_order: 7,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "resource_library", maxItems: 8 }
    },
    {
      hub_key: "learning", content_type: "widget", widget_type: "calendar", is_active: true,
      title: "Learning Calendar", category: "overview", sort_order: 8,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "calendar", maxEvents: 5 }
    },
    {
      hub_key: "learning", content_type: "widget", widget_type: "announcements", is_active: true,
      title: "Learning Announcements", category: "overview", sort_order: 9,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "announcements", maxItems: 3, category: "training" }
    },
    {
      hub_key: "learning", content_type: "widget", widget_type: "ai_recommended", is_active: true,
      title: "AI Recommended Resources", category: "overview", sort_order: 10,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "ai_recommended", maxItems: 4 }
    },
  ],

  // ── MARKETING ─────────────────────────────────────────────────────────────
  marketing: [
    {
      hub_key: "marketing", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "Active Campaigns", category: "overview", sort_order: 1,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Active Campaigns", value: "6", unit: "Running", trend: "+2 vs last month", trendDirection: "up", description: "Currently live campaigns" }
    },
    {
      hub_key: "marketing", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "Leads Generated", category: "overview", sort_order: 2,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Leads Generated", value: "284", unit: "This Month", trend: "+34 vs last month", trendDirection: "up", description: "Marketing-attributed leads" }
    },
    {
      hub_key: "marketing", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "Content Published", category: "overview", sort_order: 3,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Content Published", value: "18", unit: "This Month", trend: "+5 vs last month", trendDirection: "up", description: "Pieces of content published" }
    },
    {
      hub_key: "marketing", content_type: "widget", widget_type: "tasks", is_active: true,
      title: "Campaign Tasks", category: "overview", sort_order: 4,
      config_json: { tab_layout: "dashboard", size: "large", widget_type: "tasks", maxItems: 8, showCompleted: false }
    },
    {
      hub_key: "marketing", content_type: "widget", widget_type: "calendar", is_active: true,
      title: "Content Calendar", category: "overview", sort_order: 5,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "calendar", maxEvents: 6 }
    },
    {
      hub_key: "marketing", content_type: "widget", widget_type: "resource_library", is_active: true,
      title: "Brand & Resource Library", category: "overview", sort_order: 6,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "resource_library", maxItems: 6 }
    },
    {
      hub_key: "marketing", content_type: "widget", widget_type: "quick_links", is_active: true,
      title: "Brand Assets", category: "overview", sort_order: 7,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "quick_links", display: "grid", hub_key: "marketing" }
    },
    {
      hub_key: "marketing", content_type: "widget", widget_type: "announcements", is_active: true,
      title: "Marketing Announcements", category: "overview", sort_order: 8,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "announcements", maxItems: 3, category: "product" }
    },
    {
      hub_key: "marketing", content_type: "widget", widget_type: "activity_feed", is_active: true,
      title: "Activity Feed", category: "overview", sort_order: 9,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "activity_feed", maxItems: 8 }
    },
    {
      hub_key: "marketing", content_type: "widget", widget_type: "ai_suggested_actions", is_active: true,
      title: "AI Suggested Actions", category: "overview", sort_order: 10,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "ai_suggested_actions" }
    },
  ],

  // ── INNOVATION ────────────────────────────────────────────────────────────
  innovation: [
    {
      hub_key: "innovation", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "Active Ideas", category: "overview", sort_order: 1,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Active Ideas", value: "23", unit: "In Review", trend: "+5 this week", trendDirection: "up", description: "Ideas currently in pipeline" }
    },
    {
      hub_key: "innovation", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "Projects Running", category: "overview", sort_order: 2,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Projects Running", value: "4", unit: "Active", trend: "On track", trendDirection: "neutral", description: "Innovation projects in progress" }
    },
    {
      hub_key: "innovation", content_type: "widget", widget_type: "kpi", is_active: true,
      title: "Experiments Live", category: "overview", sort_order: 3,
      config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Experiments Live", value: "8", unit: "Running", trend: "+2 this month", trendDirection: "up", description: "Active experiments & pilots" }
    },
    {
      hub_key: "innovation", content_type: "widget", widget_type: "tasks", is_active: true,
      title: "Innovation Tasks", category: "overview", sort_order: 4,
      config_json: { tab_layout: "dashboard", size: "large", widget_type: "tasks", maxItems: 8, showCompleted: false }
    },
    {
      hub_key: "innovation", content_type: "widget", widget_type: "workflow_queue", is_active: true,
      title: "Project Queue", category: "overview", sort_order: 5,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "workflow_queue", maxItems: 6 }
    },
    {
      hub_key: "innovation", content_type: "widget", widget_type: "resource_library", is_active: true,
      title: "Innovation Resources", category: "overview", sort_order: 6,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "resource_library", maxItems: 6 }
    },
    {
      hub_key: "innovation", content_type: "widget", widget_type: "activity_feed", is_active: true,
      title: "Innovation Activity", category: "overview", sort_order: 7,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "activity_feed", maxItems: 8 }
    },
    {
      hub_key: "innovation", content_type: "widget", widget_type: "announcements", is_active: true,
      title: "Innovation Updates", category: "overview", sort_order: 8,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "announcements", maxItems: 3, category: "product" }
    },
    {
      hub_key: "innovation", content_type: "widget", widget_type: "ai_suggested_actions", is_active: true,
      title: "AI Suggested Actions", category: "overview", sort_order: 9,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "ai_suggested_actions" }
    },
    {
      hub_key: "innovation", content_type: "widget", widget_type: "ai_knowledge_search", is_active: true,
      title: "AI Knowledge Search", category: "overview", sort_order: 10,
      config_json: { tab_layout: "dashboard", size: "medium", widget_type: "ai_knowledge_search", placeholder: "Search ideas, projects, experiments…" }
    },
  ],
};

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const results = {};

    for (const cfg of HUB_CONFIGS) {
      const hubKey = cfg.hub_key;
      results[hubKey] = { configs: 0, tabs: 0, widgets: 0, skipped_widgets: 0 };

      // 1. HubConfiguration — create only if missing
      const existingCfg = await base44.asServiceRole.entities.HubConfiguration.filter({ hub_key: hubKey }, "", 1);
      if (!existingCfg || existingCfg.length === 0) {
        await base44.asServiceRole.entities.HubConfiguration.create({ ...cfg, hero_title: "Good morning" });
        results[hubKey].configs = 1;
      }

      // 2. Tabs — create only missing tabs (matched by hub_key + tab_key)
      const existingTabs = await base44.asServiceRole.entities.SalesHubTabConfig.filter({ hub_key: hubKey }, "", 50);
      const existingTabKeys = new Set((existingTabs || []).map(t => t.tab_key));
      const tabsToCreate = (HUB_DEFAULT_TABS[hubKey] || [])
        .filter(t => !existingTabKeys.has(t.tab_key))
        .map(t => ({ ...t, hub_key: hubKey }));
      if (tabsToCreate.length > 0) {
        await base44.asServiceRole.entities.SalesHubTabConfig.bulkCreate(tabsToCreate);
        results[hubKey].tabs = tabsToCreate.length;
      }

      // 3. Overview widgets — create only if the hub has zero widgets on "overview" tab
      // This preserves any custom widgets admins have added to the overview tab.
      const existingOverviewWidgets = await base44.asServiceRole.entities.HubContentItem.filter(
        { hub_key: hubKey, category: "overview" }, "", 100
      );

      if (!existingOverviewWidgets || existingOverviewWidgets.length === 0) {
        // No existing widgets — safe to seed all defaults
        const widgetsToCreate = HUB_DEFAULT_WIDGETS[hubKey] || [];
        if (widgetsToCreate.length > 0) {
          await base44.asServiceRole.entities.HubContentItem.bulkCreate(widgetsToCreate);
          results[hubKey].widgets = widgetsToCreate.length;
        }
      } else {
        // Existing widgets found — skip to preserve admin changes
        results[hubKey].skipped_widgets = existingOverviewWidgets.length;
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});