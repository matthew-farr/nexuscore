import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Log the publish event — this automatically publishes to live
    const publishRes = await base44.functions.invoke('logAppPublish', {});

    return Response.json({
      success: true,
      version: publishRes.data.version,
      message: 'App published to live',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});