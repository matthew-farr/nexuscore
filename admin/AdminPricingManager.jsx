import { useState, useEffect } from "react";
import { Plus, Search, Globe, Package, RefreshCw, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/lib/AuthContext";
import PricingProductRow from "./pricing/PricingProductRow";
import PricingProductModal from "./pricing/PricingProductModal";
import OverseasRateModal from "./pricing/OverseasRateModal";
import CsvUploadPanel from "./pricing/CsvUploadPanel";
import TemplateManager from "./pricing/TemplateManager";

const TABS = [
  { key: "products", label: "Products", icon: Package },
  { key: "overseas",  label: "Overseas Rates", icon: Globe },
  { key: "templates", label: "PDF Templates", icon: FileText },
];

const fmt = (n) => (n != null && isFinite(Number(n)) && Number(n) !== 0) ? `£${Number(n).toFixed(2)}` : "—";

export default function AdminPricingManager() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();

  const [activeTab,     setActiveTab]     = useState("products");
  const [products,      setProducts]      = useState([]);
  const [overseas,      setOverseas]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [editProduct,   setEditProduct]   = useState(null);   // null=closed, {}=new, {id,...}=edit
  const [editOverseas,  setEditOverseas]  = useState(null);
  const [showUpload,    setShowUpload]    = useState(false);

  const load = async () => {
    setLoading(true);
    const [prods, overs] = await Promise.all([
      base44.entities.PricingProduct.list("display_order", 500),
      base44.entities.OverseasPricingRate.list("country", 500),
    ]);
    setProducts(prods);
    setOverseas(overs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (p) => {
    await base44.entities.PricingProduct.update(p.id, { is_active: !p.is_active, last_updated: new Date().toISOString(), updated_by: user?.email || "" });
    load();
  };

  const toggleOverseasActive = async (o) => {
    await base44.entities.OverseasPricingRate.update(o.id, { is_active: !o.is_active, last_updated: new Date().toISOString(), updated_by: user?.email || "" });
    load();
  };

  const deleteAllProducts = async () => {
    if (!window.confirm("⚠️ Delete ALL product pricing records? This cannot be undone.")) return;
    if (!window.confirm("Are you absolutely sure? This will remove all pricing data.")) return;
    try {
      const allProducts = await base44.entities.PricingProduct.list("id", 1000);
      for (const p of allProducts) {
        await base44.entities.PricingProduct.delete(p.id);
      }
      load();
      alert(`✓ Deleted ${allProducts.length} product records`);
    } catch (err) {
      alert(`❌ Delete failed: ${err.message}`);
    }
  };

  const deleteAllOverseas = async () => {
    if (!window.confirm("⚠️ Delete ALL overseas pricing records? This cannot be undone.")) return;
    if (!window.confirm("Are you absolutely sure? This will remove all pricing data.")) return;
    try {
      const allOverseas = await base44.entities.OverseasPricingRate.list("id", 1000);
      for (const o of allOverseas) {
        await base44.entities.OverseasPricingRate.delete(o.id);
      }
      load();
      alert(`✓ Deleted ${allOverseas.length} overseas records`);
    } catch (err) {
      alert(`❌ Delete failed: ${err.message}`);
    }
  };

  const removeDuplicateProducts = async () => {
    if (!window.confirm("Remove duplicate product names? Keep newest record per name.")) return;
    try {
      const normalisedMap = {};
      const toDelete = [];
      for (const p of products) {
        const norm = String(p.product_name || "").toLowerCase().trim().replace(/[-_\s]+/g, " ");
        if (!normalisedMap[norm]) {
          normalisedMap[norm] = p;
        } else {
          const existing = normalisedMap[norm];
          const pDate = new Date(p.last_updated || p.created_date).getTime();
          const existingDate = new Date(existing.last_updated || existing.created_date).getTime();
          if (pDate > existingDate) {
            toDelete.push(existing.id);
            normalisedMap[norm] = p;
          } else {
            toDelete.push(p.id);
          }
        }
      }
      for (const id of toDelete) {
        await base44.entities.PricingProduct.delete(id);
      }
      load();
      alert(`✓ Removed ${toDelete.length} duplicate product records`);
    } catch (err) {
      alert(`❌ Cleanup failed: ${err.message}`);
    }
  };

  const removeDuplicateOverseas = async () => {
    if (!window.confirm("Remove duplicate country names? Keep newest record per country.")) return;
    try {
      const normalisedMap = {};
      const toDelete = [];
      for (const o of overseas) {
        const norm = String(o.country || "").toLowerCase().trim().replace(/\s+/g, " ");
        if (!normalisedMap[norm]) {
          normalisedMap[norm] = o;
        } else {
          const existing = normalisedMap[norm];
          const oDate = new Date(o.last_updated || o.created_date).getTime();
          const existingDate = new Date(existing.last_updated || existing.created_date).getTime();
          if (oDate > existingDate) {
            toDelete.push(existing.id);
            normalisedMap[norm] = o;
          } else {
            toDelete.push(o.id);
          }
        }
      }
      for (const id of toDelete) {
        await base44.entities.OverseasPricingRate.delete(id);
      }
      load();
      alert(`✓ Removed ${toDelete.length} duplicate overseas records`);
    } catch (err) {
      alert(`❌ Cleanup failed: ${err.message}`);
    }
  };

  const filteredProducts = products.filter(p =>
    p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.product_type?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOverseas = overseas.filter(o =>
    o.country?.toLowerCase().includes(search.toLowerCase())
  );

  // Styles
  const bg     = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)";
  const border = isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)";
  const textColor  = isDark ? "rgba(255,255,255,0.88)" : "hsl(230 25% 12%)";
  const dimColor   = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";
  const hdrColor   = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.30)";
  const inputStyle = {
    height: "36px", borderRadius: "10px", padding: "0 12px 0 36px", fontSize: "13px",
    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    border: isDark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(0,0,0,0.09)",
    color: textColor, outline: "none", width: "100%",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold" style={{ color: textColor }}>Pricing Manager</h2>
          <p className="text-xs mt-0.5" style={{ color: dimColor }}>
            Manage product pricing and overseas rates. Changes are reflected immediately in the Sales Hub calculator.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={load} title="Refresh" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", border, borderRadius: "10px", padding: "8px", cursor: "pointer", color: dimColor }}>
            <RefreshCw style={{ width: "14px", height: "14px" }} />
          </button>
          <button
            type="button"
            onClick={() => setShowUpload(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", border, color: dimColor, cursor: "pointer" }}
          >
            Import Pricing
          </button>
          <button
            type="button"
            onClick={() => activeTab === "products" ? setEditProduct({}) : setEditOverseas({})}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", border: "none", cursor: "pointer" }}
          >
            <Plus style={{ width: "13px", height: "13px" }} />
            Add {activeTab === "products" ? "Product" : "Country"}
          </button>
        </div>
      </div>

      {/* Data Quality & Reset Section */}
      <div className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.20)" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold" style={{ color: "#ef4444" }}>⚠️ Data Quality & Reset</p>
            <p className="text-10px mt-0.5" style={{ color: dimColor }}>
              {products.length} products · {overseas.length} overseas rates
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={removeDuplicateProducts}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.30)", color: "#ef4444", cursor: "pointer" }}
            >
              Remove Product Duplicates
            </button>
            <button
              type="button"
              onClick={removeDuplicateOverseas}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.30)", color: "#ef4444", cursor: "pointer" }}
            >
              Remove Overseas Duplicates
            </button>
            <button
              type="button"
              onClick={deleteAllProducts}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "rgba(239,68,68,0.20)", border: "1px solid rgba(239,68,68,0.40)", color: "#dc2626", cursor: "pointer" }}
            >
              Delete All Products
            </button>
            <button
              type="button"
              onClick={deleteAllOverseas}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "rgba(239,68,68,0.20)", border: "1px solid rgba(239,68,68,0.40)", color: "#dc2626", cursor: "pointer" }}
            >
              Delete All Overseas
            </button>
          </div>
        </div>
      </div>

      {/* CSV Upload panels */}
      {showUpload && (
        <div className="rounded-2xl p-4 space-y-4" style={{ background: bg, border }}>
          <p className="text-xs font-semibold" style={{ color: dimColor }}>Import Pricing (.xlsx preferred, .csv supported)</p>
          <CsvUploadPanel type="product"  existingProducts={products} existingOverseas={overseas} onImported={() => { load(); }} isDark={isDark} user={user} />
          <div style={{ height: "1px", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />
          <CsvUploadPanel type="overseas" existingProducts={products} existingOverseas={overseas} onImported={() => { load(); }} isDark={isDark} user={user} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setActiveTab(tab.key); setSearch(""); }}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold relative"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: active ? (isDark ? "#fff" : "hsl(230 25% 12%)") : dimColor,
              }}
            >
              <Icon style={{ width: "13px", height: "13px" }} />
              {tab.label}
              {active && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, #8b5cf6, #7c3aed)" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative" style={{ maxWidth: "320px" }}>
        <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: dimColor, pointerEvents: "none" }} />
        <input type="text" placeholder={activeTab === "products" ? "Search products…" : "Search countries…"} value={search} onChange={e => setSearch(e.target.value)} style={inputStyle} />
      </div>

      {/* Content */}
      {loading && activeTab !== "templates" ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : activeTab === "templates" ? (
        <TemplateManager isDark={isDark} user={user} />
      ) : activeTab === "products" ? (
        /* ── PRODUCTS TABLE ── */
        filteredProducts.length === 0 ? (
          <div className="rounded-xl py-12 text-center" style={{ background: bg, border }}>
            <Package style={{ width: "28px", height: "28px", color: dimColor, margin: "0 auto 8px" }} />
            <p style={{ fontSize: "13px", fontWeight: 600, color: dimColor }}>No products found</p>
            <p style={{ fontSize: "11px", color: isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)", marginTop: "4px" }}>
              {search ? "Try a different search" : "Add products or upload a CSV to get started."}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: bg, border }}>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: "700px" }}>
                <thead>
                  <tr style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
                    {["Product", "Type", "Cost ex VAT", "VAT", "Default GP", "Status", "Last Updated", ""].map(h => (
                      <th key={h} className={`px-3 py-2.5 text-xs font-semibold ${h === "Cost ex VAT" || h === "VAT" || h === "Default GP" ? "text-right" : "text-left"}`} style={{ color: hdrColor, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <PricingProductRow
                      key={p.id}
                      product={p}
                      isDark={isDark}
                      onEdit={() => setEditProduct(p)}
                      onToggle={() => toggleActive(p)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5" style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: "10px", color: dimColor }}>{filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} · {products.filter(p => p.is_active).length} active</p>
            </div>
          </div>
        )
      ) : (
        /* ── OVERSEAS RATES TABLE ── */
        filteredOverseas.length === 0 ? (
          <div className="rounded-xl py-12 text-center" style={{ background: bg, border }}>
            <Globe style={{ width: "28px", height: "28px", color: dimColor, margin: "0 auto 8px" }} />
            <p style={{ fontSize: "13px", fontWeight: 600, color: dimColor }}>No overseas rates found</p>
            <p style={{ fontSize: "11px", color: isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)", marginTop: "4px" }}>
              {search ? "Try a different search" : "Add countries manually or upload a CSV."}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: bg, border }}>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: "600px" }}>
                <thead>
                  <tr style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
                    {["Country","Financial Integrity","Criminal History","Directorship","VAT","Status",""].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold" style={{ color: hdrColor, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOverseas.map(o => (
                    <tr key={o.id} style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)" }}>
                      <td className="px-3 py-2.5" style={{ fontSize: "13px", fontWeight: 600, color: textColor }}>{o.country}</td>
                      {[
                        { field: "financial_integrity_cost", certn: "is_certn_fi"  },
                        { field: "criminal_history_cost",    certn: "is_certn_ch"  },
                        { field: "directorship_cost",        certn: "is_certn_dir" },
                      ].map(({ field, certn }) => {
                        const isCertn = !!o[certn];
                        const hasVal  = !isCertn && o[field] != null && isFinite(Number(o[field])) && Number(o[field]) > 0;
                        return (
                          <td key={field} className="px-3 py-2.5" style={{ fontSize: "12px" }}>
                            {isCertn
                              ? <span style={{ color: "#818cf8", fontWeight: 600, fontSize: "11px" }}>CERTN</span>
                              : hasVal
                                ? <span style={{ color: textColor }}>{`£${Number(o[field]).toFixed(2)}`}</span>
                                : <span style={{ color: "#ef4444", fontSize: "11px" }}>N/A</span>}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5" style={{ fontSize: "12px", color: dimColor }}>{o.vat_rate != null ? `${(o.vat_rate * 100).toFixed(0)}%` : "—"}</td>
                      <td className="px-3 py-2.5">
                        <button type="button" onClick={() => toggleOverseasActive(o)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 600, color: o.is_active ? "#10b981" : dimColor }}>
                          {o.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-3 py-2.5">
                        <button type="button" onClick={() => setEditOverseas(o)} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: dimColor, cursor: "pointer" }}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5" style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: "10px", color: dimColor }}>{filteredOverseas.length} countr{filteredOverseas.length !== 1 ? "ies" : "y"} · {overseas.filter(o => o.is_active).length} active</p>
            </div>
          </div>
        )
      )}

      {/* Modals */}
      {editProduct !== null && (
        <PricingProductModal
          product={editProduct?.id ? editProduct : null}
          isDark={isDark}
          user={user}
          onClose={() => setEditProduct(null)}
          onSaved={() => { setEditProduct(null); load(); }}
        />
      )}
      {editOverseas !== null && (
        <OverseasRateModal
          rate={editOverseas?.id ? editOverseas : null}
          isDark={isDark}
          user={user}
          onClose={() => setEditOverseas(null)}
          onSaved={() => { setEditOverseas(null); load(); }}
        />
      )}
    </div>
  );
}