import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("transactions").order("desc").take(100);
  },
});

export const create = mutation({
  args: {
    type: v.union(v.literal("income"), v.literal("expense"), v.literal("transfer")),
    amount: v.number(),
    date: v.string(),
    description: v.string(),
    category: v.optional(v.string()),
    fromAccountId: v.optional(v.id("accounts")),
    toAccountId: v.optional(v.id("accounts")),
    isRecurring: v.optional(v.boolean()),
    recurrenceFrequency: v.optional(
      v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("yearly"))
    ),
  },
  handler: async (ctx, args) => {
    // Transaction logic to update account balances
    if (args.type === "expense" && args.fromAccountId) {
      const fromAccount = await ctx.db.get(args.fromAccountId);
      if (fromAccount) {
        // If it's a liability (like a credit card), spending money increases the balance owed.
        // If it's an asset (like a bank), spending money decreases the balance.
        const newBalance = fromAccount.isLiability 
          ? fromAccount.balance + args.amount 
          : fromAccount.balance - args.amount;
        await ctx.db.patch(args.fromAccountId, { balance: newBalance });
      }
    } else if (args.type === "income" && args.toAccountId) {
      const toAccount = await ctx.db.get(args.toAccountId);
      if (toAccount) {
        // If it's a liability (e.g. paying off a loan), income decreases the balance owed.
        // If it's an asset, income increases the balance.
        const newBalance = toAccount.isLiability 
          ? toAccount.balance - args.amount 
          : toAccount.balance + args.amount;
        await ctx.db.patch(args.toAccountId, { balance: newBalance });
      }
    } else if (args.type === "transfer" && args.fromAccountId && args.toAccountId) {
      const fromAccount = await ctx.db.get(args.fromAccountId);
      const toAccount = await ctx.db.get(args.toAccountId);
      
      if (fromAccount) {
        const newFromBalance = fromAccount.isLiability 
          ? fromAccount.balance + args.amount 
          : fromAccount.balance - args.amount;
        await ctx.db.patch(args.fromAccountId, { balance: newFromBalance });
      }
      
      if (toAccount) {
        const newToBalance = toAccount.isLiability 
          ? toAccount.balance - args.amount 
          : toAccount.balance + args.amount;
        await ctx.db.patch(args.toAccountId, { balance: newToBalance });
      }
    }

    return await ctx.db.insert("transactions", {
      ...args,
      userId: "temp-user", // Temporary placeholder
    });
  },
});
