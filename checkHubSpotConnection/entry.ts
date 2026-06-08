import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Safe read-only HubSpot connection check — uses the OAuth connector token only.
// Never returns or logs the token value.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Use the OAuth connector — never a raw secret
    let accessToken;
    try {
      const conn = await base44.asServiceRole.connectors.getConnection("hubspot");
      accessToken = conn.accessToken;
    } catch (e) {
      return Response.json({
        connected: false,
        secret_name: "HubSpot OAuth Connector",
        token_found: false,
        error: "HubSpot OAuth connector not connected or not authorised",
        checked_at: new Date().toISOString(),
      });
    }

    if (!accessToken) {
      return Response.json({
        connected: false,
        secret_name: "HubSpot OAuth Connector",
        token_found: false,
        error: "No access token returned from connector",
        checked_at: new Date().toISOString(),
      });
    }

    // Test with a safe read-only endpoint
    const res = await fetch("https://api.hubapi.com/crm/v3/owners?limit=1", {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });

    if (res.ok) {
      return Response.json({
        connected: true,
        secret_name: "HubSpot OAuth Connector",
        token_found: true,
        error: null,
        checked_at: new Date().toISOString(),
      });
    } else {
      const errText = await res.text().catch(() => "Unknown error");
      // Strip any token-like strings from the error before returning
      const safeError = errText.replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, "[REDACTED]");
      return Response.json({
        connected: false,
        secret_name: "HubSpot OAuth Connector",
        token_found: true,
        error: `HTTP ${res.status}: ${safeError.slice(0, 200)}`,
        checked_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    return Response.json({
      connected: false,
      secret_name: "HubSpot OAuth Connector",
      token_found: false,
      error: error.message?.slice(0, 200) || "Unexpected error",
      checked_at: new Date().toISOString(),
    });
  }
});