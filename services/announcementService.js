import { base44 } from "@/api/base44Client";
import { parseISO, isBefore, isAfter } from "date-fns";

/**
 * Get published announcements visible to user
 * @param {Object} userProfile - Current user profile
 * @returns {Promise<Array>} Array of visible announcements
 */
export async function getPublishedAnnouncements(userProfile) {
  try {
    const announcements = await base44.entities.Announcement.list();
    const now = new Date();

    return filterAnnouncementsByAccess(
      announcements.filter(a => {
        // Must be active
        if (!a.is_active) return false;

        // Must be published
        if (a.status !== "published") return false;

        // Check publish datetime (scheduled)
        if (a.publish_datetime) {
          const publishDate = parseISO(a.publish_datetime);
          if (isAfter(publishDate, now)) return false;
        }

        // Check expiry datetime
        if (a.expiry_datetime) {
          const expiryDate = parseISO(a.expiry_datetime);
          if (isBefore(now, expiryDate) === false) return false;
        }

        return true;
      }),
      userProfile
    );
  } catch (error) {
    console.warn("[announcementService] getPublishedAnnouncements failed:", error.message);
    return [];
  }
}

/**
 * Get all announcements (admin view)
 * @returns {Promise<Array>} All announcements
 */
export async function getAllAnnouncements() {
  try {
    return await base44.entities.Announcement.list();
  } catch (error) {
    console.warn("[announcementService] getAllAnnouncements failed:", error.message);
    return [];
  }
}

/**
 * Get announcement by ID
 * @param {string} id - Announcement ID
 * @returns {Promise<Object|null>} Announcement record or null
 */
export async function getAnnouncementById(id) {
  try {
    const announcements = await base44.entities.Announcement.list();
    return announcements.find(a => a.id === id) || null;
  } catch (error) {
    console.warn("[announcementService] getAnnouncementById failed:", error.message);
    return null;
  }
}

/**
 * Filter announcements by user access (role/department visibility)
 * @param {Array} announcements - Announcements to filter
 * @param {Object} userProfile - Current user profile
 * @returns {Array} Filtered announcements
 */
export function filterAnnouncementsByAccess(announcements, userProfile) {
  if (!userProfile) return [];

  return announcements.filter(announcement => {
    // No visibility restrictions = visible to all
    if ((!announcement.visibility_roles || announcement.visibility_roles.length === 0) &&
        (!announcement.visibility_departments || announcement.visibility_departments.length === 0)) {
      return true;
    }

    // Check role visibility
    if (announcement.visibility_roles && announcement.visibility_roles.length > 0) {
      if (!announcement.visibility_roles.includes(userProfile.role_type)) {
        return false;
      }
    }

    // Check department visibility
    if (announcement.visibility_departments && announcement.visibility_departments.length > 0) {
      if (!announcement.visibility_departments.includes(userProfile.department)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Create announcement
 * @param {Object} announcementData - Announcement data
 * @returns {Promise<Object>} Created announcement
 */
export async function createAnnouncement(announcementData) {
  try {
    return await base44.entities.Announcement.create(announcementData);
  } catch (error) {
    console.warn("[announcementService] createAnnouncement failed:", error.message);
    return null;
  }
}

/**
 * Update announcement
 * @param {string} id - Announcement ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated announcement
 */
export async function updateAnnouncement(id, updates) {
  try {
    return await base44.entities.Announcement.update(id, updates);
  } catch (error) {
    console.warn("[announcementService] updateAnnouncement failed:", error.message);
    return null;
  }
}

/**
 * Archive announcement (soft delete)
 * @param {string} id - Announcement ID
 * @returns {Promise<boolean>} True if archived
 */
export async function archiveAnnouncement(id) {
  try {
    await base44.entities.Announcement.update(id, { is_active: false });
    return true;
  } catch (error) {
    console.warn("[announcementService] archiveAnnouncement failed:", error.message);
    return false;
  }
}

/**
 * Check if user has acknowledged announcement
 * @param {string} announcementId - Announcement ID
 * @param {string} userProfileId - User profile ID
 * @returns {Promise<boolean>} True if acknowledged
 */
export async function hasUserAcknowledged(announcementId, userProfileId) {
  try {
    const acknowledgements = await base44.entities.AnnouncementAcknowledgement.list();
    return acknowledgements.some(
      a => a.announcement_id === announcementId && a.user_profile_id === userProfileId
    );
  } catch (error) {
    console.warn("[announcementService] hasUserAcknowledged failed:", error.message);
    return false;
  }
}

/**
 * Create acknowledgement
 * @param {string} announcementId - Announcement ID
 * @param {string} userProfileId - User profile ID
 * @returns {Promise<Object>} Created acknowledgement
 */
export async function acknowledgeAnnouncement(announcementId, userProfileId) {
  try {
    return await base44.entities.AnnouncementAcknowledgement.create({
      announcement_id: announcementId,
      user_profile_id: userProfileId,
      acknowledged_at: new Date().toISOString(),
      acknowledgement_required: true,
    });
  } catch (error) {
    console.warn("[announcementService] acknowledgeAnnouncement failed:", error.message);
    return null;
  }
}