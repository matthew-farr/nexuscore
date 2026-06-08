import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Clean a surname for use in a staff code.
 * Returns at least 3 chars (padded with 'X') and at most 4 chars, uppercase, letters only.
 */
function cleanSurname(raw) {
  const clean = (raw || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (!clean) return 'USR';                        // absolute fallback
  return clean.slice(0, 4).padEnd(3, 'X');         // min 3 chars, max 4
}

async function generateUniqueCode(base44, lastName, roleType) {
  const surnameSegment = cleanSurname(lastName);
  const prefix = roleType === 'Admin' ? 'CDA' : 'CDS';
  const base = `${prefix}-${surnameSegment}`;

  // Fetch ALL profiles and filter in-memory (avoids $regex dependency)
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

    // Check by auth_user_id first (primary key)
    const existing = await base44.asServiceRole.entities.UserProfile.filter({ auth_user_id: user.id });
    if (existing.length > 0) {
      return Response.json({ profile: existing[0], created: false });
    }

    // Also check if profile exists by email (case-insensitive) to prevent duplicates
    if (user.email) {
      const allProfiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 500);
      const emailMatch = allProfiles.find(p => 
        p.email && p.email.trim().toLowerCase() === user.email.trim().toLowerCase()
      );
      if (emailMatch) {
        // Update auth_user_id on the existing profile if blank
        if (!emailMatch.auth_user_id) {
          await base44.asServiceRole.entities.UserProfile.update(emailMatch.id, { auth_user_id: user.id });
        }
        return Response.json({ profile: emailMatch, created: false });
      }
    }

    // Parse name — handle single-word names gracefully
    const nameParts = (user.full_name || '').trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || 'Unknown';
    // If only one name part, use it as both first and last for code generation,
    // but keep last_name empty so admin can fill it in properly
    const lastNameForCode = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0] || 'User';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const roleType = user.role === 'admin' ? 'Admin' : 'Staff';
    const staffCode = await generateUniqueCode(base44, lastNameForCode, roleType);

    const newProfile = {
      auth_user_id: user.id,
      email: user.email || '',
      first_name: firstName,
      last_name: lastName,
      display_name: (user.full_name || '').trim() || firstName,
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