/**
 * App Publish Versioning
 * Format: VYY.WW.BB.HH:mm (e.g. V26.23.01.21:19)
 * - YY = 2-digit year
 * - WW = ISO week number, 2 digits
 * - BB = build number for that week, 2 digits
 * - HH:mm = publish time in 24-hour format
 */

export function getISOWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export function getVersionParts(date = new Date()) {
  const yy = String(date.getFullYear()).slice(-2);
  const ww = String(getISOWeek(date)).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return { yy, ww, hh, mm };
}

/**
 * Compute the next App Publish version number.
 * @param {Array} publishedApps - all AppPublish records with status === 'published'
 * @param {Date} now - the publish datetime (defaults to now)
 * @returns {{ version_number: string, version_year: string, version_week: string, version_build: string, publish_time: string }}
 */
export function computeNextAppVersion(publishedApps, now = new Date()) {
  const { yy, ww, hh, mm } = getVersionParts(now);

  // Find all publishes in the same YY + WW
  const sameWeek = publishedApps.filter(
    app => app.version_year === yy && app.version_week === ww
  );

  // Find the highest build number for this week
  const maxBuild = sameWeek.reduce((max, app) => {
    const b = parseInt(app.version_build || '0', 10);
    return b > max ? b : max;
  }, 0);

  const nextBuild = maxBuild + 1;
  const bb = String(nextBuild).padStart(2, '0');
  const publishTime = `${hh}:${mm}`;

  return {
    version_number: `V${yy}.${ww}.${bb}.${publishTime}`,
    version_year: yy,
    version_week: ww,
    version_build: bb,
    publish_time: publishTime,
  };
}