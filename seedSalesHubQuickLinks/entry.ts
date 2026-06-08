import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DEFAULT_QUICK_LINKS = [
  {
    title: "Open HubSpot",
    description: "Access HubSpot CRM",
    url: "https://app.hubspot.com",
    icon: "Globe",
    colour_theme: "cyan",
    sort_order: 1,
    is_active: true,
    open_in_new_tab: true,
  },
  {
    title: "Open Power BI",
    description: "View sales analytics",
    url: "https://app.powerbi.com/groups/966ddc8c-43da-4dc5-a1c8-b10c8e6ba2ac/reports/8866abf5-7dda-4ebf-985d-4f2c1af26639/8ce144bece14a0c04002?experience=power-bi",
    icon: "BarChart2",
    colour_theme: "purple",
    sort_order: 2,
    is_active: true,
    open_in_new_tab: true,
  },
  {
    title: "Sales Guides",
    description: "Onboarding and best practices",
    url: "#",
    icon: "BookOpen",
    colour_theme: "amber",
    sort_order: 3,
    is_active: true,
    open_in_new_tab: true,
  },
  {
    title: "Client Sign Up",
    description: "Register new clients",
    url: "#",
    icon: "UserPlus",
    colour_theme: "pink",
    sort_order: 4,
    is_active: true,
    open_in_new_tab: true,
  },
  {
    title: "CD Admin Portal",
    description: "Admin controls",
    url: "#",
    icon: "Shield",
    colour_theme: "blue",
    sort_order: 5,
    is_active: true,
    open_in_new_tab: true,
  },
  {
    title: "Accurate Portal",
    description: "Accurate checks system",
    url: "#",
    icon: "CheckSquare",
    colour_theme: "green",
    sort_order: 6,
    is_active: true,
    open_in_new_tab: true,
  },
  {
    title: "Flick Portal",
    description: "Flick integration",
    url: "#",
    icon: "Zap",
    colour_theme: "purple",
    sort_order: 7,
    is_active: true,
    open_in_new_tab: true,
  },
  {
    title: "CERTN Portal",
    description: "CERTN checks",
    url: "#",
    icon: "ScanLine",
    colour_theme: "red",
    sort_order: 8,
    is_active: true,
    open_in_new_tab: true,
  },
  {
    title: "Credas",
    description: "Credas system",
    url: "#",
    icon: "CreditCard",
    colour_theme: "green",
    sort_order: 9,
    is_active: true,
    open_in_new_tab: true,
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if links already exist
    const existing = await base44.entities.SalesHubQuickLink.list("", 100);
    
    if (existing && existing.length > 0) {
      return Response.json({ message: 'Quick links already seeded', count: existing.length });
    }

    // Create default links
    await base44.entities.SalesHubQuickLink.bulkCreate(DEFAULT_QUICK_LINKS);

    return Response.json({ success: true, created: DEFAULT_QUICK_LINKS.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});