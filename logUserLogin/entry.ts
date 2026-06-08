import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch staff code from UserProfile
    let staffCode = null;
    try {
      // Try by auth_user_id first
      let profile = await base44.entities.UserProfile.filter({ auth_user_id: user.id }, '', 1);
      if (!profile || profile.length === 0) {
        // Fallback: try by display name
        profile = await base44.entities.UserProfile.filter({ display_name: user.full_name }, '', 1);
      }
      if (profile && profile.length > 0) {
        staffCode = profile[0].staff_code;
      }
    } catch (profileError) {
      console.log('Could not fetch UserProfile:', profileError.message);
    }

    // Skip logging if this is CDA-FARR-0001
    if (staffCode === 'CDA-FARR-0001') {
      return Response.json({ success: true, skipped: true });
    }

    // Log this login
    await base44.entities.UserLoginLog.create({
      user_id: user.id,
      user_name: user.full_name,
      staff_code: staffCode,
      login_at: new Date().toISOString(),
    });

    return Response.json({ success: true });
  } catch (error) {
    // Don't fail auth if logging fails
    console.error('Failed to log login:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});