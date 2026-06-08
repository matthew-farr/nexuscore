import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function buildStaffCode(lastName, roleType) {
  // Clean surname: remove spaces, punctuation, special chars, uppercase
  const clean = lastName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const surnameSegment = clean.slice(0, 4).padEnd(clean.length < 4 ? clean.length : 4, '');
  const prefix = roleType === 'Admin' ? 'CDA' : 'CDS';
  return { prefix, surnameSegment };
}

async function generateUniqueCode(base44, lastName, roleType) {
  const { prefix, surnameSegment } = buildStaffCode(lastName, roleType);
  const base = `${prefix}-${surnameSegment}`;

  // Fetch existing codes starting with this base
  const existing = await base44.asServiceRole.entities.UserProfile.filter({ staff_code: { $regex: `^${base}-` } });
  const usedNumbers = new Set(
    existing.map(p => {
      const parts = p.staff_code.split('-');
      return parseInt(parts[parts.length - 1], 10);
    }).filter(n => !isNaN(n))
  );

  // Find next available number
  let num = 1;
  while (usedNumbers.has(num)) num++;
  const padded = String(num).padStart(4, '0');
  return `${base}-${padded}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { lastName, roleType } = await req.json();
    if (!lastName) return Response.json({ error: 'lastName is required' }, { status: 400 });

    const staffCode = await generateUniqueCode(base44, lastName, roleType || 'Staff');
    return Response.json({ staff_code: staffCode });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});