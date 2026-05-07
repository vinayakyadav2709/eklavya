import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("providers").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    category: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("providers", args);
  },
});

export const toggle = mutation({
  args: {
    id: v.id("providers"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { isActive: args.isActive });
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("providers").collect();
    const existingCodes = new Set(existing.map((p) => p.code));

    const providers = [
      {
        name: "Kite by Zerodha",
        code: "kite",
        category: "investment",
        isActive: true,
      },
      {
        name: "Kotak Securities",
        code: "kotak",
        category: "investment",
        isActive: true,
      },
    ];

    for (const provider of providers) {
      if (!existingCodes.has(provider.code)) {
        await ctx.db.insert("providers", provider);
      }
    }
  },
});
