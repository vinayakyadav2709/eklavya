import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCwIcon } from "lucide-react";
import { TableHoldings } from "../../components/table-holdings";
import { useQuery, useConvex } from "convex/react";
import { api } from "@eklavya/db/convex/_generated/api";

export const Route = createFileRoute("/_app/holdings")({
  component: HoldingsPage,
});

function HoldingsPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const accounts = useQuery(api.accounts.get);
  const holdings = useQuery(api.investmentHoldings.getByUser);
  const convex = useConvex();

  const connectedAccounts = (accounts ?? []).filter(
    (a) => a.providerId && a.apiConfig?.status === "active"
  );

  const handleSyncAll = async () => {
    if (isSyncing || connectedAccounts.length === 0) return;
    try {
      setIsSyncing(true);
      const providers = await convex.query(api.providers.get);
      const providerMap = new Map(providers?.map((p) => [p._id, p]) ?? []);

      for (const account of connectedAccounts) {
        const provider = account.providerId ? providerMap.get(account.providerId) : null;
        if (provider?.code === "kite") {
          await convex.action(api.kiteSync.syncHoldings, {
            accountId: account._id as any,
          });
        } else if (provider?.code === "kotak") {
          await convex.action(api.kotakSync.syncHoldings, {
            accountId: account._id as any,
          });
        }
      }
    } catch (e) {
      console.error("Failed to sync holdings", e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <header className="shrink-0 flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <h1 className="font-heading text-2xl">Holdings</h1>
          <p className="text-muted-foreground text-sm">
            Investment holdings synced from your broker accounts.
          </p>
        </div>
        {connectedAccounts.length > 0 && (
          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <RefreshCwIcon className={`size-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync"}
          </button>
        )}
      </header>

      <main className="flex-1 overflow-auto p-6">
        {connectedAccounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-background/30 px-6 py-16 text-center">
            <p className="text-muted-foreground text-sm">
              No connected broker accounts found.
            </p>
            <p className="mt-1 text-muted-foreground text-xs">
              Go to Settings &rarr; Integrations to connect Kite or Kotak Neo.
            </p>
          </div>
        ) : (
          <TableHoldings holdings={holdings} accounts={accounts} />
        )}
      </main>
    </div>
  );
}
