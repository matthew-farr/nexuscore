import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all login records
    const logins = await base44.asServiceRole.entities.UserLoginLog.list('-login_at', 500);
    
    if (!logins || logins.length === 0) {
      return Response.json({ success: true, updated: 0, message: 'No login records found' });
    }

    // Fetch all user profiles
    const profiles = await base44.asServiceRole.entities.UserProfile.list('', 500);
    const staffCodeMapByAuthId = {};
    const staffCodeMapByName = {};
    profiles.forEach(p => {
      if (p.auth_user_id) staffCodeMapByAuthId[p.auth_user_id] = p.staff_code;
      if (p.display_name) staffCodeMapByName[p.display_name] = p.staff_code;
    });

    // Fetch users to match by email
    const users = await base44.asServiceRole.entities.User.list('', 500);
    const userMap = {};
    users.forEach(u => {
      userMap[u.id] = u;
    });

    // Update login records with staff codes
    let updated = 0;
    for (const login of logins) {
      if (login.staff_code) continue; // Skip if already has staff code
      
      let staffCode = staffCodeMapByAuthId[login.user_id];
      
      // Fallback: match by user name
      if (!staffCode && login.user_name) {
        staffCode = staffCodeMapByName[login.user_name];
      }
      
      if (staffCode) {
        await base44.asServiceRole.entities.UserLoginLog.update(login.id, {
          staff_code: staffCode,
        });
        updated++;
      }
    }

    return Response.json({ success: true, updated, total: logins.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});