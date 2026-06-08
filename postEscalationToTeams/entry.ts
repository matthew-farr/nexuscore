import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('microsoft_teams');

    const body = await req.json();
    const { action, teamId, channelId, escalation } = body;

    // Action: list_teams
    if (action === 'list_teams') {
      const res = await fetch('https://graph.microsoft.com/v1.0/me/joinedTeams', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      if (!res.ok) return Response.json({ error: data.error?.message || 'Failed to list teams' }, { status: res.status });
      return Response.json({ teams: data.value.map(t => ({ id: t.id, name: t.displayName })) });
    }

    // Action: list_channels
    if (action === 'list_channels') {
      if (!teamId) return Response.json({ error: 'teamId is required' }, { status: 400 });
      const res = await fetch(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      if (!res.ok) return Response.json({ error: data.error?.message || 'Failed to list channels' }, { status: res.status });
      return Response.json({ channels: data.value.map(c => ({ id: c.id, name: c.displayName })) });
    }

    // Action: post_escalation (default)
    if (!teamId || !channelId) {
      return Response.json({ error: 'teamId and channelId are required to post a message' }, { status: 400 });
    }
    if (!escalation) {
      return Response.json({ error: 'escalation object is required' }, { status: 400 });
    }

    const statusColor = {
      'ESCALATED': '✅',
      'DUE TO BE ESCALATED': '⚠️',
      'LPF DETAILS': '🔵',
      'WITHDRAWN': '🟡',
      'UNABLE TO ESCALATE ONLINE': '⛔',
      'CJSM': '🔴',
      'INTERNAL QUERY - INCONFLICT': '🟣'
    };

    const emoji = statusColor[escalation.status] || '📋';
    const messageContent = `
<b>${emoji} DBS Escalation Update</b><br/>
<b>ERef:</b> ${escalation.eref || 'N/A'}<br/>
<b>Company:</b> ${escalation.company || 'N/A'}<br/>
<b>Status:</b> ${escalation.status || 'N/A'}<br/>
${escalation.escalated_date ? `<b>Escalated Date:</b> ${escalation.escalated_date}<br/>` : ''}
${escalation.escalated_agent ? `<b>Escalated By:</b> ${escalation.escalated_agent}<br/>` : ''}
${escalation.account_manager ? `<b>Account Manager:</b> ${escalation.account_manager}<br/>` : ''}
${escalation.police_details ? `<b>Police Force:</b> ${escalation.police_details}<br/>` : ''}
    `.trim();

    const res = await fetch(
      `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          body: {
            contentType: 'html',
            content: messageContent
          }
        })
      }
    );

    const data = await res.json();
    if (!res.ok) return Response.json({ error: data.error?.message || 'Failed to post message' }, { status: res.status });

    return Response.json({ success: true, messageId: data.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});