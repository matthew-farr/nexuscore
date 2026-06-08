import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, event } = await req.json();

    if (!action || !event) {
      return Response.json({ error: 'Missing action or event' }, { status: 400 });
    }

    // Get icon from event type
    const iconMap = {
      company_event: "Building2",
      training: "BookOpen",
      meeting: "Users",
      birthday: "Cake",
      anniversary: "Gift",
      deadline: "Clock",
      announcement: "Bell",
      compliance: "ShieldAlert",
      system: "Cog",
    };

    const activity = {
      activity_type: action === "create" ? "created" : action === "update" ? "updated" : "deleted",
      title: `${action === "create" ? "Created" : action === "update" ? "Updated" : "Deleted"} event: ${event.title}`,
      description: event.description || "",
      entity_type: "event",
      entity_id: event.id,
      route: "/calendar",
      icon: iconMap[event.event_type] || "Calendar",
      performed_by_name: user.full_name,
      visibility_roles: event.visibility_roles?.length > 0 ? event.visibility_roles : [],
      visibility_departments: event.visibility_departments?.length > 0 ? event.visibility_departments : [],
      is_system_activity: false,
      metadata: {
        event_type: event.event_type,
        colour: event.colour,
      },
    };

    await base44.asServiceRole.entities.Activity.create(activity);

    return Response.json({ success: true });
  } catch (error) {
    console.warn("[logCalendarActivity] Error:", error.message);
    return Response.json({ success: false }, { status: 200 });
  }
});