/**
 * ensureOperationsHubTools — safety check/fallback
 * Upserts the 60 Day DBS Escalations tool if it doesn't exist.
 * Called automatically on OperationsHub page load.
 * Non-admin users can call this (read-only safety check).
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const HUB_KEY = "operations";

const REQUIRED_TOOLS = [
  {
    title: "60 Day DBS Escalations",
    description: "Track DBS applications due for 60 day escalation.",
    icon: "AlertTriangle",
    colour_theme: "pink",
    sort_order: 2,
    url: "/operations/60-day-dbs-escalations"
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch existing tools for this hub
    const existingTools = await base44.asServiceRole.entities.HubContentItem.filter(
      { hub_key: HUB_KEY, content_type: "tool" },
      "sort_order",
      100
    );

    const existingTitles = new Set((existingTools || []).map(t => t.title));

    // Check which tools are missing
    const missingTools = REQUIRED_TOOLS.filter(t => !existingTitles.has(t.title));

    if (missingTools.length === 0) {
      return Response.json({ success: true, message: "All tools exist", toolsChecked: existingTitles.size });
    }

    // Create missing tools
    const toolsToCreate = missingTools.map(t => ({
      ...t,
      hub_key: HUB_KEY,
      content_type: "tool",
      is_active: true,
      open_in_new_tab: false
    }));

    await base44.asServiceRole.entities.HubContentItem.bulkCreate(toolsToCreate);

    return Response.json({
      success: true,
      message: `Created ${missingTools.length} missing tools`,
      created: missingTools.map(t => t.title),
      totalTools: existingTitles.size + missingTools.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});