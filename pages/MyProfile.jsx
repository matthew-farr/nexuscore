import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import PageContainer from "../components/ui-custom/PageContainer";
import ProfileHeroCard from "../components/profile/ProfileHeroCard";
import ProfileSection from "../components/profile/ProfileSection";
import ProfileField from "../components/profile/ProfileField";
import ProfileIdPanel from "../components/profile/ProfileIdPanel";
import SkillsMatrixSection from "../components/profile/SkillsMatrixSection";
import HubSpotProfileCard from "../components/profile/HubSpotProfileCard";
import { useTheme } from "../components/ThemeProvider";
import {
  User, Briefcase, Heart, GraduationCap, Loader2, AlertCircle,
  BookOpen, Award, CheckCircle, ClipboardList
} from "lucide-react";

export default function MyProfile() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    const res = await base44.functions.invoke("getOrCreateProfile", {});
    if (res.data?.profile) {
      setProfile(res.data.profile);
    } else {
      setError("Could not load your profile.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  async function handleFieldSave(fieldKey, value) {
    const res = await base44.functions.invoke("updateMyProfile", { updates: { [fieldKey]: value } });
    if (res.data?.profile) setProfile(res.data.profile);
  }

  async function handlePhotoUpload(url) {
    const res = await base44.functions.invoke("updateMyProfile", { updates: { profile_photo_url: url } });
    if (res.data?.profile) setProfile(res.data.profile);
  }

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#ec2ca3" }} />
          <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
            Loading your profile…
          </p>
        </div>
      </PageContainer>
    );
  }

  if (error || !profile) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "#ef4444" }} />
          <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.60)" : "rgba(0,0,0,0.60)" }}>
            {error || "Profile not found."}
          </p>
        </div>
      </PageContainer>
    );
  }

  const isAdmin = profile.role_type === "Admin";
  const canEdit = true; // Own profile — always editable for allowed fields

  return (
    <PageContainer>
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Main Column */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Hero */}
          <ProfileHeroCard profile={profile} onPhotoUpload={handlePhotoUpload} isOwnProfile={true} />

          {/* Personal Details */}
          <ProfileSection title="Personal Details" icon={User} accentColor="#ec2ca3" delay={0.08}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileField label="First Name" fieldKey="first_name" value={profile.first_name} editable={isAdmin} onSave={handleFieldSave} />
              <ProfileField label="Last Name" fieldKey="last_name" value={profile.last_name} editable={isAdmin} onSave={handleFieldSave} />
              <ProfileField label="Preferred Name" fieldKey="preferred_name" value={profile.preferred_name} editable={canEdit} onSave={handleFieldSave} placeholder="e.g. Matt" />
              <ProfileField label="Email" fieldKey="email" value={profile.email} editable={false} />
              <ProfileField label="Phone" fieldKey="phone_number" value={profile.phone_number} editable={canEdit} onSave={handleFieldSave} type="tel" />
              <ProfileField label="Work Mobile" fieldKey="work_mobile" value={profile.work_mobile} editable={canEdit} onSave={handleFieldSave} type="tel" />
              <ProfileField label="Location / Office" fieldKey="location" value={profile.location} editable={canEdit} onSave={handleFieldSave} />
              <ProfileField label="Date of Birth" fieldKey="date_of_birth" value={profile.date_of_birth} editable={canEdit} onSave={handleFieldSave} type="date" />
            </div>
          </ProfileSection>

          {/* Work Details */}
          <ProfileSection title="Work Details" icon={Briefcase} accentColor="#0ea5e9" delay={0.12}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileField label="Job Title" fieldKey="job_title" value={profile.job_title} editable={isAdmin} onSave={handleFieldSave} />
              <ProfileField label="Department" fieldKey="department" value={profile.department} editable={isAdmin} onSave={handleFieldSave} />
              <ProfileField label="Manager" fieldKey="manager_name" value={profile.manager_name} editable={isAdmin} onSave={handleFieldSave} />
              <ProfileField label="Employment Status" fieldKey="employment_status" value={profile.employment_status} editable={false} />
              <ProfileField label="Start Date" fieldKey="start_date" value={profile.start_date} editable={isAdmin} onSave={handleFieldSave} type="date" />
              <ProfileField label="Work Anniversary" fieldKey="work_anniversary_date" value={profile.work_anniversary_date} editable={false} />
              <ProfileField label="Role Type" fieldKey="role_type" value={profile.role_type} editable={false} />
              <ProfileField label="Onboarding Status" fieldKey="onboarding_status" value={profile.onboarding_status} editable={isAdmin} onSave={handleFieldSave} />
            </div>
          </ProfileSection>

          {/* About Me */}
          <ProfileSection title="About Me" icon={Heart} accentColor="#a855f7" delay={0.16}>
            <div className="space-y-4">
              <ProfileField label="Bio" fieldKey="bio" value={profile.bio} editable={canEdit} onSave={handleFieldSave} type="textarea" placeholder="Tell the team a bit about yourself…" />
              <ProfileField label="Skills" fieldKey="skills" value={profile.skills} editable={canEdit} onSave={handleFieldSave} placeholder="e.g. Excel, HubSpot, Project Management" />
              <ProfileField label="Interests" fieldKey="interests" value={profile.interests} editable={canEdit} onSave={handleFieldSave} placeholder="e.g. Cycling, Photography, Travel" />
            </div>
          </ProfileSection>

          {/* Skills Matrix */}
          <SkillsMatrixSection userId={profile.user_id} />
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-[280px] flex-shrink-0 space-y-4">
          {/* Permanent ID Panel */}
          <ProfileIdPanel profile={profile} delay={0.06} />

          {/* HubSpot Integration */}
          <HubSpotProfileCard profile={profile} delay={0.08} onRefresh={loadProfile} />

          {/* Learning Snapshot Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.10 }}
            className="relative rounded-2xl p-5 overflow-hidden"
            style={{
              background: isDark
                ? "linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)"
                : "linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(248,246,255,0.88) 100%)",
              border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
              backdropFilter: "blur(20px)",
              boxShadow: isDark
                ? "0 4px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)"
                : "0 2px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.90)",
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: isDark ? "linear-gradient(to right, transparent, rgba(255,255,255,0.13), transparent)" : "linear-gradient(to right, transparent, rgba(255,255,255,0.90), transparent)" }} />

            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(245,158,11,0.20)", border: "1px solid rgba(245,158,11,0.30)" }}>
                <GraduationCap className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
              </div>
              <h2 className="text-sm font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.90)" : "hsl(230 25% 12%)" }}>
                Learning Snapshot
              </h2>
            </div>

            <div className="space-y-3">
              {[
                { icon: BookOpen, label: "Courses Assigned", value: "—", color: "#0ea5e9" },
                { icon: CheckCircle, label: "Courses Completed", value: "—", color: "#10b981" },
                { icon: Award, label: "Certificates Earned", value: "—", color: "#f59e0b" },
                { icon: ClipboardList, label: "Onboarding Status", value: profile.onboarding_status, color: "#a855f7" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                    <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.60)" : "rgba(0,0,0,0.55)" }}>
                      {label}
                    </span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.80)" : "hsl(230 25% 15%)" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[10px] mt-4 text-center" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.30)" }}>
              LMS integration coming soon
            </p>
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
}