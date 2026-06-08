import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Backfill resolved_at for completed issues where it's null
    // by using updated_at as the fallback
    const allCompleted = await base44.asServiceRole.entities.JiraIssue.filter({ 
      status_category: 'Done',
      is_active: true
    }, '-updated_at', 500);
    
    let backfilled = 0;
    const batchSize = 10;
    
    for (let i = 0; i < allCompleted.length; i += batchSize) {
      const batch = allCompleted.slice(i, i + batchSize);
      
      for (const issue of batch) {
        if (!issue.resolved_at && issue.updated_at) {
          try {
            await base44.asServiceRole.entities.JiraIssue.update(issue.id, {
              resolved_at: issue.updated_at
            });
            backfilled++;
          } catch (e) {
            console.error(`Failed to backfill ${issue.issue_key}:`, e.message);
          }
        }
      }
      
      // Rate limit throttling between batches
      if (i + batchSize < allCompleted.length) {
        await new Promise(r => setTimeout(r, 300));
      }
    }

    return Response.json({
      success: true,
      total: allCompleted.length,
      backfilled,
      skipped: allCompleted.length - backfilled,
      message: `Backfilled ${backfilled} completed issues with updated_at as resolved_at`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});