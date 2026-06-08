/**
 * Global Hub Theme Token System for Checks Direct OS
 *
 * Provides a consistent token-based approach to colours across all hubs.
 * All widgets, cards, borders, glows and accents should use these tokens.
 *
 * Usage:
 *   import { buildHubTheme } from "@/lib/hubTheme";
 *   const theme = buildHubTheme(accentColour, isDark);
 *   // then: style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
 */

/**
 * Build a full hub theme token set from a single accent colour.
 * @param {string} accent  - hex colour e.g. "#ec2ca3"
 * @param {boolean} isDark - current dark-mode state
 * @returns {object} theme tokens
 */
export function buildHubTheme(accent = "#ec2ca3", isDark = false) {
  return {
    // Core accent
    primary: accent,

    // Backgrounds
    surface: isDark ? `${accent}12` : `${accent}08`,
    surfaceHover: isDark ? `${accent}20` : `${accent}14`,
    card: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.95)",
    cardHover: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.95)",

    // Borders
    border: isDark ? `${accent}28` : `${accent}22`,
    borderStrong: isDark ? `${accent}45` : `${accent}38`,
    borderSubtle: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",

    // Glows
    glow: `0 0 20px ${accent}25, 0 4px 16px rgba(0,0,0,0.12)`,
    glowStrong: `0 0 40px ${accent}35, 0 8px 32px rgba(0,0,0,0.20)`,

    // Gradients
    gradient: `linear-gradient(135deg, ${accent}20, ${accent}08)`,
    gradientStrong: `linear-gradient(135deg, ${accent}35, ${accent}15)`,
    gradientText: `linear-gradient(135deg, ${accent}, ${accent}bb)`,

    // Icon backgrounds
    iconBg: isDark ? `${accent}20` : `${accent}15`,
    iconBorder: `${accent}35`,

    // Text
    text: isDark ? "#ffffff" : "#0f172a",
    textMuted: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.50)",
    textSubtle: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)",
    accentText: accent,

    // Badge
    badge: isDark ? `${accent}22` : `${accent}15`,
    badgeText: accent,
    badgeBorder: `${accent}30`,

    // Button
    buttonBg: accent,
    buttonText: "#ffffff",
    buttonHover: isDark ? `${accent}ee` : `${accent}cc`,

    // Status colours (fixed, not accent-based)
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#0ea5e9",

    // Spinner
    spinnerBorder: `${accent}30`,
    spinnerTop: accent,
  };
}

/**
 * Map a colour_theme string to a hex colour.
 */
export const COLOUR_MAP = {
  cyan: "#06b6d4",
  purple: "#8b5cf6",
  pink: "#ec2ca3",
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  blue: "#0ea5e9",
};

export function resolveColour(colourTheme, fallback = "#06b6d4") {
  return COLOUR_MAP[colourTheme] || fallback;
}