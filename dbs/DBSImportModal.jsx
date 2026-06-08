import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CheckCircle2 } from 'lucide-react';

// Flexible column header mapping
const normalizeHeader = (header) => {
  return header.trim().toUpperCase().replace(/\s+/g, ' ');
};

const COLUMN_PATTERNS = {
  date_received: /^(DATE\s+RECEIVED|DATE_RECEIVED)$/i,
  eref: /^EREF$/i,
  our_ref: /^(OUR\s+REF|OUR_REF)$/i,
  query_type: /^QUERY$/i,
  company_name: /^(COMPANY\s+NAME|COMPANY_NAME)$/i,
  date_sent_to_client: /^(DATE\s+SENT|DATE_SENT)$/i,
  action_taken_summary: /^(ACTION\s+TAKEN|ACTION_TAKEN)$/i,
  date_resent_chased: /^(DATE\s+RESENT|DATE_RESENT)$/i
};

const mapHeader = (header) => {
  const normalized = normalizeHeader(header);
  for (const [field, pattern] of Object.entries(COLUMN_PATTERNS)) {
    if (pattern.test(normalized)) return field;
  }
  return null;
};

export default function DBSImportModal({ onClose, onSuccess, isDark }) {
  const [csvData, setCsvData] = useState('');
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState(1);

  const parseData = (text) => {
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];

    // Detect delimiter
    let delimiter = ',';
    if (lines[0].includes('\t')) {
      delimiter = '\t';
    } else if (!lines[0].includes(',')) {
      // Try to detect space-aligned columns (2+ spaces between columns)
      delimiter = null;
    }

    const splitLine = (line) => {
      if (delimiter) {
        return line.split(delimiter).map(v => v.trim().replace(/^"(.*)"$/, '$1'));
      } else {
        // Smart split: split on 2+ consecutive spaces
        return line.split(/\s{2,}/).map(v => v.trim());
      }
    };

    const headerLine = lines[0];
    const headers = splitLine(headerLine);
    const fieldMap = {};
    
    // Map headers to fields
    headers.forEach((header, idx) => {
      const field = mapHeader(header);
      if (field) fieldMap[idx] = field;
    });

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = splitLine(lines[i]);
      const row = {};
      Object.entries(fieldMap).forEach(([idx, field]) => {
        const val = values[idx] || '';
        if (val.trim()) row[field] = val.trim();
      });
      if (Object.keys(row).length > 0) rows.push(row);
    }

    return rows;
  };

  const handlePreview = () => {
    if (!csvData.trim()) return;
    const parsed = parseData(csvData);
    if (parsed.length === 0) {
      alert('No records detected. Please paste from Excel including the header row, or upload/export as CSV.');
      return;
    }
    setPreview(parsed);
    setStep(2);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const user = await base44.auth.me();
      
      // Filter to only rows with all required fields: date_received, eref, our_ref, company_name
      const toCreate = preview
        .filter(row => 
          row.date_received && 
          row.eref && 
          row.our_ref && 
          row.company_name
        )
        .map(row => ({
          ...row,
          source: 'CJSM',
          stage: 'Responded to DBS'
        }));

      if (toCreate.length === 0) {
        alert('No valid records to import. Ensure records have all required fields: Date Received, EREF, Our Ref, and Company Name.');
        setImporting(false);
        return;
      }

      const created = await base44.entities.DBSQueryTracker.bulkCreate(toCreate);

      const auditLogs = created.map(record => ({
        query_id: record.id,
        action_type: 'imported',
        field_changed: 'import',
        old_value: '',
        new_value: 'Record imported from CSV',
        changed_by: user.email
      }));

      if (auditLogs.length > 0) {
        await base44.entities.DBSQueryAuditLog.bulkCreate(auditLogs);
      }

      setStep(3);
    } finally {
      setImporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 90 }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl rounded-xl flex flex-col max-h-[90vh]"
        style={{ zIndex: 100 }}
        style={{
          background: isDark ? '#050816' : '#ffffff',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          boxShadow: isDark
            ? '0 0 40px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.3)'
            : '0 8px 32px rgba(0,0,0,0.08)'
        }}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-6 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
              {step === 1 && 'Import CJSM Data'}
              {step === 2 && 'Preview & Confirm'}
              {step === 3 && 'Import Complete'}
            </h2>
            {step !== 3 && (
              <button onClick={onClose} className="p-1 hover:opacity-70 transition-opacity">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }} className="mb-2 text-sm">
                  Paste your data directly from Excel or as CSV. Make sure to include the header row.
                </p>
                <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} className="mb-4 text-xs">
                  Supports: CSV, tab-separated (Excel), or space-aligned formats. Required fields: Date Received, EREF, Our Ref, Company Name.
                </p>
                <Textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="Paste CSV data or Excel rows here..."
                  rows={10}
                  className="mb-4 text-xs font-mono"
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }} className="mb-4 text-sm">
                  <span className="font-semibold text-green-500">{preview.length} records</span> ready to import. Review the preview:
                </p>
                <div className="max-h-[300px] overflow-y-auto mb-4 p-3 rounded-lg space-y-2" style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                  {preview.map((row, idx) => (
                    <div key={idx} className="p-3 rounded text-xs" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)' }}>
                      <p className="font-semibold mb-1">{row.company_name || 'Unknown'}</p>
                      <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                        EREF: {row.eref}, Our Ref: {row.our_ref}, Query: {row.query_type}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-semibold mb-2" style={{ color: isDark ? '#ffffff' : '#0f0f2e' }}>
                  Import Complete!
                </p>
                <p style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }} className="mb-6">
                  {preview.length} records imported successfully.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 p-6 border-t gap-3 flex" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
          {step === 1 && (
            <>
              <Button onClick={onClose} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handlePreview}
                disabled={!csvData.trim()}
                style={{ background: 'linear-gradient(135deg, #06b6d4, #06b6d488)' }}
                className="flex-1"
              >
                Preview
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button onClick={() => { setStep(1); setPreview([]); }} variant="outline" className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={importing}
                style={{ background: 'linear-gradient(135deg, #ec2ca3, #ec2ca388)' }}
                className="flex-1"
              >
                {importing ? 'Importing...' : 'Import All'}
              </Button>
            </>
          )}
          {step === 3 && (
            <Button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              style={{ background: 'linear-gradient(135deg, #ec2ca3, #ec2ca388)' }}
              className="w-full"
            >
              Done
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}