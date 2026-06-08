/**
 * Central hub configuration registry.
 * All hub-specific defaults live here — NO hardcoding in individual pages.
 */

export const HUB_REGISTRY = {
  sales: {
    key: "sales",
    name: "Sales Hub",
    route: "/sales",
    icon: "TrendingUp",
    defaultAccent: "#ec2ca3",
    defaultBadge: "Sales Hub",
    defaultSubtitle: "Ready to drive performance today?",
  },
  operations: {
    key: "operations",
    name: "Operations Hub",
    route: "/operations",
    icon: "Settings2",
    defaultAccent: "#0ea5e9",
    defaultBadge: "Operations Hub",
    defaultSubtitle: "Operations, Compliance, Documentation and Process Management.",
  },
  compliance: {
    key: "compliance",
    name: "Compliance Hub",
    route: "/compliance",
    icon: "Shield",
    defaultAccent: "#10b981",
    defaultBadge: "Compliance Hub",
    defaultSubtitle: "Stay compliant, stay protected.",
  },
  learning: {
    key: "learning",
    name: "Learning Hub",
    route: "/learning",
    icon: "GraduationCap",
    defaultAccent: "#8b5cf6",
    defaultBadge: "Learning Hub",
    defaultSubtitle: "Grow your skills and knowledge.",
  },
  marketing: {
    key: "marketing",
    name: "Marketing Hub",
    route: "/marketing",
    icon: "Megaphone",
    defaultAccent: "#f59e0b",
    defaultBadge: "Marketing Hub",
    defaultSubtitle: "Drive brand and pipeline growth.",
  },
  innovation: {
    key: "innovation",
    name: "Innovation Hub",
    route: "/innovation",
    icon: "Lightbulb",
    defaultAccent: "#6366f1",
    defaultBadge: "Innovation Hub",
    defaultSubtitle: "Build the future of Checks Direct.",
  },
};

export const HUB_DEFAULT_TABS = {
  sales: [
    { tab_key: "overview",     label: "Overview",      sort_order: 1, is_active: true, is_default: true,  icon: "LayoutDashboard" },
    { tab_key: "analytics",    label: "Analytics",     sort_order: 2, is_active: true, is_default: false, icon: "BarChart2" },
    { tab_key: "sales-tools",  label: "Sales Tools",   sort_order: 3, is_active: true, is_default: false, icon: "Zap" },
    { tab_key: "guides",       label: "Guides",        sort_order: 4, is_active: true, is_default: false, icon: "BookOpen" },
    { tab_key: "ai",           label: "AI Assistant",  sort_order: 5, is_active: true, is_default: false, icon: "Sparkles" },
  ],
  operations: [
    { tab_key: "overview",   label: "Overview",           sort_order: 1, is_active: true, is_default: true,  icon: "LayoutDashboard" },
    { tab_key: "compliance", label: "Compliance",         sort_order: 2, is_active: true, is_default: false, icon: "Shield" },
    { tab_key: "processes",  label: "Processes",          sort_order: 3, is_active: true, is_default: false, icon: "GitBranch" },
    { tab_key: "documents",  label: "Documents",          sort_order: 4, is_active: true, is_default: false, icon: "FileText" },
    { tab_key: "templates",  label: "Templates",          sort_order: 5, is_active: true, is_default: false, icon: "Layout" },
    { tab_key: "ops-tools",  label: "Operations Tools",   sort_order: 6, is_active: true, is_default: false, icon: "Zap" },
    { tab_key: "ai",         label: "AI Assistant",       sort_order: 7, is_active: true, is_default: false, icon: "Sparkles" },
  ],
  compliance: [
    { tab_key: "overview",    label: "Overview",            sort_order: 1, is_active: true, is_default: true,  icon: "LayoutDashboard" },
    { tab_key: "policies",    label: "Policies",            sort_order: 2, is_active: true, is_default: false, icon: "Shield" },
    { tab_key: "audits",      label: "Audit Actions",       sort_order: 3, is_active: true, is_default: false, icon: "ClipboardCheck" },
    { tab_key: "expiring",    label: "Expiring Checks",     sort_order: 4, is_active: true, is_default: false, icon: "AlertTriangle" },
    { tab_key: "training",    label: "Training Compliance", sort_order: 5, is_active: true, is_default: false, icon: "GraduationCap" },
    { tab_key: "ai",          label: "AI Assistant",        sort_order: 6, is_active: true, is_default: false, icon: "Sparkles" },
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
    { tab_key: "overview",   label: "Overview",          sort_order: 1, is_active: true, is_default: true,  icon: "LayoutDashboard" },
    { tab_key: "campaigns",  label: "Campaigns",         sort_order: 2, is_active: true, is_default: false, icon: "Megaphone" },
    { tab_key: "calendar",   label: "Content Calendar",  sort_order: 3, is_active: true, is_default: false, icon: "Calendar" },
    { tab_key: "assets",     label: "Brand Assets",      sort_order: 4, is_active: true, is_default: false, icon: "Image" },
    { tab_key: "resources",  label: "Resources",         sort_order: 5, is_active: true, is_default: false, icon: "BookOpen" },
    { tab_key: "ai",         label: "AI Assistant",      sort_order: 6, is_active: true, is_default: false, icon: "Sparkles" },
  ],
  innovation: [
    { tab_key: "overview",   label: "Overview",     sort_order: 1, is_active: true, is_default: true,  icon: "LayoutDashboard" },
    { tab_key: "ideas",      label: "Ideas",        sort_order: 2, is_active: true, is_default: false, icon: "Lightbulb" },
    { tab_key: "projects",   label: "Projects",     sort_order: 3, is_active: true, is_default: false, icon: "Layers" },
    { tab_key: "roadmap",    label: "Roadmap",      sort_order: 4, is_active: true, is_default: false, icon: "Map" },
    { tab_key: "experiments",label: "Experiments",  sort_order: 5, is_active: true, is_default: false, icon: "FlaskConical" },
    { tab_key: "ai",         label: "AI Assistant", sort_order: 6, is_active: true, is_default: false, icon: "Sparkles" },
  ],
};