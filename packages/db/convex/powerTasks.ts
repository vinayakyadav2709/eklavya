import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {
    date: v.optional(v.string()), // Format: YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("powerTasks").withIndex("by_user_date", (q) => q.eq("userId", "temp-user"));
    if (args.date) {
      q = q.filter((q) => q.eq(q.field("date"), args.date));
    }
    return await q.collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    pillarId: v.optional(v.id("pillars")),
    points: v.number(),
    targetMetric: v.number(),
    alarmTime: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("powerTasks", {
      ...args,
      userId: "temp-user",
      status: "pending",
    });
  },
});

export const updateMeasure = mutation({
  args: {
    id: v.id("powerTasks"),
    actualMetric: v.number(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    // Point degradation logic
    // If actual >= target, full points
    // If half, half points, etc. Let's do simple proportional rounded
    let earnedPoints = 0;
    if (args.actualMetric >= task.targetMetric) {
      earnedPoints = task.points;
    } else {
      const fraction = args.actualMetric / task.targetMetric;
      earnedPoints = Math.round(task.points * fraction);
    }

    return await ctx.db.patch(args.id, {
      actualMetric: args.actualMetric,
      earnedPoints,
      status: "completed",
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("powerTasks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
