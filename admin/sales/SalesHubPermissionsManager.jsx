import { useTheme } from "../../ThemeProvider";
import { motion } from "framer-motion";

const ACCENT = "#ec2ca3";

const PERMISSIONS = [
  { key: "view_sales_hub", label: "View Sales Hub", desc: "Access the Sales Hub" },
  { key: "access_sales_tools", label: "Access Sales Tools", desc: "Use internal calculators and builders" },
  { key: "manage_quick_links", label: "Manage Quick Links", desc: "Create and edit quick launch links" },
  { key: "manage_proposals", label: "Manage Proposals", desc: "Upload and manage proposal templates" },
  { key: "edit_dashboard", label: "Edit Dashboard Embed", desc: "Configure dashboard settings" },
  { key: "view_power_bi", label: "View Power BI Embed", desc: "Access embedded Power BI report" },
  { key: "commission_estimator", label: "Commission Estimator", desc: "Use commission calculator tool" },
];

export default function SalesHubPermissionsManager() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg" style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(236,44,163,0.12), rgba(139,92,246,0.08))"
          : "linear-gradient(135deg, rgba(236,44,163,0.08), rgba(139,92,246,0.05))",
        border: isDark ? "1px solid rgba(236,44,163,0.25)" : "1px solid rgba(236,44,163,0.20)",
      }}>
        <p style={{ fontSize: "13px", color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}>
          Configure role-based access to Sales Hub features. Users with <strong>Super Admin</strong> and <strong>Admin</strong> roles bypass these restrictions.
        </p>
      </div>

      <div className="space-y-2">
        {PERMISSIONS.map((perm, i) => (
          <motion.div
            key={perm.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="p-4 rounded-lg"
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(15,23,42,0.70), rgba(15,23,42,0.50))"
                : "linear-gradient(135deg, rgba(255,255,255,1), rgba(250,248,255,0.94))",
              border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(199,210,254,0.40)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: isDark ? "#ffffff" : "hsl(230 25% 10%)" }}>
                  {perm.label}
                </div>
                <p style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.55)", marginTop: "2px" }}>
                  {perm.desc}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {["Manager", "Staff"].map(role => (
                  <label key={role} style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", whiteSpace: "nowrap" }}>
                    <input type="checkbox" style={{ cursor: "pointer" }} />
                    {role}
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}