import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const invalidRecords = [];
    const migratedRecords = [];

    // Fetch all DBS queries
    const allQueries = await base44.entities.DBSQueryTracker.list();

    // Step 1: Identify and delete records with invalid dates
    for (const record of allQueries) {
      const dateReceived = record.date_received;
      
      // Check if date is invalid or in the future
      let isInvalid = false;
      
      if (!dateReceived) {
        isInvalid = true;
      } else {
        try {
          const date = new Date(dateReceived);
          if (isNaN(date.getTime())) {
            isInvalid = true;
          } else if (date > new Date()) {
            isInvalid = true;
          }
        } catch {
          isInvalid = true;
        }
      }

      if (isInvalid) {
        invalidRecords.push(record.id);
        
        // Delete audit logs
        const auditLogs = await base44.entities.DBSQueryAuditLog.filter({ query_id: record.id });
        for (const log of auditLogs) {
          await base44.entities.DBSQueryAuditLog.delete(log.id);
        }

        // Delete notes
        const notes = await base44.entities.DBSQueryNote.filter({ query_id: record.id });
        for (const note of notes) {
          await base44.entities.DBSQueryNote.delete(note.id);
        }

        // Delete record
        await base44.entities.DBSQueryTracker.delete(record.id);
      }
    }

    // Step 2: Migrate imported records to "Responded to DBS"
    const remainingQueries = await base44.entities.DBSQueryTracker.list();
    
    for (const record of remainingQueries) {
      // Only migrate records that were imported or have source = CJSM
      if (record.source === 'CJSM' && record.stage !== 'Responded to DBS') {
        const oldStage = record.stage;
        
        // Update record
        await base44.entities.DBSQueryTracker.update(record.id, {
          stage: 'Responded to DBS',
          updated_date: new Date().toISOString(),
          updated_by: 'System Migration'
        });

        // Create audit log
        await base44.entities.DBSQueryAuditLog.create({
          query_id: record.id,
          action_type: 'Bulk Stage Update',
          field_changed: 'stage',
          old_value: oldStage,
          new_value: 'Responded to DBS',
          changed_by: 'System Migration',
          changed_date: new Date().toISOString()
        });

        migratedRecords.push({
          id: record.id,
          company: record.company_name,
          oldStage,
          newStage: 'Responded to DBS'
        });
      }
    }

    return Response.json({
      success: true,
      invalidRecordsDeleted: invalidRecords.length,
      deletedRecordIds: invalidRecords,
      recordsMigrated: migratedRecords.length,
      migratedRecords
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});