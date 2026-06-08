import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CONTACT_PROPERTIES = [
  "firstname",
  "lastname",
  "email",
  "phone",
  "jobtitle",
  "lifecyclestage",
  "hs_lastmodifieddate",
  "createdate",
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, portalId } = await req.json();

    if (!companyId) {
      return Response.json({ error: "companyId is required" }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");

    // Fetch contacts associated with the company via associations API
    const assocRes = await fetch(
      `https://api.hubapi.com/crm/v3/objects/companies/${companyId}/associations/contacts?limit=50`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!assocRes.ok) {
      const errText = await assocRes.text();
      return Response.json({ error: `HubSpot associations error: ${assocRes.status}`, detail: errText }, { status: 502 });
    }

    const assocData = await assocRes.json();
    const contactIds = (assocData.results || []).map(r => r.id);

    if (contactIds.length === 0) {
      return Response.json({ contacts: [], total: 0 });
    }

    // Batch-read contact details
    const batchRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/batch/read", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: contactIds.map(id => ({ id })),
        properties: CONTACT_PROPERTIES,
      }),
    });

    if (!batchRes.ok) {
      const errText = await batchRes.text();
      return Response.json({ error: `HubSpot batch read error: ${batchRes.status}`, detail: errText }, { status: 502 });
    }

    const batchData = await batchRes.json();

    const contacts = (batchData.results || []).map(c => ({
      id: c.id,
      properties: c.properties,
      url: portalId
        ? `https://app.hubspot.com/contacts/${portalId}/contact/${c.id}`
        : null,
    }));

    return Response.json({ contacts, total: contacts.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});