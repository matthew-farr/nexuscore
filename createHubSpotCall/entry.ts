import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const DISPOSITION_GUID = {
  CONNECTED:      "f240bbac-87c9-4f6e-bf70-924b57d47db7",
  NO_ANSWER:      "73a0d17f-1163-4015-bdd5-ec830791da20",
  LEFT_VOICEMAIL: "b0e2eba5-c05a-44b5-83af-d1c8a2e3f84f",
  BUSY:           "ba9e7f2d-0e46-4cf9-be9c-9aafc22ac3b8",
  WRONG_NUMBER:   "17b47fee-58de-441e-a44c-c6300d46f273",
};

function buildAssociations(companyId, contactId) {
  return {
    contactIds: contactId ? [parseInt(contactId)] : [],
    companyIds: [parseInt(companyId)],
    dealIds: [],
    ownerIds: [],
    ticketIds: [],
  };
}

// Resolve HubSpot owner for the logged-in user.
// 1. Checks UserProfile.hubspot_owner_id (primary)
// 2. Falls back to email matching against HubSpot owners API
// 3. If resolved via email match, auto-backfills the profile fields
// 4. Returns null if neither resolves — caller must block submission
async function resolveOwnerForUser(base44, accessToken, user) {
  const profiles = await base44.asServiceRole.entities.UserProfile.filter({ auth_user_id: user.id });
  const profile = profiles?.[0];

  if (profile?.hubspot_owner_id) {
    return {
      ownerId: profile.hubspot_owner_id,
      ownerName: profile.hubspot_owner_name || profile.display_name || user.full_name,
      ownerEmail: profile.hubspot_owner_email || user.email,
      source: "profile",
      profileAutoLinked: false,
    };
  }

  // Fallback: email match against HubSpot owners API
  const res = await fetch("https://api.hubapi.com/crm/v3/owners?limit=100", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.ok) {
    const data = await res.json();
    const match = (data.results || []).find(
      o => o.email && o.email.toLowerCase() === (user.email || "").toLowerCase()
    );
    if (match) {
      const ownerName = [match.firstName, match.lastName].filter(Boolean).join(" ") || match.email;
      // Auto-backfill the profile so the UI shows "Linked" next time
      if (profile?.id) {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          hubspot_owner_id: String(match.id),
          hubspot_owner_name: ownerName,
          hubspot_owner_email: match.email,
        });
      }
      return {
        ownerId: String(match.id),
        ownerName,
        ownerEmail: match.email,
        source: "email_match",
        profileAutoLinked: true,
      };
    }
  }

  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const {
      companyId, contactId, direction, outcome, subject, body,
      callDatetime, followUpRequired, followUpDate,
    } = await req.json();

    if (!companyId) return Response.json({ error: "companyId is required" }, { status: 400 });
    if (!body || body.trim().length < 5) return Response.json({ error: "Call notes must be at least 5 characters" }, { status: 400 });
    if (followUpRequired && !followUpDate) return Response.json({ error: "Follow-up date is required when follow-up is enabled" }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");

    const ownerMatch = await resolveOwnerForUser(base44, accessToken, user);
    if (!ownerMatch) {
      return Response.json({
        error: "Your account is not linked to a HubSpot owner. Please ask an admin to set your HubSpot Owner ID in your profile.",
        ownerMissing: true,
      }, { status: 422 });
    }

    const callTimestamp = callDatetime ? new Date(callDatetime).getTime() : Date.now();
    const safeContactId = contactId && String(contactId).trim() ? contactId : null;
    const associations = buildAssociations(companyId, safeContactId);

    const callRes = await fetch("https://api.hubapi.com/engagements/v1/engagements", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        engagement: {
          active: true,
          type: "CALL",
          timestamp: callTimestamp,
          ownerId: parseInt(ownerMatch.ownerId),
        },
        associations,
        metadata: {
          body: body.trim(),
          fromNumber: "",
          toNumber: "",
          status: "COMPLETED",
          disposition: DISPOSITION_GUID[outcome] || DISPOSITION_GUID.CONNECTED,
          durationMilliseconds: 0,
          direction: direction || "OUTBOUND",
          title: (subject || "Sales call").trim(),
        },
      }),
    });

    if (!callRes.ok) {
      const errText = await callRes.text();
      let errMsg = `HubSpot returned status ${callRes.status}`;
      try { errMsg = JSON.parse(errText).message || errMsg; } catch (_) {}
      return Response.json({ error: "Failed to create call in HubSpot", hubspot_message: errMsg }, { status: 502 });
    }

    const createdCall = await callRes.json();
    const callId = createdCall.engagement?.id;

    // Follow-up task — always type CALL
    let taskId = null;
    let taskCreated = false;
    let taskErrorSafeMessage = null;

    if (followUpRequired && followUpDate) {
      const dueTs = new Date(followUpDate + "T09:00:00.000Z").getTime();
      const taskAssociations = buildAssociations(companyId, safeContactId);

      const taskRes = await fetch("https://api.hubapi.com/engagements/v1/engagements", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          engagement: {
            active: true,
            type: "TASK",
            timestamp: dueTs,
            ownerId: parseInt(ownerMatch.ownerId),
          },
          associations: taskAssociations,
          metadata: {
            subject: "Follow up after call",
            body: body.trim(),
            status: "NOT_STARTED",
            taskType: "CALL",
          },
        }),
      });

      const taskRaw = await taskRes.text();
      if (taskRes.ok) {
        let createdTask;
        try { createdTask = JSON.parse(taskRaw); } catch (_) { createdTask = {}; }
        taskId = createdTask.engagement?.id || null;
        taskCreated = !!taskId;
      } else {
        try { taskErrorSafeMessage = JSON.parse(taskRaw).message || `HubSpot status ${taskRes.status}`; }
        catch (_) { taskErrorSafeMessage = `HubSpot status ${taskRes.status}`; }
        console.error("[task] creation failed:", taskErrorSafeMessage);
      }
    }

    return Response.json({
      callCreated: true,
      callId,
      ownerName: ownerMatch.ownerName,
      ownerEmail: ownerMatch.ownerEmail,
      ownerSource: ownerMatch.source,
      profileAutoLinked: ownerMatch.profileAutoLinked,
      followUpRequested: !!followUpRequired,
      taskCreated,
      taskId,
      taskErrorSafeMessage,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});