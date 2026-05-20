interface CalendarTask {
  id: string
  title: string
  date: string
  alarmTime: string
  color?: string
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function CalendarsMonthShowcasePage({ tasks }: { tasks: CalendarTask[] }) {
  // April 2026 — starts on Wed (day 1)
  const offset = 2
  const totalDays = 30
  const cells = offset + totalDays
  const rows = Math.ceil(cells / 7)

  const tasksByDay = new Map<string, CalendarTask[]>()
  for (const t of tasks) {
    const d = t.date.slice(-2)
    const day = parseInt(d, 10)
    if (day >= 1 && day <= totalDays) {
      const list = tasksByDay.get(t.date) ?? []
      list.push(t)
      tasksByDay.set(t.date, list)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-hidden rounded-xl border border-border/60 bg-background/40">
        <div className="grid grid-cols-7 border-border/40 border-b">
          {DAYS.map((d) => (
            <div
              key={d}
              className="px-3 py-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-5">
          {Array.from({ length: rows * 7 }).map((_, i) => {
            const day = i - offset + 1
            const out = day < 1 || day > totalDays
            const today = day === 26
            const dateStr = `2026-04-${String(day).padStart(2, "0")}`
            const dayTasks = tasksByDay.get(dateStr) ?? []
            const overflow = dayTasks.length - 3
            const maxShow = 3
            return (
              <div
                key={i}
                className={
                  "min-h-[110px] border-border/40 border-r border-b p-1.5 last-of-type:border-r-0 " +
                  (out ? "bg-muted/20" : "")
                }
              >
                {!out ? (
                  <>
                    <div
                      className={
                        "mb-1 flex size-7 items-center justify-center rounded-full font-mono text-[12px] " +
                        (today
                          ? "bg-foreground text-background"
                          : "text-foreground/80")
                      }
                    >
                      {day}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {dayTasks.slice(0, maxShow).map((t) => (
                        <div
                          key={t.id}
                          className="truncate rounded border px-1.5 py-0.5 text-[10px] leading-tight"
                          style={{
                            backgroundColor: t.color ? `${t.color}20` : "rgb(99 102 241 / 0.15)",
                            borderColor: t.color ? `${t.color}40` : "rgb(99 102 241 / 0.3)",
                            color: t.color ?? "rgb(99 102 241)",
                          }}
                        >
                          {t.alarmTime ? `${t.alarmTime} ` : ""}
                          {t.title}
                        </div>
                      ))}
                      {overflow > 0 ? (
                        <div className="px-1 font-mono text-[10px] text-muted-foreground">
                          +{overflow} more
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
