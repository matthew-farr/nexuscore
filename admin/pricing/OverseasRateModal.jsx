import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EMPTY = { country: "", financial_integrity_cost: "", criminal_history_cost: "", directorship_cost: "", vat_rate: 0.20, is_active: true, internal_notes: "" };

export default function OverseasRateModal({ rate, onClose, onSaved, isDark, user }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!rate) { setForm(EMPTY); return; }
    // Coerce null numeric fields to "" so inputs render as blank (not "null")
    setForm({
      ...EMPTY,
      ...rate,
      financial_integrity_cost: rate.financial_integrity_cost ?? "",
      criminal_history_cost:    rate.criminal_history_cost    ?? "",
      directorship_cost:        rate.directorship_cost        ?? "",
    });
  }, [rate]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.country) return;
    setSaving(true);
    const payload = {
      ...form,
      financial_integrity_cost: form.financial_integrity_cost !== "" ? parseFloat(form.financial_integrity_cost) : null,
      criminal_history_cost:    form.criminal_history_cost    !== "" ? parseFloat(form.criminal_history_cost)    : null,
      directorship_cost:        form.directorship_cost        !== "" ? parseFloat(form.directorship_cost)        : null,
      vat_rate:   parseFloat(form.vat_rate) || 0.20,
      last_updated: new Date().toISOString(),
      updated_by: user?.email || "",
    };
    if (rate?.id) await base44.entities.OverseasPricingRate.update(rate.id, payload);
    else await base44.entities.OverseasPricingRate.create(payload);
    setSaving(false);
    onSaved();
  };

  const bg = isDark ? "#080e20" : "#ffffff";
  const inputS = { width: "100%", height: "34px", borderRadius: "8px", padding: "0 10px", fontSize: "12px", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)", color: isDark ? "rgba(255,255,255,0.88)" : "hsl(230 25% 12%)", outline: "none" };
  const lbl = { fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", display: "block", marginBottom: "4px" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.60)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div className="relative w-full max-w-md rounded-2xl" style={{ background: bg, border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)", boxShadow: "0 24px 64px rgba(0,0,0,0.45)" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)" }}>
          <span className="text-sm font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.88)" : "hsl(230 25% 12%)" }}>{rate?.id ? "Edit Country Rate" : "Add Country Rate"}</span>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.40)" }}><X style={{ width: "16px", height: "16px" }} /></button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label style={lbl}>Country *</label>
            <input type="text" value={form.country} onChange={e => set("country", e.target.value)} placeholder="e.g. Australia" style={inputS} />
          </div>
          <div>
            <label style={lbl}>Financial Integrity (£ ex VAT)</label>
            <input type="number" min="0" step="0.01" value={form.financial_integrity_cost} onChange={e => set("financial_integrity_cost", e.target.value)} placeholder="Leave blank = N/A" style={inputS} />
          </div>
          <div>
            <label style={lbl}>Criminal History (£ ex VAT)</label>
            <input type="number" min="0" step="0.01" value={form.criminal_history_cost} onChange={e => set("criminal_history_cost", e.target.value)} placeholder="Leave blank = N/A" style={inputS} />
          </div>
          <div>
            <label style={lbl}>Directorship (£ ex VAT)</label>
            <input type="number" min="0" step="0.01" value={form.directorship_cost} onChange={e => set("directorship_cost", e.target.value)} placeholder="Leave blank = N/A" style={inputS} />
          </div>
          <div>
            <label style={lbl}>VAT Rate</label>
            <select value={form.vat_rate} onChange={e => set("vat_rate", parseFloat(e.target.value))} style={inputS}>
              <option value={0.20}>20%</option>
              <option value={0}>0% (Exempt)</option>
            </select>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" checked={!!form.is_active} onChange={e => set("is_active", e.target.checked)} id="overseas-active" />
            <label htmlFor="overseas-active" style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.60)", cursor: "pointer" }}>Active (show in calculator)</label>
          </div>
          <div className="col-span-2">
            <label style={lbl}>Internal Notes</label>
            <textarea value={form.internal_notes} onChange={e => set("internal_notes", e.target.value)} rows={2} placeholder="Admin notes only" style={{ ...inputS, height: "auto", padding: "8px 10px", resize: "vertical" }} />
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 text-xs font-semibold rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", color: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.45)", cursor: "pointer" }}>Cancel</button>
          <button type="button" onClick={save} disabled={saving || !form.country} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-xl text-white" style={{ background: "linear-gradient(135deg, #06b6d4, #0ea5e9)", border: "none", cursor: form.country ? "pointer" : "not-allowed", opacity: form.country ? 1 : 0.5 }}>
            <Save style={{ width: "12px", height: "12px" }} />
            {saving ? "Saving…" : "Save Rate"}
          </button>
        </div>
      </div>
    </div>
  );
}