import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CATEGORY_MAPPING = {
  'Company Policies': 'Company Information',
  'Operations': 'Operations',
  'DBS & Compliance': 'Compliance',
  'Sales': 'Sales & Account Management',
  'Systems & Software': 'Systems & Software',
  'User Guides & Walkthroughs': 'Products',
  'HR': 'Company Information',
  'Training': 'Company Information',
  'Finance': 'Finance & Commercial',
  'Marketing': 'Marketing & Communications',
};

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
      const oldCategory = doc.category;
      const newCategory = CATEGORY_MAPPING[oldCategory];

      if (newCategory && newCategory !== oldCategory) {
        await base44.asServiceRole.entities.KnowledgeDocument.update(doc.id, {
          category: newCategory,
        });
        updated++;
      }
    }

    return Response.json({
      success: true,
      message: `Migrated ${updated} documents to new categories`,
      totalDocuments: docs.length,
      migratedCount: updated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});