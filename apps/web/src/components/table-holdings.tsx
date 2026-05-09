import { TrendingDownIcon, TrendingUpIcon, MinusIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import type { Doc } from "@eklavya/db/convex/_generated/dataModel";
import { cn } from "#/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@eklavya/db/convex/_generated/api";

function pnlColor(pnl: number | undefined): string {
  if (!pnl) return "text-muted-foreground";
  if (pnl > 0) return "text-emerald-500";
  if (pnl < 0) return "text-destructive";
  return "text-muted-foreground";
}

function pnlSign(pnl: number | undefined): string {
  if (!pnl) return "";
  return pnl > 0 ? "+" : "";
}

export function TableHoldings({
  holdings,
  accounts,
}: {
  holdings: Doc<"investmentHoldings">[] | undefined;
  accounts: Doc<"accounts">[] | undefined;
}) {
  const providers = useQuery(api.providers.get);
  const providerMap = new Map((providers ?? []).map((p) => [p._id, p]));

  const accountMap = new Map((accounts ?? []).map((a) => [a._id, a]));

  const totalValue = holdings?.reduce((s, h) => s + h.currentValue, 0) ?? 0;
  const totalPnl = holdings?.reduce((s, h) => s + (h.pnl ?? 0), 0) ?? 0;

  const fmt = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  return (
    <div className="space-y-3">
      <div className="rounded-xl border bg-card shadow-xs/5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="ps-4">Symbol</TableHead>
              <TableHead>Broker</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Avg Price</TableHead>
              <TableHead className="text-right">LTP</TableHead>
              <TableHead className="text-right">Current Value</TableHead>
              <TableHead className="pe-4 text-right">P&amp;L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings === undefined ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Loading holdings...
                </TableCell>
              </TableRow>
            ) : holdings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No holdings yet. Click a Sync button to fetch your portfolio.
                </TableCell>
              </TableRow>
            ) : (
              holdings.map((h) => {
                const changePercent =
                  h.avgBuyPrice > 0
                    ? ((h.lastPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100
                    : 0;

                const account = accountMap.get(h.accountId);
                const provider = account?.providerId
                  ? providerMap.get(account.providerId)
                  : null;

                return (
                  <TableRow key={h._id}>
                    <TableCell className="ps-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-md",
                            (h.pnl ?? 0) > 0
                              ? "bg-emerald-500/10"
                              : (h.pnl ?? 0) < 0
                                ? "bg-destructive/10"
                                : "bg-muted"
                          )}
                        >
                          {(h.pnl ?? 0) > 0 ? (
                            <TrendingUpIcon className="size-4 text-emerald-500" />
                          ) : (h.pnl ?? 0) < 0 ? (
                            <TrendingDownIcon className="size-4 text-destructive" />
                          ) : (
                            <MinusIcon className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{h.symbol}</div>
                          {h.name !== h.symbol && (
                            <div className="text-muted-foreground text-xs truncate max-w-[180px]">
                              {h.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {provider ? (
                        <span className="inline-flex items-center rounded-full border border-border/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                          {provider.code}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {h.quantity}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                      {fmt.format(h.avgBuyPrice)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {fmt.format(h.lastPrice)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums font-medium">
                      {fmt.format(h.currentValue)}
                    </TableCell>
                    <TableCell className="pe-4 text-right font-mono tabular-nums">
                      <span className={pnlColor(h.pnl)}>
                        {pnlSign(h.pnl)}
                        {fmt.format(h.pnl ?? 0)}
                      </span>
                      <span className={cn("ml-1.5 text-xs", pnlColor(h.pnl))}>
                        ({changePercent >= 0 ? "+" : ""}
                        {changePercent.toFixed(2)}%)
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {holdings && holdings.length > 0 && (
        <div className="flex justify-end gap-6 rounded-xl border bg-card px-6 py-3 text-sm shadow-xs/5">
          <div>
            <span className="text-muted-foreground">Total Value</span>
            <span className="ml-2 font-mono font-medium tabular-nums">
              {fmt.format(totalValue)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Total P&amp;L</span>
            <span
              className={cn(
                "ml-2 font-mono font-medium tabular-nums",
                pnlColor(totalPnl)
              )}
            >
              {pnlSign(totalPnl)}
              {fmt.format(totalPnl)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
