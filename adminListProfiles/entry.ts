import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Admin-only function to list all user profiles.
 * Staff users will receive a 403.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const profiles = await base44.asServiceRole.entities.UserProfile.list('-updated_date', 500);
    return Response.json({ profiles });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});