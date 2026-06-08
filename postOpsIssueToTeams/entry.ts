import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Support both direct calls (with action) and automation payloads (with event.type)
    const { action, teamId, channelId, issue, event, data } = body;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('microsoft_teams');

    // Action: list_teams
    if (action === 'list_teams') {
      const res = await fetch('https://graph.microsoft.com/v1.0/me/joinedTeams', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const resData = await res.json();
      if (!res.ok) return Response.json({ error: resData.error?.message || 'Failed to list teams' }, { status: res.status });
      return Response.json({ teams: resData.value.map(t => ({ id: t.id, name: t.displayName })) });
    }

    // Action: list_channels
    if (action === 'list_channels') {
      if (!teamId) return Response.json({ error: 'teamId is required' }, { status: 400 });
      const res = await fetch(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const resData = await res.json();
      if (!res.ok) return Response.json({ error: resData.error?.message || 'Failed to list channels' }, { status: res.status });
      return Response.json({ channels: resData.value.map(c => ({ id: c.id, name: c.displayName })) });
    }

    // Post issue — can come from automation (data) or direct call (issue)
    const issueData = issue || data;

    if (!issueData) return Response.json({ error: 'No issue data provided' }, { status: 400 });

    // Resolve teamId/channelId — use env vars (set via admin) or passed values
    const resolvedTeamId = teamId || Deno.env.get('OPS_TEAMS_TEAM_ID');
    const resolvedChannelId = channelId || Deno.env.get('OPS_TEAMS_CHANNEL_ID');

    if (!resolvedTeamId || !resolvedChannelId) {
      return Response.json({ error: 'teamId and channelId are required. Set OPS_TEAMS_TEAM_ID and OPS_TEAMS_CHANNEL_ID environment variables.' }, { status: 400 });
    }

    const statusEmoji = {
      'Complete Outage': '🔴',
      'Degraded / Partly Not Working': '🟡',
      'Unknown': '⚪',
      'Resolved': '✅'
    };

    const emoji = statusEmoji[issueData.status] || '📋';

    const mainInfo = [
      `<b>${emoji} New Operations Issue Logged</b>`,
      `<b>Ref:</b> ${issueData.issue_reference || 'N/A'}`,
      `<b>Title:</b> ${issueData.title || 'N/A'}`,
      `<b>Status:</b> ${issueData.status || 'Unknown'}`,
      issueData.affected_service ? `<b>Service:</b> ${issueData.affected_service}` : null,
      issueData.affected_count ? `<b>Affected:</b> ${issueData.affected_count}` : null,
      issueData.raised_by ? `<b>Raised By:</b> ${issueData.raised_by}` : null,
      `<b>Ticket Raised:</b> ${issueData.ticket_raised ? (issueData.ticket_reference ? issueData.ticket_reference : 'Yes') : 'No'}`,
    ].filter(Boolean).join('<br/>');

    const descriptionBlock = issueData.description
      ? `<br/><b>Description:</b><br/><blockquote>${issueData.description}</blockquote>`
      : '';

    const lines = mainInfo + descriptionBlock;

    const res = await fetch(
      `https://graph.microsoft.com/v1.0/teams/${resolvedTeamId}/channels/${resolvedChannelId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body: { contentType: 'html', content: lines } })
      }
    );

    const resData = await res.json();
    if (!res.ok) return Response.json({ error: resData.error?.message || 'Failed to post message' }, { status: res.status });

    return Response.json({ success: true, messageId: resData.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});