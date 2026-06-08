import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Calls use HubSpot legacy engagements API because Base44 OAuth connector
// does not currently support crm.objects.calls.write.
// Retrieval uses: GET /engagements/v1/engagements/associated/COMPANY/:id/paged
// This returns all engagement types; we filter for type === "CALL".

// Maps HubSpot disposition GUIDs → human-readable outcome labels
const DISPOSITION_LABEL = {
  // Standard HubSpot disposition GUIDs
  "f240bbac-87c9-4f6e-bf70-924b57d47db7": "Connected",
  "73a0d17f-1163-4015-bdd5-ec830791da20": "No Answer",
  "b0e2eba5-c05a-44b5-83af-d1c8a2e3f84f": "Left Voicemail",
  "ba9e7f2d-0e46-4cf9-be9c-9aafc22ac3b8": "Busy",
  "17b47fee-58de-441e-a44c-c6300d46f273": "Wrong Number",
  // Additional GUIDs seen in some HubSpot portals
  "9d9162e7-6cf3-4944-bf63-4dff82258764": "No Answer",
  "a4c4c377-d246-4b32-a13b-75a2cc981a4e": "Left Live Message",
  "b2cf5968-551e-4856-9783-52b3da59a7d0": "Left Voicemail",
  "c9a2ea06-0a4a-4f5e-9cd3-ce63b0bc58f7": "Connected",
  // Fallback for non-GUID string values (legacy stored as enum)
  CONNECTED:      "Connected",
  NO_ANSWER:      "No Answer",
  LEFT_VOICEMAIL: "Left Voicemail",
  BUSY:           "Busy",
  WRONG_NUMBER:   "Wrong Number",
};

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

    // Fetch all engagements associated with this company (paged, up to 100)
    const engRes = await fetch(
      `https://api.hubapi.com/engagements/v1/engagements/associated/COMPANY/${companyId}/paged?limit=100`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!engRes.ok) {
      const errText = await engRes.text();
      let errMsg = `HubSpot returned status ${engRes.status}`;
      try {
        const parsed = JSON.parse(errText);
        errMsg = parsed.message || errMsg;
      } catch (_) { /* ignore */ }
      return Response.json({
        error: "Failed to fetch calls from HubSpot",
        step_failed: "fetch_engagements",
        hubspot_status: engRes.status,
        hubspot_message: errMsg,
      }, { status: 502 });
    }

    const engData = await engRes.json();
    const engagements = engData.results || [];

    // Filter to CALL type only
    const calls = engagements
      .filter(e => e.engagement?.type === "CALL")
      .map(e => {
        const eng = e.engagement || {};
        const meta = e.metadata || {};
        const disposition = meta.disposition || null;
        return {
          id: String(eng.id),
          title: meta.title || "Call",
          body: meta.body || "",
          direction: meta.direction || null,
          outcome: DISPOSITION_LABEL[disposition] || disposition || null,
          callDatetime: eng.timestamp ? new Date(eng.timestamp).toISOString() : null,
          createdAt: eng.createdAt ? new Date(eng.createdAt).toISOString() : null,
          ownerId: eng.ownerId ? String(eng.ownerId) : null,
          url: portalId ? `https://app.hubspot.com/contacts/${portalId}/company/${companyId}` : null,
        };
      })
      .sort((a, b) => new Date(b.callDatetime || b.createdAt || 0) - new Date(a.callDatetime || a.createdAt || 0));

    return Response.json({ calls, total: calls.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});