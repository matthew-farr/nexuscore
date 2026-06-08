import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch escalations with "DUE TO BE ESCALATED" status
    const escalations = await base44.asServiceRole.entities.DBSEscalation.filter({ status: 'DUE TO BE ESCALATED' }, '', 500);

    if (!escalations || escalations.length === 0) {
      return Response.json({ updated: 0, message: 'No "DUE TO BE ESCALATED" records found' });
    }

    // Sequential update with delay
    let updated = 0;
    for (const escalation of escalations) {
      try {
        await base44.asServiceRole.entities.DBSEscalation.update(escalation.id, { status: 'ESCALATED' });
        updated++;
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (e) {
        console.error(`Failed to update ${escalation.id}:`, e.message);
      }
    }

    return Response.json({ updated, message: `Updated ${updated} escalations to ESCALATED status` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});