import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function cleanSurname(raw) {
  const clean = (raw || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (!clean) return 'USR';
  return clean.slice(0, 4).padEnd(3, 'X');
}

async function generateUniqueCode(base44, lastName, roleType) {
  const surnameSegment = cleanSurname(lastName);
  const prefix = roleType === 'Admin' ? 'CDA' : 'CDS';
  const base = `${prefix}-${surnameSegment}`;

  const existing = await base44.asServiceRole.entities.UserProfile.list('-created_date', 500);
  const usedNumbers = new Set(
    existing
      .filter(p => p.staff_code && p.staff_code.startsWith(base + '-'))
      .map(p => {
        const parts = p.staff_code.split('-');
        return parseInt(parts[parts.length - 1], 10);
      })
      .filter(n => !isNaN(n))
  );

  let num = 1;
  while (usedNumbers.has(num)) num++;
  return `${base}-${String(num).padStart(4, '0')}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const userId = body?.event?.entity_id || body?.data?.id;
    const userData = body?.data;

    if (!userId) {
      return Response.json({ error: 'No user ID in payload' }, { status: 400 });
    }

    // Check if profile already exists for this user
    const existing = await base44.asServiceRole.entities.UserProfile.filter({ auth_user_id: userId });
    if (existing.length > 0) {
      return Response.json({ skipped: true, reason: 'Profile already exists' });
    }

    // Parse name from user data
    const fullName = (userData?.full_name || '').trim();
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || 'Unknown';
    const lastNameForCode = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0] || 'User';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    const email = userData?.email || '';
    const role = userData?.role || 'user';

    const roleType = role === 'admin' ? 'Admin' : 'Staff';
    const staffCode = await generateUniqueCode(base44, lastNameForCode, roleType);

    const newProfile = {
      auth_user_id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      display_name: fullName || firstName,
      staff_code: staffCode,
      learner_id: staffCode,
      certificate_profile_id: staffCode,
      role_type: roleType,
      employment_status: 'Active',
      onboarding_status: 'Not Started',
      profile_completion_percentage: 0,
      last_profile_update: new Date().toISOString(),
    };

    const created = await base44.asServiceRole.entities.UserProfile.create(newProfile);
    return Response.json({ profile: created, created: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});