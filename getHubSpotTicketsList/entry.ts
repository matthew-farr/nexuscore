import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");
    const body = await req.json().catch(() => ({}));
    const { pipelineId } = body;

    // Get open stage IDs for this pipeline
    const url = pipelineId
      ? `https://api.hubapi.com/crm/v3/pipelines/tickets/${pipelineId}`
      : "https://api.hubapi.com/crm/v3/pipelines/tickets";
    const pipelinesRes = await fetch(url, { headers: { "Authorization": `Bearer ${accessToken}` } });
    const pipelinesData = await pipelinesRes.json();

    const pipelines = pipelineId ? [pipelinesData] : (pipelinesData.results || []);
    const openStageIds = [];
    const stageLabels = {};
    for (const pipeline of pipelines) {
      for (const stage of (pipeline.stages || [])) {
        if (stage.metadata?.ticketState !== "CLOSED") {
          openStageIds.push(stage.id);
          stageLabels[stage.id] = stage.label;
        }
      }
    }

    if (openStageIds.length === 0) {
      return Response.json({ tickets: [] });
    }

    const filters = [{ propertyName: "hs_pipeline_stage", operator: "IN", values: openStageIds }];
    if (pipelineId) {
      filters.push({ propertyName: "hs_pipeline", operator: "EQ", value: pipelineId });
    }

    // Paginate to get all tickets
    const allTickets = [];
    let after = undefined;
    do {
      const searchBody = {
        filterGroups: [{ filters }],
        properties: [
          "subject", "content", "hs_pipeline_stage", "hs_pipeline",
          "hs_ticket_priority", "createdate", "hs_lastmodifieddate",
          "hubspot_owner_id", "hs_ticket_category", "source_type",
          "hs_resolution", "notes_last_updated",
          "candidate_first_name", "candidate_full_name"
        ],
        limit: 100,
        sorts: [{ propertyName: "createdate", direction: "DESCENDING" }],
      };
      if (after) searchBody.after = after;

      const searchRes = await fetch("https://api.hubapi.com/crm/v3/objects/tickets/search", {
        method: "POST",
        headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(searchBody),
      });

      if (!searchRes.ok) {
        const err = await searchRes.text();
        return Response.json({ error: err }, { status: searchRes.status });
      }

      const data = await searchRes.json();
      for (const ticket of (data.results || [])) {
        const stageId = ticket.properties?.hs_pipeline_stage;
        ticket.properties.hs_pipeline_stage_label = stageLabels[stageId] || stageId;
        allTickets.push(ticket);
      }

      after = data.paging?.next?.after;
    } while (after && allTickets.length < 500);

    // --- Resolve owner names via /owners endpoint ---
    const ownerIds = [...new Set(allTickets.map(t => t.properties?.hubspot_owner_id).filter(Boolean))];
    const ownerMap = {};
    if (ownerIds.length > 0) {
      // Fetch each owner individually to avoid EU vs US domain issues
      await Promise.all(ownerIds.map(async (ownerId) => {
        const res = await fetch(`https://api.hubapi.com/crm/v3/owners/${ownerId}`, {
          headers: { "Authorization": `Bearer ${accessToken}` }
        });
        if (res.ok) {
          const o = await res.json();
          ownerMap[ownerId] = `${o.firstName || ""} ${o.lastName || ""}`.trim() || o.email || `Owner ${ownerId}`;
        }
      }));
    }

    // --- Fetch company associations for all tickets ---
    const ticketIds = allTickets.map(t => t.id);
    const companyAssocMap = {};

    if (ticketIds.length > 0) {
      const companyBatchRes = await fetch("https://api.hubapi.com/crm/v4/associations/tickets/companies/batch/read", {
        method: "POST",
        headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: ticketIds.map(id => ({ id })) }),
      });
      if (companyBatchRes.ok) {
        const companyData = await companyBatchRes.json();
        for (const result of (companyData.results || [])) {
          companyAssocMap[result.from?.id] = (result.to || []).map(t => t.toObjectId);
        }
      }
    }

    // --- Fetch company names ---
    const allCompanyIds = [...new Set(Object.values(companyAssocMap).flat())];
    const companyMap = {};
    if (allCompanyIds.length > 0) {
      const companyBatchRes = await fetch("https://api.hubapi.com/crm/v3/objects/companies/batch/read", {
        method: "POST",
        headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: allCompanyIds.map(id => ({ id })), properties: ["name"] }),
      });
      if (companyBatchRes.ok) {
        const companyData = await companyBatchRes.json();
        for (const c of (companyData.results || [])) {
          companyMap[c.id] = c.properties?.name || "";
        }
      }
    }

    // --- Enrich each ticket ---
    for (const ticket of allTickets) {
      const ownerId = ticket.properties?.hubspot_owner_id;
      ticket.properties.owner_name = ownerId ? (ownerMap[ownerId] || null) : null;

      // Candidate name from custom ticket fields
      ticket.properties.candidate_firstname = ticket.properties.candidate_first_name || null;
      ticket.properties.candidate_lastname = ticket.properties.candidate_full_name || null;

      const companyIds = companyAssocMap[ticket.id] || [];
      ticket.properties.company_name = companyIds.length > 0 ? (companyMap[companyIds[0]] || null) : null;
    }

    // Get portal ID
    let portalId = null;
    const accountRes = await fetch("https://api.hubapi.com/account-info/v3/details", {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });
    if (accountRes.ok) {
      const accountData = await accountRes.json();
      portalId = accountData.portalId;
    }

    return Response.json({ tickets: allTickets, total: allTickets.length, portalId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});