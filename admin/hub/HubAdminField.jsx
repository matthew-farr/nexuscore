import { useTheme } from "../../ThemeProvider";

/**
 * Reusable form field for hub admin modals.
 * Props: label, required, children
 */
export function HubAdminField({ label, required, children }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          fontWeight: 700,
          marginBottom: "5px",
          color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}{required && <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

/**
 * Reusable styled input for hub admin modals.
 */
export function HubAdminInput({ type = "text", value, onChange, placeholder, min, step, ...rest }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const style = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    background: isDark ? "rgba(255,255,255,0.07)" : "#f8fafc",
    border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.12)",
    color: isDark ? "#ffffff" : "#000000",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    colorScheme: isDark ? "dark" : "light",
  };
  if (type === "textarea") {
    return (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...style, minHeight: "72px", resize: "vertical" }}
        {...rest}
      />
    );
  }
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      step={step}
      style={style}
      {...rest}
    />
  );
}

/**
 * Reusable styled select for hub admin modals.
 */
export function HubAdminSelect({ value, onChange, options, renderLabel, ...rest }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        width: "100%",
        padding: "8px 12px",
        borderRadius: "8px",
        fontSize: "13px",
        background: isDark ? "rgba(255,255,255,0.07)" : "#f8fafc",
        border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.12)",
        color: isDark ? "#ffffff" : "#000000",
        outline: "none",
        colorScheme: isDark ? "dark" : "light",
        boxSizing: "border-box",
      }}
      {...rest}
    >
      {options.map(opt =>
        typeof opt === "string"
          ? <option key={opt} value={opt}>{renderLabel ? renderLabel(opt) : opt}</option>
          : <option key={opt.value} value={opt.value}>{opt.label}</option>
      )}
    </select>
  );
}

/**
 * Toggle checkbox row for hub admin modals.
 */
export function HubAdminToggle({ label, checked, onChange }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 500,
        color: isDark ? "rgba(255,255,255,0.78)" : "hsl(230 25% 15%)",
        userSelect: "none",
      }}
    >
      <input type="checkbox" checked={checked} onChange={onChange} style={{ cursor: "pointer", accentColor: "#ec2ca3" }} />
      {label}
    </label>
  );
}

/**
 * Section divider for modal forms.
 */
export function HubAdminDivider() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div
      style={{
        height: "1px",
        background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        margin: "4px 0",
      }}
    />
  );
}