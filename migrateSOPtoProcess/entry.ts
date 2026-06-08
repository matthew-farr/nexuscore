import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const docs = await base44.asServiceRole.entities.KnowledgeDocument.list('', 1000);
    let updated = 0;

    for (const doc of docs) {
      if (doc.doc_type === 'SOP') {
        await base44.asServiceRole.entities.KnowledgeDocument.update(doc.id, {
          doc_type: 'Process',
        });
        updated++;
      }
    }

    return Response.json({
      success: true,
      message: `Migrated ${updated} documents from SOP to Process`,
      totalDocuments: docs.length,
      migratedCount: updated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});