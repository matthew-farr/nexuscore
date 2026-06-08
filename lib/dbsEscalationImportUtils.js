import { base44 } from '@/api/base44Client';
import * as XLSX from 'xlsx';

// Column name mappings to normalize friendly headers from the weekly export spreadsheet
const COLUMN_MAPPINGS = {
  // TrackingCode = ERef (primary identifier)
  eref: ['trackingcode', 'tracking code', 'tracking_code', 'eref', 'e-ref', 'external reference', 'tracking'],
  // SubmitDate = DBS Submitted Date
  dbs_submitted_date: ['submitdate', 'submit date', 'dbs submitted date', 'submitted date', 'dbs_submitted_date'],
  // CompanyId MUST come before CompanyName so exact match on 'companyid' wins
  company_id: ['companyid', 'company id', 'company_id', 'clientid', 'client id', 'client_id'],
  // CompanyName
  company: ['companyname', 'company name', 'company_name', 'clientname', 'client name', 'client_name'],
  // Surname only (not Forename)
  surname: ['surname', 'last name', 'lastname', 'last_name'],
  // ApplicationRef = Application Ref
  application_ref: ['applicationref', 'application ref', 'application reference', 'application_ref'],
  // EscalationDate = Escalated Date
  escalated_date: ['escalationdate', 'escalation date', 'escalated date', 'date escalated', 'escalated_date'],
  // Status
  status: ['status', 'current status'],
  // Police details (local police force)
  police_details: ['police details', 'police force', 'local police force', 'police_details', 'lpf'],
  // Account Manager / Consultant
  account_manager: ['accountmanager', 'account manager', 'account_manager', 'consultant', 'agent', 'assigned agent'],
  // Escalated Agent
  escalated_agent: ['escalatedagent', 'escalated agent', 'escalated_agent', 'assigned escalated agent']
};

const VALID_STATUSES = [
  'LPF DETAILS',
  'WITHDRAWN',
  'ESCALATED',
  'DUE TO BE ESCALATED',
  'UNABLE TO ESCALATE ONLINE',
  'CJSM',
  'INTERNAL QUERY - INCONFLICT'
];

// Full list of police forces (stored as-is)
export const POLICE_FORCE_OPTIONS = [
  'Hampshire and Isle of Wight',
  'Sussex',
  'Kent',
  'North Wales',
  'Derbyshire',
  'Dyfed-Powys',
  'Northumbria',
  'West Yorkshire',
  'Lancashire',
  'Royal Military',
  'Essex',
  'Wiltshire',
  'Thames Valley',
  'MET',
  'GWENT',
  'Avon and Somerset',
  'Greater Manchester',
  'Dorset',
  'Cumbria',
  'Northamptonshire',
  'West Midlands',
  'South Wales Police',
  'Surrey',
  'Central (police Scotland)',
  'Lothian And Borders (police Scotland)',
  'Cambridgeshire',
  'Cleveland',
  'Durham',
  'Gloucester'
];

// Parse file content (CSV or XLSX)
export async function parseFile(file) {
  if (file.name.endsWith('.csv')) {
    const content = await file.text();
    return parseCSV(content);
  } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    return parseXLSX(file);
  } else {
    throw new Error('Unsupported file format. Please use CSV or XLSX.');
  }
}

// Parse CSV content
export function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  const rows = lines.slice(1).map((line, idx) => {
    const values = parseCSVLine(line);
    return { values, rowNum: idx + 2 };
  });

  return { headers, rows };
}

// Parse a single CSV line (handles quoted values)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Parse XLSX content
export async function parseXLSX(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (rawData.length === 0) {
          resolve({ headers: [], rows: [] });
          return;
        }

        const headers = (rawData[0] || []).map(h => (h || '').toString().toLowerCase().trim());
        const rows = rawData.slice(1).map((row, idx) => {
          const values = (row || []).map(v => (v || '').toString());
          return { values, rowNum: idx + 2 };
        });

        resolve({ headers, rows });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// Map CSV headers to schema field names
export function mapHeaders(csvHeaders) {
  const mapping = {};
  const unmappedHeaders = [];

  csvHeaders.forEach((header, idx) => {
    let mapped = false;
    const normalised = header.toLowerCase().replace(/\s+/g, '');
    // First pass: exact match only
    for (const [fieldName, variants] of Object.entries(COLUMN_MAPPINGS)) {
      if (variants.some(v => v.toLowerCase().replace(/\s+/g, '') === normalised)) {
        mapping[fieldName] = idx;
        mapped = true;
        break;
      }
    }
    // Second pass: substring match (only if no exact match found)
    if (!mapped) {
      for (const [fieldName, variants] of Object.entries(COLUMN_MAPPINGS)) {
        if (mapping[fieldName] !== undefined) continue; // already mapped
        if (variants.some(v => {
          const vn = v.toLowerCase().replace(/\s+/g, '');
          return normalised.includes(vn) || vn.includes(normalised);
        })) {
          mapping[fieldName] = idx;
          mapped = true;
          break;
        }
      }
    }
    if (!mapped) {
      unmappedHeaders.push(header);
    }
  });

  return { mapping, unmappedHeaders };
}

// Parse UK date formats (including Excel serial numbers)
function parseUKDate(dateStr) {
  if (!dateStr || !dateStr.trim()) return null;

  const str = dateStr.trim();

  // Excel serial number (number-only string)
  if (/^\d{5}$/.test(str)) {
    const serial = parseInt(str, 10);
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + serial * 86400000);
    if (!isNaN(date)) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const date = new Date(str + 'T00:00:00Z');
    if (!isNaN(date)) return str;
  }

  // dd/mm/yyyy or d/m/yyyy
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(str)) {
    const parts = str.split(/[/-]/);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      const date = new Date(year, month - 1, day);
      if (date.getDate() === day) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
    }
  }

  return null;
}

// Normalize status to valid enum
function normalizeStatus(status) {
  if (!status || !status.trim()) return 'DUE TO BE ESCALATED';
  const upper = status.trim().toUpperCase();
  return VALID_STATUSES.includes(upper) ? upper : null;
}

// Normalize police details — accept any non-empty string (free text / force name)
function normalizePoliceDetails(value) {
  if (!value || !value.trim()) return '';
  return value.trim();
}

// Convert row values to record object
export function rowToRecord(rowValues, mapping, mode = 'create') {
  const record = {};

  const getValueByField = (field) => {
    const idx = mapping[field];
    return idx !== undefined && idx < rowValues.length ? rowValues[idx].trim() : '';
  };

  record.eref = (getValueByField('eref') || '').trim().toUpperCase();
  record.dbs_submitted_date = parseUKDate(getValueByField('dbs_submitted_date')) || null;
  record.company = (getValueByField('company') || '').trim() || null;
  record.company_id = (getValueByField('company_id') || '').trim() || null;
  record.surname = (getValueByField('surname') || '').trim() || null;
  record.application_ref = (getValueByField('application_ref') || '').trim() || null;
  record.escalated_date = parseUKDate(getValueByField('escalated_date')) || null;
  record.status = normalizeStatus(getValueByField('status'));
  record.police_details = normalizePoliceDetails(getValueByField('police_details'));
  record.account_manager = (getValueByField('account_manager') || '').trim() || null;
  record.escalated_agent = (getValueByField('escalated_agent') || '').trim() || null;

  // For upsert mode, track which fields are populated in the source
  if (mode === 'upsert') {
    record._sourceFields = Object.keys(record).filter(k => {
      const val = record[k];
      return val !== null && val !== '' && val !== undefined;
    });
  }

  return record;
}

// Prepare record for upsert update (only populated fields)
export function prepareUpsertUpdate(sourceRecord, existingRecord) {
  const update = {};

  (sourceRecord._sourceFields || []).forEach(field => {
    if (field === 'eref' || field === '_sourceFields') return;
    const sourceVal = sourceRecord[field];
    const existingVal = existingRecord[field];

    if (sourceVal !== existingVal) {
      update[field] = sourceVal;
    }
  });

  return update;
}

// Validate a single record
export function validateRecord(record, rowNum) {
  const errors = [];

  if (!record.eref) {
    errors.push('Missing ERef');
  }

  return {
    valid: errors.length === 0,
    errors,
    rowNum
  };
}

// Detect duplicates in file
export function detectFileDuplicates(records) {
  const seen = new Set();
  const duplicates = [];

  records.forEach(r => {
    if (r.valid && r.record.eref) {
      if (seen.has(r.record.eref)) {
        duplicates.push({ eref: r.record.eref, rowNum: r.rowNum });
      } else {
        seen.add(r.record.eref);
      }
    }
  });

  return duplicates;
}

// Get unique valid ERefs for existing DB check
export function getUniqueERefs(records) {
  const seen = new Set();
  const erefs = [];

  records.forEach(r => {
    if (r.valid && r.record.eref && !seen.has(r.record.eref)) {
      erefs.push(r.record.eref);
      seen.add(r.record.eref);
    }
  });

  return erefs;
}

// Download template CSV matching the weekly export format
export function downloadTemplate() {
  const headers = ['TrackingCode', 'SubmitDate', 'CompanyName', 'CompanyId', 'Surname', 'ApplicationRef', 'EscalationDate', 'Status', 'PoliceDetails', 'AccountManager', 'EscalatedAgent'];
  const example = ['E123456789', '01/05/2026', 'ACME Corp', 'C001', 'Smith', 'APP-123', '', 'DUE TO BE ESCALATED', 'Hampshire and Isle of Wight', 'Matthew Farr', 'Jane Smith'];

  const csv = [headers.join(','), example.join(',')].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dbs_escalations_template.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

// Get existing records by ERefs (returns map)
export async function getExistingRecordsByERefs(erefs) {
  const map = new Map();
  if (erefs.length === 0) return map;

  const chunks = [];
  for (let i = 0; i < erefs.length; i += 50) {
    chunks.push(erefs.slice(i, i + 50));
  }

  const existingRecords = await Promise.all(
    chunks.map(chunk => base44.entities.DBSEscalation.filter({ eref: chunk }, '', 1000))
  );

  existingRecords.flat().forEach(r => map.set(r.eref, r));
  return map;
}