import { base44 } from "@/api/base44Client";

/**
 * Log an activity event to the Activity entity
 * Use for user actions: viewing, creating, updating, etc.
 */
export async function logActivity({
  activity_type,
  title,
  description = "",
  entity_type,
  entity_id,
  route,
  icon,
  metadata = {},
  performed_by_name = "",
  department = "",
  visibility_roles = [],
  visibility_departments = [],
  is_system_activity = false,
}) {
  try {
    const user = await base44.auth.me();
    if (!user) return;

    await base44.entities.Activity.create({
      activity_type,
      title,
      description,
      entity_type,
      entity_id,
      route,
      icon,
      metadata,
      performed_by_user_id: user.id,
      performed_by_name: performed_by_name || user.full_name || "Unknown",
      department,
      visibility_roles,
      visibility_departments,
      is_system_activity,
    });
  } catch (error) {
    console.warn("Activity logging failed (non-blocking):", error);
    // Silently fail - activity tracking should never break functionality
  }
}

/**
 * Track a recently viewed item
 * Updates existing record if user re-visits, otherwise creates new
 */
export async function trackRecentlyViewed({
  entity_type,
  entity_id,
  title,
  route,
  icon,
}) {
  try {
    const user = await base44.auth.me();
    if (!user) return;

    // Get user profile
    const profiles = await base44.entities.UserProfile.filter({
      auth_user_id: user.id,
    });

    if (!profiles || profiles.length === 0) return;
    const userProfile = profiles[0];

    // Check if already viewed
    const existing = await base44.entities.RecentlyViewed.filter({
      user_profile_id: userProfile.id,
      entity_type,
      entity_id,
    });

    const now = new Date().toISOString();

    if (existing && existing.length > 0) {
      // Update existing
      await base44.entities.RecentlyViewed.update(existing[0].id, {
        last_viewed_date: now,
      });
    } else {
      // Create new
      await base44.entities.RecentlyViewed.create({
        user_profile_id: userProfile.id,
        entity_type,
        entity_id,
        title,
        route,
        icon,
        last_viewed_date: now,
      });
    }
  } catch (error) {
    console.warn("Recently viewed tracking failed (non-blocking):", error);
  }
}

/**
 * Get recent activities visible to current user
 * Filters by role/department permissions
 */
export async function getVisibleActivities(limit = 20) {
  try {
    const user = await base44.auth.me();
    if (!user) return [];

    // Get all activities, sorted newest first
    const activities = await base44.entities.Activity.list("-created_date", limit);

    // Filter by visibility rules
    return activities.filter((activity) => {
      // System activities visible to everyone
      if (activity.is_system_activity) return true;

      // Check role visibility
      if (activity.visibility_roles?.length > 0) {
        if (!activity.visibility_roles.includes(user.role)) return false;
      }

      // Check department visibility
      if (activity.visibility_departments?.length > 0) {
        // Would need department from user profile - skip for now
        // This is enhanced later when profile is available
      }

      return true;
    });
  } catch (error) {
    console.warn("Failed to fetch activities:", error);
    return [];
  }
}

/**
 * Get recently viewed items for current user
 */
export async function getRecentlyViewed(limit = 6) {
  try {
    const user = await base44.auth.me();
    if (!user) return [];

    // Get user profile
    const profiles = await base44.entities.UserProfile.filter({
      auth_user_id: user.id,
    });

    if (!profiles || profiles.length === 0) return [];
    const userProfile = profiles[0];

    // Get recently viewed, sorted by most recent
    const viewed = await base44.entities.RecentlyViewed.filter(
      { user_profile_id: userProfile.id },
      "-last_viewed_date",
      limit
    );

    return viewed;
  } catch (error) {
    console.warn("Failed to fetch recently viewed:", error);
    return [];
  }
}