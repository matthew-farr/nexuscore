import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { issue_key } = await req.json();

    if (!issue_key) {
      return Response.json({ error: 'issue_key required' }, { status: 400 });
    }

    const jiraEmail = (Deno.env.get('JIRA_EMAIL') || '').trim();
    const jiraToken = (Deno.env.get('JIRA_API_TOKEN') || '').trim();
    const jiraBaseUrl = (Deno.env.get('JIRA_BASE_URL') || 'https://new-directions.atlassian.net').trim();

    if (!jiraEmail || !jiraToken) {
      return Response.json({ error: 'Jira credentials not configured' }, { status: 500 });
    }

    const authString = `${jiraEmail}:${jiraToken}`;
    const encodedAuth = btoa(authString);
    const authHeader = `Basic ${encodedAuth}`;
    const headers = { 'Authorization': authHeader };

    // Fetch comments
    let comments = [];
    try {
      const commentsRes = await fetch(
        `${jiraBaseUrl}/rest/api/2/issue/${issue_key}/comment?maxResults=100`,
        { headers }
      );
      const commentsData = commentsRes.ok ? await commentsRes.json() : {};
      comments = (commentsData.comments || []).map(c => ({
        author: c.author?.displayName || 'Unknown',
        body: c.body,
        created: c.created,
        updated: c.updated
      }));
    } catch (e) {
      console.error(`Failed to fetch comments for ${issue_key}:`, e.message);
    }

    // Fetch changelog
    let changelog = [];
    try {
      const changelogRes = await fetch(
        `${jiraBaseUrl}/rest/api/2/issue/${issue_key}/changelog?maxResults=100`,
        { headers }
      );
      const changelogData = changelogRes.ok ? await changelogRes.json() : {};
      changelog = (changelogData.values || []).map(h => ({
        author: h.author?.displayName || 'Unknown',
        created: h.created,
        changes: (h.items || []).map(i => ({
          field: i.field,
          fieldtype: i.fieldtype,
          from: i.fromString,
          to: i.toString
        }))
      }));
    } catch (e) {
      console.error(`Failed to fetch changelog for ${issue_key}:`, e.message);
    }

    // Fetch full issue to get attachments
    let attachments = [];
    try {
      const issueRes = await fetch(
        `${jiraBaseUrl}/rest/api/3/issue/${issue_key}?fields=attachment`,
        { headers }
      );
      const issueData = issueRes.ok ? await issueRes.json() : {};
      attachments = (issueData.fields?.attachment || []).map(att => ({
        id: att.id,
        filename: att.filename,
        mimeType: att.mimeType,
        size: att.size,
        downloadUrl: att.content,
        author: att.author?.displayName || 'Unknown',
        created: att.created
      }));
    } catch (e) {
      console.error(`Failed to fetch attachments for ${issue_key}:`, e.message);
    }

    return Response.json({
      issue_key,
      comments,
      changelog,
      attachments,
      success: true
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});