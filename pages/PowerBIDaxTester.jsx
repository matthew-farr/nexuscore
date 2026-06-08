import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Play, Loader2 } from "lucide-react";

export default function PowerBIDaxTester() {
  const [datasetId, setDatasetId] = useState("");
  const [query, setQuery] = useState("EVALUATE TOPN(10, 'TableName')");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runQuery = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await base44.functions.invoke("executePowerBIDax", {
        datasetId,
        query,
      });
      setResult(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const rows = result?.results?.[0]?.tables?.[0]?.rows || [];
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Power BI DAX Tester</h1>
        <p className="text-sm text-muted-foreground mt-1">
          PoC — uses a manually rotated bearer token. Token expires with the session.
        </p>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-300">
          This is a temporary PoC. The bearer token must be manually refreshed when it expires.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Dataset ID</label>
          <Input
            value={datasetId}
            onChange={e => setDatasetId(e.target.value)}
            placeholder="e.g. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">DAX Query</label>
          <Textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            rows={6}
            className="font-mono text-sm"
          />
        </div>
        <Button onClick={runQuery} disabled={loading || !datasetId.trim()}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          Run Query
        </Button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg border border-destructive/40 bg-destructive/10 text-sm text-destructive">
          {error}
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                {columns.map(col => (
                  <th key={col} className="px-3 py-2 text-left font-semibold text-xs uppercase tracking-wide truncate max-w-48">
                    {col.replace(/\[|\]/g, "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t hover:bg-muted/50">
                  {columns.map(col => (
                    <td key={col} className="px-3 py-2 text-xs font-mono">
                      {String(row[col] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-3 py-2 text-xs text-muted-foreground border-t">{rows.length} row(s) returned</p>
        </div>
      )}

      {result && rows.length === 0 && (
        <p className="text-sm text-muted-foreground">Query ran successfully — no rows returned.</p>
      )}
    </div>
  );
}