// Checks Direct Financial Year Roadmap Quarter Configuration

export const ROADMAP_QUARTERS = [
  {
    key: "Q4-2526",
    label: "Q4 25/26",
    dateRange: "May 2026 – July 2026",
    sortIndex: 0,
  },
  {
    key: "Q1-2627",
    label: "Q1 26/27",
    dateRange: "August 2026 – October 2026",
    sortIndex: 1,
  },
  {
    key: "Q2-2627",
    label: "Q2 26/27",
    dateRange: "November 2026 – January 2027",
    sortIndex: 2,
  },
  {
    key: "Q3-2627",
    label: "Q3 26/27",
    dateRange: "February 2027 – April 2027",
    sortIndex: 3,
  },
  {
    key: "Q4-2627",
    label: "Q4 26/27",
    dateRange: "May 2027 – July 2027",
    sortIndex: 4,
  },
  {
    key: "Future Considerations",
    label: "Future Considerations",
    dateRange: null,
    sortIndex: 5,
  },
];

// Current quarter as of June 2026 = Q4 25/26
export const CURRENT_QUARTER_KEY = "Q4-2526";

export const QUARTER_OPTIONS = ROADMAP_QUARTERS.map(q => ({
  value: q.key,
  label: q.dateRange ? `${q.label} (${q.dateRange})` : q.label,
}));

export const STATUS_CONFIG = {
  "Planned":         { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.30)" },
  "In Progress":     { color: "#06b6d4", bg: "rgba(6,182,212,0.12)",  border: "rgba(6,182,212,0.30)" },
  "Completed":       { color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.30)" },
  "Delayed":         { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.30)" },
  "Not Progressing": { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.30)" },
};

export const STATUSES = ["Planned", "In Progress", "Completed", "Delayed", "Not Progressing"];
export const ROADMAP_TYPES = ["Web Development", "Internal"];