import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { release_id } = await req.json();

    if (!release_id) {
      return Response.json({ error: 'release_id required' }, { status: 400 });
    }

    // Fetch staff code from UserProfile
    let staffCode = null;
    try {
      let profile = await base44.entities.UserProfile.filter({ auth_user_id: user.id }, '', 1);
      if (!profile || profile.length === 0) {
        profile = await base44.entities.UserProfile.filter({ display_name: user.full_name }, '', 1);
      }
      if (profile && profile.length > 0) {
        staffCode = profile[0].staff_code;
      }
    } catch (profileError) {
      console.log('Could not fetch UserProfile:', profileError.message);
    }

    // Fetch release details for title and view count
    const releaseData = await base44.entities.FeatureRelease.get(release_id);
    const releaseTitle = releaseData?.title || 'Unknown Release';
    const currentCount = typeof releaseData?.view_count === 'number' ? releaseData.view_count : 0;

    // Log view in FeatureReleaseView (create new record if doesn't exist)
    let isNewViewer = true;
    try {
      await base44.entities.FeatureReleaseView.create({
        release_id,
        release_title: releaseTitle,
        user_id: user.id,
        user_name: user.full_name,
        staff_code: staffCode,
        viewed_at: new Date().toISOString(),
      });
    } catch (err) {
      // Ignore duplicate errors from unique constraint
      if (err.message?.includes('unique') || err.message?.includes('already exists')) {
        isNewViewer = false;
      } else {
        throw err;
      }
    }
    
    // Only increment count for new viewers
    if (isNewViewer) {
      await base44.entities.FeatureRelease.update(release_id, {
        view_count: currentCount + 1,
      });
    }

    return Response.json({ success: true, view_count: currentCount + 1 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});