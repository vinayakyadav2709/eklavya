import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ATTACK MODE
  journals: defineTable({
    userId: v.string(), // ID from better-auth
    date: v.string(), // YYYY-MM-DD
    procrastinationTriggers: v.string(),
    behaviorsToFix: v.string(),
    rulesToReadToday: v.string(),
  }).index("by_user", ["userId"]).index("by_user_date", ["userId", "date"]),

  goals: defineTable({
    userId: v.string(),
    goalName: v.string(),
    whatIKnow: v.string(),
    whatIDontKnow: v.string(),
    industrySecrets: v.string(),
    whatToUnlearn: v.string(),
    status: v.string(), // "active", "completed"
  }).index("by_user", ["userId"]),

  problems: defineTable({
    userId: v.string(),
    problemDescription: v.string(),
    category: v.string(), // "applicable", "not_applicable"
    rootCause: v.string(),
    practicalSolution: v.string(),
  }).index("by_user", ["userId"]),

  tasks: defineTable({
    userId: v.string(),
    title: v.string(),
    deadline: v.optional(v.string()),
    completed: v.boolean(),
    isNuclear: v.boolean(),
  }).index("by_user", ["userId"]).index("by_user_date", ["userId", "deadline"]),

  // HABITS
  habits: defineTable({
    userId: v.string(),
    name: v.string(),
    frequency: v.string(), // "daily", "weekly"
  }).index("by_user", ["userId"]),

  habitLogs: defineTable({
    habitId: v.id("habits"),
    userId: v.string(),
    date: v.string(), // YYYY-MM-DD
    completed: v.boolean(),
  }).index("by_user_date", ["userId", "date"]).index("by_habit_date", ["habitId", "date"]),

  // BUDGET
  transactions: defineTable({
    userId: v.string(),
    amount: v.number(),
    type: v.string(), // "expense", "income"
    category: v.string(),
    date: v.string(), // YYYY-MM-DD
    description: v.string(),
  }).index("by_user", ["userId"]).index("by_user_date", ["userId", "date"]),
});
