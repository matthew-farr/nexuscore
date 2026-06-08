import { useState, useEffect, useRef } from "react";
import { Upload, Eye, Trash2, Check, AlertTriangle, Code } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function TemplateManager({ isDark, user }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateNotes, setTemplateNotes] = useState("");
  const [previewId, setPreviewId] = useState(null);
  const [previewMode, setPreviewMode] = useState("code"); // "code" or "rendered"
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.PriceListTemplate.list("uploaded_date", 100);
    setTemplates(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".html") && !file.name.endsWith(".htm")) {
      setUploadError("Only .html or .htm files are accepted");
      setUploadSuccess(false);
      e.target.value = "";
      return;
    }

    if (!templateName.trim()) {
      setUploadError("Please enter a template name");
      setUploadSuccess(false);
      e.target.value = "";
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadSuccess(false);

    try {
      // Upload HTML file to storage
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const payload = {
        name: templateName,
        html_file_url: file_url,
        preview_note: templateNotes,
        created_by: user?.email || "",
        uploaded_date: new Date().toISOString(),
        is_active: templates.length === 0, // Auto-activate if first template
      };
      await base44.entities.PriceListTemplate.create(payload);
      setUploadSuccess(true);
      setTemplateName("");
      setTemplateNotes("");
      setTimeout(() => setUploadSuccess(false), 3000);
      load();
    } catch (err) {
      setUploadError(`Upload failed: ${err.message}`);
    }
    setUploading(false);
    e.target.value = "";
  };

  const activateTemplate = async (id) => {
    try {
      // Deactivate all
      for (const t of templates) {
        if (t.is_active) {
          await base44.entities.PriceListTemplate.update(t.id, { is_active: false });
        }
      }
      // Activate selected
      await base44.entities.PriceListTemplate.update(id, { is_active: true });
      load();
    } catch (err) {
      alert(`Activation failed: ${err.message}`);
    }
  };

  const deleteTemplate = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await base44.entities.PriceListTemplate.delete(id);
      load();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const bg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)";
  const border = isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)";
  const textColor = isDark ? "rgba(255,255,255,0.88)" : "hsl(230 25% 12%)";
  const dimColor = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";
  const inputStyle = {
    width: "100%",
    height: "36px",
    borderRadius: "9px",
    padding: "0 12px",
    fontSize: "13px",
    background: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
    border: isDark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(0,0,0,0.09)",
    color: textColor,
    outline: "none",
  };

  const activeTemplate = templates.find(t => t.is_active);

  return (
    <div className="space-y-4">
      {/* Active template alert */}
      {!activeTemplate && (
        <div className="flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <AlertTriangle style={{ width: "13px", height: "13px", color: "#f59e0b", flexShrink: 0, marginTop: "1px" }} />
          <p style={{ fontSize: "11px", color: isDark ? "rgba(255,255,255,0.60)" : "rgba(0,0,0,0.58)" }}>
            <strong style={{ color: "#f59e0b" }}>No active template.</strong> The PDF will use the built-in basic template. Upload and activate an HTML template to use custom branding.
          </p>
        </div>
      )}

      {/* Upload section */}
      <div className="rounded-xl p-4" style={{ background: bg, border }}>
        <p style={{ fontSize: "12px", fontWeight: 600, color: textColor, marginBottom: "12px" }}>Upload PDF Template</p>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Template name (e.g. 'Default Branding Q2 2026')"
            value={templateName}
            onChange={e => { setTemplateName(e.target.value); setUploadError(""); }}
            style={inputStyle}
          />
          <textarea
            placeholder="Optional notes (admin only)"
            value={templateNotes}
            onChange={e => setTemplateNotes(e.target.value)}
            style={{ ...inputStyle, height: "60px", resize: "none" }}
          />

          {uploadSuccess && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.30)" }}>
              <Check style={{ width: "14px", height: "14px", color: "#10b981" }} />
              <p style={{ fontSize: "12px", color: "#10b981", fontWeight: 600 }}>✓ Template uploaded and activated</p>
            </div>
          )}

          {uploadError && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.30)" }}>
              <AlertTriangle style={{ width: "14px", height: "14px", color: "#ef4444" }} />
              <p style={{ fontSize: "12px", color: "#ef4444" }}>{uploadError}</p>
            </div>
          )}

          <input ref={fileRef} type="file" accept=".html,.htm" style={{ display: "none" }} onChange={handleFileSelect} />
          <button
            type="button"
            onClick={() => {
              if (fileRef.current && !uploading && templateName.trim()) {
                fileRef.current.click();
              }
            }}
            disabled={uploading || !templateName.trim()}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
            style={{
              background: uploading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              border: "none",
              cursor: uploading || !templateName.trim() ? "not-allowed" : "pointer",
              opacity: uploading || !templateName.trim() ? 0.6 : 1,
              transition: "all 0.2s",
            }}
          >
            <Upload style={{ width: "13px", height: "13px" }} />
            {uploading ? "Uploading…" : "Choose HTML File"}
          </button>

          <div style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)", borderRadius: "9px", padding: "10px", fontSize: "10px", color: dimColor, lineHeight: 1.6 }}>
            <p style={{ fontWeight: 600, marginBottom: "6px", color: textColor }}>Placeholder Reference:</p>
            <code style={{ fontFamily: "monospace", fontSize: "9px", display: "block", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {"{{customer_name}} {{company_name}} {{issued_date}}\n{{valid_until}} {{prepared_by}} {{account_manager_name}}\n{{total_ex_vat}} {{vat}} {{total_inc_vat}}\n{{customer_notes}} {{internal_notes}}"}
            </code>
            <p style={{ marginTop: "6px" }}>Wrap product rows with <span style={{ fontFamily: "monospace" }}>{"<!-- BEGIN_PRICE_LINES -->"}</span> and <span style={{ fontFamily: "monospace" }}>{"<!-- END_PRICE_LINES -->"}</span> to iterate line items.</p>
          </div>
        </div>
      </div>

      {/* Templates list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-xl py-8 text-center" style={{ background: bg, border }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: dimColor }}>No templates uploaded</p>
          <p style={{ fontSize: "11px", color: dimColor, marginTop: "4px" }}>Upload an HTML template above to get started</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: bg, border }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: "500px" }}>
              <thead>
                <tr style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderBottom: border }}>
                  <th className="px-3 py-2.5 text-left" style={{ fontSize: "10px", fontWeight: 700, color: dimColor }}>Name</th>
                  <th className="px-3 py-2.5 text-left" style={{ fontSize: "10px", fontWeight: 700, color: dimColor }}>Status</th>
                  <th className="px-3 py-2.5 text-left" style={{ fontSize: "10px", fontWeight: 700, color: dimColor }}>Uploaded</th>
                  <th className="px-3 py-2.5 text-center" style={{ fontSize: "10px", fontWeight: 700, color: dimColor }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(t => (
                  <tr key={t.id} style={{ borderBottom: border }}>
                    <td className="px-3 py-2.5" style={{ fontSize: "12px", fontWeight: 600, color: textColor }}>{t.name}</td>
                    <td className="px-3 py-2.5">
                      {t.is_active ? (
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Check style={{ width: "12px", height: "12px" }} /> Active
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", color: dimColor }}>Inactive</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5" style={{ fontSize: "11px", color: dimColor }}>
                      {new Date(t.uploaded_date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-3 py-2.5 text-center space-x-1">
                      <button
                        type="button"
                        onClick={() => setPreviewId(previewId === t.id ? null : t.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg"
                        style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", border: "1px solid " + (isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)"), color: dimColor, cursor: "pointer" }}
                      >
                        <Eye style={{ width: "11px", height: "11px" }} /> Preview
                      </button>
                      {!t.is_active && (
                        <button
                          type="button"
                          onClick={() => activateTemplate(t.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg"
                          style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.30)", color: "#10b981", cursor: "pointer" }}
                        >
                          Activate
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteTemplate(t.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg"
                        style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.30)", color: "#ef4444", cursor: "pointer" }}
                      >
                        <Trash2 style={{ width: "11px", height: "11px" }} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }} onClick={() => setPreviewId(null)}>
          <div
            className="relative w-full rounded-2xl overflow-hidden flex flex-col"
            style={{
              maxWidth: "900px",
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.10)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.40)",
              maxHeight: "90vh",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.10)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#000" }}>Template Preview: {templates.find(t => t.id === previewId)?.name}</h3>
                <p style={{ fontSize: "11px", color: "rgba(0,0,0,0.50)", marginTop: "2px" }}>
                  {previewMode === "code" ? "Raw HTML content" : "Rendered preview with sample data"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewMode("code")}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    background: previewMode === "code" ? "rgba(0,0,0,0.08)" : "transparent",
                    border: previewMode === "code" ? "1px solid rgba(0,0,0,0.12)" : "1px solid transparent",
                    color: "#000",
                    cursor: "pointer",
                  }}
                >
                  <Code style={{ width: "12px", height: "12px" }} /> Code
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("rendered")}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    background: previewMode === "rendered" ? "rgba(0,0,0,0.08)" : "transparent",
                    border: previewMode === "rendered" ? "1px solid rgba(0,0,0,0.12)" : "1px solid transparent",
                    color: "#000",
                    cursor: "pointer",
                  }}
                >
                  <Eye style={{ width: "12px", height: "12px" }} /> Preview
                </button>
              </div>
            </div>
            <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
              {previewMode === "code" ? (
                <pre style={{
                  background: "rgba(0,0,0,0.03)",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "#000",
                  overflow: "auto",
                  maxHeight: "400px",
                  lineHeight: 1.4,
                }}>
                  {templates.find(t => t.id === previewId)?.html_file_url ? "[HTML file stored in cloud storage]" : "[Legacy template - no file]"}
                </pre>
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                  <p>HTML file preview would render here when file is loaded from cloud storage.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}