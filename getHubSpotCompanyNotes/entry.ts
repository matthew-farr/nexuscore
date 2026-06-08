import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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

    // Step 1: Get note IDs associated with the company
    const assocRes = await fetch(
      `https://api.hubapi.com/crm/v3/objects/companies/${companyId}/associations/notes?limit=50`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!assocRes.ok) {
      const errText = await assocRes.text();
      return Response.json({ error: `HubSpot error: ${assocRes.status}`, detail: errText }, { status: 502 });
    }

    const assocData = await assocRes.json();
    const noteIds = (assocData.results || []).map(r => r.id);

    if (noteIds.length === 0) {
      return Response.json({ notes: [], total: 0 });
    }

    // Step 2: Batch read note details
    const batchRes = await fetch("https://api.hubapi.com/crm/v3/objects/notes/batch/read", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: ["hs_note_body", "hs_timestamp", "hubspot_owner_id", "hs_lastmodifieddate"],
        inputs: noteIds.map(id => ({ id })),
      }),
    });

    if (!batchRes.ok) {
      const errText = await batchRes.text();
      return Response.json({ error: `HubSpot batch error: ${batchRes.status}`, detail: errText }, { status: 502 });
    }

    const batchData = await batchRes.json();

    const notes = (batchData.results || [])
      .map(n => ({
        id: n.id,
        body: n.properties?.hs_note_body || "",
        timestamp: n.properties?.hs_timestamp || n.properties?.hs_lastmodifieddate || null,
        ownerId: n.properties?.hubspot_owner_id || null,
        url: portalId ? `https://app.hubspot.com/contacts/${portalId}/note/${n.id}` : null,
      }))
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    return Response.json({ notes, total: notes.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});