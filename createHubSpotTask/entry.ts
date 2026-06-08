import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function buildAssociations(companyId, contactId) {
  return {
    contactIds: contactId ? [parseInt(contactId)] : [],
    companyIds: [parseInt(companyId)],
    dealIds: [],
    ownerIds: [],
    ticketIds: [],
  };
}

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

const PRIORITY_MAP = { Low: "LOW", Medium: "MEDIUM", High: "HIGH", None: "NONE" };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { companyId, contactId, title, body, dueDate, priority } = await req.json();

    if (!companyId) return Response.json({ error: "companyId is required" }, { status: 400 });
    if (!title || title.trim().length < 2) return Response.json({ error: "Task title must be at least 2 characters" }, { status: 400 });
    if (!dueDate) return Response.json({ error: "Due date is required" }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");

    const ownerMatch = await resolveOwnerForUser(base44, accessToken, user);
    if (!ownerMatch) {
      return Response.json({
        error: "Your account is not linked to a HubSpot owner. Please ask an admin to set your HubSpot Owner ID in your profile.",
        ownerMissing: true,
      }, { status: 422 });
    }

    const safeContactId = contactId && String(contactId).trim() ? contactId : null;
    const associations = buildAssociations(companyId, safeContactId);
    const dueTs = new Date(dueDate + "T09:00:00.000Z").getTime();

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
        associations,
        metadata: {
          subject: title.trim(),
          body: (body || "").trim(),
          status: "NOT_STARTED",
          taskType: "TODO",
          priority: PRIORITY_MAP[priority] || "NONE",
        },
      }),
    });

    const taskRaw = await taskRes.text();
    if (!taskRes.ok) {
      let errMsg = `HubSpot status ${taskRes.status}`;
      try { errMsg = JSON.parse(taskRaw).message || errMsg; } catch (_) {}
      return Response.json({ error: errMsg }, { status: 502 });
    }

    let created;
    try { created = JSON.parse(taskRaw); } catch (_) { created = {}; }

    return Response.json({
      taskCreated: true,
      taskId: created.engagement?.id || null,
      ownerName: ownerMatch.ownerName,
      ownerEmail: ownerMatch.ownerEmail,
      ownerSource: ownerMatch.source,
      profileAutoLinked: ownerMatch.profileAutoLinked,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});