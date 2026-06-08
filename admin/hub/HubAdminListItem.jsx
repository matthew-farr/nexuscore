import { Eye, EyeOff, Edit2, Trash2 } from "lucide-react";
import { useTheme } from "../../ThemeProvider";

const ACCENT = "#ec2ca3";

/**
 * Reusable list item for any hub admin manager.
 * Props:
 *   - title, subtitle, badge, badgeColour
 *   - isActive
 *   - onToggle(e)
 *   - onEdit(e)
 *   - onDelete(e)
 *   - leftSlot – any node rendered left of title (icon swatch, emoji, etc.)
 *   - rightExtra – extra buttons rendered before the standard action set
 */
export default function HubAdminListItem({
  title,
  subtitle,
  badge,
  badgeColour,
  isActive = true,
  onToggle,
  onEdit,
  onDelete,
  leftSlot,
  rightExtra,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const btnBase = {
    width: "30px",
    height: "30px",
    borderRadius: "6px",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
    flexShrink: 0,
  };

  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: isDark
          ? "linear-gradient(135deg, rgba(15,23,42,0.70), rgba(15,23,42,0.50))"
          : "linear-gradient(135deg, rgba(255,255,255,1), rgba(250,248,255,0.94))",
        border: isDark
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(199,210,254,0.40)",
        opacity: isActive ? 1 : 0.52,
        transition: "opacity 0.2s",
      }}
    >
      {leftSlot && <div style={{ flexShrink: 0 }}>{leftSlot}</div>}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: isDark ? "#ffffff" : "hsl(230 25% 10%)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </span>
          {badge && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: "99px",
                background: `${badgeColour || ACCENT}22`,
                color: badgeColour || ACCENT,
                border: `1px solid ${badgeColour || ACCENT}40`,
                whiteSpace: "nowrap",
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: "11px",
              color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.45)",
              marginTop: "2px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
        {rightExtra}

        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            title={isActive ? "Hide" : "Show"}
            style={{
              ...btnBase,
              color: isActive ? ACCENT : (isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)"),
            }}
          >
            {isActive
              ? <Eye style={{ width: "14px", height: "14px" }} />
              : <EyeOff style={{ width: "14px", height: "14px" }} />
            }
          </button>
        )}

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            title="Edit"
            style={{
              ...btnBase,
              color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
            }}
            onMouseEnter={e => e.currentTarget.style.color = ACCENT}
            onMouseLeave={e => e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)"}
          >
            <Edit2 style={{ width: "14px", height: "14px" }} />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            title="Delete"
            style={{
              ...btnBase,
              color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
            onMouseLeave={e => e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)"}
          >
            <Trash2 style={{ width: "14px", height: "14px" }} />
          </button>
        )}
      </div>
    </div>
  );
}