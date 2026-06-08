import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if events already seeded
    const existingEvents = await base44.entities.CalendarEvent.list();
    if (existingEvents.length > 0) {
      return Response.json({ message: 'Events already seeded' }, { status: 200 });
    }

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const events = [
      {
        title: "Team Weekly Sync",
        description: "Weekly team meeting to discuss progress and blockers",
        event_type: "meeting",
        start_datetime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 10, 0).toISOString(),
        end_datetime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 11, 0).toISOString(),
        all_day: false,
        location: "Conference Room A",
        colour: "#8b5cf6",
        icon: "Users",
        visibility_roles: [],
        visibility_departments: [],
        is_active: true,
        is_recurring: true,
        recurrence_rule: "FREQ=WEEKLY;BYDAY=MO",
        reminder_minutes: 15,
      },
      {
        title: "GDPR Training Deadline",
        description: "Annual GDPR compliance training must be completed",
        event_type: "training",
        start_datetime: new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString(),
        end_datetime: new Date(now.getFullYear(), now.getMonth() + 1, 15, 23, 59).toISOString(),
        all_day: true,
        colour: "#f59e0b",
        icon: "BookOpen",
        visibility_roles: ["Staff"],
        visibility_departments: [],
        is_active: true,
        is_recurring: false,
        reminder_minutes: 1440,
      },
      {
        title: "Company All-Hands",
        description: "Quarterly company update and strategy session",
        event_type: "company_event",
        start_datetime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 14, 0).toISOString(),
        end_datetime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 15, 30).toISOString(),
        all_day: false,
        location: "Main Hall",
        colour: "#22d3ee",
        icon: "Building2",
        visibility_roles: [],
        visibility_departments: [],
        is_active: true,
        is_recurring: false,
        reminder_minutes: 30,
      },
      {
        title: "Compliance Audit Review",
        description: "Annual compliance audit and remediation check",
        event_type: "compliance",
        start_datetime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15, 9, 0).toISOString(),
        end_datetime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15, 12, 0).toISOString(),
        all_day: false,
        location: "Virtual",
        colour: "#a855f7",
        icon: "ShieldAlert",
        visibility_roles: ["Admin"],
        visibility_departments: [],
        is_active: true,
        is_recurring: false,
        reminder_minutes: 60,
      },
      {
        title: "New Starter Onboarding",
        description: "Welcome and onboarding session for new team member",
        event_type: "announcement",
        start_datetime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5).toISOString(),
        end_datetime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5).toISOString(),
        all_day: true,
        colour: "#06b6d4",
        icon: "Bell",
        visibility_roles: [],
        visibility_departments: [],
        is_active: true,
        is_recurring: false,
        reminder_minutes: 0,
      },
    ];

    const created = await base44.entities.CalendarEvent.bulkCreate(events);

    return Response.json({
      success: true,
      created: created.length,
      events: created.map(e => ({ id: e.id, title: e.title, event_type: e.event_type })),
    });
  } catch (error) {
    console.error("Seed error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});