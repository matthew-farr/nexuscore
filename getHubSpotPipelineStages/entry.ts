import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");

    const body = await req.json().catch(() => ({}));
    const { pipelineId } = body;

    const url = pipelineId
      ? `https://api.hubapi.com/crm/v3/pipelines/tickets/${pipelineId}`
      : `https://api.hubapi.com/crm/v3/pipelines/tickets`;

    const res = await fetch(url, {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    const raw = pipelineId ? [data] : (data.results || []);
    const pipelines = raw.map(p => ({
      id: p.id,
      label: p.label,
      stages: (p.stages || [])
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(s => ({
          id: s.id,
          label: s.label,
          displayOrder: s.displayOrder,
          ticketState: s.metadata?.ticketState,
        }))
    }));

    return Response.json({ pipelines });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});