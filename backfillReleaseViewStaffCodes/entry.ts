import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all release views
    const views = await base44.asServiceRole.entities.FeatureReleaseView.list('', 500);
    
    if (!views || views.length === 0) {
      return Response.json({ success: true, updated: 0, message: 'No release views found' });
    }

    // Fetch all user profiles
    const profiles = await base44.asServiceRole.entities.UserProfile.list('', 500);
    const staffCodeMapByAuthId = {};
    const staffCodeMapByName = {};
    profiles.forEach(p => {
      if (p.auth_user_id) staffCodeMapByAuthId[p.auth_user_id] = p.staff_code;
      if (p.display_name) staffCodeMapByName[p.display_name] = p.staff_code;
    });

    // Fetch all releases for title mapping
    const releases = await base44.asServiceRole.entities.FeatureRelease.list('', 500);
    const releaseTitleMap = {};
    releases.forEach(r => {
      releaseTitleMap[r.id] = r.title;
    });

    // Update views with staff codes and titles
    let updated = 0;
    for (const view of views) {
      const updateData = {};
      
      if (!view.staff_code) {
        let staffCode = staffCodeMapByAuthId[view.user_id];
        if (!staffCode && view.user_name) {
          staffCode = staffCodeMapByName[view.user_name];
        }
        if (staffCode) {
          updateData.staff_code = staffCode;
        }
      }
      
      if (!view.release_title && view.release_id) {
        const title = releaseTitleMap[view.release_id];
        if (title) {
          updateData.release_title = title;
        }
      }
      
      if (Object.keys(updateData).length > 0) {
        await base44.asServiceRole.entities.FeatureReleaseView.update(view.id, updateData);
        updated++;
      }
    }

    return Response.json({ success: true, updated, total: views.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});