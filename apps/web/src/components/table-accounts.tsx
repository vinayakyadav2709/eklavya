import { LandmarkIcon, LineChartIcon, CreditCardIcon, UserIcon } from "lucide-react";
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

export function TableAccounts({ accounts }: { accounts: Doc<"accounts">[] | undefined }) {
  return (
    <div className="rounded-xl border bg-card shadow-xs/5">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="ps-4">Account</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Institution</TableHead>
            <TableHead className="pe-4 text-right">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts === undefined ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                Loading accounts...
              </TableCell>
            </TableRow>
          ) : accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No accounts added yet.
              </TableCell>
            </TableRow>
          ) : (
            accounts.map((account) => {
              const config = getCategoryConfig(account.category);
              const formattedBalance = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(account.balance);

              return (
                <TableRow key={account._id}>
                  <TableCell className="ps-4">
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
                      <div>
                        <div className="font-medium">{account.name}</div>
                        {account.isLiability && (
                          <div className="text-destructive text-xs">Liability</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal capitalize">
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {account.institution || "—"}
                  </TableCell>
                  <TableCell className="pe-4 text-right font-mono tabular-nums font-medium">
                    <span className={account.isLiability ? "text-destructive" : ""}>
                      {account.isLiability ? "-" : ""}{formattedBalance}
                    </span>
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
