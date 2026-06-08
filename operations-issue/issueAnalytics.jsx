// Analytics utilities for Operations Issue Log
// All date logic uses Europe/London timezone

const TZ = 'Europe/London';

function toUKDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  // Get UK local date string, then parse it back as a plain date
  const parts = d.toLocaleDateString('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).split('/');
  // parts: [dd, mm, yyyy]
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
}

function getUKToday() {
  return toUKDate(new Date().toISOString());
}

function getUKMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function computeKPIs(issues) {
  const today = getUKToday();
  const weekStart = getUKMonday(today);
  const monthStart = startOfMonth(today);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const isToday = (d) => d >= today && d < new Date(today.getTime() + 86400000);
  const isThisWeek = (d) => d >= weekStart;
  const isThisMonth = (d) => d >= monthStart;

  let todayCount = 0, weekCount = 0, monthCount = 0;
  let outagesMonth = 0, degradedMonth = 0;
  const serviceCountMonth = {};

  for (const issue of issues) {
    if (issue.is_archived) continue;
    const d = toUKDate(issue.created_date);
    if (!d) continue;
    if (isToday(d)) todayCount++;
    if (isThisWeek(d)) weekCount++;
    if (isThisMonth(d)) {
      monthCount++;
      if (issue.status === 'Complete Outage') outagesMonth++;
      if (issue.status === 'Degraded / Partly Not Working') degradedMonth++;
      if (issue.affected_service) {
        serviceCountMonth[issue.affected_service] = (serviceCountMonth[issue.affected_service] || 0) + 1;
      }
    }
  }

  const activeCount = issues.filter(i => !i.is_archived && i.status !== 'Resolved').length;

  const mostAffectedEntry = Object.entries(serviceCountMonth).sort((a, b) => b[1] - a[1])[0];
  const mostAffectedService = mostAffectedEntry ? `${mostAffectedEntry[0]} (${mostAffectedEntry[1]})` : 'None';

  // Recurring count
  const { trends } = computeTrends(issues);
  const repeatAlerts = trends.length;

  return { todayCount, weekCount, monthCount, activeCount, outagesMonth, degradedMonth, mostAffectedService, repeatAlerts };
}

export function computeServiceBreakdown(issues) {
  const today = getUKToday();
  const monthStart = startOfMonth(today);
  const counts = {};
  for (const issue of issues) {
    if (issue.is_archived) continue;
    const d = toUKDate(issue.created_date);
    if (!d || d < monthStart) continue;
    const svc = issue.affected_service || 'Other';
    counts[svc] = (counts[svc] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

const KEYWORDS = [
  'dbs', 'licence', 'driving', 'upload', 'payment', 'supplier',
  'portal', 'email', 'right to work', 'overseas', 'hubspot', 'stripe',
  'submission', 'verification', 'delay', 'error', 'failed'
];

function normaliseTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

function extractKeywords(text) {
  const lower = (text || '').toLowerCase();
  return KEYWORDS.filter(kw => lower.includes(kw));
}

export function computeTrends(issues) {
  const today = getUKToday();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const recent = issues.filter(i => {
    if (i.is_archived) return false;
    const d = toUKDate(i.created_date);
    return d && d >= thirtyDaysAgo;
  });

  const trends = [];
  const seen = new Set();

  // 1. Same affected_service ≥ 3 times
  const bySvc = {};
  for (const issue of recent) {
    if (!issue.affected_service) continue;
    if (!bySvc[issue.affected_service]) bySvc[issue.affected_service] = [];
    bySvc[issue.affected_service].push(issue);
  }
  for (const [svc, list] of Object.entries(bySvc)) {
    if (list.length >= 3) {
      const key = `svc:${svc}`;
      if (!seen.has(key)) {
        seen.add(key);
        const active = list.filter(i => i.status !== 'Resolved').length;
        const lastDate = list.map(i => i.created_date).sort().reverse()[0];
        trends.push({
          name: `${svc} Issues`,
          service: svc,
          count: list.length,
          active,
          lastDate,
          reason: `service`,
          suggestion: `Review ${svc} supplier/system logs. Consider adding a Known Issue note to the Knowledge Centre.`
        });
      }
    }
  }

  // 2. Same normalised title ≥ 2 times
  const byTitle = {};
  for (const issue of recent) {
    const norm = normaliseTitle(issue.title);
    if (!byTitle[norm]) byTitle[norm] = [];
    byTitle[norm].push(issue);
  }
  for (const [norm, list] of Object.entries(byTitle)) {
    if (list.length >= 2) {
      const svc = list[0].affected_service || 'Unknown';
      const key = `title:${norm}`;
      if (!seen.has(key)) {
        seen.add(key);
        const active = list.filter(i => i.status !== 'Resolved').length;
        const lastDate = list.map(i => i.created_date).sort().reverse()[0];
        trends.push({
          name: list[0].title,
          service: svc,
          count: list.length,
          active,
          lastDate,
          reason: `title`,
          suggestion: `Same issue reported ${list.length} times. Investigate root cause — a permanent fix may be needed.`
        });
      }
    }
  }

  // 3. Same keyword cluster ≥ 3 times
  const byKeyword = {};
  for (const issue of recent) {
    const kws = extractKeywords(`${issue.title} ${issue.description || ''}`);
    for (const kw of kws) {
      if (!byKeyword[kw]) byKeyword[kw] = [];
      byKeyword[kw].push(issue);
    }
  }
  for (const [kw, list] of Object.entries(byKeyword)) {
    if (list.length >= 3) {
      const key = `kw:${kw}`;
      if (!seen.has(key)) {
        // Avoid duplicate with service trend for same issues
        const svcAlreadyCovered = trends.some(t => t.service && list.every(i => i.affected_service === t.service));
        if (svcAlreadyCovered) continue;
        seen.add(key);
        const active = list.filter(i => i.status !== 'Resolved').length;
        const lastDate = list.map(i => i.created_date).sort().reverse()[0];
        const svc = list[0].affected_service || 'Multiple';
        trends.push({
          name: `Recurring "${kw}" Issues`,
          service: svc,
          count: list.length,
          active,
          lastDate,
          reason: `keyword`,
          suggestion: `Multiple issues related to "${kw}" detected. Review affected systems and consider proactive communication.`
        });
      }
    }
  }

  return { trends: trends.sort((a, b) => b.count - a.count) };
}

export function computeDailyChart(issues) {
  const today = getUKToday();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({ date: d, label: `${d.getDate()}/${d.getMonth() + 1}`, count: 0 });
  }
  for (const issue of issues) {
    if (issue.is_archived) continue;
    const d = toUKDate(issue.created_date);
    if (!d) continue;
    for (const day of days) {
      if (d.getTime() === day.date.getTime()) { day.count++; break; }
    }
  }
  return days;
}

export function applyDateFilter(issues, filter) {
  if (!filter || filter === 'all') return issues;
  const today = getUKToday();
  const now = new Date(today);

  let cutoff;
  if (filter === 'today') cutoff = today;
  else if (filter === 'week') {
    const day = today.getDay();
    cutoff = new Date(today);
    cutoff.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  } else if (filter === 'month') {
    cutoff = new Date(today.getFullYear(), today.getMonth(), 1);
  } else if (filter === 'last30') {
    cutoff = new Date(today);
    cutoff.setDate(today.getDate() - 30);
  }

  return issues.filter(i => {
    const d = new Date(i.created_date);
    return d >= cutoff;
  });
}