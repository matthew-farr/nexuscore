import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Download, RotateCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import * as XLSX from "xlsx";

// ── Column alias maps ─────────────────────────────────────────────────
const PRODUCT_ALIASES = {
  product_name: ["product_name", "producttype", "product type", "product", "product name"],
  supplier_cost_ex_vat: ["supplier_cost_ex_vat", "supplier cost ex vat", "supplier cost exvat", "cost ex vat", "cost exvat", "cost_ex_vat"],
  supplier_vat_rate: ["supplier_vat_rate", "vat rate (0 or 0.20), not the vat value", "vat rate", "vatrate", "vat"],
  cost_inc_vat: ["cost_inc_vat", "cost inc vat", "cost incvat", "costincvat"],
};

const OVERSEAS_ALIASES = {
  country: ["country"],
  financial_integrity_cost: ["financial_integrity_cost", "financial integrity cost", "financial integrity", "fi cost", "fi_cost"],
  criminal_history_cost: ["criminal_history_cost", "criminal history cost", "criminal history", "ch cost", "ch_cost"],
  directorship_cost: ["directorship_cost", "directorship cost", "directorship", "dir cost", "dir_cost"],
};

function normaliseHeader(h) {
  return String(h).toLowerCase().trim().replace(/_/g, " ").replace(/\s+/g, " ");
}

function normaliseProductName(name) {
  return String(name || "").toLowerCase().trim().replace(/[-_\s]+/g, " ");
}

function normaliseCountryName(name) {
  return String(name || "").toLowerCase().trim().replace(/\s+/g, " ");
}

function buildHeaderMap(spreadsheetHeaders, aliasMap) {
  const map = {};
  for (const [internalField, aliases] of Object.entries(aliasMap)) {
    for (const header of spreadsheetHeaders) {
      if (aliases.includes(normaliseHeader(header))) {
        map[internalField] = header;
        break;
      }
    }
  }
  return map;
}

function mapRow(rawRow, headerMap) {
  const out = {};
  for (const [internalField, spreadsheetHeader] of Object.entries(headerMap)) {
    out[internalField] = rawRow[spreadsheetHeader] ?? "";
  }
  return out;
}

function normaliseValue(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (s === "" || s === "-" || s.toLowerCase() === "n/a") return null;
  if (s.toUpperCase() === "CERTN") return "CERTN";
  const cleaned = s.replace(/£/g, "").replace(/,/g, "").trim();
  const n = parseFloat(cleaned);
  if (!isFinite(n)) throw new Error(`Unreadable value: "${s}"`);
  if (n <= 0) return null;
  return n;
}

function safeNormalise(raw) {
  try {
    const v = normaliseValue(raw);
    if (v === "CERTN") return { value: null, certn: true, error: null };
    return { value: v, certn: false, error: null };
  } catch (e) {
    return { value: null, certn: false, error: e.message };
  }
}

function parseFile(file, callback) {
  const reader = new FileReader();
  const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
  reader.onload = (ev) => {
    try {
      if (isExcel) {
        const wb = XLSX.read(ev.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
        callback({ headers, rows });
      } else {
        const text = ev.target.result;
        const lines = text.trim().split(/\r?\n/);
        if (lines.length < 2) { callback({ headers: [], rows: [] }); return; }
        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        const rows = lines.slice(1).map(line => {
          const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
          return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
        });
        callback({ headers, rows });
      }
    } catch (err) {
      callback({ headers: [], rows: [], error: err.message });
    }
  };
  if (isExcel) reader.readAsBinaryString(file);
  else reader.readAsText(file);
}

function validateProductRow(row) {
  const errors = [];
  if (!String(row.product_name || "").trim()) errors.push("Product Name is required");
  return errors;
}

function validateOverseasRow(row) {
  const errors = [];
  const country = String(row.country || "").trim();
  if (!country) errors.push("Country is required");
  for (const field of ["financial_integrity_cost", "criminal_history_cost", "directorship_cost"]) {
    try { normaliseValue(row[field]); } catch (e) { errors.push(`${field}: ${e.message}`); }
  }
  return errors;
}

const PRODUCT_PREVIEW_COLS = [
  { key: "product_name", label: "Product Name" },
  { key: "supplier_cost_ex_vat", label: "Supplier Cost ex VAT" },
  { key: "supplier_vat_rate", label: "Supplier VAT Rate" },
  { key: "cost_inc_vat", label: "Cost inc VAT" },
];

const OVERSEAS_PREVIEW_COLS = [
  { key: "country", label: "Country" },
  { key: "financial_integrity_cost", label: "Financial Integrity" },
  { key: "criminal_history_cost", label: "Criminal History" },
  { key: "directorship_cost", label: "Directorship" },
];

const PRODUCT_REQUIRED = ["product_name"];
const OVERSEAS_REQUIRED = ["country"];

function downloadFailedCsv(failedRows, isProduct) {
  const cols = isProduct
    ? ["row", "product_name", "supplier_cost_ex_vat", "supplier_vat_rate", "cost_inc_vat", "failure_reason"]
    : ["row", "country", "financial_integrity_cost", "criminal_history_cost", "directorship_cost", "failure_reason"];
  const lines = [cols.join(","), ...failedRows.map(r => cols.map(c => {
    const val = r[c] ?? "";
    const s = String(val).replace(/"/g, '""');
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
  }).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `failed_rows_${isProduct ? "products" : "overseas"}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CsvUploadPanel({ type, existingProducts, existingOverseas, onImported, isDark, user }) {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(null);
  const [failedRowsCache, setFailedRowsCache] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showFailures, setShowFailures] = useState(true);
  const fileRef = useRef();

  const isProduct = type === "product";
  const aliasMap = isProduct ? PRODUCT_ALIASES : OVERSEAS_ALIASES;
  const requiredFields = isProduct ? PRODUCT_REQUIRED : OVERSEAS_REQUIRED;
  const previewCols = isProduct ? PRODUCT_PREVIEW_COLS : OVERSEAS_PREVIEW_COLS;

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    parseFile(file, ({ headers, rows, error }) => {
      if (error) { alert(`Failed to read file: ${error}`); return; }
      const headerMap = buildHeaderMap(headers, aliasMap);
      const missingFields = requiredFields.filter(f => !(f in headerMap));
      const mappedRows = rows.map((rawRow, i) => {
        const mapped = mapRow(rawRow, headerMap);
        return {
          mapped,
          index: i + 2,
          errors: isProduct ? validateProductRow(mapped) : validateOverseasRow(mapped),
        };
      });
      setPreview({ mappedRows, headerMap, missingFields });
      setShowPreview(true);
      setResult(null);
    });
    e.target.value = "";
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const retryWithBackoff = async (fn, maxRetries = 3) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (i < maxRetries - 1) {
          const delays = [500, 1500, 3000];
          await sleep(delays[i]);
        }
      }
    }
    throw lastError;
  };

  const doImport = async (rowsToProcess = null) => {
    if (!preview && !rowsToProcess) return;
    const validRows = rowsToProcess || preview.mappedRows.filter(r => r.errors.length === 0);
    const now = new Date().toISOString();
    const updatedBy = user?.email || "";
    const batchSize = 10;
    const batchDelay = 500;

    setImporting(true);
    setProgress({ total: validRows.length, processed: 0, created: 0, updated: 0, retried: 0, failed: 0, currentBatch: 0 });

    let created = 0, updated = 0, retried = 0, failed = 0;
    const newFailedRows = [];

    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      setProgress(p => ({ ...p, currentBatch: batchNum }));

      for (const { mapped, index } of batch) {
        try {
          if (isProduct) {
            const normalisedName = normaliseProductName(mapped.product_name);
            const existing = existingProducts.find(p => normaliseProductName(p.product_name) === normalisedName);
            const costEx = normaliseValue(mapped.supplier_cost_ex_vat);
            const vatRate = (() => {
              const v = normaliseValue(mapped.supplier_vat_rate);
              if (v === null) return 0;
              return v > 1 ? v / 100 : v;
            })();
            const payload = {
              product_name: mapped.product_name,
              supplier_cost_ex_vat: typeof costEx === "number" ? costEx : 0,
              supplier_vat_rate: vatRate,
              is_vatable_product: vatRate > 0,
              is_active: true,
              service_fee_vat_rate: 0.20,
              display_order: existing?.display_order ?? (existingProducts.length + validRows.indexOf(validRows.find(r => r.mapped === mapped)) + 1),
              last_updated: now,
              updated_by: updatedBy,
            };
            if (existing) {
              await retryWithBackoff(() => base44.entities.PricingProduct.update(existing.id, payload));
              updated++;
            } else {
              await retryWithBackoff(() => base44.entities.PricingProduct.create(payload));
              created++;
            }
          } else {
            const normalisedCountry = normaliseCountryName(mapped.country);
            const existing = existingOverseas.find(o => normaliseCountryName(o.country) === normalisedCountry);
            const fi = safeNormalise(mapped.financial_integrity_cost);
            const ch = safeNormalise(mapped.criminal_history_cost);
            const dir = safeNormalise(mapped.directorship_cost);
            const cellErrors = [
              fi.error && `Financial Integrity: ${fi.error}`,
              ch.error && `Criminal History: ${ch.error}`,
              dir.error && `Directorship: ${dir.error}`,
            ].filter(Boolean);
            if (cellErrors.length > 0) {
              newFailedRows.push({
                row: index,
                country: mapped.country,
                financial_integrity_cost: mapped.financial_integrity_cost ?? "",
                criminal_history_cost: mapped.criminal_history_cost ?? "",
                directorship_cost: mapped.directorship_cost ?? "",
                failure_reason: cellErrors.join("; "),
                mapped,
              });
              continue;
            }
            const certnFields = [fi.certn && "Financial Integrity", ch.certn && "Criminal History", dir.certn && "Directorship"].filter(Boolean);
            const existingNotes = existing?.internal_notes || "";
            const certnNote = certnFields.length > 0 ? `CERTN: ${certnFields.join(", ")}` : "";
            const baseNotes = existingNotes.replace(/CERTN:[^\n]*/g, "").trim();
            const internalNotes = [baseNotes, certnNote].filter(Boolean).join("\n").trim();
            const payload = {
              country: mapped.country,
              financial_integrity_cost: fi.value,
              criminal_history_cost: ch.value,
              directorship_cost: dir.value,
              is_certn_fi: fi.certn,
              is_certn_ch: ch.certn,
              is_certn_dir: dir.certn,
              internal_notes: internalNotes,
              is_active: true,
              last_updated: now,
              updated_by: updatedBy,
            };
            if (existing) {
              await retryWithBackoff(() => base44.entities.OverseasPricingRate.update(existing.id, payload));
              updated++;
            } else {
              await retryWithBackoff(() => base44.entities.OverseasPricingRate.create(payload));
              created++;
            }
          }
          setProgress(p => ({ ...p, processed: p.processed + 1, created, updated }));
        } catch (err) {
          failed++;
          retried++;
          newFailedRows.push({
            row: index,
            country: mapped.country ?? mapped.product_name ?? "",
            financial_integrity_cost: mapped.financial_integrity_cost ?? "",
            criminal_history_cost: mapped.criminal_history_cost ?? "",
            directorship_cost: mapped.directorship_cost ?? "",
            product_name: mapped.product_name ?? "",
            supplier_cost_ex_vat: mapped.supplier_cost_ex_vat ?? "",
            supplier_vat_rate: mapped.supplier_vat_rate ?? "",
            cost_inc_vat: mapped.cost_inc_vat ?? "",
            failure_reason: err?.message || "Unknown API error",
            mapped,
          });
          setProgress(p => ({ ...p, processed: p.processed + 1, failed, retried }));
        }
      }

      if (i + batchSize < validRows.length) {
        await sleep(batchDelay);
      }
    }

    setImporting(false);
    setPreview(null);
    setShowPreview(false);
    setShowFailures(true);
    setFailedRowsCache(newFailedRows);
    setResult({ created, updated, retried, failed, failedRows: newFailedRows });
    setProgress(null);
    onImported();
  };

  const surface = { background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", borderRadius: "12px" };
  const dimColor = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";
  const textColor = isDark ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.65)";

  const mappingHint = preview?.headerMap
    ? Object.entries(preview.headerMap)
        .map(([internal, sheet]) => sheet !== internal ? `"${sheet}" → ${internal}` : internal)
        .join(", ")
    : null;

  return (
    <div className="space-y-3">
      <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={() => { setResult(null); fileRef.current.click(); }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
        style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)", color: isDark ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.60)", cursor: "pointer" }}
      >
        <Upload style={{ width: "13px", height: "13px" }} />
        Upload {isProduct ? "Product" : "Overseas"} Pricing (.xlsx or .csv)
      </button>

      <p style={{ fontSize: "10px", color: dimColor, lineHeight: 1.5 }}>
        {isProduct
          ? <>Recognised columns: <span style={{ fontFamily: "monospace" }}>ProductType / Product Name</span>, <span style={{ fontFamily: "monospace" }}>Supplier cost EX VAT</span>, <span style={{ fontFamily: "monospace" }}>VAT rate</span>, <span style={{ fontFamily: "monospace" }}>Cost_Inc_VAT</span>. Column names matched flexibly — no renaming needed.</>
          : <>Recognised columns: <span style={{ fontFamily: "monospace" }}>country</span>, <span style={{ fontFamily: "monospace" }}>financial_integrity_cost</span>, <span style={{ fontFamily: "monospace" }}>criminal_history_cost</span>, <span style={{ fontFamily: "monospace" }}>directorship_cost</span>. Valid cost values: £58.50, 58.50, £0.00, 0, blank, -, CERTN. Blank/zero = Not available (not an error).</>}
      </p>

      {/* Progress during import */}
      {progress && (
        <div className="rounded-xl p-3 space-y-2" style={{ background: "rgba(99,102,241,0.10)", border: "1px solid rgba(99,102,241,0.25)" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#818cf8" }}>
            Importing… Batch {progress.currentBatch} · {progress.processed}/{progress.total} rows
          </div>
          <div style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", borderRadius: "8px", height: "8px", overflow: "hidden" }}>
            <div style={{ background: "#818cf8", height: "100%", width: `${(progress.processed / progress.total) * 100}%`, transition: "width 0.3s" }} />
          </div>
          <div style={{ fontSize: "10px", color: dimColor }}>
            Created: {progress.created} · Updated: {progress.updated} · Failed: {progress.failed}
          </div>
        </div>
      )}

      {/* Import result */}
      {result && (
        <div className="space-y-2">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: result.failed === 0 ? "rgba(16,185,129,0.10)" : "rgba(245,158,11,0.10)",
              border: result.failed === 0 ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(245,158,11,0.25)",
            }}
          >
            {result.failed === 0
              ? <CheckCircle style={{ width: "14px", height: "14px", color: "#10b981", flexShrink: 0 }} />
              : <AlertTriangle style={{ width: "14px", height: "14px", color: "#f59e0b", flexShrink: 0 }} />}
            <span style={{ fontSize: "12px", color: textColor }}>
              Import complete — <strong>{result.created}</strong> created, <strong>{result.updated}</strong> updated, <strong>{result.retried}</strong> retried
              {result.failed > 0 && <>, <strong style={{ color: "#ef4444" }}>{result.failed} failed</strong></>}.
            </span>
          </div>

          {result.failed > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.22)" }}>
              <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid rgba(239,68,68,0.15)" }}>
                <button
                  type="button"
                  className="flex items-center gap-2"
                  onClick={() => setShowFailures(v => !v)}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <AlertTriangle style={{ width: "13px", height: "13px", color: "#ef4444" }} />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#ef4444" }}>
                    {result.failed} failed row{result.failed !== 1 ? "s" : ""} — click to {showFailures ? "hide" : "show"}
                  </span>
                  {showFailures
                    ? <ChevronUp style={{ width: "13px", height: "13px", color: "#ef4444" }} />
                    : <ChevronDown style={{ width: "13px", height: "13px", color: "#ef4444" }} />}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => doImport(failedRowsCache.map(fr => ({ mapped: fr.mapped, index: fr.row, errors: [] })))}
                    disabled={importing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "#818cf8", border: "none", color: "white", cursor: "pointer" }}
                  >
                    <RotateCw style={{ width: "11px", height: "11px" }} />
                    Retry Failed
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadFailedCsv(result.failedRows, isProduct)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.30)", color: "#ef4444", cursor: "pointer" }}
                  >
                    <Download style={{ width: "11px", height: "11px" }} />
                    Download CSV
                  </button>
                </div>
              </div>

              {showFailures && (
                <div className="overflow-x-auto" style={{ maxHeight: "260px", overflowY: "auto" }}>
                  <table className="w-full" style={{ minWidth: isProduct ? "600px" : "720px" }}>
                    <thead>
                      <tr style={{ background: "rgba(239,68,68,0.08)" }}>
                        {[
                          { label: "Row", w: "48px" },
                          { label: isProduct ? "Product Name" : "Country", w: "130px" },
                          ...(isProduct ? [
                            { label: "Cost ex VAT", w: "100px" },
                            { label: "VAT Rate", w: "80px" },
                            { label: "Cost inc VAT", w: "100px" },
                          ] : [
                            { label: "FI Cost", w: "90px" },
                            { label: "CH Cost", w: "90px" },
                            { label: "Dir Cost", w: "90px" },
                          ]),
                          { label: "Failure Reason", w: "auto" },
                        ].map(col => (
                          <th key={col.label} className="px-3 py-2 text-left" style={{ fontSize: "10px", fontWeight: 700, color: "#ef4444", whiteSpace: "nowrap", minWidth: col.w }}>
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.failedRows.map((fr, i) => (
                        <tr key={i} style={{ borderTop: "1px solid rgba(239,68,68,0.10)", background: i % 2 === 0 ? "transparent" : "rgba(239,68,68,0.03)" }}>
                          <td className="px-3 py-2" style={{ fontSize: "11px", color: dimColor }}>{fr.row}</td>
                          <td className="px-3 py-2" style={{ fontSize: "11px", fontWeight: 600, color: textColor, maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {fr.country || fr.product_name || <span style={{ color: dimColor }}>—</span>}
                          </td>
                          {isProduct ? (
                            <>
                              <td className="px-3 py-2" style={{ fontSize: "11px", color: textColor }}>{fr.supplier_cost_ex_vat || "—"}</td>
                              <td className="px-3 py-2" style={{ fontSize: "11px", color: textColor }}>{fr.supplier_vat_rate || "—"}</td>
                              <td className="px-3 py-2" style={{ fontSize: "11px", color: textColor }}>{fr.cost_inc_vat || "—"}</td>
                            </>
                          ) : (
                            <>
                              <td className="px-3 py-2" style={{ fontSize: "11px", color: textColor }}>{String(fr.financial_integrity_cost ?? "") || "—"}</td>
                              <td className="px-3 py-2" style={{ fontSize: "11px", color: textColor }}>{String(fr.criminal_history_cost ?? "") || "—"}</td>
                              <td className="px-3 py-2" style={{ fontSize: "11px", color: textColor }}>{String(fr.directorship_cost ?? "") || "—"}</td>
                            </>
                          )}
                          <td className="px-3 py-2" style={{ fontSize: "11px", color: "#f87171", maxWidth: "220px" }}>
                            {fr.failure_reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="rounded-xl overflow-hidden" style={surface}>
          {preview.missingFields.length > 0 && (
            <div className="flex items-start gap-2 px-3 py-2.5" style={{ background: "rgba(239,68,68,0.10)", borderBottom: "1px solid rgba(239,68,68,0.20)" }}>
              <AlertTriangle style={{ width: "13px", height: "13px", color: "#ef4444", marginTop: "1px", flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: 600 }}>
                  Missing required column: {preview.missingFields.join(", ")}
                </span>
                <p style={{ fontSize: "10px", color: "#f87171", marginTop: "2px" }}>
                  Could not find a matching column for the above field(s) in your file.
                </p>
              </div>
            </div>
          )}

          {mappingHint && (
            <div className="px-3 py-2" style={{ background: "rgba(99,102,241,0.07)", borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: "10px", color: isDark ? "#a5b4fc" : "#4f46e5" }}>
                <strong>Mapped columns:</strong> {mappingHint}
              </p>
            </div>
          )}

          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-2.5"
            onClick={() => setShowPreview(v => !v)}
            style={{ background: "none", border: "none", cursor: "pointer", color: dimColor }}
          >
            <span style={{ fontSize: "12px", fontWeight: 600 }}>
              Preview: {preview.mappedRows.length} rows ({preview.mappedRows.filter(r => r.errors.length === 0).length} valid, {preview.mappedRows.filter(r => r.errors.length > 0).length} with errors)
            </span>
            {showPreview ? <ChevronUp style={{ width: "14px", height: "14px" }} /> : <ChevronDown style={{ width: "14px", height: "14px" }} />}
          </button>

          {showPreview && (
            <div className="overflow-x-auto" style={{ maxHeight: "220px", overflowY: "auto" }}>
              <table className="w-full" style={{ minWidth: "500px" }}>
                <thead>
                  <tr style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}>
                    <th className="px-3 py-2 text-left" style={{ fontSize: "10px", fontWeight: 700, color: dimColor }}>Row</th>
                    {previewCols.map(col => (
                      <th key={col.key} className="px-3 py-2 text-left" style={{ fontSize: "10px", fontWeight: 700, color: dimColor }}>{col.label}</th>
                    ))}
                    <th className="px-3 py-2 text-left" style={{ fontSize: "10px", fontWeight: 700, color: dimColor }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.mappedRows.map(({ mapped, index, errors }) => (
                    <tr key={index} style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.04)", background: errors.length > 0 ? "rgba(239,68,68,0.05)" : "transparent" }}>
                      <td className="px-3 py-1.5" style={{ fontSize: "11px", color: dimColor }}>{index}</td>
                      {previewCols.map(col => (
                        <td key={col.key} className="px-3 py-1.5" style={{ fontSize: "11px", color: textColor, maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {mapped[col.key] !== undefined && mapped[col.key] !== "" ? String(mapped[col.key]) : <span style={{ color: dimColor }}>—</span>}
                        </td>
                      ))}
                      <td className="px-3 py-1.5">
                        {errors.length === 0
                          ? <span style={{ fontSize: "10px", color: "#10b981", fontWeight: 600 }}>✓ Valid</span>
                          : <span style={{ fontSize: "10px", color: "#ef4444" }}>{errors[0]}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {preview.missingFields.length === 0 && (
            <div className="px-4 py-3 flex items-center gap-3" style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
              <button
                type="button"
                onClick={() => doImport()}
                disabled={importing || preview.mappedRows.filter(r => r.errors.length === 0).length === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", border: "none", cursor: "pointer", opacity: importing ? 0.7 : 1 }}
              >
                {importing ? "Importing…" : `Import ${preview.mappedRows.filter(r => r.errors.length === 0).length} valid rows`}
              </button>
              <button type="button" onClick={() => { setPreview(null); setShowPreview(false); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: dimColor, fontSize: "12px" }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}