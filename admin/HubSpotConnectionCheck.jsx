import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, XCircle, Loader2, Wifi, WifiOff, ShieldCheck, Clock, Key } from "lucide-react";

export default function HubSpotConnectionCheck() {
  const [result, setResult]   = useState(null);
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    setTesting(true);
    try {
      const res = await base44.functions.invoke("checkHubSpotConnection", {});
      setResult(res.data);
    } catch (e) {
      setResult({
        connected: false,
        secret_name: "HubSpot OAuth Connector",
        token_found: false,
        error: e.message || "Request failed",
        checked_at: new Date().toISOString(),
      });
    } finally {
      setTesting(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  };

  const statusColour = result === null
    ? "text-muted-foreground"
    : result.connected
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";

  const statusLabel = result === null
    ? "Not tested"
    : result.connected
    ? "Connected to HubSpot successfully"
    : "HubSpot connection failed";

  const StatusIcon = result === null
    ? Wifi
    : result.connected
    ? CheckCircle2
    : XCircle;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
        <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">HubSpot Connection Check</h3>
          <p className="text-xs text-muted-foreground">Verify your HubSpot OAuth connector is active — admin only</p>
        </div>
      </div>

      {/* Diagnostic rows */}
      <div className="divide-y divide-border">

        <div className="flex items-center gap-3 px-5 py-3">
          <Key className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Credential source</p>
            <p className="text-sm font-semibold text-foreground font-mono">
              {result?.secret_name ?? "HubSpot OAuth Connector"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-3">
          <Key className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Token found</p>
            <p className={`text-sm font-semibold ${
              result === null
                ? "text-muted-foreground"
                : result.token_found
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}>
              {result === null ? "Not tested" : result.token_found ? "Yes" : "No"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-3">
          <StatusIcon className={`w-4 h-4 flex-shrink-0 ${statusColour}`} />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Connection status</p>
            <p className={`text-sm font-semibold ${statusColour}`}>{statusLabel}</p>
          </div>
        </div>

        {result?.error && (
          <div className="flex items-start gap-3 px-5 py-3 bg-red-50 dark:bg-red-950/30">
            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Error</p>
              <p className="text-sm text-red-700 dark:text-red-400 break-words">{result.error}</p>
            </div>
          </div>
        )}

        {result?.checked_at && (
          <div className="flex items-center gap-3 px-5 py-3">
            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Last checked</p>
              <p className="text-sm text-foreground">{formatDate(result.checked_at)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="px-5 py-4 border-t border-border">
        <button
          onClick={runTest}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {testing
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Testing…</>
            : <><WifiOff className="w-4 h-4" /> Test HubSpot Connection</>
          }
        </button>
        <p className="text-xs text-muted-foreground mt-2">
          Makes a secure server-side call to HubSpot. The token is never exposed to the browser.
        </p>
      </div>
    </div>
  );
}