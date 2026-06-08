import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Returns a unified chronological activity feed for a company.
// Sources: Notes (CRM v3), Calls, Tasks (legacy engagements API), Tickets (CRM v3)

const DISPOSITION_LABEL = {
  "f240bbac-87c9-4f6e-bf70-924b57d47db7": "Connected",
  "73a0d17f-1163-4015-bdd5-ec830791da20": "No Answer",
  "b0e2eba5-c05a-44b5-83af-d1c8a2e3f84f": "Left Voicemail",
  "ba9e7f2d-0e46-4cf9-be9c-9aafc22ac3b8": "Busy",
  "17b47fee-58de-441e-a44c-c6300d46f273": "Wrong Number",
  CONNECTED: "Connected",
  NO_ANSWER: "No Answer",
  LEFT_VOICEMAIL: "Left Voicemail",
  BUSY: "Busy",
  WRONG_NUMBER: "Wrong Number",
};

const TICKET_PROPS = ["subject", "hs_pipeline", "hs_pipeline_stage", "hs_ticket_priority", "hubspot_owner_id", "hs_lastmodifieddate", "createdate"];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { companyId, portalId } = await req.json();
    if (!companyId) return Response.json({ error: "companyId is required" }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");
    const authHeaders = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

    // ── Fetch all engagements (calls + tasks + notes via legacy) ──────────────
    let allEngagements = [];
    let offset = 0;
    let hasMore = true;
    while (hasMore) {
      const res = await fetch(
        `https://api.hubapi.com/engagements/v1/engagements/associated/COMPANY/${companyId}/paged?limit=100&offset=${offset}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) break;
      const data = await res.json();
      allEngagements = allEngagements.concat(data.results || []);
      hasMore = data.hasMore || false;
      offset = data.offset || (offset + (data.results || []).length);
      if ((data.results || []).length === 0) break;
    }

    // ── Fetch notes via CRM v3 ────────────────────────────────────────────────
    const noteAssocRes = await fetch(
      `https://api.hubapi.com/crm/v3/objects/companies/${companyId}/associations/notes?limit=50`,
      { headers: authHeaders }
    );
    let notes = [];
    if (noteAssocRes.ok) {
      const noteAssocData = await noteAssocRes.json();
      const noteIds = (noteAssocData.results || []).map(r => r.id);
      if (noteIds.length > 0) {
        const batchRes = await fetch("https://api.hubapi.com/crm/v3/objects/notes/batch/read", {
          method: "POST", headers: authHeaders,
          body: JSON.stringify({ properties: ["hs_note_body", "hs_timestamp", "hubspot_owner_id", "hs_lastmodifieddate"], inputs: noteIds.map(id => ({ id })) }),
        });
        if (batchRes.ok) {
          const batchData = await batchRes.json();
          notes = (batchData.results || []).map(n => ({
            id: `note-${n.id}`,
            activityType: "note",
            title: "Note added",
            description: n.properties?.hs_note_body || "",
            date: n.properties?.hs_timestamp || n.properties?.hs_lastmodifieddate || null,
            ownerId: n.properties?.hubspot_owner_id || null,
            url: portalId ? `https://app.hubspot.com/contacts/${portalId}/note/${n.id}` : null,
          }));
        }
      }
    }

    // ── Fetch tickets via CRM v3 ──────────────────────────────────────────────
    let tickets = [];
    const ticketAssocRes = await fetch(
      `https://api.hubapi.com/crm/v3/objects/companies/${companyId}/associations/tickets?limit=50`,
      { headers: authHeaders }
    );
    if (ticketAssocRes.ok) {
      const ticketAssocData = await ticketAssocRes.json();
      const ticketIds = (ticketAssocData.results || []).map(r => r.id);
      if (ticketIds.length > 0) {
        // Fetch pipeline stage map
        const plRes = await fetch("https://api.hubapi.com/crm/v3/pipelines/tickets", { headers: authHeaders });
        const stageMap = {};
        if (plRes.ok) {
          const plData = await plRes.json();
          for (const pl of (plData.results || [])) {
            for (const stage of (pl.stages || [])) {
              stageMap[stage.id] = { label: stage.label, pipelineName: pl.label };
            }
          }
        }
        const batchRes = await fetch("https://api.hubapi.com/crm/v3/objects/tickets/batch/read", {
          method: "POST", headers: authHeaders,
          body: JSON.stringify({ inputs: ticketIds.map(id => ({ id })), properties: TICKET_PROPS }),
        });
        if (batchRes.ok) {
          const batchData = await batchRes.json();
          for (const t of (batchData.results || [])) {
            const p = t.properties || {};
            const stageInfo = stageMap[p.hs_pipeline_stage] || null;
            // Ticket Created event
            if (p.createdate) {
              tickets.push({
                id: `ticket-created-${t.id}`,
                activityType: "ticket_created",
                title: `Ticket created: ${p.subject || "Untitled"}`,
                description: stageInfo ? `${stageInfo.pipelineName} · ${stageInfo.label}` : (p.hs_pipeline_stage || ""),
                date: p.createdate,
                ownerId: p.hubspot_owner_id || null,
                url: portalId ? `https://app.hubspot.com/contacts/${portalId}/ticket/${t.id}` : null,
              });
            }
            // Ticket Updated event (if modified after creation)
            if (p.hs_lastmodifieddate && p.hs_lastmodifieddate !== p.createdate) {
              tickets.push({
                id: `ticket-updated-${t.id}`,
                activityType: "ticket_updated",
                title: `Ticket updated: ${p.subject || "Untitled"}`,
                description: stageInfo ? `Stage: ${stageInfo.label}` : "",
                date: p.hs_lastmodifieddate,
                ownerId: p.hubspot_owner_id || null,
                url: portalId ? `https://app.hubspot.com/contacts/${portalId}/ticket/${t.id}` : null,
              });
            }
          }
        }
      }
    }

    // ── Map engagements (calls + tasks) ───────────────────────────────────────
    const engagementItems = allEngagements.map(e => {
      const eng = e.engagement || {};
      const meta = e.metadata || {};
      const type = eng.type;

      if (type === "CALL") {
        const disposition = DISPOSITION_LABEL[meta.disposition] || meta.disposition || "";
        return {
          id: `call-${eng.id}`,
          activityType: "call",
          title: meta.title || "Call logged",
          description: [disposition, meta.body].filter(Boolean).join(" · "),
          date: eng.timestamp ? new Date(eng.timestamp).toISOString() : null,
          ownerId: eng.ownerId || null,
          url: portalId && eng.id ? `https://app.hubspot.com/contacts/${portalId}/tasks/${eng.id}` : null,
        };
      }

      if (type === "TASK") {
        const isCompleted = meta.status === "COMPLETED";
        return {
          id: `task-${eng.id}`,
          activityType: isCompleted ? "task_completed" : "task_created",
          title: meta.subject || (isCompleted ? "Task completed" : "Task created"),
          description: meta.body || "",
          date: eng.timestamp ? new Date(eng.timestamp).toISOString() : null,
          ownerId: eng.ownerId || null,
          url: portalId && eng.id ? `https://app.hubspot.com/contacts/${portalId}/tasks/${eng.id}` : null,
        };
      }

      return null;
    }).filter(Boolean);

    // ── Merge, deduplicate notes (legacy engagements may overlap CRM v3) ─────
    // Keep CRM v3 notes only; skip legacy NOTE engagements
    const legacyExcluded = engagementItems.filter(e => !e.id.startsWith("note-"));

    const allItems = [...notes, ...legacyExcluded, ...tickets]
      .filter(item => item.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return Response.json({ activities: allItems });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});