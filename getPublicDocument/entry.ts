import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();

    if (!token) {
      return Response.json({ error: 'Token required' }, { status: 400 });
    }

    // Use service role to fetch by token — no auth needed for public share
    const docs = await base44.asServiceRole.entities.KnowledgeDocument.filter({
      public_share_token: token,
      status: 'Published',
    });

    if (!docs || docs.length === 0) {
      return Response.json({ error: 'Document not found or not publicly available' }, { status: 404 });
    }

    const doc = docs[0];

    // Fetch FAQs relevant to this document's audience
    const audiences = [];
    if (doc.is_applicant_shareable) audiences.push('applicant');
    if (doc.is_client_shareable) audiences.push('client');

    let faqs = [];
    if (audiences.length > 0) {
      const allFaqs = await base44.asServiceRole.entities.PublicFAQ.list('sort_order', 200);
      faqs = allFaqs.filter(f => audiences.includes(f.audience) && f.is_active !== false);
    }

    // Only return safe fields — never expose internal admin data
    return Response.json({
      faqs,
      doc: {
        id: doc.id,
        title: doc.title,
        description: doc.description,
        content: doc.content,
        doc_type: doc.doc_type,
        category: doc.category,
        owner: doc.owner,
        version: doc.version,
        published_date: doc.published_date,
        file_url: doc.file_url,
        pdf_url: doc.pdf_url,
        external_url: doc.external_url,
        is_compliance_critical: doc.is_compliance_critical,
        is_client_shareable: doc.is_client_shareable,
        is_applicant_shareable: doc.is_applicant_shareable,
        tags: doc.tags,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});