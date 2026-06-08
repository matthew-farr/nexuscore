import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");

    // If specific pipelineId + stageIds provided, use them directly
    // Otherwise auto-detect all open stages across all pipelines
    const body = await req.json().catch(() => ({}));
    const { pipelineId, stageIds } = body;

    let filterStageIds = stageIds && stageIds.length ? stageIds : null;

    if (!filterStageIds) {
      // Auto-detect open stage IDs (optionally scoped to one pipeline)
      const url = pipelineId
        ? `https://api.hubapi.com/crm/v3/pipelines/tickets/${pipelineId}`
        : "https://api.hubapi.com/crm/v3/pipelines/tickets";
      const pipelinesRes = await fetch(url, { headers: { "Authorization": `Bearer ${accessToken}` } });
      const pipelinesData = await pipelinesRes.json();
      const pipelines = pipelineId ? [pipelinesData] : (pipelinesData.results || []);
      filterStageIds = [];
      for (const pipeline of pipelines) {
        for (const stage of (pipeline.stages || [])) {
          if (stage.metadata?.ticketState !== "CLOSED") {
            filterStageIds.push(stage.id);
          }
        }
      }
    }

    const filters = [{ propertyName: "hs_pipeline_stage", operator: "IN", values: filterStageIds }];
    if (pipelineId) {
      filters.push({ propertyName: "hs_pipeline", operator: "EQ", value: pipelineId });
    }

    // Use IN_LIST operator to filter by open stage IDs
    const searchRes = await fetch("https://api.hubapi.com/crm/v3/objects/tickets/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filterGroups: [{ filters }],
        properties: ["subject", "hs_pipeline_stage"],
        limit: 1,
      }),
    });

    if (!searchRes.ok) {
      const err = await searchRes.text();
      return Response.json({ error: err }, { status: searchRes.status });
    }

    const data = await searchRes.json();
    return Response.json({ count: data.total ?? 0 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});