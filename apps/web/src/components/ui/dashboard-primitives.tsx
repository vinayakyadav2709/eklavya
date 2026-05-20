import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
} from "lucide-react"

export function StatCard({
  label,
  value,
  sub,
  trend,
}: {
  label: string
  value: string
  sub: string
  trend?: "up" | "down"
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className="mt-1 font-heading text-2xl tracking-tight">
        {value}
      </div>
      {sub || trend ? (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          {trend === "up" ? (
            <ArrowUpRightIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : trend === "down" ? (
            <ArrowDownRightIcon className="size-3.5 text-rose-600 dark:text-rose-400" />
          ) : null}
          {sub}
        </div>
      ) : null}
    </div>
  )
}

export function Sparkline({ data }: { data: number[] }) {
  const W = 600
  const H = 160
  const PAD = 8
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = (W - PAD * 2) / (data.length - 1)
  const points = data
    .map((v, i) => {
      const x = PAD + i * stepX
      const y = PAD + (1 - (v - min) / range) * (H - PAD * 2)
      return `${x},${y}`
    })
    .join(" ")
  const area = `M ${PAD} ${H - PAD} L ${points
    .split(" ")
    .join(" L ")} L ${W - PAD} ${H - PAD} Z`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="dash-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#dash-grad)" className="text-primary" />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
      {data.map((v, i) => {
        const x = PAD + i * stepX
        const y = PAD + (1 - (v - min) / range) * (H - PAD * 2)
        const last = i === data.length - 1
        return last ? (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r="6"
              className="text-primary opacity-25"
              fill="currentColor"
            />
            <circle
              cx={x}
              cy={y}
              r="2.5"
              className="text-primary"
              fill="currentColor"
            />
          </g>
        ) : null
      })}
    </svg>
  )
}

export function AreaChart({
  values,
  color,
}: {
  values: number[]
  color?: string
}) {
  const w = 600
  const h = 160
  const max = Math.max(...values)
  const min = Math.min(...values) * 0.95
  const stepX = w / (values.length - 1)
  const points = values
    .map((v, i) => `${i * stepX},${h - ((v - min) / (max - min)) * h}`)
    .join(" ")
  const fillPath = `M 0,${h} L ${points.replace(/ /g, " L ")} L ${w},${h} Z`
  const linePath = `M ${points.replace(/ /g, " L ")}`
  const stroke = color ?? "rgb(16 185 129)"

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-40 w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#area-grad)" />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth="2" />
    </svg>
  )
}

export function ProgressBar({
  value,
  max,
  label,
  color,
}: {
  value: number
  max: number
  label?: string
  color?: string
}) {
  const pct = Math.min((value / max) * 100, 100)
  const barColor = color ?? "bg-emerald-500"

  return (
    <div>
      {label && (
        <div className="mb-1 flex items-baseline justify-between text-sm">
          <span>{label}</span>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {pct.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-foreground/[0.06]">
        <div
          className={`h-full ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function SegmentBar({
  segments,
}: {
  segments: { name: string; pct: number; color: string }[]
}) {
  return (
    <div className="flex h-3 overflow-hidden rounded-full">
      {segments.map((s) => (
        <div
          key={s.name}
          style={{ width: `${s.pct}%`, background: s.color }}
          className="h-full"
        />
      ))}
    </div>
  )
}

export function ActivityItem({
  initials,
  who,
  what,
  target,
  time,
}: {
  initials: string
  who: string
  what: string
  target: string
  time: string
}) {
  return (
    <li className="flex items-start gap-3 text-sm">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] text-xs font-medium">
        {initials}
      </span>
      <div className="min-w-0 flex-1 leading-snug">
        <span className="font-medium">{who}</span>{" "}
        <span className="text-muted-foreground">{what}</span>{" "}
        <span className="text-foreground/85">{target}</span>
        <div className="mt-0.5 text-xs text-muted-foreground">{time}</div>
      </div>
    </li>
  )
}
