import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Get and trim secrets
    const jiraEmail = (Deno.env.get('JIRA_EMAIL') || '').trim();
    const jiraToken = (Deno.env.get('JIRA_API_TOKEN') || '').trim();
    let jiraBaseUrl = (Deno.env.get('JIRA_BASE_URL') || 'https://new-directions.atlassian.net').trim();

    if (jiraBaseUrl.endsWith('/')) {
      jiraBaseUrl = jiraBaseUrl.slice(0, -1);
    }

    // Build diagnostics
    const diagnostics = {
      secretsConfigured: {
        jiraBaseUrlExists: !!Deno.env.get('JIRA_BASE_URL'),
        jiraEmailExists: !!Deno.env.get('JIRA_EMAIL'),
        jiraApiTokenExists: !!Deno.env.get('JIRA_API_TOKEN'),
        jiraEmailLength: jiraEmail.length,
        jiraApiTokenLength: jiraToken.length,
        authMethod: 'Basic'
      }
    };

    if (!jiraEmail || !jiraToken) {
      return Response.json({ error: 'Jira credentials not configured', diagnostics }, { status: 500 });
    }

    // Build Basic Auth header
    const authString = `${jiraEmail}:${jiraToken}`;
    const encodedAuth = btoa(authString);
    const authHeader = `Basic ${encodedAuth}`;

    // Add auth header details to diagnostics
    diagnostics.authHeaderInfo = {
      headerValue: authHeader.substring(0, 20) + '...',
      authStringFormat: `${jiraEmail.substring(0, 3)}...@...:***`,
      encodedAuthLength: encodedAuth.length,
      jiraEmail: jiraEmail,
      jiraTokenFirst20: jiraToken.substring(0, 20),
      jiraTokenLast20: jiraToken.substring(jiraToken.length - 20),
      fullAuthString: authString
    };

    const results = {
      diagnostics,
      test1: { name: 'User Info', status: null, accountId: null, displayName: null, error: null },
      test2: { name: 'Project Search', status: null, total: null, names: [], error: null },
      test3: { name: 'All Issues (ORDER BY created DESC)', status: null, total: null, jql: 'ORDER BY created DESC', error: null },
      test4: { name: 'Open Issues (statusCategory != Done)', status: null, total: null, jql: 'statusCategory != Done', error: null },
      test5: { name: 'Exclude Rollbar (reporter != "Rollbar for JIRA")', status: null, total: null, jql: 'reporter != "Rollbar for JIRA"', error: null }
    };

    // Test 1: User Info (CRITICAL - must pass before continuing)
    try {
      const resp = await fetch(`${jiraBaseUrl}/rest/api/3/myself`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      results.test1.status = resp.status;
      if (resp.ok) {
        const data = await resp.json();
        results.test1.accountId = data.accountId;
        results.test1.displayName = data.displayName;
      } else {
        const errorText = await resp.text();
        results.test1.error = errorText.substring(0, 500);
      }
    } catch (e) {
      results.test1.error = e.message;
    }

    // Only run remaining tests if /myself returns 200
    if (results.test1.status === 200) {
      // Test 2: Projects
      try {
        const resp = await fetch(`${jiraBaseUrl}/rest/api/3/project/search`, {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        results.test2.status = resp.status;
        if (resp.ok) {
          const data = await resp.json();
          results.test2.total = data.total;
          results.test2.names = (data.values || []).map(p => p.name);
        } else {
          results.test2.error = await resp.text();
        }
      } catch (e) {
        results.test2.error = e.message;
      }

      // Tests 3-5: JQL searches
      const tests = [
        { key: 'test3', jql: 'statusCategory != Done ORDER BY created DESC' },
        { key: 'test4', jql: 'statusCategory != Done' },
        { key: 'test5', jql: 'reporter != "Rollbar for JIRA"' }
      ];

      for (const test of tests) {
        try {
          const resp = await fetch(`${jiraBaseUrl}/rest/api/3/search/jql`, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              jql: test.jql,
              maxResults: 1,
              fields: []
            })
          });
          results[test.key].status = resp.status;
          if (resp.ok) {
            const data = await resp.json();
            results[test.key].total = data.total;
          } else {
            results[test.key].error = await resp.text();
          }
        } catch (e) {
          results[test.key].error = e.message;
        }
      }
    } else {
      results.test1.error = results.test1.error || 'Authentication failed. Check credentials and base URL.';
    }

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});