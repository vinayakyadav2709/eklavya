import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { format } from 'date-fns';
import { PlusIcon, CheckCircleIcon, ClockIcon, TargetIcon, ActivityIcon, CalendarDaysIcon, XIcon, ListIcon, CalendarIcon } from 'lucide-react';
import { Button } from '#/components/ui/button';
import { Card, CardPanel } from '#/components/ui/card';
import { Badge } from '#/components/ui/badge';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@eklavya/db/convex/_generated/api';
import { AddTaskModal } from '#/components/modals-add-task';
import { CalendarsWeekShowcasePage } from '#/components/calendars-week';
import { CalendarsMonthShowcasePage } from '#/components/calendars-month';

export const Route = createFileRoute('/_app/tasks')({
  component: TasksPage,
});

function TasksPage() {
  const [modalMode, setModalMode] = useState<"today" | "tomorrow" | null>(null);
  const [viewMode, setViewMode] = useState<"board" | "week" | "month">("board");
  const [hoursLeft, setHoursLeft] = useState("");
  const [measuringTaskId, setMeasuringTaskId] = useState<string | null>(null);
  const [actualMetric, setActualMetric] = useState("");

  const pillars = useQuery(api.pillars.get);
  const updateMeasure = useMutation(api.powerTasks.updateMeasure);

  const todayDate = new Date();
  const todayStr = format(todayDate, "yyyy-MM-dd");
  
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = format(tomorrowDate, "yyyy-MM-dd");

  const allTasks = useQuery(api.powerTasks.get, {}) ?? [];
  const todayTasks = allTasks.filter(t => t.date === todayStr);
  const tomorrowTasks = allTasks.filter(t => t.date === tomorrowStr);

  const handleMeasure = async (taskId: string) => {
    if (!actualMetric) return;
    await updateMeasure({ id: taskId as any, actualMetric: parseFloat(actualMetric) });
    setMeasuringTaskId(null);
    setActualMetric("");
  };

  const currentPoints = todayTasks.filter(t => t.status === "completed").reduce((acc, t) => acc + (t.earnedPoints || 0), 0);
  const isWinning = currentPoints >= 10;

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <header className="shrink-0 flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <h1 className="font-heading text-2xl">Nuclear Tasks</h1>
          <p className="text-muted-foreground text-sm">
            Lock in your tasks, execute with urgency, and conquer your goals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="mr-4 flex items-center rounded-md border border-border/60 p-0.5 font-mono text-[10px] uppercase tracking-[0.2em]">
            <button
              onClick={() => setViewMode("board")}
              className={`rounded px-2 py-1 transition-colors ${viewMode === "board" ? "bg-foreground/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`rounded px-2 py-1 transition-colors ${viewMode === "week" ? "bg-foreground/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`rounded px-2 py-1 transition-colors ${viewMode === "month" ? "bg-foreground/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Month
            </button>
          </div>

          <Button onClick={() => setModalMode("today")} variant="outline" className="hidden sm:flex">
            <PlusIcon className="size-4 mr-2" />
            Log Today
          </Button>
          <Button onClick={() => setModalMode("tomorrow")}>
            <PlusIcon className="size-4 mr-2" />
            Plan Tomorrow
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-0">
        {viewMode === "board" && (
          <div className="mx-auto max-w-5xl space-y-10 p-6 pb-20">
          
          {/* Progress Header & Nuke Today Formula combined into a dashboard row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <CardPanel className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">Nuclear Scoreboard</div>
                    <h2 className="mt-1 font-heading text-3xl">
                      <span className={isWinning ? "text-emerald-500" : "text-foreground"}>{currentPoints}</span>
                      <span className="text-muted-foreground text-xl"> / 20 Points</span>
                    </h2>
                    <p className="mt-1 text-muted-foreground text-sm">Target: &gt;10 points every day.</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em] mb-2">Weekly</div>
                    <div className="flex gap-1">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className={`size-6 rounded-sm border ${i < 3 ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-muted/30 border-border'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </CardPanel>
            </Card>

            <Card className="overflow-hidden">
              <CardPanel className="p-6 flex flex-col justify-center">
                <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em] mb-3">Nuke Today Engine</h3>
                <div className="flex items-end gap-3">
                  <label className="flex-1">
                    <span className="mb-1 block text-xs text-muted-foreground">Hours left today</span>
                    <div className="relative">
                      <ClockIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                      <input
                        type="number"
                        value={hoursLeft}
                        onChange={(e) => setHoursLeft(e.target.value)}
                        placeholder="e.g. 5"
                        className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </label>
                  <div className="pb-1 text-sm text-muted-foreground hidden sm:block">
                    = Max tasks possible
                  </div>
                </div>
              </CardPanel>
            </Card>
          </div>

          {/* Execution Board (Using Event Cards style) */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl">Today's Execution Board</h2>
            </div>

            {todayTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 py-12 text-center bg-card/30">
                <p className="text-muted-foreground text-sm">No tasks locked in for today.</p>
                <Button onClick={() => setModalMode("today")} variant="link" className="mt-2">Add your first task</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todayTasks.sort((a, b) => a.alarmTime.localeCompare(b.alarmTime)).map(task => {
                  const pillar = pillars?.find(p => p._id === task.pillarId);
                  const isCompleted = task.status === "completed";
                  const isMeasuring = measuringTaskId === task._id;

                  // Extract hour and min from alarmTime (e.g. "14:30")
                  const [hour, min] = task.alarmTime.split(":");
                  const isAm = parseInt(hour) < 12;

                  return (
                    <Card key={task._id} className={`overflow-hidden transition-all ${isCompleted ? 'opacity-60' : ''}`}>
                      <CardPanel className="flex items-stretch gap-0 p-0 h-full">
                        <div
                          className={`flex w-20 shrink-0 flex-col items-center justify-center border-r bg-gradient-to-b p-4 ${
                            isCompleted ? 'from-muted to-muted/50' : 'from-foreground/[0.05] to-transparent'
                          }`}
                        >
                          <div className="font-mono text-[10px] text-foreground/60 uppercase tracking-[0.2em]">
                            {isAm ? "AM" : "PM"}
                          </div>
                          <div className="font-heading text-2xl leading-none my-1">{hour}:{min}</div>
                          <div className="font-mono text-[10px] text-foreground/60 uppercase tracking-[0.2em]">
                            Alarm
                          </div>
                        </div>
                        
                        <div className="flex min-w-0 flex-1 flex-col p-4 justify-between">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`font-heading font-semibold text-base ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </h3>
                              {isCompleted && (
                                <Badge className="gap-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] border-none">
                                  <CheckCircleIcon className="size-3" /> DONE
                                </Badge>
                              )}
                            </div>
                            
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
                              <span className="inline-flex items-center gap-1.5">
                                <TargetIcon className="size-3" />
                                Target: {task.targetMetric}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <ActivityIcon className="size-3" />
                                {task.points} Points
                              </span>
                              {pillar && (
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="size-1.5 rounded-full" style={{ backgroundColor: pillar.color || '#ccc' }} />
                                  {pillar.name}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-xs font-mono text-muted-foreground">
                              {isCompleted ? `Earned: ${task.earnedPoints} pts` : `Worth: ${task.points} pts`}
                            </div>
                            <div className="flex items-center gap-2">
                              {!isCompleted && !isMeasuring && (
                                <Button size="sm" onClick={() => setMeasuringTaskId(task._id)}>
                                  Measure
                                </Button>
                              )}
                              {!isCompleted && isMeasuring && (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    placeholder="Actual"
                                    value={actualMetric}
                                    onChange={(e) => setActualMetric(e.target.value)}
                                    className="h-8 w-20 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                                  />
                                  <Button size="sm" onClick={() => handleMeasure(task._id)}>Save</Button>
                                  <Button size="sm" variant="ghost" onClick={() => setMeasuringTaskId(null)}>
                                    <XIcon className="size-4"/>
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardPanel>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* Tomorrow's Lock-in */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-xl">Tomorrow's Lock-in</h2>
                <p className="mt-1 text-sm text-muted-foreground">You cannot sleep until tomorrow is planned.</p>
              </div>
            </div>

            {tomorrowTasks.length === 0 ? (
               <div className="rounded-xl border border-dashed border-border/70 py-8 text-center bg-card/30">
                 <p className="text-muted-foreground text-sm">Tomorrow is blank. Don't leave it to chance.</p>
                 <Button onClick={() => setModalMode("tomorrow")} variant="outline" className="mt-3">Plan Tomorrow</Button>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tomorrowTasks.sort((a, b) => a.alarmTime.localeCompare(b.alarmTime)).map(task => {
                  const pillar = pillars?.find(p => p._id === task.pillarId);
                  return (
                    <Card key={task._id} className="overflow-hidden bg-background">
                      <CardPanel className="p-4 flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center shrink-0 w-12 text-center">
                          <ClockIcon className="size-4 text-muted-foreground mb-1"/>
                          <span className="font-mono text-xs font-medium">{task.alarmTime}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{task.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                            <span>{task.points} pts</span>
                            {pillar && (
                              <>
                                <span>•</span>
                                <span>{pillar.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </CardPanel>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

        </div>
        )}

        {viewMode === "week" && (
          <CalendarsWeekShowcasePage />
        )}

        {viewMode === "month" && (
          <CalendarsMonthShowcasePage />
        )}
      </main>

      {modalMode && <AddTaskModal defaultDate={modalMode} onClose={() => setModalMode(null)} />}
    </div>
  );
}

