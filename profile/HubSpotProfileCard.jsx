import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";
import { Building2, User, Mail, Hash, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function HubSpotProfileCard({ profile: initialProfile, delay = 0 }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [profile, setProfile] = useState(initialProfile);

  // Re-fetch the profile from the backend so auto-linked data shows immediately
  // even if the parent hasn't refreshed yet
  useEffect(() => {
    let cancelled = false;
    if (initialProfile?.hubspot_owner_id) {
      // Already has data from parent — no need to re-fetch
      setProfile(initialProfile);
      return;
    }
    // Fetch fresh so we catch any auto-backfill that happened during a recent action
    base44.functions.invoke("getOrCreateProfile", {}).then(res => {
      if (!cancelled && res.data?.profile) {
        setProfile(res.data.profile);
      }
    });
    return () => { cancelled = true; };
  }, [initialProfile?.hubspot_owner_id]);

  const hasOwner = !!profile?.hubspot_owner_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)"
          : "linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(240,253,250,0.88) 100%)",
        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
        backdropFilter: "blur(20px)",
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.90)",
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: isDark ? "linear-gradient(to right, transparent, rgba(255,255,255,0.13), transparent)" : "linear-gradient(to right, transparent, rgba(255,255,255,0.90), transparent)" }} />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,122,0,0.15)", border: "1px solid rgba(255,122,0,0.25)" }}>
          <Building2 className="w-3.5 h-3.5" style={{ color: "#ff7a00" }} />
        </div>
        <h2 className="text-sm font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 12%)" }}>
          HubSpot Integration
        </h2>
      </div>

      {/* Status badge */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mb-4 text-xs font-semibold ${
        hasOwner
          ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
          : "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
      }`}>
        {hasOwner
          ? <><CheckCircle className="w-3.5 h-3.5" /> Linked to HubSpot</>
          : <><AlertCircle className="w-3.5 h-3.5" /> Not linked — contact admin</>
        }
      </div>

      {/* Fields */}
      <div className="space-y-3">
        {[
          { icon: Hash,  label: "Owner ID",    value: profile?.hubspot_owner_id    || "—" },
          { icon: User,  label: "Owner Name",  value: profile?.hubspot_owner_name  || "—" },
          { icon: Mail,  label: "Owner Email", value: profile?.hubspot_owner_email || "—" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Icon className="w-3.5 h-3.5" style={{ color: "#ff7a00" }} />
              <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.60)" : "rgba(0,0,0,0.55)" }}>
                {label}
              </span>
            </div>
            <span className="text-xs font-semibold text-right break-all" style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[10px] mt-4 text-center" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.30)" }}>
        Managed by admin · Read-only
      </p>
    </motion.div>
  );
}