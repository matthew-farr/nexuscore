import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Marks a TASK engagement as COMPLETED via PATCH on the legacy engagements API.
// PATCH /engagements/v1/engagements/{engagementId}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await req.json();
    if (!taskId) return Response.json({ error: "taskId is required" }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");

    const res = await fetch(`https://api.hubapi.com/engagements/v1/engagements/${taskId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metadata: { status: "COMPLETED" },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      let msg = `HubSpot status ${res.status}`;
      try { msg = JSON.parse(txt).message || msg; } catch (_) {}
      return Response.json({ error: msg }, { status: 502 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});