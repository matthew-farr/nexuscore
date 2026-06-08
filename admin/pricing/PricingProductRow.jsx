import { Pencil, ToggleLeft, ToggleRight } from "lucide-react";

const fmt = (n) => (n != null && isFinite(Number(n))) ? `£${Number(n).toFixed(2)}` : "—";

export default function PricingProductRow({ product, onEdit, onToggle, isDark }) {
  const textColor = isDark ? "rgba(255,255,255,0.82)" : "hsl(230 25% 12%)";
  const dimColor  = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.40)";

  return (
    <tr style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)" }}>
      <td className="py-2.5 px-3">
        <div style={{ fontSize: "13px", fontWeight: 600, color: textColor }}>{product.product_name}</div>
        {product.internal_notes && (
          <div style={{ fontSize: "10px", color: dimColor, marginTop: "2px" }}>{product.internal_notes}</div>
        )}
      </td>
      <td className="py-2.5 px-3">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(139,92,246,0.14)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}
        >
          {product.product_type || "—"}
        </span>
      </td>
      <td className="py-2.5 px-3 text-right" style={{ fontSize: "13px", color: textColor }}>{fmt(product.supplier_cost_ex_vat)}</td>
      <td className="py-2.5 px-3 text-right" style={{ fontSize: "12px", color: dimColor }}>
        {product.supplier_vat_rate != null ? `${(product.supplier_vat_rate * 100).toFixed(0)}%` : "—"}
      </td>
      <td className="py-2.5 px-3 text-right" style={{ fontSize: "13px", color: "#10b981", fontWeight: 600 }}>{fmt(product.default_service_fee_ex_vat)}</td>
      <td className="py-2.5 px-3">
        <button
          onClick={onToggle}
          className="flex items-center gap-1"
          style={{ background: "none", border: "none", cursor: "pointer", color: product.is_active ? "#10b981" : dimColor }}
        >
          {product.is_active
            ? <ToggleRight style={{ width: "18px", height: "18px" }} />
            : <ToggleLeft  style={{ width: "18px", height: "18px" }} />}
          <span style={{ fontSize: "11px", fontWeight: 600 }}>{product.is_active ? "Active" : "Inactive"}</span>
        </button>
      </td>
      <td className="py-2.5 px-3" style={{ fontSize: "10px", color: dimColor, whiteSpace: "nowrap" }}>
        {product.last_updated
          ? new Date(product.last_updated).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })
          : "—"}
        {product.updated_by && (
          <div style={{ fontSize: "9px", opacity: 0.7 }}>{product.updated_by.split("@")[0]}</div>
        )}
      </td>
      <td className="py-2.5 px-3 text-right">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
          style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)", color: dimColor, cursor: "pointer" }}
        >
          <Pencil style={{ width: "11px", height: "11px" }} />
          Edit
        </button>
      </td>
    </tr>
  );
}