import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CheckCircle2, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  parseFile,
  mapHeaders,
  rowToRecord,
  validateRecord,
  detectFileDuplicates,
  getUniqueERefs,
  downloadTemplate,
  getExistingRecordsByERefs,
  prepareUpsertUpdate
} from '@/lib/dbsEscalationImportUtils';

export default function DBSEscalationImportDrawer({ isOpen, onClose, onSuccess, isDark }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const importMode = 'create';
  const [parsed, setParsed] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [failedRecords, setFailedRecords] = useState([]);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    console.time('dbs-import-drawer-open');
    setFile(selectedFile);
    setFileName(selectedFile.name);

    try {
      console.time('dbs-import-file-parse');
      const { headers, rows } = await parseFile(selectedFile);

      console.time('dbs-import-column-mapping');
      const { mapping } = mapHeaders(headers);
      console.timeEnd('dbs-import-column-mapping');

      // Convert rows to records with mode
      const records = rows.map((row) => {
        const record = rowToRecord(row.values, mapping, importMode);
        const validation = validateRecord(record, row.rowNum);
        return { record, ...validation };
      });

      // Detect duplicates in file
      const fileDuplicates = detectFileDuplicates(records);

      // Get existing ERefs from DB
      console.time('dbs-import-duplicate-check-existing');
      const uniqueErefs = getUniqueERefs(records);
      const existingRecordsMap = await getExistingRecordsByERefs(uniqueErefs);
      console.timeEnd('dbs-import-duplicate-check-existing');

      const validRecords = records.filter(r => r.valid);
      const newRows = validRecords.filter(r => !existingRecordsMap.has(r.record.eref));
      const updateRows = validRecords.filter(r => existingRecordsMap.has(r.record.eref));

      setParsed({
        records,
        fileDuplicates,
        existingRecordsMap,
        totalRows: rows.length,
        validRows: validRecords.length,
        invalidRows: records.filter(r => !r.valid).length,
        newRows: newRows.length,
        updateRows: updateRows.length,
        fileDuplicateCount: fileDuplicates.length
      });
      console.timeEnd('dbs-import-file-parse');
    } catch (err) {
      console.error('Failed to parse file:', err);
      toast.error('Failed to parse file: ' + err.message);
      setFile(null);
      setFileName('');
      setParsed(null);
    }
  };

  const processRecords = async (recordsToProcess, existingRecordsMap) => {
    const delay = (ms) => new Promise(res => setTimeout(res, ms));
    const created = [];
    const updated = [];
    const failed = [];
    const BATCH_SIZE = 5;
    const BATCH_DELAY = 500;

    setImportProgress({ current: 0, total: recordsToProcess.length });
    let processedCount = 0;

    for (let i = 0; i < recordsToProcess.length; i += BATCH_SIZE) {
      const batch = recordsToProcess.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (r) => {
        let attempts = 0;
        const maxAttempts = 3;
        while (attempts < maxAttempts) {
          try {
            await base44.entities.DBSEscalation.create(r.record);
            created.push(r);
            break;
          } catch (err) {
            attempts++;
            if (attempts < maxAttempts && (err.message?.includes('rate') || err.message?.includes('429') || err.status === 429)) {
              await delay(1000 * attempts);
            } else {
              console.error(`Failed ERef ${r.record.eref}:`, err.message);
              failed.push({ record: r, error: err.message });
              break;
            }
          }
        }
        processedCount++;
        setImportProgress({ current: processedCount, total: recordsToProcess.length });
      }));
      if (i + BATCH_SIZE < recordsToProcess.length) await delay(BATCH_DELAY);
    }

    return { created, updated, failed };
  };

  const handleImport = async () => {
    if (!parsed || importing) return;
    setImporting(true);
    try {
      const validErefs = new Set(parsed.fileDuplicates.map(d => d.eref));
      let recordsToProcess = parsed.records.filter(r =>
        r.valid && r.record.eref && !validErefs.has(r.record.eref)
      );
      if (importMode === 'create') {
        recordsToProcess = recordsToProcess.filter(r => !parsed.existingRecordsMap.has(r.record.eref));
      }

      const { created, updated, failed } = await processRecords(recordsToProcess, parsed.existingRecordsMap);

      onSuccess();
      setFailedRecords(failed);
      const skipped = parsed.fileDuplicateCount + (importMode === 'create' ? parsed.updateRows : 0);
      setImportResult({ created: created.length, updated: updated.length, skipped, failed: failed.length, failedRows: failed });

      if (created.length > 0 || updated.length > 0) toast.success(`Import complete: ${created.length} created, ${updated.length} updated.`);
      if (failed.length > 0) toast.warning(`${failed.length} rows failed — use Retry to try again.`);
    } catch (err) {
      console.error('Import failed:', err);
      toast.error('Import failed: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleRetryFailed = async () => {
    if (!failedRecords.length || importing) return;
    setImporting(true);
    try {
      const recordsToRetry = failedRecords.map(f => f.record);
      const { created, updated, failed } = await processRecords(recordsToRetry, parsed?.existingRecordsMap || new Map());
      onSuccess();
      setFailedRecords(failed);
      setImportResult(prev => ({
        ...prev,
        created: prev.created + created.length,
        updated: prev.updated + updated.length,
        failed: failed.length,
        failedRows: failed
      }));
      if (created.length > 0 || updated.length > 0) toast.success(`Retry complete: ${created.length} created, ${updated.length} updated.`);
      if (failed.length > 0) toast.warning(`${failed.length} still failing.`);
      else toast.success('All records processed successfully!');
    } catch (err) {
      toast.error('Retry failed: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setFileName('');
    setParsed(null);
    setImportResult(null);
    setFailedRecords([]);
    setImportProgress({ current: 0, total: 0 });
    onClose();
  };

  const importableRows = !parsed ? 0 : parsed.validRows - parsed.fileDuplicateCount - (importMode === 'create' ? parsed.updateRows : 0);
  const importButtonDisabled = !parsed || importing || importableRows === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={handleClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: 620 }}
            animate={{ x: 0 }}
            exit={{ x: 620 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-[620px] z-50 overflow-y-auto flex flex-col"
            style={{
              background: isDark ? '#1a1a2e' : '#ffffff',
              borderLeft: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
            }}
          >
            {/* Header */}
            <div className="sticky top-0 p-6 border-b flex items-center justify-between" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h2 style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-xl font-semibold">
                Import DBS Escalations
              </h2>
              <button onClick={handleClose} className="p-1 hover:bg-accent rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Result Summary */}
              {importResult && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="font-semibold mb-2">
                        Import Complete
                      </h3>
                      <div style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }} className="text-sm space-y-1">
                        {importResult.created > 0 && <p>✓ Created: {importResult.created}</p>}
                        {importResult.updated > 0 && <p>✓ Updated: {importResult.updated}</p>}
                        {importResult.skipped > 0 && <p>⊘ Skipped: {importResult.skipped}</p>}
                        {importResult.failed > 0 && (
                          <>
                            <p>✕ Failed: {importResult.failed}</p>
                            <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                              {importResult.failedRows.slice(0, 20).map((f, idx) => (
                                <p key={idx} className="text-xs opacity-80">
                                  {f.record?.record?.eref || 'Unknown'}: {f.error}
                                </p>
                              ))}
                              {importResult.failedRows.length > 20 && (
                                <p className="text-xs opacity-60">...and {importResult.failedRows.length - 20} more (see browser console)</p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* File Upload & Mode */}
              {!importResult && (
                <>
                  <div className="space-y-3">
                    <h3 style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-sm font-semibold">
                      Upload File
                    </h3>
                    <div
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all"
                      style={{
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                      }}
                      onClick={() => document.getElementById('file-input').click()}
                    >
                      <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} />
                      <p style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }} className="font-medium mb-1">
                        Click to select CSV file
                      </p>
                      <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="text-xs">
                        CSV or XLSX format • Max 5MB
                      </p>
                      <input
                        id="file-input"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {fileName && (
                      <p style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }} className="text-sm">
                        Selected: <span className="font-semibold">{fileName}</span>
                      </p>
                    )}
                  </div>

                  {/* Validation Preview */}
                  {parsed && (
                    <div className="space-y-3">
                      <h3 style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-sm font-semibold">
                        C. Validation Preview
                      </h3>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                          <p style={{ color: '#16a34a' }} className="text-xs font-semibold mb-1">Valid</p>
                          <p style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-lg font-bold">{parsed.validRows}</p>
                        </div>

                        <div className="p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                          <p style={{ color: '#dc2626' }} className="text-xs font-semibold mb-1">Invalid</p>
                          <p style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-lg font-bold">{parsed.invalidRows}</p>
                        </div>

                        {importMode === 'create' && (
                          <div className="p-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                            <p style={{ color: '#16a34a' }} className="text-xs font-semibold mb-1">To Create</p>
                            <p style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-lg font-bold">{parsed.newRows}</p>
                          </div>
                        )}

                        {importMode === 'create' && (
                          <div className="p-3 rounded-lg" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
                            <p style={{ color: '#ea580c' }} className="text-xs font-semibold mb-1">Will Skip</p>
                            <p style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-lg font-bold">{parsed.updateRows}</p>
                          </div>
                        )}

                        {importMode === 'upsert' && (
                          <>
                            <div className="p-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                              <p style={{ color: '#16a34a' }} className="text-xs font-semibold mb-1">New</p>
                              <p style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-lg font-bold">{parsed.newRows}</p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
                              <p style={{ color: '#3b82f6' }} className="text-xs font-semibold mb-1">Update</p>
                              <p style={{ color: isDark ? '#ffffff' : '#0f0f2e' }} className="text-lg font-bold">{parsed.updateRows}</p>
                            </div>
                          </>
                        )}
                      </div>

                      {parsed.fileDuplicates.length > 0 && (
                        <div className="p-3 rounded-lg" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
                          <p style={{ color: '#ea580c' }} className="text-xs font-semibold mb-2">Duplicates in File: {parsed.fileDuplicates.length}</p>
                          <div style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)' }} className="text-xs space-y-1">
                            {parsed.fileDuplicates.slice(0, 3).map((dup) => (
                              <p key={`${dup.eref}-${dup.rowNum}`}>Row {dup.rowNum}: {dup.eref}</p>
                            ))}
                            {parsed.fileDuplicates.length > 3 && <p>... and {parsed.fileDuplicates.length - 3} more</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 p-6 border-t space-y-3" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              {importResult ? (
                <div className="space-y-3 w-full">
                  {failedRecords.length > 0 && (
                    <Button
                      onClick={handleRetryFailed}
                      disabled={importing}
                      className="w-full"
                      style={{ background: 'linear-gradient(135deg, #f97316, #f9731688)' }}
                    >
                      {importing
                        ? `Retrying... ${importProgress.current} / ${importProgress.total}`
                        : `Retry Failed (${failedRecords.length} records)`}
                    </Button>
                  )}
                  <Button onClick={handleClose} className="w-full" style={{ background: 'linear-gradient(135deg, #ec2ca3, #ec2ca388)' }}>
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    onClick={handleImport}
                    disabled={importButtonDisabled}
                    className="w-full"
                    style={{ background: 'linear-gradient(135deg, #ec2ca3, #ec2ca388)' }}
                  >
                    {importing
                      ? importProgress.total > 0
                        ? `Importing... ${importProgress.current} / ${importProgress.total}`
                        : 'Preparing...'
                      : `Import (${importableRows} rows)`}
                  </Button>
                  <Button onClick={downloadTemplate} variant="outline" className="w-full flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Template
                  </Button>
                  <Button onClick={handleClose} variant="outline" className="w-full">
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}