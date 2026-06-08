import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ICON_MAPPINGS = {
  // Exact domain matches
  'slack.com': 'Slack',
  'github.com': 'Github',
  'linkedin.com': 'Linkedin',
  'twitter.com': 'Twitter',
  'facebook.com': 'Facebook',
  'instagram.com': 'Instagram',
  'hubspot.com': 'HubSpot',
  'salesforce.com': 'Salesforce',
  'microsoft.com': 'Teams',
  'teams.microsoft.com': 'Teams',
  'outlook.com': 'Outlook',
  'powerbi.microsoft.com': 'PowerBI',
  'sheets.google.com': 'Google Sheets',
  'docs.google.com': 'Word',
  'drive.google.com': 'Google Drive',
  'calendar.google.com': 'Calendar',
  'analytics.google.com': 'Google Analytics',
  'jira.atlassian.net': 'Jira',
  'confluence.atlassian.net': 'Confluence',
  'asana.com': 'Asana',
  'monday.com': 'Monday.com',
  'notion.so': 'Notion',
  'figma.com': 'Figma',
  'stripe.com': 'Stripe',
  'paypal.com': 'PayPal',
  'shopify.com': 'Shopify',
  'zoom.us': 'Zoom',
  'meet.google.com': 'Google Meet',
  'trello.com': 'Trello',
  'discord.com': 'Discord',
  'tableau.com': 'Tableau',
  'looker.com': 'Looker',
  
  // Keyword matches (case-insensitive)
  'hubspot': 'HubSpot',
  'salesforce': 'Salesforce',
  'teams': 'Teams',
  'slack': 'Slack',
  'github': 'Github',
  'jira': 'Jira',
  'confluence': 'Confluence',
  'asana': 'Asana',
  'monday': 'Monday.com',
  'notion': 'Notion',
  'figma': 'Figma',
  'tableau': 'Tableau',
  'looker': 'Looker',
  'powerbi': 'PowerBI',
  'analytics': 'Google Analytics',
  'sheets': 'Google Sheets',
  'docs': 'Word',
  'drive': 'Google Drive',
  'mail': 'Mail',
  'calendar': 'Calendar',
  'outlook': 'Outlook',
  'teams': 'Teams',
  'linkedin': 'Linkedin',
  'twitter': 'Twitter',
  'facebook': 'Facebook',
  'instagram': 'Instagram',
  'zoom': 'Zoom',
  'meet': 'Google Meet',
  'trello': 'Trello',
  'discord': 'Discord',
  'stripe': 'Stripe',
  'paypal': 'PayPal',
  'shopify': 'Shopify',
  'crm': 'Salesforce',
  'marketing': 'Megaphone',
  'sales': 'ShoppingCart',
  'support': 'HeartPulse',
  'hr': 'Users',
  'finance': 'DollarSign',
  'operations': 'Wrench',
  'engineering': 'Cpu',
  'design': 'Layers',
  'development': 'GitBranch',
  'project': 'Briefcase',
  'knowledge': 'BookOpen',
  'learning': 'GraduationCap',
  'training': 'GraduationCap',
  'help': 'HelpCircle',
  'documentation': 'BookOpen',
  'api': 'Server',
  'dashboard': 'Grid',
  'report': 'BarChart2',
  'analytics': 'LineChart',
  'data': 'Database',
};

function findIconForLink(title, url) {
  const lowerTitle = title.toLowerCase();
  const lowerUrl = url.toLowerCase();

  // Try exact domain match first
  for (const [domain, icon] of Object.entries(ICON_MAPPINGS)) {
    if (lowerUrl.includes(domain)) {
      return icon;
    }
  }

  // Try keyword match in title
  for (const [keyword, icon] of Object.entries(ICON_MAPPINGS)) {
    if (lowerTitle.includes(keyword)) {
      return icon;
    }
  }

  // Try keyword match in URL
  for (const [keyword, icon] of Object.entries(ICON_MAPPINGS)) {
    if (lowerUrl.includes(keyword)) {
      return icon;
    }
  }

  // Default fallback
  return 'Globe';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all quick links
    const quickLinks = await base44.entities.QuickLink.list();

    // Update each link with appropriate icon
    const updated = [];
    for (const link of quickLinks) {
      const icon = findIconForLink(link.title, link.url);
      
      if (link.icon !== icon) {
        await base44.entities.QuickLink.update(link.id, { icon });
        updated.push({ id: link.id, title: link.title, icon });
      }
    }

    return Response.json({
      success: true,
      message: `Updated ${updated.length} quick links with appropriate icons`,
      updated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});