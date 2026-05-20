import { createFileRoute } from "@tanstack/react-router"
import { useMemo } from "react"
import { format } from "date-fns"
import { useQuery } from "convex/react"
import { api } from "@eklavya/db/convex/_generated/api"
import {
  ActivityItem,
  AreaChart,
  ProgressBar,
  SegmentBar,
  Sparkline,
  StatCard,
} from "#/components/ui/dashboard-primitives"

const SPARK_DATA = [12, 18, 14, 22, 19, 28, 24, 33, 29, 38, 34, 42]

export const Route = createFileRoute("/_app/")({
  component: DashboardPage,
})

function DashboardPage() {
  const accounts = useQuery(api.accounts.get)
  const holdings = useQuery(api.investmentHoldings.getByUser)
  const transactions = useQuery(api.transactions.get)

  const stats = useMemo(() => {
    const accts = accounts ?? []
    const totalAssets = accts
      .filter((a) => !a.isLiability)
      .reduce((sum, a) => sum + a.balance, 0)
    const totalLiabilities = accts
      .filter((a) => a.isLiability)
      .reduce((sum, a) => sum + a.balance, 0)
    const netWorth = totalAssets - totalLiabilities

    const now = new Date()
    const thisMonth = format(now, "yyyy-MM")
    const hlds = holdings ?? []
    const portfolioValue = hlds.reduce((sum, h) => sum + h.currentValue, 0)
    const totalPnl = hlds.reduce((sum, h) => sum + (h.pnl ?? 0), 0)
    const gainers = hlds.filter((h) => (h.pnl ?? 0) > 0).length
    const losers = hlds.filter((h) => (h.pnl ?? 0) < 0).length

    const txns = transactions ?? []
    const monthTxns = txns.filter((t) => t.date.startsWith(thisMonth))
    const monthlyIncome = monthTxns
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
    const monthlyExpenses = monthTxns
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
    const monthIncomeCount = monthTxns.filter((t) => t.type === "income").length
    const monthExpenseCount = monthTxns.filter((t) => t.type === "expense").length

    const categoryMap = new Map<string, number>()
    for (const t of monthTxns.filter((t) => t.type === "expense")) {
      const cat = t.category ?? "Other"
      categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + t.amount)
    }
    const topCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const allMonthlyAmounts = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const m = format(d, "yyyy-MM")
      const income = txns
        .filter((t) => t.type === "income" && t.date.startsWith(m))
        .reduce((s, t) => s + t.amount, 0)
      const expense = txns
        .filter((t) => t.type === "expense" && t.date.startsWith(m))
        .reduce((s, t) => s + t.amount, 0)
      return income - expense
    }).reverse()

    const recentTxns = [...txns]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)

    const accountCategories = [
      { name: "Liquid", pct: 0, color: "rgb(56 189 248)" },
      { name: "Investment", pct: 0, color: "rgb(99 102 241)" },
      { name: "Credit", pct: 0, color: "rgb(244 63 94)" },
      { name: "Entity", pct: 0, color: "rgb(245 158 11)" },
    ]
    for (const a of accts) {
      const cat = accountCategories.find((c) => c.name.toLowerCase() === a.category)
      if (cat && totalAssets > 0) {
        cat.pct += (a.balance / (totalAssets || 1)) * 100
      }
    }

    return {
      netWorth,
      totalAssets,
      totalLiabilities,
      portfolioValue,
      totalPnl,
      gainers,
      losers,
      monthlyIncome,
      monthlyExpenses,
      monthIncomeCount,
      monthExpenseCount,
      topCategories,
      allMonthlyAmounts: allMonthlyAmounts.length > 1 ? allMonthlyAmounts : SPARK_DATA,
      recentTxns,
      accountCategories,
      accountCount: accts.length,
      holdingCount: hlds.length,
    }
  }, [accounts, holdings, transactions])

  const currency = (v: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 1,
      notation: v >= 100_000 ? "compact" : "standard",
    }).format(v)

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <header className="shrink-0 flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <h1 className="font-heading text-2xl">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Your financial universe at a glance.
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Net Worth"
              value={currency(stats.netWorth)}
              sub={`${stats.accountCount} account${stats.accountCount !== 1 ? "s" : ""}`}
            />
            <StatCard
              label="Monthly Income"
              value={currency(stats.monthlyIncome)}
              sub={`${stats.monthIncomeCount} transaction${stats.monthIncomeCount !== 1 ? "s" : ""}`}
            />
            <StatCard
              label="Monthly Expenses"
              value={currency(stats.monthlyExpenses)}
              sub={`${stats.monthExpenseCount} transaction${stats.monthExpenseCount !== 1 ? "s" : ""}`}
            />
            <StatCard
              label="Portfolio Value"
              value={stats.portfolioValue > 0 ? currency(stats.portfolioValue) : "—"}
              sub={
                stats.holdingCount > 0
                  ? `${stats.holdingCount} holding${stats.holdingCount !== 1 ? "s" : ""}`
                  : "No holdings yet"
              }
              trend={stats.totalPnl > 0 ? "up" : stats.totalPnl < 0 ? "down" : undefined}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-background/40 p-5 lg:col-span-2">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Net Worth Trend
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-heading text-2xl">
                    {currency(stats.netWorth)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    last 6 months
                  </span>
                </div>
              </div>
              <div className="mt-4 h-44 w-full">
                <Sparkline data={stats.allMonthlyAmounts} />
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/40 p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Accounts
                </div>
                <span className="text-xs text-muted-foreground">
                  {stats.accountCount} total
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-baseline justify-between text-sm">
                  <span>Assets</span>
                  <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                    +{currency(stats.totalAssets)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-sm">
                  <span>Liabilities</span>
                  <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400">
                    −{currency(stats.totalLiabilities)}
                  </span>
                </div>
              </div>

              {stats.accountCategories.some((c) => c.pct > 0) && (
                <div className="mt-5">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Allocation by type
                  </div>
                  <div className="mt-3">
                    <SegmentBar
                      segments={stats.accountCategories.filter((c) => c.pct > 0)}
                    />
                  </div>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {stats.accountCategories
                      .filter((c) => c.pct > 0)
                      .map((a) => (
                        <li
                          key={a.name}
                          className="flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="size-2 rounded-full"
                              style={{ background: a.color }}
                            />
                            {a.name}
                          </span>
                          <span className="font-mono tabular-nums text-muted-foreground">
                            {a.pct.toFixed(1)}%
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-background/40 p-5 lg:col-span-2">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Cashflow
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-heading text-2xl">
                    {currency(stats.monthlyIncome - stats.monthlyExpenses)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    net this month
                  </span>
                </div>
              </div>

              <div className="mt-4 h-40">
                <AreaChart
                  values={stats.allMonthlyAmounts}
                  color={
                    stats.monthlyIncome >= stats.monthlyExpenses
                      ? "rgb(16 185 129)"
                      : "rgb(244 63 94)"
                  }
                />
              </div>

              {stats.topCategories.length > 0 && (
                <div className="mt-5 space-y-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Top expense categories
                  </div>
                  {stats.topCategories.map(([cat, amount]) => {
                    const pct =
                      stats.monthlyExpenses > 0
                        ? (amount / stats.monthlyExpenses) * 100
                        : 0
                    return (
                      <ProgressBar
                        key={cat}
                        label={cat}
                        value={pct}
                        max={100}
                        color={
                          pct > 40
                            ? "bg-amber-500"
                            : pct > 20
                              ? "bg-sky-500"
                              : "bg-emerald-500"
                        }
                      />
                    )
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border/60 bg-background/40 p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Recent activity
              </div>
              {stats.recentTxns.length === 0 ? (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  No transactions yet.
                </p>
              ) : (
                <ul className="mt-4 flex flex-col gap-3.5">
                  {stats.recentTxns.map((t) => (
                    <ActivityItem
                      key={t._id}
                      initials={t.type === "income" ? "IN" : t.type === "expense" ? "EX" : "TR"}
                      who={t.description}
                      what={
                        t.type === "income"
                          ? "received"
                          : t.type === "expense"
                            ? "spent"
                            : "transferred"
                      }
                      target={currency(t.amount)}
                      time={t.date}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
