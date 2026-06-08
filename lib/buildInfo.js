// ─── MANUAL: bump BUILD_R each time you publish within the same week ──────────
const BUILD_R = 1;
// ─────────────────────────────────────────────────────────────────────────────

const now = new Date();

const getISOWeek = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const year = now.getFullYear();
const week = String(getISOWeek(now)).padStart(2, "0");

export const BUILD_VERSION = `${year}-${week}-R${BUILD_R}`;

export const BUILD_TIMESTAMP = now.toLocaleString("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/London",
});