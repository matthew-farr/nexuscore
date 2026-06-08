import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const startTime = Date.now();
  const diagnostics = {
    requestUrl: null,
    jqlUsed: null,
    httpStatus: null,
    contentType: null,
    issuesReturned: 0,
    recordsCreated: 0,
    recordsUpdated: 0,
    recordsMarkedStale: 0,
    lastSyncTime: null,
    firstIssueKey: null,
    errorMessage: null,
    errorBody: null,
    durationMs: 0,
    jiraResponseTotal: null,
    jiraResponseMaxResults: null,
    jiraResponseStartAt: null,
    jiraResponsePreview: null
  };

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      diagnostics.errorMessage = 'Forbidden: Admin access required';
      diagnostics.durationMs = Date.now() - startTime;
      return Response.json({ diagnostics, error: 'Admin only' }, { status: 403 });
    }

    // Get and trim credentials from environment
    const jiraEmail = (Deno.env.get('JIRA_EMAIL') || '').trim();
    const jiraToken = (Deno.env.get('JIRA_API_TOKEN') || '').trim();
    let jiraBaseUrl = (Deno.env.get('JIRA_BASE_URL') || 'https://new-directions.atlassian.net').trim();

    if (!jiraEmail || !jiraToken) {
      diagnostics.errorMessage = 'Jira credentials not configured in environment';
      diagnostics.durationMs = Date.now() - startTime;
      return Response.json({ diagnostics, error: 'Credentials missing' }, { status: 500 });
    }

    if (jiraBaseUrl.endsWith('/')) {
      jiraBaseUrl = jiraBaseUrl.slice(0, -1);
    }

    // Build Basic Auth header with proper formatting
    const authString = `${jiraEmail}:${jiraToken}`;
    const encodedAuth = btoa(authString);
    const authHeader = `Basic ${encodedAuth}`;

    // Jira v3 REST API search with JQL (using POST to the correct endpoint)
    const jqlActive = 'issuetype IN (Epic, Admin, "BAU Project", Bug, Support, Triage) AND "department[dropdown]" NOT IN ("Care & Support", Commercial, Compliance, "Digital Services", Education, Facilities, "HR / Ops") AND reporter != 557058:41f82459-08ea-4caa-bb49-e3bdd9625750 AND status NOT IN (Complete, Completed, Done) ORDER BY created DESC';
    const jqlCompleted = 'issuetype IN (Epic, Admin, "BAU Project", Bug, Support, Triage) AND "department[dropdown]" NOT IN ("Care & Support", Commercial, Compliance, "Digital Services", Education, Facilities, "HR / Ops") AND reporter != 557058:41f82459-08ea-4caa-bb49-e3bdd9625750 AND statusCategory = Done ORDER BY updated DESC';
    
    const searchUrl = `${jiraBaseUrl}/rest/api/3/search/jql`;
    diagnostics.requestUrl = searchUrl;
    diagnostics.jqlUsed = jqlActive;

    const fields = [
      'summary',
      'description',
      'environment',
      'status',
      'issuetype',
      'priority',
      'assignee',
      'reporter',
      'creator',
      'created',
      'updated',
      'duedate',
      'project',
      'resolution',
      'customfield_10001',
      'customfield_10002',
      'customfield_10003',
      'customfield_10004',
      'customfield_10005',
      'customfield_10020',
      'customfield_10047',
      'customfield_10086'
    ];

    // Fetch active issues (small batch to avoid rate limits)
    const responseActive = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jql: jqlActive, maxResults: 100, fields })
    });

    diagnostics.httpStatus = responseActive.status;
    diagnostics.contentType = responseActive.headers.get('content-type');

    if (!responseActive.ok) {
      const errorText = await responseActive.text();
      diagnostics.errorMessage = `HTTP ${responseActive.status}: Jira API returned an error`;
      diagnostics.errorBody = errorText.substring(0, 1000);
      diagnostics.durationMs = Date.now() - startTime;
      return Response.json({ diagnostics, error: 'Jira API error' }, { status: responseActive.status });
    }

    const dataActive = await responseActive.json();
    const issues = dataActive.issues || [];

    // Wait before next request to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 500));

    // Fetch completed issues (small batch)
    const responseCompleted = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jql: jqlCompleted, maxResults: 100, fields })
    });

    const dataCompleted = await responseCompleted.json();
    const completedIssues = responseCompleted.ok ? (dataCompleted.issues || []) : [];
    const allIssues = [...issues, ...completedIssues];
    
    diagnostics.issuesReturned = allIssues.length;
    diagnostics.jiraResponseTotal = dataActive.total || 0;
    diagnostics.jiraResponseMaxResults = dataActive.maxResults || 0;
    diagnostics.jiraResponseStartAt = dataActive.startAt || 0;
    diagnostics.jiraResponsePreview = JSON.stringify(dataActive).substring(0, 1000);
    
    if (allIssues.length > 0) {
      diagnostics.firstIssueKey = allIssues[0].key;
    }

    if (allIssues.length === 0) {
      diagnostics.errorMessage = 'Jira connected successfully but returned 0 matching issues. Check the JQL filter, project permissions, and token access.';
      diagnostics.durationMs = Date.now() - startTime;
      return Response.json({ diagnostics, warning: 'No issues found' });
    }

    const now = new Date().toISOString();
    const syncedKeys = new Set();

    // Get all existing records to mark stale
    const allExisting = await base44.asServiceRole.entities.JiraIssue.list('-updated_at', 500);

    // Helper to extract plain text from ADF (Atlassian Document Format)
    const extractTextFromADF = (adf) => {
      if (!adf || !adf.content) return null;
      if (typeof adf === 'string') return adf;
      
      try {
        const text = adf.content.map(block => {
          if (!block.content) return '';
          return block.content.map(node => {
            if (node.type === 'text') return node.text;
            if (node.type === 'hardBreak') return '\n';
            return '';
          }).join('');
        }).join('\n\n').trim();
        
        return text || null;
      } catch (e) {
        return null;
      }
    };

    // Process each issue from Jira (active and completed)
    for (const issue of allIssues) {
      try {
        syncedKeys.add(issue.key);

        // Helper to extract string from custom field (handles objects, arrays, etc)
        const extractString = (field) => {
          if (!field) return null;
          if (typeof field === 'string') return field;
          if (field.name) return field.name;
          if (field.value) return field.value;
          if (Array.isArray(field) && field.length > 0) return extractString(field[0]);
          return null;
        };

        // For completed issues, use resolutiondate if available, else fallback to updated_at
        const isCompleted = issue.fields.status?.statusCategory?.name === 'Done';
        const resolvedAt = issue.fields.resolutiondate || (isCompleted ? issue.fields.updated : null);

        const issueData = {
          issue_key: issue.key,
          issue_id: issue.id,
          summary: issue.fields.summary,
          description: extractTextFromADF(issue.fields.description) || null,
          environment: extractTextFromADF(issue.fields.environment) || null,
          issue_type: issue.fields.issuetype?.name || 'Unknown',
          status: issue.fields.status?.name || 'Unknown',
          status_category: issue.fields.status?.statusCategory?.name || 'Unknown',
          priority: issue.fields.priority?.name || 'None',
          assignee_name: issue.fields.assignee?.displayName || null,
          assignee_email: issue.fields.assignee?.emailAddress || null,
          reporter_name: issue.fields.reporter?.displayName || null,
          reporter_email: issue.fields.reporter?.emailAddress || null,
          creator_name: issue.fields.creator?.displayName || null,
          due_date: issue.fields.duedate || null,
          story_points: issue.fields.customfield_10086 || null,
          sprint: extractString(issue.fields.customfield_10020),
          created_at: issue.fields.created,
          updated_at: issue.fields.updated,
          resolved_at: resolvedAt,
          issue_url: `https://new-directions.atlassian.net/issues?filter=10522&selectedIssue=${issue.key}`,
          project_key: issue.fields.project?.key || null,
          project_name: issue.fields.project?.name || null,
          resolution: issue.fields.resolution?.name || null,
          category: extractString(issue.fields.customfield_10001),
          department: extractString(issue.fields.customfield_10002),
          impact: extractString(issue.fields.customfield_10003),
          requestor: extractString(issue.fields.customfield_10004),
          urgency: extractString(issue.fields.customfield_10005),
          staff_email: issue.fields.customfield_10047 || null,
          is_active: true,
          is_stale: false,
          last_synced_at: now,
          raw_jira_data: issue
        };

        // Try to find existing record by issue_key
        const existing = allExisting.find(e => e.issue_key === issue.key);

        if (existing) {
          // Update existing
          await base44.asServiceRole.entities.JiraIssue.update(existing.id, issueData);
          diagnostics.recordsUpdated++;
        } else {
          // Create new
          await base44.asServiceRole.entities.JiraIssue.create(issueData);
          diagnostics.recordsCreated++;
        }
      } catch (e) {
        console.error(`Failed to sync issue ${issue.key}:`, e.message);
      }
    }

    // Mark records not in this sync as stale
    for (const existing of allExisting) {
      if (!syncedKeys.has(existing.issue_key)) {
        try {
          await base44.asServiceRole.entities.JiraIssue.update(existing.id, {
            is_stale: true,
            is_active: false
          });
          diagnostics.recordsMarkedStale++;
        } catch (e) {
          console.error(`Failed to mark stale: ${existing.issue_key}`, e.message);
        }
      }
    }

    diagnostics.lastSyncTime = now;
    diagnostics.durationMs = Date.now() - startTime;

    return Response.json({ diagnostics, success: true });
  } catch (error) {
    diagnostics.errorMessage = error.message;
    diagnostics.durationMs = Date.now() - startTime;
    return Response.json({ diagnostics, error: error.message }, { status: 500 });
  }
});