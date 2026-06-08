import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Fields a staff user is allowed to edit on their own profile
const STAFF_EDITABLE_FIELDS = [
  'preferred_name', 'phone_number', 'work_mobile', 'bio', 'skills',
  'interests', 'profile_photo_url', 'location', 'date_of_birth'
];

// Additional fields only admins can edit
const ADMIN_EXTRA_FIELDS = [
  'first_name', 'last_name', 'display_name', 'job_title', 'department',
  'manager_name', 'start_date', 'work_anniversary_date', 'employment_status',
  'role_type', 'onboarding_status', 'admin_notes', 'security_notes',
  'internal_flags', 'permissions_group', 'can_manage_content', 'can_manage_lms',
  'can_manage_users', 'can_publish_content'
];

// Fields that must NEVER be updated via this function regardless of role
const IMMUTABLE_FIELDS = ['staff_code', 'auth_user_id', 'id', 'created_date', 'learner_id', 'certificate_profile_id'];

function calcCompletion(profile) {
  const fields = ['first_name', 'last_name', 'job_title', 'department', 'phone_number', 'bio', 'profile_photo_url', 'start_date', 'location'];
  const filled = fields.filter(f => profile[f] && String(profile[f]).trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { updates, targetUserId } = body;

    if (!updates || typeof updates !== 'object') {
      return Response.json({ error: 'updates object is required' }, { status: 400 });
    }

    const isAdmin = user.role === 'admin';

    // Determine target profile
    let profileToUpdate;
    if (isAdmin && targetUserId && targetUserId !== user.id) {
      // Admin editing another user's profile
      const results = await base44.asServiceRole.entities.UserProfile.filter({ auth_user_id: targetUserId });
      if (!results.length) return Response.json({ error: 'Profile not found' }, { status: 404 });
      profileToUpdate = results[0];
    } else {
      // User editing their own profile (or admin editing their own)
      const results = await base44.asServiceRole.entities.UserProfile.filter({ auth_user_id: user.id });
      if (!results.length) return Response.json({ error: 'Profile not found' }, { status: 404 });
      profileToUpdate = results[0];
    }

    // Build allowed field list — strip immutable fields regardless
    const allowedFields = isAdmin
      ? [...STAFF_EDITABLE_FIELDS, ...ADMIN_EXTRA_FIELDS].filter(f => !IMMUTABLE_FIELDS.includes(f))
      : STAFF_EDITABLE_FIELDS.filter(f => !IMMUTABLE_FIELDS.includes(f));

    const safeUpdates = {};
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key) && !IMMUTABLE_FIELDS.includes(key)) {
        safeUpdates[key] = updates[key];
      }
    }

    // If name fields changed, keep display_name in sync (admin only path)
    if (isAdmin && (safeUpdates.first_name !== undefined || safeUpdates.last_name !== undefined)) {
      const newFirst = safeUpdates.first_name ?? profileToUpdate.first_name ?? '';
      const newLast = safeUpdates.last_name ?? profileToUpdate.last_name ?? '';
      safeUpdates.display_name = `${newFirst} ${newLast}`.trim();
    }

    // Recalculate completion
    const merged = { ...profileToUpdate, ...safeUpdates };
    safeUpdates.profile_completion_percentage = calcCompletion(merged);
    safeUpdates.last_profile_update = new Date().toISOString();

    const updated = await base44.asServiceRole.entities.UserProfile.update(profileToUpdate.id, safeUpdates);
    return Response.json({ profile: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});