import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByAccount = query({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("investmentHoldings")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .collect();
  },
});

export const getByUser = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("investmentHoldings")
      .withIndex("by_user", (q) => q.eq("userId", "temp-user"))
      .collect();
  },
});

export const upsert = mutation({
  args: {
    accountId: v.id("accounts"),
    symbol: v.string(),
    name: v.string(),
    isin: v.optional(v.string()),
    quantity: v.number(),
    avgBuyPrice: v.number(),
    lastPrice: v.number(),
    currentValue: v.number(),
    pnl: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("investmentHoldings")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .filter((q) => q.eq(q.field("symbol"), args.symbol))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args });
      return existing._id;
    }

    return await ctx.db.insert("investmentHoldings", {
      ...args,
      userId: "temp-user",
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("investmentHoldings"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const clearByAccount = mutation({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    const holdings = await ctx.db
      .query("investmentHoldings")
      .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
      .collect();

    for (const holding of holdings) {
      await ctx.db.delete(holding._id);
    }
  },
});
