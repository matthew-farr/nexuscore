import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });

    const { datasetId, query } = await req.json();
    if (!datasetId || !query) {
      return Response.json({ error: 'datasetId and query are required' }, { status: 400 });
    }

    const token = Deno.env.get('POWERBI_BEARER_TOKEN');
    if (!token) {
      return Response.json({ error: 'POWERBI_BEARER_TOKEN secret is not set' }, { status: 500 });
    }

    const res = await fetch(
      `https://api.powerbi.com/v1.0/myorg/datasets/${datasetId}/executeQueries`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queries: [{ query }],
          serializerSettings: { includeNulls: true },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data?.error?.message || 'Power BI API error', details: data }, { status: res.status });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});