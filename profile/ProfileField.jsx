import { useState, useEffect } from "react";
import { useTheme } from "../ThemeProvider";
import { Pencil, Check, X } from "lucide-react";

export default function ProfileField({
  label, value, fieldKey, onSave, editable = false,
  type = "text", placeholder = "", options = null
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  // Sync draft if value changes externally (e.g. admin saves a different field)
  useEffect(() => {
    if (!editing) setDraft(value || "");
  }, [value, editing]);

  const inputStyle = {
    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.10)",
    borderRadius: "10px",
    color: isDark ? "#ffffff" : "hsl(230 25% 10%)",
    padding: "6px 10px",
    fontSize: "13px",
    width: "100%",
    outline: "none",
  };

  function handleSave() {
    if (onSave) onSave(fieldKey, draft);
    setEditing(false);
  }

  function handleCancel() {
    setDraft(value || "");
    setEditing(false);
  }

  return (
    <div className="group">
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
        style={{ color: isDark ? "rgba(180,195,220,0.50)" : "rgba(0,0,0,0.38)" }}>
        {label}
      </p>

      {editing ? (
        <div className="flex items-start gap-2">
          {type === "textarea" ? (
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={3}
              placeholder={placeholder}
              autoFocus
              style={{ ...inputStyle, resize: "vertical" }}
            />
          ) : options ? (
            <select
              value={draft}
              onChange={e => setDraft(e.target.value)}
              autoFocus
              style={{ ...inputStyle }}
            >
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={placeholder}
              autoFocus
              style={inputStyle}
            />
          )}
          <button
            onClick={handleSave}
            className="p-1.5 rounded-lg flex-shrink-0 mt-0.5"
            style={{ background: "#10b981", color: "#fff" }}>
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg flex-shrink-0 mt-0.5"
            style={{ background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)", color: isDark ? "#fff" : "#000" }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-sm flex-1 min-w-0 break-words" style={{ color: isDark ? "rgba(255,255,255,0.82)" : "hsl(230 25% 18%)" }}>
            {value
              ? value
              : <span style={{ color: isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.28)" }}>Not set</span>
            }
          </p>
          {editable && (
            <button
              onClick={() => { setDraft(value || ""); setEditing(true); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg flex-shrink-0"
              style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)" }}>
              <Pencil className="w-3 h-3" style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)" }} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}