import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function cleanSurname(raw) {
  const clean = (raw || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (!clean) return 'USR';
  return clean.slice(0, 4).padEnd(3, 'X');
}

async function generateUniqueCode(base44, lastName, roleType, existingProfiles) {
  const surnameSegment = cleanSurname(lastName);
  const prefix = roleType === 'Admin' ? 'CDA' : 'CDS';
  const base = `${prefix}-${surnameSegment}`;

  const usedNumbers = new Set(
    existingProfiles
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

    // Fetch all users and all existing profiles
    const [allUsers, allProfiles] = await Promise.all([
      base44.asServiceRole.entities.User.list('-created_date', 500),
      base44.asServiceRole.entities.UserProfile.list('-created_date', 500),
    ]);

    const profiledUserIds = new Set(allProfiles.map(p => p.auth_user_id).filter(Boolean));
    const usersWithoutProfile = allUsers.filter(u => !profiledUserIds.has(u.id));

    let created = 0;
    const profilesSnapshot = [...allProfiles];

    for (const user of usersWithoutProfile) {
      const fullName = (user.full_name || '').trim();
      const nameParts = fullName.split(/\s+/).filter(Boolean);
      const firstName = nameParts[0] || 'Unknown';
      const lastNameForCode = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0] || 'User';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      const roleType = user.role === 'admin' ? 'Admin' : 'Staff';

      const staffCode = await generateUniqueCode(base44, lastNameForCode, roleType, profilesSnapshot);

      const newProfile = {
        auth_user_id: user.id,
        email: user.email || '',
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

      const profile = await base44.asServiceRole.entities.UserProfile.create(newProfile);
      profilesSnapshot.push(profile); // keep snapshot fresh for code uniqueness
      created++;
    }

    return Response.json({ checked: allUsers.length, created, skipped: allUsers.length - usersWithoutProfile.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});