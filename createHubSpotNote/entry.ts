import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Note → Company: associationTypeId 190
// Note → Contact: associationTypeId 202

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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { companyId, contactId, body } = await req.json();

    if (!companyId) return Response.json({ error: "companyId is required" }, { status: 400 });
    if (!body || body.trim().length < 5) return Response.json({ error: "Note must be at least 5 characters" }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");

    const ownerMatch = await resolveOwnerForUser(base44, accessToken, user);
    if (!ownerMatch) {
      return Response.json({
        error: "Your account is not linked to a HubSpot owner. Please ask an admin to set your HubSpot Owner ID in your profile.",
        ownerMissing: true,
      }, { status: 422 });
    }

    const associations = [
      { to: { id: companyId }, types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 190 }] },
    ];
    if (contactId) {
      associations.push({ to: { id: contactId }, types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }] });
    }

    const noteRes = await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        properties: {
          hs_note_body: body.trim(),
          hs_timestamp: Date.now(),
          hubspot_owner_id: ownerMatch.ownerId,
        },
        associations,
      }),
    });

    if (!noteRes.ok) {
      const errText = await noteRes.text();
      console.error("HubSpot note error:", noteRes.status, errText);
      return Response.json({ error: `HubSpot error: ${noteRes.status}`, detail: errText }, { status: 502 });
    }

    const created = await noteRes.json();
    return Response.json({
      success: true,
      noteId: created.id,
      ownerName: ownerMatch.ownerName,
      ownerEmail: ownerMatch.ownerEmail,
      ownerSource: ownerMatch.source,
      profileAutoLinked: ownerMatch.profileAutoLinked,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});