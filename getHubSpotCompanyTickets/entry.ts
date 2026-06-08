import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Returns tickets associated with a specific company using CRM v3 associations + batch read.

const TICKET_PROPS = [
  "subject",
  "hs_pipeline",
  "hs_pipeline_stage",
  "hs_ticket_priority",
  "hubspot_owner_id",
  "hs_lastmodifieddate",
  "createdate",
  "content",
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { companyId, portalId } = await req.json();
    if (!companyId) return Response.json({ error: "companyId is required" }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");
    const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

    // Step 1: Get ticket IDs associated with this company
    const assocRes = await fetch(
      `https://api.hubapi.com/crm/v3/objects/companies/${companyId}/associations/tickets?limit=100`,
      { headers }
    );
    if (!assocRes.ok) {
      const txt = await assocRes.text();
      let msg = `HubSpot status ${assocRes.status}`;
      try { msg = JSON.parse(txt).message || msg; } catch (_) {}
      return Response.json({ error: msg }, { status: 502 });
    }
    const assocData = await assocRes.json();
    const ticketIds = (assocData.results || []).map(r => r.id);
    if (ticketIds.length === 0) return Response.json({ tickets: [] });

    // Step 2: Fetch pipeline metadata so we can resolve stage labels
    const pipelinesRes = await fetch("https://api.hubapi.com/crm/v3/pipelines/tickets", { headers });
    const pipelinesData = pipelinesRes.ok ? await pipelinesRes.json() : { results: [] };
    // Build maps: pipelineId -> name, stageId -> { label, isOpen }
    const pipelineNameMap = {};
    const stageMap = {};
    for (const pl of (pipelinesData.results || [])) {
      pipelineNameMap[pl.id] = pl.label;
      for (const stage of (pl.stages || [])) {
        stageMap[stage.id] = {
          label: stage.label,
          isOpen: stage.metadata?.ticketState !== "CLOSED",
          pipelineName: pl.label,
        };
      }
    }

    // Step 3: Batch read ticket details
    const batchRes = await fetch("https://api.hubapi.com/crm/v3/objects/tickets/batch/read", {
      method: "POST",
      headers,
      body: JSON.stringify({
        inputs: ticketIds.map(id => ({ id })),
        properties: TICKET_PROPS,
      }),
    });
    if (!batchRes.ok) {
      const txt = await batchRes.text();
      let msg = `HubSpot batch read status ${batchRes.status}`;
      try { msg = JSON.parse(txt).message || msg; } catch (_) {}
      return Response.json({ error: msg }, { status: 502 });
    }
    const batchData = await batchRes.json();

    const tickets = (batchData.results || []).map(t => {
      const p = t.properties || {};
      const stageInfo = stageMap[p.hs_pipeline_stage] || null;
      return {
        id: t.id,
        subject: p.subject || "Untitled Ticket",
        pipeline: stageInfo?.pipelineName || pipelineNameMap[p.hs_pipeline] || p.hs_pipeline || null,
        stage: stageInfo?.label || p.hs_pipeline_stage || null,
        isOpen: stageInfo ? stageInfo.isOpen : true,
        priority: p.hs_ticket_priority || null,
        ownerId: p.hubspot_owner_id || null,
        createdDate: p.createdate || null,
        lastModifiedDate: p.hs_lastmodifieddate || null,
        notes: p.content || null,
        url: portalId ? `https://app.hubspot.com/contacts/${portalId}/ticket/${t.id}` : null,
      };
    }).sort((a, b) => {
      // Open tickets first, then sort by lastModifiedDate desc
      if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
      return new Date(b.lastModifiedDate || 0) - new Date(a.lastModifiedDate || 0);
    });

    return Response.json({ tickets });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});