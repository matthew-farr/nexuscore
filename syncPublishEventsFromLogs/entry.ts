import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get the latest AppPublish record to know where to start
    const existingPublishes = await base44.asServiceRole.entities.AppPublish.list('-published_date', 1);
    const latestPublishDate = existingPublishes[0]?.published_date 
      ? new Date(existingPublishes[0].published_date) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago

    // Query logs for app.published events since the latest known publish
    // Note: Base44 logs API may not be available, so we'll work with a 30-day window
    // by checking the Activity entity instead
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activities = await base44.asServiceRole.entities.Activity.filter({
      event_type: 'app.published',
      created_date: { $gte: thirtyDaysAgo.toISOString() }
    }, '-created_date', 100);

    const logs = activities;

    if (!logs || logs.length === 0) {
      return Response.json({ synced: 0, message: 'No new publish events found' });
    }

    // Helper to calculate ISO week
    const getISOWeek = (date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };

    const formatVersionNumber = (date) => {
      const year = String(date.getFullYear()).slice(-2);
      const week = String(getISOWeek(date)).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const mins = String(date.getMinutes()).padStart(2, '0');

      // Count builds for this week to get build number
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // This will be incremented in the next step
      return { year, week, hours, mins };
    };

    // Sync each publish event
    let synced = 0;
    for (const log of logs) {
      const publishDate = new Date(log.created_date || log.timestamp);
      const versionInfo = formatVersionNumber(publishDate);

      // Count existing publishes for this week to determine build number
      const weekStart = new Date(publishDate);
      weekStart.setDate(weekStart.getDate() - publishDate.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);

      const weekPublishes = await base44.asServiceRole.entities.AppPublish.filter({
        version_week: versionInfo.week,
        version_year: versionInfo.year
      });

      const buildNum = String(weekPublishes.length + 1).padStart(2, '0');
      const versionNumber = `V${versionInfo.year}.${versionInfo.week}.${buildNum}.${versionInfo.hours}:${versionInfo.mins}`;

      // Check if this publish already exists
      const existing = await base44.asServiceRole.entities.AppPublish.filter({
        version_number: versionNumber
      });

      if (existing.length === 0) {
        await base44.asServiceRole.entities.AppPublish.create({
          version_number: versionNumber,
          version_year: versionInfo.year,
          version_week: versionInfo.week,
          version_build: buildNum,
          publish_time: `${versionInfo.hours}:${versionInfo.mins}`,
          published_date: publishDate.toISOString(),
          published_by: 'Auto-synced from logs',
          status: 'published'
        });
        synced++;
      }
    }

    return Response.json({ 
      synced, 
      message: `Synced ${synced} new publish events from logs` 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});