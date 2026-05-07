import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  RepeatIcon,
  LandmarkIcon, 
  LineChartIcon, 
  CreditCardIcon, 
  UserIcon
} from "lucide-react";
import { Badge } from "#/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import type { Doc } from "@eklavya/db/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@eklavya/db/convex/_generated/api";

type AccountCategory = "liquid" | "investment" | "credit" | "entity";

function getCategoryConfig(category: AccountCategory) {
  switch (category) {
    case "liquid":
      return { label: "Liquid", Icon: LandmarkIcon, bg: "from-emerald-400/40 to-teal-600/30", colorCls: "text-emerald-500" };
    case "investment":
      return { label: "Investment", Icon: LineChartIcon, bg: "from-indigo-400/40 to-violet-600/30", colorCls: "text-indigo-500" };
    case "credit":
      return { label: "Credit", Icon: CreditCardIcon, bg: "from-rose-300/40 to-rose-600/30", colorCls: "text-rose-500" };
    case "entity":
      return { label: "Entity", Icon: UserIcon, bg: "from-amber-300/40 to-orange-500/30", colorCls: "text-amber-500" };
  }
}

export function TableTransactionsShowcasePage({ transactions }: { transactions: Doc<"transactions">[] | undefined }) {
  const accounts = useQuery(api.accounts.get);

  return (
    <div className="rounded-xl border bg-card shadow-xs/5">
      <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="ps-4">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Account ID</TableHead>
              <TableHead className="pe-4 text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions === undefined ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((t) => {
                const formattedAmount = new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(t.amount);

                let accountDisplay = "—";
                let config = null;
                
                if (t.type === "expense" || t.type === "transfer") {
                  const acc = accounts?.find(a => a._id === t.fromAccountId);
                  accountDisplay = acc?.name || t.fromAccountId || "—";
                  if (acc) config = getCategoryConfig(acc.category);
                } else if (t.type === "income") {
                  const acc = accounts?.find(a => a._id === t.toAccountId);
                  accountDisplay = acc?.name || t.toAccountId || "—";
                  if (acc) config = getCategoryConfig(acc.category);
                }
                
                if (t.type === "transfer") {
                  const toAcc = accounts?.find(a => a._id === t.toAccountId);
                  const toName = toAcc?.name || t.toAccountId || "—";
                  accountDisplay = `${accountDisplay} → ${toName}`;
                }

                return (
                  <TableRow key={t._id}>
                    <TableCell className="ps-4 text-muted-foreground font-mono text-sm tabular-nums">
                      {t.date}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={
                            "flex size-7 shrink-0 items-center justify-center rounded-full " +
                            (t.type === "income"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : t.type === "transfer"
                                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                : "bg-muted text-muted-foreground")
                          }
                          aria-hidden
                        >
                          {t.type === "income" ? (
                            <ArrowDownLeftIcon className="size-3.5" />
                          ) : t.type === "transfer" ? (
                            <RepeatIcon className="size-3.5" />
                          ) : (
                            <ArrowUpRightIcon className="size-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {t.description}
                            {t.isRecurring && (
                              <RepeatIcon className="size-3 text-muted-foreground opacity-50" />
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {t.category || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {config ? (
                        <div className="flex items-center gap-3">
                          <div
                            className={
                              "flex size-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ring-1 ring-border/60 " +
                              config.bg
                            }
                            aria-hidden
                          >
                            <config.Icon className={`size-5 ${config.colorCls}`} />
                          </div>
                          <span className="text-muted-foreground font-medium">
                            {accountDisplay}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground font-mono text-xs">
                          {accountDisplay}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="pe-4 text-right">
                      <div
                        className={
                          "font-mono tabular-nums font-medium " +
                          (t.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : t.type === "transfer"
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-foreground")
                        }
                      >
                        {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}{formattedAmount}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
  );
}
