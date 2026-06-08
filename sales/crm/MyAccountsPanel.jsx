import { Building2, ExternalLink, Loader2, Inbox, AlertTriangle, Clock } from "lucide-react";
import { useTheme } from "../../ThemeProvider";

function formatDate(str) {
  if (!str) return null;
  return new Date(str).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function CompanyRow({ company, onViewDetails, isDark }) {
  const p = company.properties || {};
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0"
      style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(6,182,212,0.15)" }}>
        <Building2 className="w-4 h-4 text-cyan-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: isDark ? "#ffffff" : "#000000" }}>
          {p.name || "—"}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
          {p.domain && (
            <span className="text-[11px] truncate"
              style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.50)" }}>
              {p.domain}
            </span>
          )}
          {company.owner_name && (
            <span className="text-[11px]"
              style={{ color: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.45)" }}>
              {company.owner_name}
            </span>
          )}
          {p.hs_lastmodifieddate && (
            <span className="flex items-center gap-1 text-[11px]"
              style={{ color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.40)" }}>
              <Clock className="w-2.5 h-2.5" />
              {formatDate(p.hs_lastmodifieddate)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button onClick={() => onViewDetails(company)}
          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors hover:opacity-80"
          style={{
            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
            border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.08)",
            color: isDark ? "#ffffff" : "#000000",
          }}>
          Details
        </button>
        {company.url && (
          <a href={company.url} target="_blank" rel="noreferrer"
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
            style={{ background: "rgba(6,182,212,0.15)" }}>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-500" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function MyAccountsPanel({ companies, loading, error, onViewDetails, isDark }) {
  return (
    <div className="rounded-xl border overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.01) 100%)"
          : "rgba(255,255,255,0.85)",
        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
      }}>
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-sm font-bold mb-3" style={{ color: isDark ? "#ffffff" : "#000000" }}>
          My Accounts — Recently Updated
        </h3>

        {loading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
            <span className="text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>Loading accounts…</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 py-4">
            <AlertTriangle className="w-4 h-4" style={{ color: "#ef4444" }} />
            <span className="text-sm" style={{ color: isDark ? "#ffffff" : "#000000" }}>Unable to load accounts</span>
          </div>
        ) : !companies?.length ? (
          <div className="flex flex-col items-center py-6 gap-1.5">
            <Inbox className="w-8 h-8 opacity-20" style={{ color: isDark ? "#ffffff" : "#000000" }} />
            <p className="text-sm font-semibold" style={{ color: isDark ? "#ffffff" : "#000000" }}>
              No accounts found
            </p>
          </div>
        ) : (
          <div>
            {companies.slice(0, 10).map(c => (
              <CompanyRow key={c.id} company={c} onViewDetails={onViewDetails} isDark={isDark} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}