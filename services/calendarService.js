import { base44 } from "@/api/base44Client";
import { startOfMonth, endOfMonth, startOfDay, endOfDay, isWithinInterval, parseISO } from "date-fns";

/**
 * Get all events for a given month
 * @param {Date} month - The month to fetch events for
 * @param {Object} userProfile - Current user profile for permission filtering
 * @returns {Promise<Array>} Array of CalendarEvent records
 */
export async function getEventsForMonth(month, userProfile) {
  try {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const events = await base44.entities.CalendarEvent.list();
    
    return filterEventsByAccess(
      events.filter(e => {
        const eventStart = parseISO(e.start_datetime);
        return e.is_active && isWithinInterval(eventStart, { start: monthStart, end: monthEnd });
      }),
      userProfile
    );
  } catch (error) {
    console.warn("[calendarService] getEventsForMonth failed:", error.message);
    return [];
  }
}

/**
 * Get all events for a specific date
 * @param {Date} date - The date to fetch events for
 * @param {Object} userProfile - Current user profile for permission filtering
 * @returns {Promise<Array>} Array of CalendarEvent records for that day
 */
export async function getEventsForDate(date, userProfile) {
  try {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const events = await base44.entities.CalendarEvent.list();
    
    return filterEventsByAccess(
      events.filter(e => {
        const eventStart = parseISO(e.start_datetime);
        return e.is_active && isWithinInterval(eventStart, { start: dayStart, end: dayEnd });
      }),
      userProfile
    );
  } catch (error) {
    console.warn("[calendarService] getEventsForDate failed:", error.message);
    return [];
  }
}

/**
 * Get all active events for filtering/display
 * @param {Object} userProfile - Current user profile for permission filtering
 * @returns {Promise<Array>} Array of active CalendarEvent records
 */
export async function getActiveEvents(userProfile) {
  try {
    const events = await base44.entities.CalendarEvent.list();
    return filterEventsByAccess(
      events.filter(e => e.is_active),
      userProfile
    );
  } catch (error) {
    console.warn("[calendarService] getActiveEvents failed:", error.message);
    return [];
  }
}

/**
 * Filter events by user access (role/department visibility)
 * @param {Array} events - Events to filter
 * @param {Object} userProfile - Current user profile
 * @returns {Array} Filtered events
 */
export function filterEventsByAccess(events, userProfile) {
  if (!userProfile) return [];
  
  return events.filter(event => {
    // No visibility restrictions = visible to all
    if ((!event.visibility_roles || event.visibility_roles.length === 0) &&
        (!event.visibility_departments || event.visibility_departments.length === 0)) {
      return true;
    }
    
    // Check role visibility
    if (event.visibility_roles && event.visibility_roles.length > 0) {
      if (!event.visibility_roles.includes(userProfile.role_type)) {
        return false;
      }
    }
    
    // Check department visibility
    if (event.visibility_departments && event.visibility_departments.length > 0) {
      if (!event.visibility_departments.includes(userProfile.department)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Create a calendar event
 * @param {Object} eventData - Event data
 * @returns {Promise<Object>} Created event record
 */
export async function createCalendarEvent(eventData) {
  try {
    const event = await base44.entities.CalendarEvent.create(eventData);
    return event;
  } catch (error) {
    console.warn("[calendarService] createCalendarEvent failed:", error.message);
    return null;
  }
}

/**
 * Update a calendar event
 * @param {string} eventId - Event ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated event record
 */
export async function updateCalendarEvent(eventId, updates) {
  try {
    const event = await base44.entities.CalendarEvent.update(eventId, updates);
    return event;
  } catch (error) {
    console.warn("[calendarService] updateCalendarEvent failed:", error.message);
    return null;
  }
}

/**
 * Archive a calendar event (soft delete via is_active)
 * @param {string} eventId - Event ID
 * @returns {Promise<boolean>} True if archived
 */
export async function archiveCalendarEvent(eventId) {
  try {
    await base44.entities.CalendarEvent.update(eventId, { is_active: false });
    return true;
  } catch (error) {
    console.warn("[calendarService] archiveCalendarEvent failed:", error.message);
    return false;
  }
}

/**
 * Delete a calendar event permanently
 * @param {string} eventId - Event ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteCalendarEvent(eventId) {
  try {
    await base44.entities.CalendarEvent.delete(eventId);
    return true;
  } catch (error) {
    console.warn("[calendarService] deleteCalendarEvent failed:", error.message);
    return false;
  }
}