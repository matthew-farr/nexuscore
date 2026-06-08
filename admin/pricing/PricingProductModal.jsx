import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PRODUCT_TYPES = ["DBS", "Digital ID", "Right to Work", "Overseas", "Referencing", "Training", "AML", "Other"];

const EMPTY = {
  product_name: "", product_category: "", product_type: "DBS",
  supplier_cost_ex_vat: "", supplier_vat_rate: 0, default_service_fee_ex_vat: 0,
  service_fee_vat_rate: 0.20, is_vatable_product: false, is_active: true,
  display_order: 0, internal_notes: "",
};

export default function PricingProductModal({ product, onClose, onSaved, isDark, user }) {
  const [form, setForm]   = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(product ? { ...EMPTY, ...product } : EMPTY);
  }, [product]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.product_name) return;
    setSaving(true);
    const payload = {
      ...form,
      supplier_cost_ex_vat:      parseFloat(form.supplier_cost_ex_vat) || 0,
      supplier_vat_rate:         parseFloat(form.supplier_vat_rate) || 0,
      default_service_fee_ex_vat: parseFloat(form.default_service_fee_ex_vat) || 0,
      service_fee_vat_rate:      parseFloat(form.service_fee_vat_rate) || 0.20,
      display_order:             parseInt(form.display_order) || 0,
      last_updated:              new Date().toISOString(),
      updated_by:                user?.email || "",
    };
    if (product?.id) {
      await base44.entities.PricingProduct.update(product.id, payload);
    } else {
      await base44.entities.PricingProduct.create(payload);
    }
    setSaving(false);
    onSaved();
  };

  const bg    = isDark ? "#080e20" : "#ffffff";
  const inputS = {
    width: "100%", height: "34px", borderRadius: "8px", padding: "0 10px", fontSize: "12px",
    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
    color: isDark ? "rgba(255,255,255,0.88)" : "hsl(230 25% 12%)", outline: "none",
  };
  const lbl = { fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", display: "block", marginBottom: "4px" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.60)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: bg, border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)", boxShadow: "0 24px 64px rgba(0,0,0,0.45)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sticky top-0" style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)", background: bg, zIndex: 10 }}>
          <span className="text-sm font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.88)" : "hsl(230 25% 12%)" }}>
            {product?.id ? "Edit Product" : "Add Product"}
          </span>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.40)" }}>
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label style={lbl}>Product Name *</label>
            <input type="text" value={form.product_name} onChange={e => set("product_name", e.target.value)} placeholder="e.g. Enhanced DBS Check" style={inputS} />
          </div>
          <div>
            <label style={lbl}>Product Type</label>
            <select value={form.product_type} onChange={e => set("product_type", e.target.value)} style={inputS}>
              {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Category (optional)</label>
            <input type="text" value={form.product_category} onChange={e => set("product_category", e.target.value)} placeholder="e.g. Standard" style={inputS} />
          </div>
          <div>
            <label style={lbl}>Supplier Cost ex VAT (£)</label>
            <input type="number" min="0" step="0.01" value={form.supplier_cost_ex_vat} onChange={e => set("supplier_cost_ex_vat", e.target.value)} placeholder="0.00" style={inputS} />
          </div>
          <div>
            <label style={lbl}>Supplier VAT Rate</label>
            <select value={form.supplier_vat_rate} onChange={e => set("supplier_vat_rate", parseFloat(e.target.value))} style={inputS}>
              <option value={0}>0% (Exempt)</option>
              <option value={0.05}>5%</option>
              <option value={0.20}>20%</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Default Service Fee ex VAT (£)</label>
            <input type="number" min="0" step="0.01" value={form.default_service_fee_ex_vat} onChange={e => set("default_service_fee_ex_vat", e.target.value)} placeholder="0.00" style={inputS} />
          </div>
          <div>
            <label style={lbl}>Service Fee VAT Rate</label>
            <select value={form.service_fee_vat_rate} onChange={e => set("service_fee_vat_rate", parseFloat(e.target.value))} style={inputS}>
              <option value={0.20}>20% (Standard)</option>
              <option value={0}>0% (Exempt)</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Display Order</label>
            <input type="number" min="0" value={form.display_order} onChange={e => set("display_order", e.target.value)} style={inputS} />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!form.is_active} onChange={e => set("is_active", e.target.checked)} />
              <span style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.60)" }}>Active (visible in calculator)</span>
            </label>
          </div>
          <div className="col-span-2">
            <label style={lbl}>Internal Notes</label>
            <textarea value={form.internal_notes} onChange={e => set("internal_notes", e.target.value)} placeholder="Admin notes only — not shown to sales staff" rows={2} style={{ ...inputS, height: "auto", padding: "8px 10px", resize: "vertical" }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 text-xs font-semibold rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", color: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.45)", cursor: "pointer" }}>
            Cancel
          </button>
          <button type="button" onClick={save} disabled={saving || !form.product_name} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-xl text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", border: "none", cursor: form.product_name ? "pointer" : "not-allowed", opacity: form.product_name ? 1 : 0.5 }}>
            <Save style={{ width: "12px", height: "12px" }} />
            {saving ? "Saving…" : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
}