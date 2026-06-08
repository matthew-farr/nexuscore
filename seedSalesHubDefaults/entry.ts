import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const TOOLS_SEED = [
      {
        title: "VAT Calculator",
        description: "Quickly calculate VAT amounts for quotes, invoices and proposals.",
        route: "/sales/vat-calculator",
        icon: "Calculator",
        colour_theme: "cyan",
        sort_order: 1,
        is_active: true,
      },
      {
        title: "Pricing Calculator",
        description: "Build and validate pricing structures across service tiers.",
        route: "/sales/pricing-calculator",
        icon: "PoundSterling",
        colour_theme: "purple",
        sort_order: 2,
        is_active: true,
      },
      {
        title: "Customer Price List",
        description: "Build clean customer price lists from your pricing data.",
        route: "/sales/customer-price-list",
        icon: "FileText",
        colour_theme: "amber",
        sort_order: 3,
        is_active: true,
      },
      {
        title: "Commission Estimator",
        description: "Estimate commission earnings based on deal value and structure.",
        route: "/sales/commission-estimator",
        icon: "TrendingUp",
        colour_theme: "green",
        sort_order: 4,
        is_active: true,
      },
      {
        title: "Date Between",
        description: "Quick date range calculator for reports and filters.",
        route: "/sales/date-between",
        icon: "Calendar",
        colour_theme: "cyan",
        sort_order: 5,
        is_active: true,
      },
      ];

    const LINKS_SEED = [
      { title: "Open HubSpot", url: "https://hubspot.com", icon: "Globe", colour_theme: "cyan", sort_order: 1, is_active: true, open_in_new_tab: true },
      { title: "Open Power BI", url: "https://powerbi.microsoft.com", icon: "BarChart2", colour_theme: "blue", sort_order: 2, is_active: true, open_in_new_tab: true },
      { title: "Sales Guides", url: "#", icon: "BookOpen", colour_theme: "purple", sort_order: 3, is_active: true, open_in_new_tab: false },
      { title: "Client Sign Up", url: "https://example.com/signup", icon: "UserPlus", colour_theme: "green", sort_order: 4, is_active: true, open_in_new_tab: true },
      { title: "CD Admin Portal", url: "https://admin.example.com", icon: "Shield", colour_theme: "pink", sort_order: 5, is_active: true, open_in_new_tab: true },
      { title: "Accurate Portal", url: "https://accurate.example.com", icon: "CheckSquare", colour_theme: "green", sort_order: 6, is_active: true, open_in_new_tab: true },
      { title: "Flick Portal", url: "https://flick.example.com", icon: "Zap", colour_theme: "amber", sort_order: 7, is_active: true, open_in_new_tab: true },
      { title: "CERTN Portal", url: "https://certn.example.com", icon: "Shield", colour_theme: "red", sort_order: 8, is_active: true, open_in_new_tab: true },
      { title: "Credas", url: "https://credas.example.com", icon: "Link", colour_theme: "blue", sort_order: 9, is_active: true, open_in_new_tab: true },
    ];

    const WIDGETS_SEED = [
      { title: "Calendar", description: "Upcoming events and deadlines", widget_type: "Calendar", sort_order: 1, is_active: true, colour_theme: "cyan" },
      { title: "Notifications", description: "System and alerts", widget_type: "Notifications", sort_order: 2, is_active: true, colour_theme: "pink" },
      { title: "Top Performers", description: "Monthly leaderboard", widget_type: "Top Performers", sort_order: 3, is_active: true, colour_theme: "green" },
      { title: "Upcoming Events", description: "Team activities and meetings", widget_type: "Upcoming Events", sort_order: 4, is_active: true, colour_theme: "purple" },
    ];

    const ENABLEMENT_SEED = [
      {
        title: "Q2 Sales Playbook",
        description: "Updated May 2026",
        content_type: "Guide",
        category: "Sales Enablement",
        sort_order: 1,
        is_active: true,
        badge_text: "New",
      },
      {
        title: "Case Studies Library",
        description: "22 documents",
        content_type: "PDF",
        category: "Sales Enablement",
        sort_order: 2,
        is_active: true,
      },
      {
        title: "Competitor Analysis",
        description: "Q2 2026",
        content_type: "Guide",
        category: "Sales Enablement",
        sort_order: 3,
        is_active: true,
      },
      {
        title: "Objection Handling Guide",
        description: "PDF · 18 pages",
        content_type: "PDF",
        category: "Sales Enablement",
        sort_order: 4,
        is_active: true,
      },
    ];

    const PROPOSAL_SEED = [
      {
        template_name: "Standard Proposal",
        template_type: "Standard Proposal",
        html_template: "<div style='padding: 20px;'><h1>Standard Proposal</h1><p>Your proposal content here</p></div>",
        is_active: true,
        description: "18 templates",
      },
      {
        template_name: "Enterprise Proposal",
        template_type: "Enterprise Proposal",
        html_template: "<div style='padding: 20px;'><h1>Enterprise Proposal</h1><p>Enterprise proposal content</p></div>",
        is_active: false,
        description: "6 templates",
      },
      {
        template_name: "Renewal Proposal",
        template_type: "Renewal Proposal",
        html_template: "<div style='padding: 20px;'><h1>Renewal Proposal</h1><p>Renewal terms and pricing</p></div>",
        is_active: false,
        description: "Renewal deals",
      },
      {
        template_name: "One-page Summary",
        template_type: "One-page Summary",
        html_template: "<div style='padding: 20px;'><h1>One-page Summary</h1><p>Quick executive summary</p></div>",
        is_active: false,
        description: "Quick summaries",
      },
    ];

    const DASHBOARD_SEED = [
      {
        title: "Main Sales Dashboard",
        description: "Power BI sales overview",
        embed_url: "https://app.powerbi.com/view",
        embed_type: "Power BI",
        height: 460,
        is_active: false,
        show_header: true,
      },
    ];

    const BRANDING_DEFAULT = {
      hero_title: "Good morning",
      hero_subtitle: "Ready to drive performance today?",
      hero_badge: "Sales Hub",
      background_style: "Gradient",
      accent_colour: "#ec2ca3",
      show_ai_card: true,
      show_search: true,
      default_tab: "overview",
      layout_density: "Comfortable",
    };

    const TABS_SEED = [
      { hub_key: "sales", tab_key: "overview",    label: "Overview",     sort_order: 1, is_active: true, is_default: true,  icon: "LayoutDashboard", description: "Sales overview and quick actions" },
      { hub_key: "sales", tab_key: "analytics",   label: "Analytics",    sort_order: 2, is_active: true, is_default: false, icon: "BarChart2",       description: "Sales performance and dashboards" },
      { hub_key: "sales", tab_key: "sales-tools", label: "Sales Tools",  sort_order: 3, is_active: true, is_default: false, icon: "Zap",             description: "Internal calculators and tools" },
      { hub_key: "sales", tab_key: "guides",      label: "Guides",       sort_order: 4, is_active: true, is_default: false, icon: "BookOpen",        description: "Sales enablement resources" },
      { hub_key: "sales", tab_key: "ai",          label: "AI Assistant", sort_order: 5, is_active: true, is_default: false, icon: "Sparkles",        description: "AI assistant for sales queries" },
    ];

    // Fetch existing records to deduplicate
    console.log("Fetching existing Sales Hub records...");
    const [tools, links, widgets, enablement, proposals, dashboards, brandingList, existingTabs] = await Promise.all([
      base44.asServiceRole.entities.SalesHubTool.list("", 1000).catch(() => []),
      base44.asServiceRole.entities.SalesHubQuickLink.list("", 1000).catch(() => []),
      base44.asServiceRole.entities.SalesHubSidebarWidget.list("", 1000).catch(() => []),
      base44.asServiceRole.entities.SalesEnablementItem.list("", 1000).catch(() => []),
      base44.asServiceRole.entities.SalesProposalTemplate.list("", 1000).catch(() => []),
      base44.asServiceRole.entities.SalesHubDashboardEmbed.list("", 1000).catch(() => []),
      base44.asServiceRole.entities.SalesHubBrandingConfig.list("", 1).catch(() => []),
      base44.asServiceRole.entities.SalesHubTabConfig.filter({ hub_key: "sales" }, "", 50).catch(() => []),
    ]);

    const existingToolTitles = new Set(tools.map(t => t.title));
    const existingLinkTitles = new Set(links.map(l => l.title));
    const existingWidgetTypes = new Set(widgets.map(w => w.widget_type));
    const existingEnablementTitles = new Set(enablement.map(e => e.title));
    const existingProposalNames = new Set(proposals.map(p => p.template_name));
    const existingDashboardTitles = new Set(dashboards.map(d => d.title));

    const seeded = {};

    // Seed Tools (deduped)
    const toolsToCreate = TOOLS_SEED.filter(t => !existingToolTitles.has(t.title));
    if (toolsToCreate.length > 0) {
      console.log(`Creating ${toolsToCreate.length} sales tools...`);
      await base44.asServiceRole.entities.SalesHubTool.bulkCreate(toolsToCreate);
      seeded.tools = toolsToCreate.length;
    } else {
      console.log("All sales tools already exist");
      seeded.tools = 0;
    }

    // Seed Quick Links (deduped)
    const linksToCreate = LINKS_SEED.filter(l => !existingLinkTitles.has(l.title));
    if (linksToCreate.length > 0) {
      console.log(`Creating ${linksToCreate.length} quick links...`);
      await base44.asServiceRole.entities.SalesHubQuickLink.bulkCreate(linksToCreate);
      seeded.links = linksToCreate.length;
    } else {
      console.log("All quick links already exist");
      seeded.links = 0;
    }

    // Seed Widgets (deduped)
    const widgetsToCreate = WIDGETS_SEED.filter(w => !existingWidgetTypes.has(w.widget_type));
    if (widgetsToCreate.length > 0) {
      console.log(`Creating ${widgetsToCreate.length} sidebar widgets...`);
      await base44.asServiceRole.entities.SalesHubSidebarWidget.bulkCreate(widgetsToCreate);
      seeded.widgets = widgetsToCreate.length;
    } else {
      console.log("All sidebar widgets already exist");
      seeded.widgets = 0;
    }

    // Seed Enablement (deduped)
    const enablementToCreate = ENABLEMENT_SEED.filter(e => !existingEnablementTitles.has(e.title));
    if (enablementToCreate.length > 0) {
      console.log(`Creating ${enablementToCreate.length} enablement items...`);
      await base44.asServiceRole.entities.SalesEnablementItem.bulkCreate(enablementToCreate);
      seeded.enablement = enablementToCreate.length;
    } else {
      console.log("All enablement items already exist");
      seeded.enablement = 0;
    }

    // Seed Proposal Templates (deduped)
    const proposalsToCreate = PROPOSAL_SEED.filter(p => !existingProposalNames.has(p.template_name));
    if (proposalsToCreate.length > 0) {
      console.log(`Creating ${proposalsToCreate.length} proposal templates...`);
      await base44.asServiceRole.entities.SalesProposalTemplate.bulkCreate(proposalsToCreate);
      seeded.proposals = proposalsToCreate.length;
    } else {
      console.log("All proposal templates already exist");
      seeded.proposals = 0;
    }

    // Seed Dashboard (deduped)
    const dashboardsToCreate = DASHBOARD_SEED.filter(d => !existingDashboardTitles.has(d.title));
    if (dashboardsToCreate.length > 0) {
      console.log(`Creating ${dashboardsToCreate.length} dashboard embeddings...`);
      await base44.asServiceRole.entities.SalesHubDashboardEmbed.bulkCreate(dashboardsToCreate);
      seeded.dashboards = dashboardsToCreate.length;
    } else {
      console.log("All dashboard embeddings already exist");
      seeded.dashboards = 0;
    }

    // Seed Branding (only if none exists)
    if (!brandingList || brandingList.length === 0) {
      console.log("Creating default branding config...");
      await base44.asServiceRole.entities.SalesHubBrandingConfig.create(BRANDING_DEFAULT);
      seeded.branding = 1;
    } else {
      seeded.branding = 0;
    }

    // Seed Tabs (deduped by tab_key)
    const existingTabKeys = new Set((existingTabs || []).map(t => t.tab_key));
    const tabsToCreate = TABS_SEED.filter(t => !existingTabKeys.has(t.tab_key));
    if (tabsToCreate.length > 0) {
      console.log(`Creating ${tabsToCreate.length} tab configs...`);
      await base44.asServiceRole.entities.SalesHubTabConfig.bulkCreate(tabsToCreate);
      seeded.tabs = tabsToCreate.length;
    } else {
      seeded.tabs = 0;
    }

    const totalSeeded = Object.values(seeded).reduce((a, b) => a + b, 0);
    console.log(`Seeding complete. Total records created: ${totalSeeded}`);

    return Response.json({
      status: 'success',
      message: `Sales Hub defaults ready. Created ${totalSeeded} records.`,
      seeded,
      existing: {
        tools: tools.length,
        links: links.length,
        widgets: widgets.length,
        enablement: enablement.length,
        proposals: proposals.length,
        dashboards: dashboards.length,
      },
    });
  } catch (error) {
    console.error("Seeding error:", error.message);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});