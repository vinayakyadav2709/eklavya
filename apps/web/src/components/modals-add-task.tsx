import { useState } from "react";
import {
  ClockIcon,
  PlusIcon,
  XIcon,
  TargetIcon,
} from "lucide-react";
import { Button } from "#/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@eklavya/db/convex/_generated/api";
import { format } from "date-fns";

export function AddTaskModal({ onClose, defaultDate }: { onClose: () => void, defaultDate: "today" | "tomorrow" }) {
  const createTask = useMutation(api.powerTasks.create);
  const pillars = useQuery(api.pillars.get);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState("");
  const [pillarId, setPillarId] = useState<string | null>(null);
  const [points, setPoints] = useState<number>(4);
  const [targetMetric, setTargetMetric] = useState("");
  const [alarmTime, setAlarmTime] = useState("");

  const POINTS_OPTIONS = [
    { value: 8, label: "Hardest (8 pts)", desc: "2-4 hours of deep work" },
    { value: 6, label: "Hard (6 pts)", desc: "1-2 hours of focused work" },
    { value: 4, label: "Medium (4 pts)", desc: "1 hour of work" },
    { value: 2, label: "Small (2 pts)", desc: "30 mins of work" },
  ];

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      
      const targetDate = new Date();
      if (defaultDate === "tomorrow") {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      const dateString = format(targetDate, "yyyy-MM-dd");

      await createTask({
        title,
        pillarId: pillarId as any,
        points,
        targetMetric: parseFloat(targetMetric) || 1,
        alarmTime,
        date: dateString,
      });
      onClose();
    } catch (e) {
      console.error("Failed to save task", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div 
        className="fixed inset-0 bg-background/70 backdrop-blur-sm" 
        onClick={onClose} 
        aria-hidden="true"
      />
      
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-background shadow-2xl flex flex-col max-h-full">
        <div className="flex items-center justify-between border-border/60 border-b px-5 py-3.5 shrink-0">
          <div>
            <div className="font-heading text-sm">Add Nuclear Task ({defaultDate})</div>
            <div className="mt-0.5 text-muted-foreground text-xs">
              Define the exact task, weight, and alarm time.
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-md p-1 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-4 max-h-[70vh] overflow-y-auto">
          
          <div>
            <label className="block">
              <span className="mb-1 block text-[10px] font-mono text-muted-foreground uppercase tracking-[0.25em]">Task Details</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Study Physics Chapter 3"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </label>
          </div>

          {pillars !== undefined && (
            <div>
              <div className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                Power Pillar
              </div>
              {pillars.length === 0 ? (
                <div className="rounded-md border border-dashed border-border/70 p-3 text-center text-xs text-muted-foreground">
                  No pillars created yet. Go to Settings &gt; Task Pillars to add one.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {pillars.map((p) => {
                    const selected = pillarId === p._id;
                    return (
                      <label
                        key={p._id}
                        className={
                          "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors " +
                          (selected
                            ? "border-foreground/60 bg-foreground/[0.04]"
                            : "border-border/60 hover:border-foreground/30")
                        }
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          checked={selected}
                          onChange={() => setPillarId(p._id)}
                        />
                        <span
                          className={
                            "size-3.5 rounded-full border " +
                            (selected
                              ? "border-foreground bg-foreground ring-2 ring-foreground/20 ring-offset-2 ring-offset-background"
                              : "border-border")
                          }
                        />
                        <span
                          className="size-3 rounded-full shadow-sm"
                          style={{ backgroundColor: p.color || "#ccc" }}
                        />
                        <span className="text-sm">{p.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div>
            <div className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Difficulty & Weight
            </div>
            <div className="flex flex-col gap-2">
              {POINTS_OPTIONS.map((opt) => {
                const active = points === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={
                      "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors " +
                      (active
                        ? "border-foreground/60 bg-foreground/[0.04]"
                        : "border-border/60 hover:border-foreground/30")
                    }
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      checked={active}
                      onChange={() => setPoints(opt.value)}
                    />
                    <span
                      className={
                        "size-3.5 rounded-full border " +
                        (active
                          ? "border-foreground bg-foreground ring-2 ring-foreground/20 ring-offset-2 ring-offset-background"
                          : "border-border")
                      }
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{opt.label}</div>
                      <div className="text-muted-foreground text-xs">
                        {opt.desc}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block flex items-center gap-1 text-[10px] font-mono text-muted-foreground uppercase tracking-[0.25em]"><TargetIcon className="size-3"/> Target Metric</span>
              <input
                type="number"
                value={targetMetric}
                onChange={(e) => setTargetMetric(e.target.value)}
                placeholder="e.g. 4 (hours) or 30 (reps)"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </label>
            <label className="block">
              <span className="mb-1 block flex items-center gap-1 text-[10px] font-mono text-muted-foreground uppercase tracking-[0.25em]"><ClockIcon className="size-3"/> Alarm Time</span>
              <input
                type="time"
                value={alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </label>
          </div>

        </div>

        <div className="flex items-center justify-end border-border/60 border-t bg-background px-5 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title || !targetMetric || !alarmTime || !pillarId || isSubmitting}
            >
              <PlusIcon className="mr-1 size-4" />
              {isSubmitting ? "Locking in..." : "Lock In Task"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
