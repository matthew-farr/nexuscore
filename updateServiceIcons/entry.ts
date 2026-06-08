import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SERVICE_ICONS = {
  hubspot: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/hubspot.svg',
  teams: 'https://img.icons8.com/color/96/microsoft-teams.png',
  'power bi': 'https://upload.wikimedia.org/wikipedia/commons/c/cf/New_Power_BI_Logo.svg',
};

function findServiceMatch(title, url) {
  const lowerTitle = title.toLowerCase();
  const lowerUrl = url.toLowerCase();
  const combined = `${lowerTitle} ${lowerUrl}`;

  for (const [service, iconUrl] of Object.entries(SERVICE_ICONS)) {
    if (combined.includes(service)) {
      return { service, iconUrl };
    }
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const quickLinks = await base44.entities.QuickLink.list();
    const updated = [];

    for (const link of quickLinks) {
      const match = findServiceMatch(link.title, link.url);
      if (match) {
        await base44.entities.QuickLink.update(link.id, {
          icon_url: match.iconUrl,
          icon: '',
        });
        updated.push({
          id: link.id,
          title: link.title,
          service: match.service,
          icon_url: match.iconUrl,
        });
      }
    }

    return Response.json({
      success: true,
      message: `Updated ${updated.length} service icons`,
      updated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});