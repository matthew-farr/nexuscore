import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Fetches TASK engagements for a company via the legacy engagements API.
// GET /engagements/v1/engagements/associated/COMPANY/{companyId}/paged

const PRIORITY_LABEL = { NONE: "None", LOW: "Low", MEDIUM: "Medium", HIGH: "High" };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { companyId, portalId } = await req.json();
    if (!companyId) return Response.json({ error: "companyId is required" }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");

    // Fetch all engagements for the company (paged, up to 250 per page)
    let allEngagements = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const res = await fetch(
        `https://api.hubapi.com/engagements/v1/engagements/associated/COMPANY/${companyId}/paged?limit=100&offset=${offset}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) {
        const txt = await res.text();
        let msg = `HubSpot status ${res.status}`;
        try { msg = JSON.parse(txt).message || msg; } catch (_) {}
        return Response.json({ error: msg }, { status: 502 });
      }
      const data = await res.json();
      const results = data.results || [];
      allEngagements = allEngagements.concat(results);
      hasMore = data.hasMore || false;
      offset = data.offset || (offset + results.length);
      if (results.length === 0) break;
    }

    // Filter to TASK type only
    const tasks = allEngagements
      .filter(e => e.engagement?.type === "TASK")
      .map(e => {
        const eng = e.engagement || {};
        const meta = e.metadata || {};
        const assoc = e.associations || {};
        return {
          id: eng.id,
          title: meta.subject || "Task",
          body: meta.body || "",
          status: meta.status || "NOT_STARTED",        // NOT_STARTED | IN_PROGRESS | COMPLETED | DEFERRED | WAITING
          taskType: meta.taskType || "",
          priority: PRIORITY_LABEL[meta.priority] || meta.priority || "None",
          dueDate: eng.timestamp ? new Date(eng.timestamp).toISOString() : null,
          ownerId: eng.ownerId || null,
          contactIds: assoc.contactIds || [],
          companyIds: assoc.companyIds || [],
          url: portalId && eng.id
            ? `https://app.hubspot.com/contacts/${portalId}/tasks/${eng.id}`
            : null,
        };
      })
      .sort((a, b) => {
        // Open tasks first, then by due date asc
        const aOpen = a.status !== "COMPLETED";
        const bOpen = b.status !== "COMPLETED";
        if (aOpen !== bOpen) return aOpen ? -1 : 1;
        return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
      });

    return Response.json({ tasks });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});