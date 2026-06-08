import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import PageContainer from "../components/ui-custom/PageContainer";
import { useTheme } from "../components/ThemeProvider";
import ProfileHeroCard from "../components/profile/ProfileHeroCard";
import ProfileSection from "../components/profile/ProfileSection";
import ProfileField from "../components/profile/ProfileField";
import ProfileIdPanel from "../components/profile/ProfileIdPanel";
import {
  Search, Users, UserCircle2, Loader2, ShieldCheck,
  CheckCircle, XCircle, Clock, User, Briefcase, ToggleLeft, ToggleRight
} from "lucide-react";

const STATUS_COLORS = { Active: "#10b981", Inactive: "#ef4444", "On Leave": "#f59e0b" };
const STATUS_ICONS = { Active: CheckCircle, Inactive: XCircle, "On Leave": Clock };
const EMPLOYMENT_OPTIONS = ["Active", "Inactive", "On Leave"];
const ONBOARDING_OPTIONS = ["Not Started", "In Progress", "Complete"];

export default function AdminProfiles() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      setAuthUser(user);
      if (user?.role !== "admin") { setLoading(false); return; }

      // Use secure backend function — not direct entity access
      const res = await base44.functions.invoke("adminListProfiles", {});
      if (res.data?.profiles) {
        setProfiles(res.data.profiles);
      } else {
        setError("Could not load profiles.");
      }
      setLoading(false);
    })();
  }, []);

  async function handleFieldSave(fieldKey, value) {
    if (!selected || saving) return;
    setSaving(true);
    const res = await base44.functions.invoke("updateMyProfile", {
      updates: { [fieldKey]: value },
      targetUserId: selected.auth_user_id,
    });
    if (res.data?.profile) {
      const updated = res.data.profile;
      setSelected(updated);
      setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
    }
    setSaving(false);
  }

  async function handleToggleStatus(profile) {
    const newStatus = profile.employment_status === "Active" ? "Inactive" : "Active";
    await handleFieldSave("employment_status", newStatus);
  }

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.first_name?.toLowerCase().includes(q) ||
      p.last_name?.toLowerCase().includes(q) ||
      p.display_name?.toLowerCase().includes(q) ||
      p.staff_code?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.department?.toLowerCase().includes(q) ||
      p.job_title?.toLowerCase().includes(q)
    );
  });

  const cardStyle = {
    background: isDark
      ? "linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)"
      : "linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(248,246,255,0.88) 100%)",
    border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
    backdropFilter: "blur(20px)",
    boxShadow: isDark
      ? "0 4px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)"
      : "0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.90)",
  };

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#ec2ca3" }} />
          <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
            Loading profiles…
          </p>
        </div>
      </PageContainer>
    );
  }

  if (authUser?.role !== "admin") {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <ShieldCheck className="w-10 h-10 mx-auto mb-3" style={{ color: "#ef4444" }} />
          <p className="font-semibold mb-1" style={{ color: isDark ? "#fff" : "#000" }}>Admin access required</p>
          <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
            This page is restricted to Admin users only.
          </p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <XCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "#ef4444" }} />
          <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.60)" : "rgba(0,0,0,0.60)" }}>{error}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold" style={{ color: isDark ? "#ffffff" : "hsl(230 25% 10%)" }}>
            User Profiles
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(236,44,163,0.15)", color: "#ec2ca3", border: "1px solid rgba(236,44,163,0.25)" }}>
            Admin View
          </span>
        </div>
        <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.50)" }}>
          {profiles.length} registered profile{profiles.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-4">
        {/* Left: list */}
        <div className="w-full xl:w-[320px] flex-shrink-0 space-y-3">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={cardStyle}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.35)" }} />
            <input
              type="text"
              placeholder="Search name, code, email, dept…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-xs focus:outline-none"
              style={{ color: isDark ? "rgba(255,255,255,0.85)" : "hsl(230 25% 15%)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.35)" }}>✕</button>
            )}
          </div>

          {/* Counts */}
          {search && (
            <p className="text-[11px] px-1" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>
              {filtered.length} of {profiles.length} profiles
            </p>
          )}

          {/* Profile list */}
          <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-0.5">
            {filtered.map((p, i) => {
              const StatusIcon = STATUS_ICONS[p.employment_status] || CheckCircle;
              const isActive = selected?.id === p.id;
              const displayName = p.display_name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.email || "Unknown";
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
                  onClick={() => setSelected(p)}
                  className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-150"
                  style={{
                    background: isActive
                      ? isDark ? "rgba(236,44,163,0.15)" : "rgba(236,44,163,0.07)"
                      : isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.80)",
                    border: isActive
                      ? "1px solid rgba(236,44,163,0.30)"
                      : isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #ec2ca3, #7c3aed)" }}>
                    {p.profile_photo_url
                      ? <img src={p.profile_photo_url} alt="" className="w-full h-full object-cover" />
                      : <UserCircle2 className="w-5 h-5 text-white/80" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 12%)" }}>
                      {displayName}
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: "#ec2ca3" }}>{p.staff_code}</p>
                    <p className="text-[11px] truncate" style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}>
                      {p.job_title || p.department || p.email || "—"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusIcon className="w-3.5 h-3.5" style={{ color: STATUS_COLORS[p.employment_status] || "#10b981" }} />
                    <span className="text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)" }}>
                      {p.profile_completion_percentage ?? 0}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: isDark ? "#fff" : "#000" }} />
                <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)" }}>
                  No profiles found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: detail view */}
        <div className="flex-1 min-w-0">
          {selected ? (
            <div className="space-y-4">
              {/* Hero with deactivate/reactivate button */}
              <div className="relative">
                <ProfileHeroCard profile={selected} isOwnProfile={false} />
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => handleToggleStatus(selected)}
                    disabled={saving}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                    style={{
                      background: selected.employment_status === "Active"
                        ? "rgba(239,68,68,0.15)"
                        : "rgba(16,185,129,0.15)",
                      color: selected.employment_status === "Active" ? "#ef4444" : "#10b981",
                      border: `1px solid ${selected.employment_status === "Active" ? "rgba(239,68,68,0.30)" : "rgba(16,185,129,0.30)"}`,
                      opacity: saving ? 0.5 : 1,
                    }}
                  >
                    {selected.employment_status === "Active"
                      ? <><ToggleRight className="w-3.5 h-3.5" />Deactivate</>
                      : <><ToggleLeft className="w-3.5 h-3.5" />Reactivate</>
                    }
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Personal Details */}
                <ProfileSection title="Personal Details" icon={User} accentColor="#ec2ca3">
                  <div className="space-y-3">
                    <ProfileField label="First Name" fieldKey="first_name" value={selected.first_name} editable onSave={handleFieldSave} />
                    <ProfileField label="Last Name" fieldKey="last_name" value={selected.last_name} editable onSave={handleFieldSave} />
                    <ProfileField label="Preferred Name" fieldKey="preferred_name" value={selected.preferred_name} editable onSave={handleFieldSave} />
                    <ProfileField label="Email" fieldKey="email" value={selected.email} editable={false} />
                    <ProfileField label="Phone" fieldKey="phone_number" value={selected.phone_number} editable onSave={handleFieldSave} type="tel" />
                    <ProfileField label="Location" fieldKey="location" value={selected.location} editable onSave={handleFieldSave} />
                  </div>
                </ProfileSection>

                {/* Work Details */}
                <ProfileSection title="Work Details" icon={Briefcase} accentColor="#0ea5e9">
                  <div className="space-y-3">
                    <ProfileField label="Job Title" fieldKey="job_title" value={selected.job_title} editable onSave={handleFieldSave} />
                    <ProfileField label="Department" fieldKey="department" value={selected.department} editable onSave={handleFieldSave} />
                    <ProfileField label="Manager" fieldKey="manager_name" value={selected.manager_name} editable onSave={handleFieldSave} />
                    <ProfileField label="Start Date" fieldKey="start_date" value={selected.start_date} editable onSave={handleFieldSave} type="date" />
                    <ProfileField label="Employment Status" fieldKey="employment_status" value={selected.employment_status} editable onSave={handleFieldSave}
                      options={EMPLOYMENT_OPTIONS} />
                    <ProfileField label="Onboarding Status" fieldKey="onboarding_status" value={selected.onboarding_status} editable onSave={handleFieldSave}
                      options={ONBOARDING_OPTIONS} />
                  </div>
                </ProfileSection>
              </div>

              {/* Admin Section */}
              <ProfileSection title="Admin Controls" icon={ShieldCheck} accentColor="#a855f7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ProfileField label="Role Type" fieldKey="role_type" value={selected.role_type} editable onSave={handleFieldSave}
                    options={["Staff", "Admin"]} />
                  <ProfileField label="Permissions Group" fieldKey="permissions_group" value={selected.permissions_group} editable onSave={handleFieldSave} />
                  <ProfileField label="Admin Notes" fieldKey="admin_notes" value={selected.admin_notes} editable onSave={handleFieldSave} type="textarea" />
                  <ProfileField label="Security Notes" fieldKey="security_notes" value={selected.security_notes} editable onSave={handleFieldSave} type="textarea" />
                </div>

                {/* Permission toggles */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { key: "can_manage_content", label: "Manage Content" },
                    { key: "can_manage_lms", label: "Manage LMS" },
                    { key: "can_manage_users", label: "Manage Users" },
                    { key: "can_publish_content", label: "Publish Content" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => handleFieldSave(key, !selected[key])}
                      disabled={saving}
                      className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: selected[key]
                          ? isDark ? "rgba(168,85,247,0.18)" : "rgba(168,85,247,0.10)"
                          : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                        border: `1px solid ${selected[key] ? "rgba(168,85,247,0.35)" : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                        color: selected[key] ? "#a855f7" : isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
                        opacity: saving ? 0.5 : 1,
                      }}
                    >
                      {selected[key]
                        ? <ToggleRight className="w-3.5 h-3.5" />
                        : <ToggleLeft className="w-3.5 h-3.5" />
                      }
                      {label}
                    </button>
                  ))}
                </div>
              </ProfileSection>

              <ProfileIdPanel profile={selected} delay={0} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 rounded-2xl" style={cardStyle}>
              <div className="text-center">
                <UserCircle2 className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: isDark ? "#fff" : "#000" }} />
                <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>
                  Select a profile from the list to view or edit
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}