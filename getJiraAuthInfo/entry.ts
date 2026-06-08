import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const jiraEmail = (Deno.env.get('JIRA_EMAIL') || '').trim();
    const jiraToken = (Deno.env.get('JIRA_API_TOKEN') || '').trim();
    let jiraBaseUrl = (Deno.env.get('JIRA_BASE_URL') || 'https://new-directions.atlassian.net').trim();

    if (!jiraEmail || !jiraToken) {
      return Response.json({ error: 'Jira credentials not configured' }, { status: 500 });
    }

    if (jiraBaseUrl.endsWith('/')) {
      jiraBaseUrl = jiraBaseUrl.slice(0, -1);
    }

    const authString = `${jiraEmail}:${jiraToken}`;
    const encodedAuth = btoa(authString);
    const authHeader = `Basic ${encodedAuth}`;

    // Get current user info
    const userResponse = await fetch(`${jiraBaseUrl}/rest/api/3/myself`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });

    let userInfo = null;
    if (userResponse.ok) {
      userInfo = await userResponse.json();
    }

    // Get projects
    const projectsResponse = await fetch(`${jiraBaseUrl}/rest/api/3/project/search`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });

    let projectsData = null;
    if (projectsResponse.ok) {
      projectsData = await projectsResponse.json();
    }

    return Response.json({
      userInfo: {
        accountId: userInfo?.accountId || null,
        displayName: userInfo?.displayName || null,
        emailAddress: userInfo?.emailAddress || null,
        status: userResponse.status
      },
      projects: {
        total: projectsData?.total || 0,
        count: projectsData?.values?.length || 0,
        names: projectsData?.values?.map(p => p.name) || [],
        status: projectsResponse.status
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});