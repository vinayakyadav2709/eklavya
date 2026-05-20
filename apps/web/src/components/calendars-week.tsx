interface CalendarTask {
  id: string
  title: string
  date: string
  alarmTime: string
  color?: string
}

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i) // 08:00 – 18:00
const HOUR_PX = 60

const DAYS = [
  { label: "Mon", num: 26, today: true },
  { label: "Tue", num: 27 },
  { label: "Wed", num: 28 },
  { label: "Thu", num: 29 },
  { label: "Fri", num: 30 },
]

export function CalendarsWeekShowcasePage({ tasks }: { tasks: CalendarTask[] }) {
  const tasksByDay = new Map<number, CalendarTask[]>()
  for (const t of tasks) {
    const dayNum = parseInt(t.date.slice(-2), 10)
    const di = DAYS.findIndex((d) => d.num === dayNum)
    if (di >= 0) {
      const list = tasksByDay.get(di) ?? []
      list.push(t)
      tasksByDay.set(di, list)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-hidden rounded-xl border border-border/60 bg-background/40">
        <div className="grid grid-cols-[64px_repeat(5,1fr)] border-border/40 border-b">
          <div className="border-border/40 border-r" />
          {DAYS.map((d) => (
            <div
              key={d.label}
              className="border-border/40 px-3 py-3 last:border-r-0 sm:border-r"
            >
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                {d.label}
              </div>
              <div
                className={
                  "mt-0.5 inline-flex size-7 items-center justify-center rounded-full font-heading text-base " +
                  (d.today ? "bg-foreground text-background" : "")
                }
              >
                {d.num}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[64px_repeat(5,1fr)]">
          <div className="border-border/40 border-r">
            {HOURS.map((h) => (
              <div
                key={h}
                className="flex items-start justify-end px-2 py-1 font-mono text-[10px] text-muted-foreground"
                style={{ height: HOUR_PX }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {DAYS.map((d, di) => {
            const dayTasks = tasksByDay.get(di) ?? []
            return (
              <div
                key={d.label}
                className="relative border-border/40 last:border-r-0 sm:border-r"
                style={{ height: HOURS.length * HOUR_PX }}
              >
                {HOURS.map((h, hi) => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-border/30 border-t"
                    style={{ top: hi * HOUR_PX }}
                  />
                ))}

                {d.today ? (
                  <div
                    className="absolute inset-x-0 z-10 flex items-center"
                    style={{ top: HOUR_PX * 1.5 }}
                  >
                    <span className="size-2 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
                    <span className="h-px flex-1 bg-rose-500" />
                  </div>
                ) : null}

                {dayTasks.map((t) => {
                  const [hh, mm] = t.alarmTime.split(":").map(Number)
                  const startMinutes = (hh - 8) * 60 + mm
                  if (startMinutes < 0) return null
                  const top = (startMinutes / 60) * HOUR_PX
                  const height = HOUR_PX

                  return (
                    <div
                      key={t.id}
                      className="absolute overflow-hidden rounded-md border px-2 py-1 mx-0.5"
                      style={{
                        top,
                        height: Math.max(20, height - 2),
                        left: 2,
                        right: 2,
                        backgroundColor: t.color ? `${t.color}20` : "rgb(99 102 241 / 0.15)",
                        borderColor: t.color ? `${t.color}40` : "rgb(99 102 241 / 0.3)",
                        color: t.color ?? "rgb(99 102 241)",
                      }}
                    >
                      <div className="truncate text-[11px] font-medium leading-tight">
                        {t.title}
                      </div>
                      <div className="font-mono text-[9px] opacity-70">
                        {t.alarmTime}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
