import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Strip HTML tags and decode basic entities for a clean text preview
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function safePreview(text, maxLen = 300) {
  const clean = stripHtml(text);
  return clean.length > maxLen ? clean.slice(0, maxLen) + "…" : clean;
}

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

    // Fetch all paged engagements associated with this company
    let allEngagements = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const url = `https://api.hubapi.com/engagements/v1/engagements/associated/COMPANY/${companyId}/paged?limit=100&offset=${offset}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        const errText = await res.text();
        let errData = {};
        try { errData = JSON.parse(errText); } catch (_) {}

        // Detect permission / scope errors
        const status = res.status;
        const message = errData.message || errText || "";
        const isPermissionError =
          status === 403 ||
          status === 401 ||
          message.toLowerCase().includes("scope") ||
          message.toLowerCase().includes("permission") ||
          message.toLowerCase().includes("sales-email-read");

        return Response.json({
          emails: [],
          permissionError: isPermissionError,
          errorCode: status,
          errorMessage: isPermissionError
            ? "Email history is not available with the current HubSpot connection."
            : `HubSpot API error (${status})`,
          likelyScopeMissing: isPermissionError ? "sales-email-read" : null,
        });
      }

      const data = await res.json();
      const engagements = data.results || data.engagements || [];
      allEngagements = allEngagements.concat(engagements);
      hasMore = data.hasMore || false;
      offset = data.offset || (offset + 100);

      // Safety cap
      if (allEngagements.length >= 500) break;
    }

    // Filter to EMAIL type only
    const emailEngagements = allEngagements.filter(
      e => e.engagement?.type === "EMAIL"
    );

    // Detect HubSpot scope-redacted emails: subject is null/"(No subject)" AND body
    // contains the "content of this email has been redacted" message.
    const REDACTED_SIGNAL = "content of this email has been redacted";
    const isRedacted = (meta) => {
      const body = (meta.html || meta.text || meta.body || "").toLowerCase();
      return body.includes(REDACTED_SIGNAL);
    };

    if (emailEngagements.length > 0) {
      // If the majority of emails are redacted, treat as a permission error
      const redactedCount = emailEngagements.filter(e => isRedacted(e.metadata || {})).length;
      if (redactedCount > 0 && redactedCount / emailEngagements.length >= 0.5) {
        return Response.json({
          emails: [],
          permissionError: true,
          errorMessage: "Email history is not available with the current HubSpot connection.",
          likelyScopeMissing: "sales-email-read",
        });
      }
    }

    const emails = emailEngagements.map(e => {
      const eng  = e.engagement  || {};
      const meta = e.metadata    || {};

      const fromField = meta.from?.email || meta.from || "";
      const toField   = Array.isArray(meta.to)
        ? meta.to.map(t => t.email || t).join(", ")
        : (meta.to || "");
      const ccField   = Array.isArray(meta.cc)
        ? meta.cc.map(c => c.email || c).join(", ")
        : (meta.cc || "");

      const rawBody = meta.html || meta.text || meta.body || "";
      const bodyPreview = safePreview(rawBody);

      const hubspotUrl = portalId && eng.id
        ? `https://app.hubspot.com/contacts/${portalId}/engagement/${eng.id}`
        : null;

      return {
        emailId:     String(eng.id || ""),
        subject:     meta.subject || "(No subject)",
        from:        fromField,
        to:          toField,
        cc:          ccField || null,
        direction:   eng.direction || null,
        bodyPreview,
        createdDate: eng.createdAt || eng.timestamp || null,
        ownerId:     eng.ownerId ? String(eng.ownerId) : null,
        hubspotUrl,
      };
    });

    // Sort newest first
    emails.sort((a, b) => new Date(b.createdDate || 0) - new Date(a.createdDate || 0));

    return Response.json({
      emails,
      total: emails.length,
      permissionError: false,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});