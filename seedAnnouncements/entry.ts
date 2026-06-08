import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if announcements already seeded
    const existingAnnouncements = await base44.entities.Announcement.list();
    if (existingAnnouncements.length > 0) {
      return Response.json({ message: 'Announcements already seeded' }, { status: 200 });
    }

    const now = new Date();

    const announcements = [
      {
        title: "Q2 2026 Company Results",
        excerpt: "Strong performance across all departments with record growth in key metrics",
        body: "# Q2 2026 Results\n\nWe are pleased to announce record results for Q2 2026:\n\n- Revenue up 23% YoY\n- Team growth: 15 new hires\n- Customer satisfaction: 4.8/5\n\nThank you for your continued dedication.",
        category: "company_update",
        status: "published",
        priority: "high",
        author_user_id: user.id,
        author_name: user.full_name,
        publish_datetime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        visibility_roles: [],
        visibility_departments: [],
        is_pinned: true,
        is_active: true,
        requires_acknowledgement: false,
      },
      {
        title: "Annual GDPR Training Reminder",
        excerpt: "All staff must complete GDPR training by end of July",
        body: "# GDPR Training Deadline\n\nThis is a reminder that all staff members must complete the annual GDPR compliance training by July 31, 2026.\n\n## Important\nCompletion is mandatory. Please allocate 2 hours this week.",
        category: "training",
        status: "published",
        priority: "critical",
        author_user_id: user.id,
        author_name: user.full_name,
        publish_datetime: now.toISOString(),
        visibility_roles: [],
        visibility_departments: [],
        is_pinned: true,
        is_active: true,
        requires_acknowledgement: true,
      },
      {
        title: "New Workplace Flexibility Policy",
        excerpt: "Updated flexible working arrangements now in effect",
        body: "# Workplace Flexibility Update\n\nEffective immediately, we're introducing more flexible working options:\n\n- Remote work: 2 days per week\n- Flexible hours: 7am-6pm core hours\n- Compressed weeks available\n\nPlease speak with your manager about your arrangements.",
        category: "people",
        status: "published",
        priority: "medium",
        author_user_id: user.id,
        author_name: user.full_name,
        publish_datetime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        visibility_roles: [],
        visibility_departments: [],
        is_pinned: false,
        is_active: true,
        requires_acknowledgement: false,
      },
      {
        title: "System Maintenance Window",
        excerpt: "Scheduled maintenance on June 30th, 10pm-2am UTC",
        body: "# System Maintenance Alert\n\nPlease be aware of the following scheduled maintenance:\n\n**Date:** June 30, 2026  \n**Time:** 10pm - 2am UTC\n\nSystems may be unavailable during this period. No data will be lost.",
        category: "system",
        status: "published",
        priority: "high",
        author_user_id: user.id,
        author_name: user.full_name,
        publish_datetime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        visibility_roles: [],
        visibility_departments: [],
        is_pinned: false,
        is_active: true,
        requires_acknowledgement: false,
      },
      {
        title: "Welcome to the Team - New Starters",
        excerpt: "Please join us in welcoming 3 new team members",
        body: "# New Team Members\n\nWe're excited to welcome the following new starters to Checks Direct:\n\n- Alice Johnson (Operations)\n- Bob Smith (Sales)\n- Carol Williams (Compliance)\n\nPlease help make them feel welcome!",
        category: "people",
        status: "published",
        priority: "low",
        author_user_id: user.id,
        author_name: user.full_name,
        publish_datetime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        visibility_roles: [],
        visibility_departments: [],
        is_pinned: false,
        is_active: true,
        requires_acknowledgement: false,
      },
    ];

    const created = await base44.entities.Announcement.bulkCreate(announcements);

    return Response.json({
      success: true,
      created: created.length,
      announcements: created.map(a => ({ id: a.id, title: a.title, category: a.category })),
    });
  } catch (error) {
    console.error("Seed error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});