import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useTheme } from "../../ThemeProvider";

const ACCENT = "#ec2ca3";

/**
 * Reusable modal shell for hub admin managers.
 * Props:
 *   - open (bool)
 *   - onClose ()
 *   - title (string)
 *   - onSubmit (e) – called on form submit
 *   - submitLabel (string, default "Save")
 *   - children
 *   - width (string, default "500px")
 */
export default function HubAdminModal({
  open,
  onClose,
  title,
  onSubmit,
  submitLabel = "Save",
  children,
  width = "500px",
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <AnimatePresence>
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18 }}
            style={{
              background: isDark
                ? "linear-gradient(135deg, #0a0e1a 0%, #080c18 100%)"
                : "#ffffff",
              border: isDark
                ? "1px solid rgba(255,255,255,0.10)"
                : "1px solid rgba(0,0,0,0.10)",
              borderRadius: "14px",
              padding: "24px",
              width: "100%",
              maxWidth: width,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: isDark ? "#ffffff" : "hsl(230 25% 10%)",
                  margin: 0,
                }}
              >
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={e => { e.preventDefault(); onSubmit && onSubmit(e); }}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {children}

              {/* Footer */}
              <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: isDark
                      ? "1px solid rgba(255,255,255,0.12)"
                      : "1px solid rgba(0,0,0,0.12)",
                    background: "transparent",
                    color: isDark ? "rgba(255,255,255,0.70)" : "hsl(230 25% 15%)",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)`,
                    color: "#ffffff",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 700,
                    border: "none",
                    boxShadow: `0 4px 14px ${ACCENT}40`,
                  }}
                >
                  {submitLabel}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}