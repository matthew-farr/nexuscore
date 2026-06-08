import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TODAY_START = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
const TODAY_END = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("hubspot");

    // ── Resolve current user's HubSpot owner ID ────────────────────────────
    let myOwnerId = null;
    try {
      const profile = await base44.asServiceRole.entities.UserProfile.filter({ auth_user_id: user.id });
      if (profile?.[0]?.hubspot_owner_id) {
        myOwnerId = profile[0].hubspot_owner_id;
      }
    } catch (_) {}

    // ── Parallel fetches ───────────────────────────────────────────────────
    const [tasksRes, dealsRes, recentCompaniesRes, portalRes] = await Promise.all([
      // All open tasks (we'll filter client-side for today/overdue)
      fetch("https://api.hubapi.com/crm/v3/objects/tasks/search", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          filterGroups: [{ filters: [{ propertyName: "hs_task_status", operator: "NEQ", value: "COMPLETED" }] }],
          properties: ["hs_task_subject", "hs_task_status", "hs_task_type", "hs_timestamp",
            "hubspot_owner_id", "hs_task_body", "hs_task_priority"],
          sorts: [{ propertyName: "hs_timestamp", direction: "ASCENDING" }],
          limit: 100,
        }),
      }),
      // Open deals
      fetch("https://api.hubapi.com/crm/v3/objects/deals/search", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          filterGroups: [{ filters: [{ propertyName: "hs_is_closed", operator: "EQ", value: "false" }] }],
          properties: ["dealname", "dealstage", "pipeline", "amount", "closedate",
            "hubspot_owner_id", "hs_lastmodifieddate"],
          sorts: [{ propertyName: "hs_lastmodifieddate", direction: "DESCENDING" }],
          limit: 100,
        }),
      }),
      // Recently updated companies
      fetch("https://api.hubapi.com/crm/v3/objects/companies/search", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          filterGroups: [{ filters: [] }],
          properties: ["name", "domain", "phone", "city", "industry",
            "lifecyclestage", "hubspot_owner_id", "hs_lastmodifieddate", "createdate",
            "cd_industry", "cd_portal_id", "type", "hs_lead_status"],
          sorts: [{ propertyName: "hs_lastmodifieddate", direction: "DESCENDING" }],
          limit: 20,
        }),
      }),
      // Portal info
      fetch("https://api.hubapi.com/account-info/v3/details", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    const [tasksData, dealsData, companiesData, portalData] = await Promise.all([
      tasksRes.ok ? tasksRes.json() : { results: [] },
      dealsRes.ok ? dealsRes.json() : { results: [] },
      recentCompaniesRes.ok ? recentCompaniesRes.json() : { results: [] },
      portalRes.ok ? portalRes.json() : {},
    ]);

    const portalId = portalData.portalId || null;
    const allTasks = tasksData.results || [];
    const allDeals = dealsData.results || [];
    const recentCompanies = (companiesData.results || []).map(c => ({
      id: c.id,
      properties: c.properties,
      url: portalId ? `https://app.hubspot.com/contacts/${portalId}/company/${c.id}` : null,
    }));

    // ── Enrich tasks: fetch associated companies/contacts ──────────────────
    const taskIds = allTasks.map(t => t.id);
    let taskAssocMap = {};
    if (taskIds.length > 0) {
      const [compAssocRes, contAssocRes] = await Promise.all([
        fetch("https://api.hubapi.com/crm/v4/associations/tasks/companies/batch/read", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ inputs: taskIds.slice(0, 100).map(id => ({ id })) }),
        }),
        fetch("https://api.hubapi.com/crm/v4/associations/tasks/contacts/batch/read", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ inputs: taskIds.slice(0, 100).map(id => ({ id })) }),
        }),
      ]);
      const [compAssoc, contAssoc] = await Promise.all([
        compAssocRes.ok ? compAssocRes.json() : { results: [] },
        contAssocRes.ok ? contAssocRes.json() : { results: [] },
      ]);
      for (const r of (compAssoc.results || [])) {
        if (!taskAssocMap[r.from?.id]) taskAssocMap[r.from?.id] = {};
        taskAssocMap[r.from?.id].companyId = r.to?.[0]?.toObjectId;
      }
      for (const r of (contAssoc.results || [])) {
        if (!taskAssocMap[r.from?.id]) taskAssocMap[r.from?.id] = {};
        taskAssocMap[r.from?.id].contactId = r.to?.[0]?.toObjectId;
      }

      // Batch fetch company + contact names
      const companyIds = [...new Set(Object.values(taskAssocMap).map(a => a.companyId).filter(Boolean))];
      const contactIds = [...new Set(Object.values(taskAssocMap).map(a => a.contactId).filter(Boolean))];
      const [compNamesRes, contNamesRes] = await Promise.all([
        companyIds.length > 0
          ? fetch("https://api.hubapi.com/crm/v3/objects/companies/batch/read", {
              method: "POST",
              headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
              body: JSON.stringify({ inputs: companyIds.map(id => ({ id })), properties: ["name"] }),
            })
          : Promise.resolve(null),
        contactIds.length > 0
          ? fetch("https://api.hubapi.com/crm/v3/objects/contacts/batch/read", {
              method: "POST",
              headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
              body: JSON.stringify({ inputs: contactIds.map(id => ({ id })), properties: ["firstname", "lastname"] }),
            })
          : Promise.resolve(null),
      ]);

      const compNameMap = {};
      const contNameMap = {};
      if (compNamesRes?.ok) {
        const d = await compNamesRes.json();
        for (const c of (d.results || [])) compNameMap[c.id] = c.properties?.name || "";
      }
      if (contNamesRes?.ok) {
        const d = await contNamesRes.json();
        for (const c of (d.results || [])) {
          contNameMap[c.id] = [c.properties?.firstname, c.properties?.lastname].filter(Boolean).join(" ");
        }
      }

      for (const task of allTasks) {
        const assoc = taskAssocMap[task.id] || {};
        task.company_name = assoc.companyId ? (compNameMap[assoc.companyId] || null) : null;
        task.company_id   = assoc.companyId || null;
        task.contact_name = assoc.contactId ? (contNameMap[assoc.contactId] || null) : null;
        task.url = task.company_id && portalId
          ? `https://app.hubspot.com/contacts/${portalId}/company/${task.company_id}`
          : portalId ? `https://app.hubspot.com/contacts/${portalId}/tasks` : null;
      }
    }

    // ── Resolve owner names ────────────────────────────────────────────────
    const ownerIdsSet = new Set([
      ...allTasks.map(t => t.properties?.hubspot_owner_id),
      ...allDeals.map(d => d.properties?.hubspot_owner_id),
      ...recentCompanies.map(c => c.properties?.hubspot_owner_id),
    ].filter(Boolean));
    const ownerMap = {};
    await Promise.all([...ownerIdsSet].map(async id => {
      const r = await fetch(`https://api.hubapi.com/crm/v3/owners/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (r.ok) {
        const o = await r.json();
        ownerMap[id] = `${o.firstName || ""} ${o.lastName || ""}`.trim() || o.email || id;
      }
    }));

    // ── Classify tasks ─────────────────────────────────────────────────────
    const todayStart = TODAY_START();
    const todayEnd   = TODAY_END();
    const tasksDueToday = [];
    const tasksOverdue  = [];

    for (const task of allTasks) {
      const ts = task.properties?.hs_timestamp ? Number(task.properties.hs_timestamp) : null;
      const owner = task.properties?.hubspot_owner_id ? (ownerMap[task.properties.hubspot_owner_id] || null) : null;
      const enriched = { ...task, owner_name: owner };
      if (ts !== null) {
        if (ts < todayStart) tasksOverdue.push(enriched);
        else if (ts <= todayEnd) tasksDueToday.push(enriched);
      }
    }

    // ── Build pipeline snapshot ────────────────────────────────────────────
    const stageMap = {};
    for (const deal of allDeals) {
      const stage = deal.properties?.dealstage || "unknown";
      if (!stageMap[stage]) stageMap[stage] = { stage, count: 0, value: 0 };
      stageMap[stage].count++;
      stageMap[stage].value += parseFloat(deal.properties?.amount || 0);
    }
    const pipelineStages = Object.values(stageMap).sort((a, b) => b.value - a.value);

    const totalPipelineValue = allDeals.reduce((s, d) => s + parseFloat(d.properties?.amount || 0), 0);

    // Enrich companies with owner names
    for (const c of recentCompanies) {
      const oid = c.properties?.hubspot_owner_id;
      c.owner_name = oid ? (ownerMap[oid] || null) : null;
    }

    return Response.json({
      kpis: {
        open_deals: allDeals.length,
        pipeline_value: totalPipelineValue,
        tasks_due_today: tasksDueToday.length,
        tasks_overdue: tasksOverdue.length,
      },
      tasks_due_today: tasksDueToday.slice(0, 10),
      tasks_overdue:   tasksOverdue.slice(0, 10),
      pipeline_stages: pipelineStages,
      recent_companies: recentCompanies,
      my_owner_id: myOwnerId,
      portalId,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});