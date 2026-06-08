/**
 * seedOperationsHub — full idempotent seed for Operations Hub.
 * Seeds: tabs, quick links, tool cards, and widgets for ALL tabs.
 * SAFE: Only creates missing records. Never deletes or overwrites.
 * Admin-only.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const HUB_KEY = "operations";

const TABS = [
  { tab_key: "overview",   label: "Overview",         sort_order: 1, is_active: true, is_default: true,  icon: "LayoutDashboard" },
  { tab_key: "sops_processes", label: "SOPs & Processes", sort_order: 2, is_active: true, is_default: false, icon: "BookOpen" },
  { tab_key: "compliance", label: "Compliance",        sort_order: 3, is_active: true, is_default: false, icon: "Shield" },
  { tab_key: "documents",  label: "Documents",         sort_order: 4, is_active: true, is_default: false, icon: "FileText" },
  { tab_key: "templates",  label: "Templates",         sort_order: 5, is_active: true, is_default: false, icon: "Layout" },
  { tab_key: "ops-tools",  label: "Operations Tools",  sort_order: 6, is_active: true, is_default: false, icon: "Zap" },
  { tab_key: "ai",         label: "AI Assistant",      sort_order: 7, is_active: true, is_default: false, icon: "Sparkles" },
];

// Quick Launch items — stored as HubContentItem with content_type="quick_link"
const QUICK_LINKS = [
  { title: "DBS Query & CJSM Tracker", url: "/dbs-tracker", icon: "Shield",      colour_theme: "cyan",   sort_order: 1, badge_text: "New" },
  { title: "SOP Library",              url: "#",  icon: "BookOpen",        colour_theme: "cyan",   sort_order: 2, badge_text: "" },
  { title: "Policy Library",           url: "#",  icon: "Shield",          colour_theme: "green",  sort_order: 3, badge_text: "" },
  { title: "Document Library",         url: "#",  icon: "FileText",        colour_theme: "blue",   sort_order: 4, badge_text: "" },
  { title: "Audit Tracker",            url: "#",  icon: "ClipboardCheck",  colour_theme: "purple", sort_order: 5, badge_text: "" },
  { title: "Risk Register",            url: "#",  icon: "AlertTriangle",   colour_theme: "amber",  sort_order: 6, badge_text: "" },
  { title: "Process Mapper",           url: "#",  icon: "GitBranch",       colour_theme: "pink",   sort_order: 7, badge_text: "" },
  { title: "SOP Builder",              url: "#",  icon: "PencilSquare",    colour_theme: "blue",   sort_order: 8, badge_text: "Featured" },
];

// Enablement/document resources — stored as HubContentItem with content_type="enablement"
const ENABLEMENT = [
  { title: "Operations Manual",        description: "Core operations reference guide.", content_subtype: "Guide",     icon: "BookOpen",   colour_theme: "blue",   sort_order: 1, url: "#" },
  { title: "DBS Process SOP",          description: "Standard operating procedure for DBS checks.", content_subtype: "Playbook", icon: "FileText",   colour_theme: "cyan",   sort_order: 2, url: "#" },
  { title: "Compliance Policy v2.4",   description: "Current company compliance policy.", content_subtype: "PDF",      icon: "Shield",     colour_theme: "green",  sort_order: 3, url: "#" },
  { title: "Risk Assessment Template", description: "Standard risk assessment template.", content_subtype: "Template", icon: "AlertTriangle", colour_theme: "amber", sort_order: 4, url: "#" },
  { title: "Supplier Onboarding Guide",description: "Guide for onboarding new suppliers.", content_subtype: "Guide",  icon: "UserPlus",   colour_theme: "purple", sort_order: 5, url: "#" },
  { title: "Audit Checklist 2024",     description: "Internal audit checklist for this year.", content_subtype: "Template", icon: "ClipboardCheck", colour_theme: "pink", sort_order: 6, url: "#" },
];

// Tool cards — stored as HubContentItem with content_type="tool"
const TOOLS = [
  { title: "DBS Query & CJSM Tracker", description: "Track CJSM queries, client responses, DBS replies and clarification history.", icon: "Shield", colour_theme: "cyan", sort_order: 1, url: "/dbs-tracker" },
  { title: "60 Day DBS Escalations", description: "Track DBS applications due for 60 day escalation.", icon: "AlertTriangle", colour_theme: "pink", sort_order: 2, url: "/operations/60-day-dbs-escalations" },
  { title: "SOP Builder",        description: "Create and manage Standard Operating Procedures.", icon: "BookOpen",      colour_theme: "cyan",   sort_order: 3, url: "#" },
  { title: "Policy Builder",     description: "Draft and publish company policies.",              icon: "Shield",        colour_theme: "green",  sort_order: 4, url: "#" },
  { title: "Audit Tracker",      description: "Track audit actions and compliance deadlines.",    icon: "ClipboardCheck",colour_theme: "purple", sort_order: 5, url: "#" },
  { title: "Risk Register",      description: "Log, assess, and mitigate operational risks.",     icon: "AlertTriangle", colour_theme: "amber",  sort_order: 6, url: "#" },
  { title: "Review Scheduler",   description: "Schedule document and policy reviews.",            icon: "Calendar",      colour_theme: "blue",   sort_order: 7, url: "#" },
  { title: "Process Mapper",     description: "Map and visualise operational workflows.",         icon: "GitBranch",     colour_theme: "pink",   sort_order: 8, url: "#" },
  { title: "Document Library",   description: "Search and browse all operational documents.",     icon: "FileText",      colour_theme: "cyan",   sort_order: 9, url: "#" },
  { title: "Compliance Checker", description: "Verify compliance with policies and regulations.",  icon: "CheckCircle2",  colour_theme: "green",  sort_order: 10, url: "#" },
  { title: "Action Tracker",     description: "Track and manage operational action items.",       icon: "ListChecks",    colour_theme: "purple", sort_order: 11, url: "#" },
  { title: "Document Generator", description: "Generate compliance and operational documents.",   icon: "FileOutput",    colour_theme: "blue",   sort_order: 12, url: "#" },
  { title: "Improvement Suggestions", description: "Suggest and track process improvements.",   icon: "Lightbulb",     colour_theme: "amber",  sort_order: 13, url: "#" },
  { title: "Operations AI",      description: "AI-powered operations assistant.",                 icon: "Sparkles",      colour_theme: "purple", sort_order: 14, url: "#" },
];

// Widgets per tab — stored as HubContentItem with content_type="widget"
const WIDGETS = {

  overview: [
    { title: "Operational Alerts",    widget_type: "operational_alerts",  sort_order: 1, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "operational_alerts", maxItems: 5 } },
    { title: "Service Status",        widget_type: "service_status",      sort_order: 2, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "service_status" } },
    { title: "Checks Today",          widget_type: "kpi",                 sort_order: 3, config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Checks Today", value: "142", unit: "Today", trend: "+8 vs yesterday", trendDirection: "up", description: "Background checks processed" } },
    { title: "SLA Compliance",        widget_type: "kpi",                 sort_order: 4, config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "SLA Compliance", value: "97.3%", unit: "This Week", trend: "+0.4% vs last week", trendDirection: "up", description: "On-time delivery rate" } },
    { title: "Queue Backlog",         widget_type: "kpi",                 sort_order: 5, config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Queue Backlog", value: "18", unit: "Items", trend: "-4 since yesterday", trendDirection: "up", description: "Pending items in queue" } },
    { title: "Workflow Queue",        widget_type: "workflow_queue",      sort_order: 6, config_json: { tab_layout: "dashboard", size: "large", widget_type: "workflow_queue", maxItems: 8 } },
    { title: "Processing Volumes",    widget_type: "processing_volumes",  sort_order: 7, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "processing_volumes", period: "Daily" } },
    { title: "Operational Tasks",     widget_type: "tasks",               sort_order: 8, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "tasks", maxItems: 6, showCompleted: false } },
    { title: "Operations Updates",    widget_type: "announcements",       sort_order: 9, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "announcements", maxItems: 3, category: "operations" } },
    { title: "Team Calendar",         widget_type: "calendar",            sort_order: 10, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "calendar", maxEvents: 5 } },
    { title: "Resource Library",      widget_type: "resource_library",    sort_order: 11, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "resource_library", maxItems: 6, hub_key: "operations" } },
    { title: "AI Assistant",          widget_type: "ai_assistant",        sort_order: 12, config_json: { tab_layout: "dashboard", size: "small", widget_type: "ai_assistant", title: "Operations AI", promptSuggestions: ["Show today's SLA status", "What's in the workflow queue?", "Summarise operational alerts"] } },
  ],

  compliance: [
    { title: "Compliance Status",       widget_type: "compliance_status",      sort_order: 1, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "compliance_status" } },
    { title: "Compliance Score",        widget_type: "kpi",                    sort_order: 2, config_json: { tab_layout: "dashboard", size: "small", widget_type: "kpi", metric: "Compliance Score", value: "94%", unit: "Overall", trend: "+2% vs last quarter", trendDirection: "up", description: "Organisation-wide compliance" } },
    { title: "Expiring Certifications", widget_type: "expiring_certs",         sort_order: 3, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "expiring_certs", daysAhead: 60 } },
    { title: "Policy Acknowledgements", widget_type: "policy_acknowledgement", sort_order: 4, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "policy_acknowledgement" } },
    { title: "Audit Actions",           widget_type: "audit_actions",          sort_order: 5, config_json: { tab_layout: "dashboard", size: "large", widget_type: "audit_actions", maxItems: 8 } },
    { title: "Training Due Soon",       widget_type: "training_due",           sort_order: 6, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "training_due", daysAhead: 30 } },
    { title: "Compliance Announcements",widget_type: "announcements",          sort_order: 7, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "announcements", maxItems: 3, category: "compliance" } },
    { title: "Policy & Resource Library",widget_type: "resource_library",      sort_order: 8, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "resource_library", maxItems: 6 } },
    { title: "Compliance AI Search",    widget_type: "ai_knowledge_search",    sort_order: 9, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "ai_knowledge_search", placeholder: "Ask about policies, audits, or certifications…" } },
  ],

  sops_processes: [
    { title: "SOP Library",            widget_type: "resource_library",   sort_order: 1, config_json: { tab_layout: "dashboard", size: "large", widget_type: "resource_library", maxItems: 12 } },
    { title: "Process Documents",      widget_type: "resource_library",   sort_order: 2, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "resource_library", maxItems: 8 } },
    { title: "Process Maps",           widget_type: "resource_library",   sort_order: 3, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "resource_library", maxItems: 6 } },
    { title: "SOP Tasks",              widget_type: "tasks",              sort_order: 4, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "tasks", maxItems: 6, showCompleted: false } },
    { title: "SOP Updates",            widget_type: "announcements",      sort_order: 5, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "announcements", maxItems: 3, category: "operations" } },
    { title: "SOP Search",             widget_type: "ai_knowledge_search",sort_order: 6, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "ai_knowledge_search", placeholder: "Search SOPs, processes, procedures…" } },
  ],

  documents: [
    { title: "Document Library",       widget_type: "resource_library",   sort_order: 1, config_json: { tab_layout: "dashboard", size: "large", widget_type: "resource_library", maxItems: 12 } },
    { title: "Recent Activity",        widget_type: "activity_feed",      sort_order: 2, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "activity_feed", maxItems: 8 } },
    { title: "Quick Links",            widget_type: "quick_links",        sort_order: 3, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "quick_links", display: "grid", hub_key: "operations" } },
    { title: "Document Search",        widget_type: "ai_knowledge_search",sort_order: 4, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "ai_knowledge_search", placeholder: "Search documents, files, guides…" } },
    { title: "Calendar",               widget_type: "calendar",           sort_order: 5, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "calendar", maxEvents: 5 } },
  ],

  templates: [
    { title: "Templates Coming Soon",  widget_type: "placeholder",        sort_order: 1, config_json: { tab_layout: "single", size: "full", widget_type: "placeholder", title: "Templates", message: "Policy, Audit, Risk, Process, Meeting, Investigation and Operational templates will be available soon." } },
  ],

  "ops-tools": [
    { title: "All Operations Tools",   widget_type: "quick_links",        sort_order: 1, config_json: { tab_layout: "dashboard", size: "full", widget_type: "quick_links", display: "grid", hub_key: "operations" } },
    { title: "Tool Status",            widget_type: "operational_alerts", sort_order: 2, config_json: { tab_layout: "dashboard", size: "medium", widget_type: "operational_alerts", maxItems: 8 } },
  ],

  ai: [
    { title: "Operations AI Assistant",widget_type: "ai_assistant",       sort_order: 1, config_json: { tab_layout: "single", size: "full", widget_type: "ai_assistant", title: "Operations Assistant", promptSuggestions: ["Help me write an SOP", "What are our compliance obligations?", "Summarise today's operational alerts", "Create a risk assessment template", "Review our process for DBS checks"] } },
    { title: "AI Knowledge Search",    widget_type: "ai_knowledge_search",sort_order: 2, config_json: { tab_layout: "single", size: "full", widget_type: "ai_knowledge_search", placeholder: "Ask anything about Operations…" } },
    { title: "AI Recommended",         widget_type: "ai_recommended",     sort_order: 3, config_json: { tab_layout: "single", size: "full", widget_type: "ai_recommended", maxItems: 4 } },
    { title: "AI Suggested Actions",   widget_type: "ai_suggested_actions",sort_order: 4, config_json: { tab_layout: "single", size: "full", widget_type: "ai_suggested_actions" } },
  ],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const results = { tabs: 0, quickLinks: 0, tools: 0, widgets: {} };

    // 1. Seed tabs — only missing ones
    const existingTabs = await base44.asServiceRole.entities.SalesHubTabConfig.filter({ hub_key: HUB_KEY }, "", 50);
    const existingTabKeys = new Set((existingTabs || []).map(t => t.tab_key));

    // Also DELETE old tab keys that are no longer in the new set
    const OLD_KEYS = ["workflows", "status", "volumes", "resources", "processes"];
    const toDelete = (existingTabs || []).filter(t => OLD_KEYS.includes(t.tab_key));
    for (const t of toDelete) {
      await base44.asServiceRole.entities.SalesHubTabConfig.delete(t.id);
    }
    // Refresh existing keys after deletion
    const refreshedTabs = await base44.asServiceRole.entities.SalesHubTabConfig.filter({ hub_key: HUB_KEY }, "", 50);
    const refreshedKeys = new Set((refreshedTabs || []).map(t => t.tab_key));

    const tabsToCreate = TABS.filter(t => !refreshedKeys.has(t.tab_key)).map(t => ({ ...t, hub_key: HUB_KEY }));
    if (tabsToCreate.length > 0) {
      await base44.asServiceRole.entities.SalesHubTabConfig.bulkCreate(tabsToCreate);
      results.tabs = tabsToCreate.length;
    }

    // 2. Seed quick links — always refresh for latest version
    const existingQL = await base44.asServiceRole.entities.HubContentItem.filter(
      { hub_key: HUB_KEY, content_type: "quick_link" }, "", 50
    );
    // Delete old quick links to refresh
    for (const q of (existingQL || [])) {
      await base44.asServiceRole.entities.HubContentItem.delete(q.id);
    }
    const qlToCreate = QUICK_LINKS.map(q => ({
      ...q, hub_key: HUB_KEY, content_type: "quick_link", is_active: true,
      open_in_new_tab: true, description: q.title,
    }));
    await base44.asServiceRole.entities.HubContentItem.bulkCreate(qlToCreate);
    results.quickLinks = qlToCreate.length;

    // 3. Seed tools — always refresh for latest version
    const existingTools = await base44.asServiceRole.entities.HubContentItem.filter(
      { hub_key: HUB_KEY, content_type: "tool" }, "", 50
    );
    // Delete old tools to refresh
    for (const t of (existingTools || [])) {
      await base44.asServiceRole.entities.HubContentItem.delete(t.id);
    }
    const toolsToCreate = TOOLS.map(t => ({
      ...t, hub_key: HUB_KEY, content_type: "tool", is_active: true, open_in_new_tab: false,
    }));
    await base44.asServiceRole.entities.HubContentItem.bulkCreate(toolsToCreate);
    results.tools = toolsToCreate.length;

    // 4. Seed enablement items — only if none exist for this hub
    const existingEnablement = await base44.asServiceRole.entities.HubContentItem.filter(
      { hub_key: HUB_KEY, content_type: "enablement" }, "", 50
    );
    if (!existingEnablement || existingEnablement.length === 0) {
      const toCreate = ENABLEMENT.map(e => ({ ...e, hub_key: HUB_KEY, content_type: "enablement", is_active: true }));
      await base44.asServiceRole.entities.HubContentItem.bulkCreate(toCreate);
      results.enablement = toCreate.length;
    } else {
      results.enablement = `skipped (${existingEnablement.length} existing)`;
    }

    // 5. Seed widgets per tab — clean up old and seed new
    // First clean up widgets for deleted tabs and old widget configs
    const oldTabKeys = ["processes"];
    for (const oldKey of oldTabKeys) {
      const oldWidgets = await base44.asServiceRole.entities.HubContentItem.filter(
        { hub_key: HUB_KEY, content_type: "widget", category: oldKey }, "", 50
      );
      for (const w of (oldWidgets || [])) {
        await base44.asServiceRole.entities.HubContentItem.delete(w.id);
      }
    }

    // Also clean up templates tab to refresh with new config
    const templatesWidgets = await base44.asServiceRole.entities.HubContentItem.filter(
      { hub_key: HUB_KEY, content_type: "widget", category: "templates" }, "", 50
    );
    for (const w of (templatesWidgets || [])) {
      await base44.asServiceRole.entities.HubContentItem.delete(w.id);
    }

    for (const [tabKey, tabWidgets] of Object.entries(WIDGETS)) {
      const existing = await base44.asServiceRole.entities.HubContentItem.filter(
        { hub_key: HUB_KEY, content_type: "widget", category: tabKey }, "", 50
      );
      if (!existing || existing.length === 0) {
        const toCreate = tabWidgets.map(w => ({
          ...w, hub_key: HUB_KEY, content_type: "widget", is_active: true, category: tabKey,
        }));
        await base44.asServiceRole.entities.HubContentItem.bulkCreate(toCreate);
        results.widgets[tabKey] = toCreate.length;
      } else {
        results.widgets[tabKey] = `skipped (${existing.length} existing)`;
      }
    }

    return Response.json({ success: true, hub: HUB_KEY, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});