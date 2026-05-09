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

  // TASKS & PILLARS (SWETABH SYSTEM)
  pillars: defineTable({
    userId: v.string(),
    name: v.string(),
    color: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  powerTasks: defineTable({
    userId: v.string(),
    title: v.string(),
    pillarId: v.optional(v.id("pillars")),
    points: v.number(), // 2, 4, 6, 8
    targetMetric: v.number(), // e.g. 4 (hours)
    actualMetric: v.optional(v.number()), 
    earnedPoints: v.optional(v.number()),
    alarmTime: v.string(), // e.g. "10:00"
    date: v.string(), // "YYYY-MM-DD" or "Tomorrow" logic
    status: v.string(), // "pending", "completed"
  }).index("by_user_date", ["userId", "date"]),

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

  // PROVIDERS
  providers: defineTable({
    name: v.string(), // "Kite by Zerodha", "Kotak Securities"
    code: v.string(), // "kite", "kotak"
    category: v.optional(v.string()), // account category this provider serves ("investment", "liquid", etc.)
    logoUrl: v.optional(v.string()), // URL or base64 logo
    isActive: v.boolean(),
  }).index("by_code", ["code"]),

  // ACCOUNTS
  accounts: defineTable({
    userId: v.string(),
    name: v.string(), // "HDFC Savings", "Zerodha", "Rahul (Loan)"
    category: v.union(v.literal("liquid"), v.literal("investment"), v.literal("credit"), v.literal("entity")),
    balance: v.number(), // Current balance
    institution: v.optional(v.string()), // "Kotak", "Zerodha", etc.
    isLiability: v.boolean(), // true for Credit Cards and Loans we owe
    providerId: v.optional(v.id("providers")),
    lastSyncedAt: v.optional(v.string()),
    apiConfig: v.optional(v.object({
      status: v.string(), // "active", "expired", "error"
      config: v.any(), // flexible JSON per provider
    })),
  }).index("by_user", ["userId"]).index("by_provider", ["providerId"]),

  // INVESTMENT HOLDINGS
  investmentHoldings: defineTable({
    accountId: v.id("accounts"),
    userId: v.string(),
    symbol: v.string(), // "RELIANCE", "INFY"
    name: v.string(), // "Reliance Industries Ltd"
    isin: v.optional(v.string()),
    quantity: v.number(),
    avgBuyPrice: v.number(),
    lastPrice: v.number(),
    currentValue: v.number(), // quantity * lastPrice
    pnl: v.optional(v.number()),
  }).index("by_account", ["accountId"]).index("by_user", ["userId"]),

  // BUDGET / CASHFLOW
  transactions: defineTable({
    userId: v.string(),
    type: v.union(v.literal("income"), v.literal("expense"), v.literal("transfer")),
    amount: v.number(),
    date: v.string(), // YYYY-MM-DD
    description: v.string(),
    category: v.optional(v.string()), // "Food", "Salary" (Not needed for transfers)
    fromAccountId: v.optional(v.id("accounts")), // null for Income
    toAccountId: v.optional(v.id("accounts")), // null for Expense
    isRecurring: v.optional(v.boolean()),
    recurrenceFrequency: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("yearly"))),
  }).index("by_user", ["userId"]).index("by_user_date", ["userId", "date"]),
});
