import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const year = now.getFullYear().toString().slice(-2).padStart(2, '0');
    const week = getISOWeek(now).toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    // Get existing publishes for this week to increment build number
    const existingPublishes = await base44.entities.AppPublish.filter({
      version_year: year,
      version_week: week
    });

    const nextBuild = (existingPublishes.length + 1).toString().padStart(2, '0');

    const versionNumber = `V${year}.${week}.${nextBuild}.${hours}:${minutes}`;

    const publishRecord = await base44.entities.AppPublish.create({
      version_number: versionNumber,
      version_year: year,
      version_week: week,
      version_build: nextBuild,
      publish_time: `${hours}:${minutes}`,
      published_by: user.full_name || user.email,
      published_date: now.toISOString(),
      status: 'published'
    });

    return Response.json({
      success: true,
      version: versionNumber,
      record_id: publishRecord.id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});