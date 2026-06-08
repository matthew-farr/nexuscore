import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, announcement } = await req.json();

    if (!action || !announcement) {
      return Response.json({ error: 'Missing action or announcement' }, { status: 400 });
    }

    const categoryMap = {
      company_update: "Building2",
      operations: "Settings",
      sales: "TrendingUp",
      training: "BookOpen",
      compliance: "ShieldAlert",
      system: "AlertTriangle",
      product: "Lightbulb",
      people: "Users",
    };

    const activity = {
      activity_type: action === "create" ? "created" : action === "updated" ? "updated" : action === "acknowledged" ? "completed" : "deleted",
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} announcement: ${announcement.title}`,
      description: announcement.excerpt || announcement.description || "",
      entity_type: "announcement",
      entity_id: announcement.id,
      route: "/news",
      icon: categoryMap[announcement.category] || "Bell",
      performed_by_name: user.full_name,
      visibility_roles: announcement.visibility_roles?.length > 0 ? announcement.visibility_roles : [],
      visibility_departments: announcement.visibility_departments?.length > 0 ? announcement.visibility_departments : [],
      is_system_activity: false,
      metadata: {
        category: announcement.category,
        priority: announcement.priority,
      },
    };

    await base44.asServiceRole.entities.Activity.create(activity);

    return Response.json({ success: true });
  } catch (error) {
    console.warn("[logAnnouncementActivity] Error:", error.message);
    return Response.json({ success: false }, { status: 200 });
  }
});