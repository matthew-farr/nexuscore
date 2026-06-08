import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");

    const res = await fetch("https://api.hubapi.com/crm/v3/owners?limit=100", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: `HubSpot API error: ${err}` }, { status: res.status });
    }

    const data = await res.json();
    const owners = data.results || [];

    // Build a map: { "ownerId": "Full Name" } for quick lookups
    const ownerMap = {};
    // Also return full list with id, name, email
    const ownerList = [];
    for (const owner of owners) {
      const id = String(owner.id);
      const firstName = owner.firstName || "";
      const lastName = owner.lastName || "";
      const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
      const name = fullName || owner.email || `Owner ${id}`;
      ownerMap[id] = name;
      ownerList.push({ id, name, email: owner.email || null });
    }

    return Response.json({ ownerMap, ownerList, total: owners.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});