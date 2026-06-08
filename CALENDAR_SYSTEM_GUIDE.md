# Calendar & Event System — Implementation Guide

**Status:** ✅ LIVE & OPERATIONAL  
**Date:** 27 May 2026

---

## What Was Built

### 1. CalendarEvent Entity
Complete event data model with:
- **Core fields:** title, description, start_datetime, end_datetime, all_day
- **Event types:** company_event, training, meeting, birthday, anniversary, deadline, announcement, compliance, system
- **Visibility control:** visibility_roles, visibility_departments (empty = visible to all)
- **Context linking:** related_entity_type, related_entity_id, route
- **Customization:** colour, icon, metadata JSON blob
- **Recurrence:** is_recurring, recurrence_rule (RFC 5545 format)
- **Reminders:** reminder_minutes (0 = no reminder)

### 2. Calendar Service (`services/calendarService.js`)
Reusable helper functions (all error-safe):
- `getEventsForMonth(month, userProfile)` — fetch month's events
- `getEventsForDate(date, userProfile)` — fetch specific day's events
- `getActiveEvents(userProfile)` — fetch all active events
- `filterEventsByAccess(events, userProfile)` — permission-aware filtering
- `createCalendarEvent(eventData)` — create event (returns null on fail)
- `updateCalendarEvent(eventId, updates)` — update event
- `deleteCalendarEvent(eventId)` — delete event

**All functions silently fail** — never crash pages, return safe defaults ([], null, false).

### 3. Event Type Configuration (`lib/eventTypeConfig.js`)
Centralized icon/colour mapping for 9 event types:
- company_event → cyan + Building2
- training → amber + BookOpen
- meeting → purple + Users
- birthday → pink + Cake
- anniversary → green + Gift
- deadline → red + Clock
- announcement → cyan + Bell
- compliance → purple + ShieldAlert
- system → gray + Cog

Used consistently across calendar, widgets, modals, activity feed.

### 4. Home Calendar Widget (Upgraded)
Replaced static calendar with live `CalendarEvent` data:
- **Month navigation** — prev/next buttons load new month's events
- **Event indicators** — colored dots under dates with events (max 2 shown, "+N" if more)
- **Date selection** — click date to view day's events
- **Event list** — shows up to 4 events for selected date with type badges
- **Loading state** — spinner while fetching events
- **Permission aware** — only shows events user can see (role/dept filtering)
- **View Full Calendar link** — navigates to `/calendar` page

### 5. Full Calendar Page (`pages/Calendar.jsx`)
Complete calendar interface with:
- **Month view** — visual calendar grid with event indicators
- **Event list panel** — shows events for selected date
- **Search events** — real-time text search (title matching)
- **Filter by type** — dropdown to filter by event type
- **Event details modal** — click event to see full details
- **Responsive layout** — stacked on mobile, side-by-side on desktop
- **Activity tracking** — logs visits to activity feed
- **Permission aware** — displays only accessible events

### 6. Event Components
- **MonthCalendarView.jsx** — interactive month calendar with event dots
- **EventListPanel.jsx** — list of events for selected date with type badges
- **EventDetailsModal.jsx** — modal showing full event details (time, location, description)

### 7. Activity Integration
When events are created, updated, or deleted:
- Function `logCalendarActivity.js` logs to Activity entity
- Activity records link back to `/calendar` route
- Visible in ActivityFeedWidget on homepage
- Records who created/updated event and what changed

### 8. Seed Events
Function `seedCalendarEvents.js` (admin-only) populates database with:
1. **Team Weekly Sync** — meeting, recurring Mondays 10-11am
2. **GDPR Training Deadline** — training, all-day, next month 15th
3. **Company All-Hands** — company_event, in 10 days 2-3:30pm
4. **Compliance Audit Review** — compliance, in 15 days 9am-12pm (admin only)
5. **New Starter Onboarding** — announcement, in 5 days

Run via: `base44.functions.invoke('seedCalendarEvents', {})`

---

## Where Events Appear

### 1. Home Page Calendar Widget
- Top-right sidebar (alongside weather, news)
- Shows current month with event indicators
- Click date to see that day's events
- "View Full Calendar" link

### 2. Full Calendar Page (`/calendar`)
- Dedicated calendar interface
- Month view grid + event list panel
- Search & type filtering
- Click event for details modal

### 3. Activity Feed Widget (Home)
- Shows "Created event: X" entries
- Links to calendar page
- Respects event visibility rules

### 4. Mobile
- Calendar stacks on mobile
- Event indicators remain visible
- Full functionality on smaller screens

---

## Permissions & Access Control

### Event Visibility
- **Empty visibility_roles + visibility_departments** = visible to all users
- **Set visibility_roles** = only those roles can see event
- **Set visibility_departments** = only those departments can see event
- Both checks combined (AND logic)

### Admin/Manager Capabilities
- Admins can create events via UI (future build)
- Admins can edit/delete events
- Admins can set visibility rules
- Admins can enable reminders

### Staff View
- Staff see only events they have access to
- Can't create/edit events (read-only)
- Can click events for details

---

## Current Limitations (V1)

### What Works
✅ Event creation, read, update, delete  
✅ Permission filtering by role/department  
✅ Month/date-based querying  
✅ All-day and timed events  
✅ Event type categorization  
✅ Activity logging  
✅ Mobile responsive  

### What's Not Yet Built
❌ Recurrence rule processing (data model ready, not computed)  
❌ Reminder notifications (stored, not sent)  
❌ Event creation UI (only admin API seeding)  
❌ Calendar sync (iCal, Google Calendar)  
❌ Timezone support (stored as UTC, no local conversion)  
❌ Conflict detection (overlapping events)  
❌ Event series management (create/update one vs all)  

---

## Next Steps (Future Phases)

### Phase 2 — Admin Event Management
1. Create event form (datetime picker, type selector, visibility controls)
2. Edit event modal
3. Delete event confirmation
4. Admin dashboard for event management
5. Bulk event import (CSV)

### Phase 3 — Notifications
1. Reminder system (cron job 30 min before event)
2. Email notifications
3. In-app notifications
4. Notification preferences per user

### Phase 4 — Advanced Features
1. Recurrence rule processing (RFC 5545 parser)
2. Event series (edit this/all future occurrences)
3. Timezone support
4. Calendar view options (week, day, agenda)
5. Export events (iCal, PDF)

### Phase 5 — Integrations
1. Google Calendar sync (read-only)
2. Outlook integration
3. Teams calendar embed
4. Slack notifications for events
5. Zapier/IFTTT triggers

### Phase 6 — Analytics
1. Event attendance tracking
2. Calendar utilization reports
3. Team bandwidth visualization
4. Upcoming deadlines dashboard
5. Calendar heatmaps

---

## Database Schema

### CalendarEvent Entity
```
- title (string, required)
- description (string)
- event_type (enum: 9 types, required)
- start_datetime (date-time, required)
- end_datetime (date-time, required)
- all_day (boolean, default: false)
- location (string)
- colour (string, hex, default: #0ea5e9)
- icon (string, lucide name)
- visibility_roles (array of strings)
- visibility_departments (array of strings)
- is_active (boolean, default: true)
- is_recurring (boolean, default: false)
- recurrence_rule (string, RFC 5545)
- reminder_minutes (number, default: 0)
- metadata (object, JSON)
- related_entity_type (string)
- related_entity_id (string)
- route (string)
```

Built-in: id, created_date, updated_date, created_by

---

## Testing Checklist

- ✅ Calendar widget loads without crashing on empty database
- ✅ Event indicators display correctly on calendar dates
- ✅ Clicking date shows selected day's events
- ✅ Full calendar page loads with empty state
- ✅ Event details modal opens/closes properly
- ✅ Search filters events by title in real-time
- ✅ Event type filter works correctly
- ✅ Permission filtering respects role/department rules
- ✅ Activity logging triggers on seed events
- ✅ Links between widgets/pages work (View Full Calendar, event details)

---

## Ready to Ship

The calendar system is production-ready for:
- Event viewing (staff)
- Event display on homepage
- Permission management
- Activity logging

Next: Build admin UI for event creation/management (separate phase).