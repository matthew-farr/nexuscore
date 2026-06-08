import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Maps entity names to release metadata
// Only platform feature entities — not content, docs, or data records
const ENTITY_MAP = {
  SalesHubTool:   { category: 'New Feature',  hub: 'Sales',      area: 'Sales Hub' },
  RoadmapItem:    { category: 'New Feature',  hub: 'Innovation', area: 'Innovation & Roadmap' },
  HubContentItem: { category: 'New Feature',  hub: null,         area: 'Hub Content' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // ── Manual mode (admin submits Log Release form) ────────────────────────
    if (body.mode === 'manual') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Admin only' }, { status: 403 });
      }

      const { title, description, category, hub, page_url, what_changed, why_it_matters, steps, what_to_expect } = body;
      if (!title) return Response.json({ error: 'Title required' }, { status: 400 });

      const release = await base44.asServiceRole.entities.FeatureRelease.create({
        title,
        summary: description || '',
        release_notes: description || '',
        category: category || 'New Feature',
        status: 'draft',
        source: 'manual',
        related_area: hub || 'Platform',
        created_by: user.full_name || user.email,
      });

      await base44.asServiceRole.entities.FeatureGuide.create({
        release_id: release.id,
        title,
        feature_area: hub || 'Platform',
        summary: description || '',
        what_changed: what_changed || description || '',
        why_it_matters: why_it_matters || '',
        how_to_use_steps: (steps || []).filter(s => s && s.trim()),
        what_to_expect: what_to_expect || '',
        related_page_url: page_url || '',
        created_by: user.full_name || user.email,
        status: 'Draft',
      });

      return Response.json({ success: true, release_id: release.id });
    }

    // ── Auto mode (entity automation trigger) ──────────────────────────────
    const { event, data } = body;
    if (!data || !data.title) {
      return Response.json({ skipped: true, reason: 'No data or title' });
    }

    const entityName = event?.entity_name;
    const entityId = event?.entity_id;
    const config = ENTITY_MAP[entityName] || { category: 'New Feature', hub: null, area: 'Platform' };

    // Determine hub/area
    const hub = config.hub || data.hub_key || 'Platform';
    const area = config.hub ? config.area : `${hub.charAt(0).toUpperCase() + hub.slice(1)} Hub`;

    // Duplicate check via related_ticket storing entityType:entityId
    const sourceRef = `${entityName}:${entityId}`;
    const existing = await base44.asServiceRole.entities.FeatureRelease.filter({ related_ticket: sourceRef });
    if (existing && existing.length > 0) {
      const existingRelease = existing[0];
      return Response.json({
        skipped: true,
        reason: `A release draft already exists for this ${entityName} (ID: ${entityId}).`,
        existing_release_id: existingRelease.id,
        existing_title: existingRelease.title,
        existing_status: existingRelease.status,
      });
    }

    const title = data.title || data.name || `New ${entityName}`;
    const description = data.description || data.summary || '';

    // AI-generate guide content
    let guideContent = { what_changed: '', why_it_matters: '', steps: [], what_to_expect: '' };
    try {
      const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `A new ${entityName} called "${title}" has been added to Checks Direct OS (a UK DBS/employment screening compliance platform) in the ${hub} area.
${description ? `Description: ${description}` : ''}

Generate a concise, friendly staff-facing mini guide with these 4 fields:
- what_changed: 1-2 sentences explaining what was added (plain English, no technical jargon)
- why_it_matters: 1-2 sentences on why this is useful for staff at a DBS/compliance company
- steps: 3-5 practical steps on how to find and use it (as an array of short strings, starting with action verbs like "Go to...", "Click...", "Select...")
- what_to_expect: 1 sentence on what staff will see or experience

Be practical and concise. Avoid filler phrases.`,
        response_json_schema: {
          type: 'object',
          properties: {
            what_changed:    { type: 'string' },
            why_it_matters:  { type: 'string' },
            steps:           { type: 'array', items: { type: 'string' } },
            what_to_expect:  { type: 'string' },
          }
        }
      });
      if (llmResult) guideContent = llmResult;
    } catch (_) {
      // LLM failed — continue with blank guide; admin can fill in manually
    }

    // Create FeatureRelease draft
    const release = await base44.asServiceRole.entities.FeatureRelease.create({
      title,
      summary: description ? description.substring(0, 200) : `New ${entityName} added to ${hub}`,
      release_notes: description,
      category: config.category,
      status: 'draft',
      source: 'auto',
      related_area: area,
      related_ticket: sourceRef,
      created_by: 'Auto (System)',
    });

    // Create FeatureGuide draft
    await base44.asServiceRole.entities.FeatureGuide.create({
      release_id: release.id,
      title,
      feature_area: area,
      summary: description ? description.substring(0, 200) : '',
      what_changed:       guideContent.what_changed || '',
      why_it_matters:     guideContent.why_it_matters || '',
      how_to_use_steps:   guideContent.steps || [],
      what_to_expect:     guideContent.what_to_expect || '',
      created_by: 'Auto (System)',
      status: 'Draft',
    });

    return Response.json({ success: true, release_id: release.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});