import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Repair function to convert old AppPublish version formats to VYY.WW.BB.HH:mm format
 * Regenerates version_number using published_date or created_date
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin only
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all AppPublish records
    const allApps = await base44.entities.AppPublish.list('-created_date', 500);

    let repaired = 0;
    let errors = [];

    // ISO week calculation
    function getISOWeek(date) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    // Helper to generate new version from date
    function generateVersionFromDate(dateStr) {
      const date = new Date(dateStr);
      const yy = String(date.getFullYear()).slice(-2);
      const ww = String(getISOWeek(date)).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      return { yy, ww, hh, mm };
    }

    // Process each record
    for (const app of allApps) {
      // Check if version_number is in old format (contains dash or R1, etc.)
      const isOldFormat = app.version_number && (
        app.version_number.includes('-') ||
        /R\d+/.test(app.version_number) ||
        !app.version_number.startsWith('V')
      );

      if (!isOldFormat) continue; // Skip records already in correct format

      try {
        const publishDate = app.published_date || app.created_date;
        if (!publishDate) {
          errors.push({ id: app.id, reason: 'No publish or created date' });
          continue;
        }

        const { yy, ww, hh, mm } = generateVersionFromDate(publishDate);

        // Find existing builds for this YY.WW to assign correct build number
        const sameWeek = allApps.filter(a => 
          a.version_year === yy && 
          a.version_week === ww &&
          a.id !== app.id
        );
        const maxBuild = Math.max(
          ...sameWeek.map(a => parseInt(a.version_build || '0', 10)),
          0
        );
        const bb = String(maxBuild + 1).padStart(2, '0');

        const newVersionNumber = `V${yy}.${ww}.${bb}.${hh}:${mm}`;

        await base44.entities.AppPublish.update(app.id, {
          version_number: newVersionNumber,
          version_year: yy,
          version_week: ww,
          version_build: bb,
          publish_time: `${hh}:${mm}`,
        });

        repaired++;
      } catch (e) {
        errors.push({ id: app.id, reason: e.message });
      }
    }

    return Response.json({
      success: true,
      repaired,
      errors: errors.length > 0 ? errors : null,
      message: `Repaired ${repaired} AppPublish record${repaired !== 1 ? 's' : ''}`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});