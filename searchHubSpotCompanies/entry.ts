import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const COMPANY_PROPERTIES = [
  "name", "domain", "phone", "city", "industry",
  "lifecyclestage", "hubspot_owner_id", "hs_lastmodifieddate", "createdate",
  "cd_industry", "cd_portal_id", "type", "hs_lead_status",
];

const CONTACT_PROPERTIES = [
  "firstname", "lastname", "email", "phone", "mobilephone",
  "jobtitle", "company", "lifecyclestage", "hubspot_owner_id", "hs_lastmodifieddate",
];

const DEAL_PROPERTIES = [
  "dealname", "dealstage", "pipeline", "amount", "closedate",
  "hubspot_owner_id", "hs_lastmodifieddate",
];

// HubSpot full-text search using the top-level `query` field (searches across all indexed properties)
async function fulltextSearch(accessToken, objectType, properties, query, limit = 40) {
  const body = {
    query,          // HubSpot full-text search — handles partial/substring matching
    properties,
    limit,
    sorts: [{ propertyName: "hs_lastmodifieddate", direction: "DESCENDING" }],
  };
  const res = await fetch(`https://api.hubapi.com/crm/v3/objects/${objectType}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

// Also do a token-filter search for each individual token to catch multi-word misses
async function tokenSearch(accessToken, objectType, properties, fields, token, limit = 20) {
  const filterGroups = fields.flatMap(field => [
    { filters: [{ propertyName: field, operator: "CONTAINS_TOKEN", value: token }] },
    { filters: [{ propertyName: field, operator: "CONTAINS_TOKEN", value: `${token}*` }] },
  ]);
  const body = { filterGroups, properties, limit };
  const res = await fetch(`https://api.hubapi.com/crm/v3/objects/${objectType}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

function dedupeById(records) {
  const seen = new Set();
  return records.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { query, includeContacts, includeDeals } = body;

    if (!query || query.trim().length < 2) {
      return Response.json({ error: "Query must be at least 2 characters" }, { status: 400 });
    }

    const q = query.trim();
    const tokens = q.toLowerCase().split(/\s+/).filter(t => t.length >= 2);

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");

    // Portal ID for URL construction
    let portalId = null;
    try {
      const infoRes = await fetch("https://api.hubapi.com/account-info/v3/details", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (infoRes.ok) portalId = (await infoRes.json()).portalId;
    } catch (_) {}

    // ── Companies ─────────────────────────────────────────────────────────────
    // Strategy: full-text search the whole query + per-token filter searches
    const companyFields = ["name", "domain", "phone", "city"];
    const companyRaw = [];

    // 1. Full-text search (best for partial substrings like "flint")
    companyRaw.push(...await fulltextSearch(accessToken, "companies", COMPANY_PROPERTIES, q, 40));

    // 2. Each token individually via filter (catches multi-token cases like "cm tra")
    for (const token of tokens) {
      companyRaw.push(...await tokenSearch(accessToken, "companies", COMPANY_PROPERTIES, companyFields, token, 20));
    }

    const companies = dedupeById(companyRaw).map(c => ({
      id: c.id,
      properties: c.properties,
      url: portalId ? `https://app.hubspot.com/contacts/${portalId}/company/${c.id}` : null,
    }));

    // ── Contacts ──────────────────────────────────────────────────────────────
    let contacts = [];
    if (includeContacts) {
      const contactFields = ["firstname", "lastname", "email", "phone", "jobtitle"];
      const contactRaw = [];

      contactRaw.push(...await fulltextSearch(accessToken, "contacts", CONTACT_PROPERTIES, q, 30));
      for (const token of tokens) {
        contactRaw.push(...await tokenSearch(accessToken, "contacts", CONTACT_PROPERTIES, contactFields, token, 15));
      }

      contacts = dedupeById(contactRaw).map(c => ({
        id: c.id,
        properties: c.properties,
        url: portalId ? `https://app.hubspot.com/contacts/${portalId}/contact/${c.id}` : null,
      }));
    }

    // ── Deals ─────────────────────────────────────────────────────────────────
    let deals = [];
    if (includeDeals) {
      const dealFields = ["dealname", "pipeline", "dealstage"];
      const dealRaw = [];

      dealRaw.push(...await fulltextSearch(accessToken, "deals", DEAL_PROPERTIES, q, 20));
      for (const token of tokens) {
        dealRaw.push(...await tokenSearch(accessToken, "deals", DEAL_PROPERTIES, dealFields, token, 10));
      }

      deals = dedupeById(dealRaw).map(d => ({
        id: d.id,
        properties: d.properties,
        url: portalId ? `https://app.hubspot.com/contacts/${portalId}/deal/${d.id}` : null,
      }));
    }

    return Response.json({ companies, contacts, deals, portalId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});